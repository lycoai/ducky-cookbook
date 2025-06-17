import os, time, json, re # Added re for regex operations
from datetime import datetime, timezone

from dotenv import load_dotenv
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

load_dotenv(override=True)  # take environment variables from .env and override existing ones.

PAGE_LIMIT = int(os.getenv("PAGE_LIMIT", "200"))  # Slack allows up to 1000 for history
LAST_N = int(os.getenv("LAST_N", "0"))  # 0 means fetch everything
print("last_n:", LAST_N)  # DEBUG
print("Script starting...") # DEBUG

SLACK_TOKEN = os.getenv("SLACK_BOT_TOKEN")          # xoxb-…
CHANNEL_ID  = os.getenv("CHANNEL_ID")               # starts with C/G/D
print(f"Attempting to use CHANNEL_ID from .env: '{CHANNEL_ID}'") # ADD THIS LINE TO DEBUG
print(f"SLACK_TOKEN loaded (first 10 chars): '{SLACK_TOKEN[:10] if SLACK_TOKEN else None}...'") # DEBUG
print(f"LAST_N requested: {LAST_N if LAST_N else 'all'}")  # DEBUG

assert SLACK_TOKEN and SLACK_TOKEN.startswith("xoxb-"), "Missing/invalid SLACK_BOT_TOKEN"
assert CHANNEL_ID and CHANNEL_ID[0] in "CGD", "Missing/invalid CHANNEL_ID"

client        = WebClient(token=SLACK_TOKEN)

def enrich_message_data(message_dict, users_map):
    uid = message_dict.get("user")
    username = users_map.get(uid, "Unknown User") if uid else "Unknown User"
    message_text = message_dict.get("text", "")

    # Replace user mentions (<@USERID>) with @Username
    def replace_mention(match):
        user_id_mentioned = match.group(1)
        mentioned_username = users_map.get(user_id_mentioned, user_id_mentioned) # Fallback to ID if not found
        return f"@{mentioned_username}"

    # Regex to find all occurrences of <@USERID> or <@USERID|fallback_name>
    # Slack sometimes includes a fallback name like <@U123ABC|john.doe>
    # We prioritize the lookup in users_map, but this regex handles both forms.
    message_text = re.sub(r"<@([A-Z0-9]+)(?:\|[a-zA-Z0-9._-]+)?>", replace_mention, message_text)
    
    ts_val = message_dict.get("ts")
    if not ts_val: 
        print(f"Warning: Message missing 'ts' field. Client Msg ID: {message_dict.get('client_msg_id', 'N/A')}")
        iso_time = "UNKNOWN_TIMESTAMP"
    else:
        try:
            iso_time = datetime.fromtimestamp(float(ts_val), tz=timezone.utc).isoformat()
        except ValueError:
            print(f"Warning: Invalid 'ts' value '{ts_val}'. Client Msg ID: {message_dict.get('client_msg_id', 'N/A')}")
            iso_time = "INVALID_TIMESTAMP"

    return {
        "name": username,
        "text": message_text,
        "timestamp": iso_time
    }

def fetch_page(cursor=None):
    while True:
        try:
            # Ensure CHANNEL_ID is not None before making the API call
            if not CHANNEL_ID:
                raise ValueError("CHANNEL_ID is not set.")
            return client.conversations_history(
                channel=CHANNEL_ID,
                limit=min(PAGE_LIMIT, LAST_N or PAGE_LIMIT),
                oldest="0", # API expects string for 'oldest'
                cursor=cursor
            )
        except SlackApiError as e:
            if e.response["error"] == "ratelimited":
                retry_after = int(e.response.headers.get("Retry-After", 1))
                print(f"Rate‑limited → sleeping {retry_after}s")
                time.sleep(retry_after)
            else:
                raise

all_msgs, cursor = [], None
print("Starting to fetch messages...") # DEBUG
while True:
    print(f"Current cursor: {cursor}, Total messages so far: {len(all_msgs)}") # DEBUG
    resp = fetch_page(cursor)

    # Initialize as an empty list. This variable will hold messages from the current page.
    current_page_messages_list: list = []

    if resp is not None:
        api_messages_field = resp.get("messages") # Attempt to get the 'messages' field
        if isinstance(api_messages_field, list):
            # If 'messages' is a list, use it
            current_page_messages_list = api_messages_field
        else:
            # If api_messages_field is None (key not found) or not a list,
            # current_page_messages_list remains []. Log if it was an unexpected type.
            if api_messages_field is not None:
                print(f"Warning: 'messages' field from API was not a list, but {type(api_messages_field)}. Treating as no messages for this page.")
    else:
        # If resp is None, current_page_messages_list remains [].
        print("Warning: fetch_page returned None. Treating as no messages for this page.")

    if not current_page_messages_list: # Log if the list for the current page is empty
        print("No messages in this page.") # DEBUG
    
    all_msgs.extend(current_page_messages_list) # current_page_messages_list is guaranteed to be a list here.
    
    # Stop early if we have enough messages
    if LAST_N and len(all_msgs) >= LAST_N:
        all_msgs = all_msgs[:LAST_N]  # keep only the newest N
        print(f"Reached LAST_N={LAST_N}. Exiting fetch loop early.")  # DEBUG
        break
    time.sleep(0.5)  # gentle throttle; adjust via PAGE_LIMIT if needed
    cursor = resp.get("response_metadata", {}).get("next_cursor", "")
    print(f"Extended messages. New total: {len(all_msgs)}, Next cursor: '{cursor}'") # DEBUG
    if not cursor:
        print("No more pages. Exiting fetch loop.") # DEBUG
        break

# ── Build a user‑ID → name map ──────────────────────────────
users = {}
print("Fetching user list...") # DEBUG
cursor = None
while True:
    try:
        response = client.users_list(limit=200, cursor=cursor)
        
        # Iterate safely over members, defaulting to an empty list if "members" is None or missing
        for u in (response.get("members") or []):
            profile = u.get("profile", {})  # Ensure profile is a dict, default to empty if missing
            display_name = profile.get("display_name")
            real_name = profile.get("real_name")
            users[u["id"]] = display_name or real_name or u.get("name") or u.get("id") # Fallback chain for user name

        cursor = response.get("response_metadata", {}).get("next_cursor")
        if not cursor:
            break
    except SlackApiError as e:
        # More robustly check for rate-limiting error
        is_ratelimited = False
        error_message = str(e) # Default error message
        if e.response and hasattr(e.response, 'get') and e.response.get("error") == "ratelimited":
            is_ratelimited = True
            error_message = "ratelimited" # Specific message for this case

        if is_ratelimited:
            retry_after = 1 # Default retry
            if hasattr(e.response, 'headers') and isinstance(e.response.headers, dict):
                 retry_after = int(e.response.headers.get("Retry-After", 1))
            print(f"Rate‑limited while fetching users → sleeping {retry_after}s")
            time.sleep(retry_after)
        else:
            print(f"Error fetching users (SlackApiError): {error_message}")
            break 
    except Exception as ex: # Catch any other unexpected errors during user fetching
        print(f"Unexpected error fetching users: {ex}")
        break
print(f"User list fetched. Total users: {len(users)}") # DEBUG

# ── Enrich messages and fetch replies with NESTED structure ───────────
final_structured_messages = []
print("Starting message enrichment and fetching replies for NESTED structure...") # DEBUG

for m_parent_raw in all_msgs:  # all_msgs might have been sliced by LAST_N
    enriched_parent_msg = enrich_message_data(m_parent_raw, users)

    is_thread_parent = m_parent_raw.get("thread_ts") == m_parent_raw.get("ts") and m_parent_raw.get("reply_count", 0) > 0

    if is_thread_parent:
        print(f"Fetching replies for thread parent: {m_parent_raw.get('ts')}") # DEBUG
        replies_for_parent = []
        thread_replies_cursor = None
        parent_thread_ts = m_parent_raw.get("thread_ts")

        if not parent_thread_ts:
            print(f"Warning: Thread parent {m_parent_raw.get('ts')} missing thread_ts. Skipping replies.") # DEBUG
        else:
            while True: # Loop for paginating through replies for this specific parent
                try:
                    if not CHANNEL_ID:
                        print("Error: CHANNEL_ID is not set. Cannot fetch replies.") # DEBUG
                        break
                    
                    replies_resp = client.conversations_replies(
                        channel=CHANNEL_ID,
                        ts=parent_thread_ts, # ts of the parent message
                        limit=PAGE_LIMIT, 
                        cursor=thread_replies_cursor
                    )
                    
                    # The first message in 'messages' list from conversations_replies is the parent itself.
                    # We only want the actual replies, so we skip the first message.
                    actual_thread_replies_raw = replies_resp.get("messages", [])[1:] if replies_resp.get("messages") else []

                    for r_reply_raw in actual_thread_replies_raw:
                        enriched_reply_msg = enrich_message_data(r_reply_raw, users)
                        replies_for_parent.append(enriched_reply_msg)
                    
                    thread_replies_cursor = replies_resp.get("response_metadata", {}).get("next_cursor")
                    if not thread_replies_cursor:
                        break # Exit pagination loop for these replies
                    
                    time.sleep(0.5) # Gentle throttle

                except SlackApiError as e:
                    if e.response and e.response.get("error") == "ratelimited":
                        retry_after = int(e.response.headers.get("Retry-After", 1))
                        print(f"Rate‑limited fetching replies for {parent_thread_ts} → sleeping {retry_after}s")
                        time.sleep(retry_after)
                    else:
                        print(f"Slack API Error fetching replies for {parent_thread_ts}: {e}")
                        break 
                except Exception as ex:
                    print(f"Unexpected error fetching replies for {parent_thread_ts}: {ex}")
                    break 
            
            if replies_for_parent:
                replies_for_parent.sort(key=lambda x: x["timestamp"])
                enriched_parent_msg["sub-messages"] = replies_for_parent
                print(f"Added {len(replies_for_parent)} sub-messages to parent {parent_thread_ts}") # DEBUG

    final_structured_messages.append(enriched_parent_msg)

# Sort the final list of parent messages by their own timestamp
final_structured_messages.sort(key=lambda x: x["timestamp"])

print(f"Message enrichment and reply fetching complete. Total parent/standalone messages: {len(final_structured_messages)}") # DEBUG

print(f"Attempting to write {len(final_structured_messages)} structured messages to data/channel_history_enriched.json") # DEBUG
with open("data/channel_history_enriched.json", "w") as f:
    json.dump(final_structured_messages, f, indent=2)
print(f"Saved {len(final_structured_messages)} structured messages to data/channel_history_enriched.json")
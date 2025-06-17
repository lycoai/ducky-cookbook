import os, time, json
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

def fetch_page(cursor=None):
    while True:
        try:
            return client.conversations_history(
                channel=CHANNEL_ID,
                limit=min(PAGE_LIMIT, LAST_N or PAGE_LIMIT),
                oldest=0,
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
    fetched_messages = resp["messages"]
    if not fetched_messages:
        print("No messages in this page.") # DEBUG
    all_msgs.extend(fetched_messages)
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

# ── Enrich messages ─────────────────────────────────────────
enriched = []
print("Starting message enrichment...") # DEBUG
for m in all_msgs:
    m2 = m.copy()
    uid = m2.get("user")
    if uid:
        m2["username"] = users.get(uid, uid)
    m2["iso_time"] = datetime.fromtimestamp(float(m2["ts"]), tz=timezone.utc).isoformat()
    enriched.append(m2)
print(f"Message enrichment complete. Total enriched messages: {len(enriched)}") # DEBUG

print(f"Attempting to write {len(enriched)} enriched messages to channel_history_enriched.json") # DEBUG
with open("data/channel_history_enriched.json", "w") as f:
    json.dump(enriched, f, indent=2)
print(f"Saved {len(enriched)} enriched messages")
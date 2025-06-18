# Import the DuckyAI library
from duckyai import DuckyAI
# Import os for accessing environment variables
import os
# Import dotenv for loading environment variables from a .env file
from dotenv import load_dotenv
# Import json for loading JSON data
import json

# Load environment variables from .env file
load_dotenv(override=True)

# Instantiate a Ducky AI Client
# The API key is retrieved from the environment variables
client = DuckyAI(api_key=os.getenv("DUCKY_API_KEY"))

# Get DUCKY_INDEX_NAME from environment variables
ducky_index_name = os.getenv("DUCKY_INDEX_NAME")
print(f"DUCKY_INDEX_NAME: {ducky_index_name}")
if ducky_index_name is None:
    raise ValueError("DUCKY_INDEX_NAME environment variable not set")

# Define the path to the channel history file
channel_history_file_path = "data/channel_history_enriched.json"

# Initialize an empty string to store the channel history content
channel_history_content = ""
# Open the channel_history_enriched.json file in read mode with utf-8 encoding
with open(channel_history_file_path, 'r', encoding='utf-8') as f:
    json_data = json.load(f)
    seen = set()
    for idx, msg in enumerate(json_data):
        # Skip empty or system messages
        text = msg.get("text", "").strip() if "text" in msg else ""
        if not text or "has joined the channel" in text or "has left the channel" in text:
            continue
        # Deduplication by text and timestamp
        dedup_key = (text, msg.get("timestamp"))
        if dedup_key in seen:
            continue
        seen.add(dedup_key)
        # Metadata enrichment
        metadata = {
            "timestamp": msg.get("timestamp"),
            "author": msg.get("name"),
            "thread_id": f"thread_{idx}",
            "type": "message"
        }
        # Index the main message
        client.documents.index(
            index_name=ducky_index_name,
            content=text,
            metadata=metadata,
        )
        # Handle sub-messages if present
        for sub in msg.get("sub-messages", []):
            sub_text = sub.get("text", "").strip()
            if not sub_text:
                continue
            sub_dedup_key = (sub_text, sub.get("timestamp"))
            if sub_dedup_key in seen:
                continue
            seen.add(sub_dedup_key)
            sub_metadata = {
                "timestamp": sub.get("timestamp"),
                "author": sub.get("name"),
                "parent_id": msg.get("timestamp"),
                "thread_id": f"thread_{idx}",
                "type": "reply"
            }
            # Optionally prepend parent text for context
            content = f"Context: {text}\nReply: {sub_text}"
            client.documents.index(
                index_name=ducky_index_name,
                content=content,
                metadata=sub_metadata,
            )

print(f"Successfully indexed chunked and enriched content from {channel_history_file_path} to index {ducky_index_name}")
# Import the DuckyAI library
from duckyai import DuckyAI
# Import os for accessing environment variables
import os
# Import dotenv for loading environment variables from a .env file
from dotenv import load_dotenv
# Import json for loading JSON data
import json

# Load environment variables from .env file
load_dotenv()

# Instantiate a Ducky AI Client
# The API key is retrieved from the environment variables
client = DuckyAI(api_key=os.getenv("DUCKY_API_KEY"))

# Get DUCKY_INDEX_NAME from environment variables
ducky_index_name = os.getenv("DUCKY_INDEX_NAME")
if ducky_index_name is None:
    raise ValueError("DUCKY_INDEX_NAME environment variable not set")

# Define the path to the channel history file
channel_history_file_path = "data/channel_history_enriched.json"

# Initialize an empty string to store the channel history content
channel_history_content = ""
# Open the channel_history_enriched.json file in read mode with utf-8 encoding
with open(channel_history_file_path, 'r', encoding='utf-8') as f:
    # Load the JSON data
    json_data = json.load(f)
    # Convert the JSON data to a string to be indexed
    channel_history_content = json.dumps(json_data)

# Index the channel history document using the Ducky AI client
client.documents.index(
    # Specify the name of the index, this can be found in the Ducky AI dashboard
    index_name=ducky_index_name,
    # Provide the content to be indexed
    content=channel_history_content,
)

print(f"Successfully indexed content from {channel_history_file_path} to index {ducky_index_name}")
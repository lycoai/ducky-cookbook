# Import the DuckyAI library
from duckyai import DuckyAI
# Import os for accessing environment variables
import os
# Import dotenv for loading environment variables from a .env file
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

# Instantiate a Ducky AI Client
# The API key is retrieved from the environment variables
client = DuckyAI(api_key=os.getenv("DUCKY_API_KEY"))

# Initialize an empty string to store the transcript content
transcript_content= ""
# Open the transcript.txt file in read mode with utf-8 encoding
with open('data/transcript.txt', 'r', encoding='utf-8') as f:
    # Read the entire content of the file into transcript_content
    transcript_content = f.read()
    
# Index a document using the Ducky AI client
client.documents.index(
    # Specify the name of the index, this can be found in the Ducky AI dashboard
    index_name='ducky-test',
    # Provide the content to be indexed
    content=transcript_content,
)
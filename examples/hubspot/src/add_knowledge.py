# Import the DuckyAI library
from duckyai import DuckyAI
# Import os for accessing environment variables
import os
# Import dotenv for loading environment variables from a .env file
from dotenv import load_dotenv
# Import csv for loading CSV data
import csv

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

# Define the path to the CSV file
csv_file_path = "data/hubspot_multi_with_activities.csv"

# Read the CSV and index each activity as a document
dedup_set = set()
with open(csv_file_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        # Deduplicate by Activity ID
        activity_id = row.get("Activity ID")
        if not activity_id or activity_id in dedup_set:
            continue
        dedup_set.add(activity_id)
        # Compose content and metadata
        content = f"Deal: {row.get('Deal Name')} (ID: {row.get('Deal ID')})\n" \
                  f"Amount: {row.get('Amount')} | Stage: {row.get('Deal Stage')} | Pipeline: {row.get('Pipeline')} | Close Date: {row.get('Close Date')}\n" \
                  f"Contact: {row.get('First Name')} {row.get('Last Name')} (ID: {row.get('Contact ID')}) | Email: {row.get('Email')} | Phone: {row.get('Phone Number')} | Lifecycle: {row.get('Lifecycle Stage')}\n" \
                  f"Company: {row.get('Company Name')} (ID: {row.get('Company ID')}) | Domain: {row.get('Company Domain')} | Industry: {row.get('Company Industry')} | Revenue: {row.get('Company Annual Revenue')}\n" \
                  f"Activity: {row.get('Activity Type')} (ID: {row.get('Activity ID')}) | Date: {row.get('Activity Date')}\n" \
                  f"Subject: {row.get('Activity Subject')}\n" \
                  f"Body: {row.get('Activity Body')}"
        metadata = {
            "deal_id": row.get("Deal ID"),
            "deal_name": row.get("Deal Name"),
            "amount": row.get("Amount"),
            "deal_stage": row.get("Deal Stage"),
            "pipeline": row.get("Pipeline"),
            "close_date": row.get("Close Date"),
            "contact_id": row.get("Contact ID"),
            "first_name": row.get("First Name"),
            "last_name": row.get("Last Name"),
            "email": row.get("Email"),
            "phone_number": row.get("Phone Number"),
            "lifecycle_stage": row.get("Lifecycle Stage"),
            "company_id": row.get("Company ID"),
            "company_name": row.get("Company Name"),
            "company_domain": row.get("Company Domain"),
            "company_industry": row.get("Company Industry"),
            "company_annual_revenue": row.get("Company Annual Revenue"),
            "activity_id": row.get("Activity ID"),
            "activity_type": row.get("Activity Type"),
            "activity_date": row.get("Activity Date"),
            "activity_subject": row.get("Activity Subject"),
            "activity_body": row.get("Activity Body"),
            "row_index": idx
        }
        client.documents.index(
            index_name=ducky_index_name,
            content=content,
            metadata=metadata,
        )

print(f"Successfully indexed activities from {csv_file_path} to index {ducky_index_name}")
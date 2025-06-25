import os
import csv
from datetime import datetime
import json
from dotenv import load_dotenv
from hubspot import HubSpot
from hubspot.crm.deals import ApiException

load_dotenv(override=True)  # take environment variables from .env and override existing ones.

HUBSPOT_TOKEN = os.getenv("HUBSPOT_API_TOKEN")

def handle_api_exception(e):
    """Prints a helpful message for HubSpot API exceptions."""
    if e.status == 403:
        try:
            error_details = json.loads(e.body)
            if error_details.get("category") == "MISSING_SCOPES":
                print("\nError: Your HubSpot API token is missing required scopes.")
                print("Please go to your HubSpot developer account, navigate to your private app\'s settings,")
                print("and under the \'Scopes\' tab, ensure ALL of the following scopes are enabled:")
                scopes = [
                    "crm.objects.deals.read", "crm.schemas.deals.read",
                    "crm.objects.contacts.read", "crm.schemas.contacts.read",
                    "crm.objects.companies.read", "crm.schemas.companies.read",
                    "crm.objects.notes.read", "crm.objects.calls.read", "crm.objects.meetings.read"
                ]
                for scope in scopes:
                    print(f"- {scope}")

                required_scopes = error_details.get("context", {}).get("requiredGranularScopes")
                if required_scopes:
                    print("\nThe API specifically reported these as missing for the last operation:")
                    for scope in required_scopes:
                        print(f"- {scope}")
                return
        except (json.JSONDecodeError, KeyError):
            pass  # Fall through to the generic error message
    print(f"An HubSpot API error occurred: {e}")

def get_property_value(entity, property_name, default=''):
    """Safely get a property value from a HubSpot object."""
    if entity and hasattr(entity, 'properties') and property_name in entity.properties:
        return entity.properties[property_name]
    return default

def format_date(timestamp_str, fmt='%m/%d/%Y'):
    """Format HubSpot timestamp."""
    if not timestamp_str:
        return ''
    try:
        # HubSpot timestamps are in UTC and might be ISO 8601 format
        if 'T' in timestamp_str:
            if timestamp_str.endswith('Z'):
                timestamp_str = timestamp_str[:-1]
            dt_obj = datetime.fromisoformat(timestamp_str)
        else: # handle unix timestamp
            dt_obj = datetime.fromtimestamp(int(timestamp_str) / 1000)
        return dt_obj.strftime(fmt)
    except (ValueError, TypeError):
        return timestamp_str

def get_all_deals(client):
    """Fetch all deals with pagination."""
    all_deals = []
    after = None
    while True:
        try:
            deals_page = client.crm.deals.basic_api.get_page(
                limit=100,
                after=after,
                properties=["dealname", "amount", "dealstage", "pipeline", "closedate"]
            )
            all_deals.extend(deals_page.results)
            if deals_page.paging and deals_page.paging.next:
                after = deals_page.paging.next.after
            else:
                break
        except ApiException as e:
            handle_api_exception(e)
            return None
    return all_deals

def main():
    """
    Fetches deals, contacts, companies, and activities from HubSpot
    and writes them to a CSV file named hubspot_multi_with_activities.csv.
    """
    if not HUBSPOT_TOKEN:
        print("HUBSPOT_API_TOKEN not found. Please set it in your .env file.")
        return

    client = HubSpot(access_token=HUBSPOT_TOKEN)

    contacts_cache = {}
    companies_cache = {}
    output_data = []
    csv_headers = [
        'Deal ID', 'Deal Name', 'Amount', 'Deal Stage', 'Pipeline', 'Close Date',
        'Contact ID', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Lifecycle Stage',
        'Company ID', 'Company Name', 'Company Domain', 'Company Industry', 'Company Annual Revenue',
        'Activity ID', 'Activity Type', 'Activity Date', 'Activity Subject', 'Activity Body'
    ]

    deals = get_all_deals(client)
    if deals is None:
        return
        
    print(f"Found {len(deals)} deals. Processing...")

    for deal in deals:
        deal_name = get_property_value(deal, 'dealname')
        print(f"Processing Deal: {deal_name}")

        company_details = None
        try:
            company_associations = client.crm.deals.associations_api.get_all(deal.id, 'company')
            if company_associations.results:
                company_id = company_associations.results[0].id
                if company_id not in companies_cache:
                    companies_cache[company_id] = client.crm.companies.basic_api.get_by_id(
                        company_id, properties=["name", "domain", "industry", "annualrevenue"]
                    )
                company_details = companies_cache[company_id]
        except ApiException as e:
            print(f"Error fetching company for deal {deal.id}:")
            handle_api_exception(e)

        try:
            contact_associations = client.crm.deals.associations_api.get_all(deal.id, 'contact')
            for assoc in contact_associations.results:
                contact_id = assoc.id
                if contact_id not in contacts_cache:
                    contacts_cache[contact_id] = client.crm.contacts.basic_api.get_by_id(
                        contact_id, properties=["firstname", "lastname", "email", "phone", "lifecyclestage"]
                    )
        except ApiException as e:
            print(f"Error fetching contacts for deal {deal.id}:")
            handle_api_exception(e)

        for activity_type in ['note', 'call', 'meeting']:
            try:
                activity_associations = client.crm.deals.associations_api.get_all(deal.id, activity_type)
                for activity_assoc in activity_associations.results:
                    activity_id = activity_assoc.id
                    
                    activity_api = getattr(client.crm.objects, f"{activity_type}s")
                    
                    activity_props = ["hs_timestamp", f"hs_{activity_type}_body"]
                    if activity_type == 'call':
                        activity_props.append('hs_call_title')
                    elif activity_type == 'meeting':
                        activity_props.append('hs_meeting_title')

                    activity_details = activity_api.basic_api.get_by_id(activity_id, properties=activity_props)
                    
                    activity_contact_id = None
                    contact_details = None
                    activity_contact_assocs = getattr(client.crm.objects, f"{activity_type}s").associations_api.get_all(activity_id, 'contact')
                    if activity_contact_assocs.results:
                        activity_contact_id = activity_contact_assocs.results[0].id
                        contact_details = contacts_cache.get(activity_contact_id)

                    row = {
                        'Deal ID': deal.id,
                        'Deal Name': deal_name,
                        'Amount': get_property_value(deal, 'amount'),
                        'Deal Stage': get_property_value(deal, 'dealstage'),
                        'Pipeline': get_property_value(deal, 'pipeline'),
                        'Close Date': format_date(get_property_value(deal, 'closedate')),
                        'Contact ID': activity_contact_id,
                        'First Name': get_property_value(contact_details, 'firstname'),
                        'Last Name': get_property_value(contact_details, 'lastname'),
                        'Email': get_property_value(contact_details, 'email'),
                        'Phone Number': get_property_value(contact_details, 'phone'),
                        'Lifecycle Stage': get_property_value(contact_details, 'lifecyclestage'),
                        'Company ID': get_property_value(company_details, 'hs_object_id'),
                        'Company Name': get_property_value(company_details, 'name'),
                        'Company Domain': get_property_value(company_details, 'domain'),
                        'Company Industry': get_property_value(company_details, 'industry'),
                        'Company Annual Revenue': get_property_value(company_details, 'annualrevenue'),
                        'Activity ID': activity_id,
                        'Activity Type': activity_type.capitalize(),
                        'Activity Date': format_date(get_property_value(activity_details, 'hs_timestamp'), '%m/%d/%Y %H:%M'),
                        'Activity Subject': get_property_value(activity_details, 'hs_call_title') or get_property_value(activity_details, 'hs_meeting_title') or f"{activity_type.capitalize()} about {deal_name}",
                        'Activity Body': get_property_value(activity_details, f"hs_{activity_type}_body")
                    }
                    output_data.append(row)
            except ApiException as e:
                print(f"Error fetching {activity_type}s for deal {deal.id}:")
                handle_api_exception(e)

    output_filename = 'hubspot_multi_with_activities.csv'
    print(f"Writing data to {output_filename}...")
    if output_data:
        with open(output_filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_headers)
            writer.writeheader()
            writer.writerows(output_data)
        print(f"Successfully wrote data to {output_filename}.")
    else:
        print("No data was fetched to write.")

if __name__ == "__main__":
    main()

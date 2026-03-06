import sys
from database import get_client
from search import secure_hybrid_search
from ingest import ingest_data

def run_cli():
    client = get_client()
    
    print("--- 🛠️ Weaviate RAG CLI ---")
    choice = input("Do you want to (1) Ingest Data or (2) Search? ")

    if choice == "1":
        print("📥 Starting ingestion...")
        ingest_data()
        print("✅ Ingestion complete.")
    
    elif choice == "2":
        # Simulate a User Identity
        print("\nAvailable Roles: sales_team, sop_staff, engineering, management")
        roles_input = input("Enter your roles (comma-separated, e.g., 'sales_team,management'): ")
        user_roles = [r.strip() for r in roles_input.split(",")]

        query = input("\n🔍 What is your question? ")
        
        print(f"\nSearching for: '{query}' with roles: {user_roles}...")
        results = secure_hybrid_search(client, query, user_roles)

        if not results:
            print("🚫 No authorized documents found for your roles.")
        else:
            print(f"\nFound {len(results)} authorized results:")
            for idx, obj in enumerate(results):
                props = obj.properties
                content_preview = str(props.get('content', ''))[:100]
                print(f"{idx+1}. [{props['category']}] {content_preview}...")
                print(f"   🔓 Access Groups: {props['authorizedGroups']}")
                print("-" * 30)

    client.close()

if __name__ == "__main__":
    run_cli()
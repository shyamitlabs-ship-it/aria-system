import chromadb
from sentence_transformers import SentenceTransformer
import os

# Initialize ChromaDB and embedding model
chroma_client = chromadb.Client()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Create collection
collection = chroma_client.get_or_create_collection("ticket_routing")

# Seed data — example issues mapped to departments
ROUTING_EXAMPLES = [
    {"issue": "I was charged twice for my subscription", "dept": "Finance & Billing Team", "category": "billing"},
    {"issue": "My invoice shows wrong amount", "dept": "Finance & Billing Team", "category": "billing"},
    {"issue": "I need a refund for duplicate payment", "dept": "Finance & Billing Team", "category": "billing"},
    {"issue": "The system is completely down and not working", "dept": "Technical Team", "category": "incident"},
    {"issue": "Our entire network went offline", "dept": "Technical Team", "category": "incident"},
    {"issue": "Critical service outage affecting operations", "dept": "Technical Team", "category": "incident"},
    {"issue": "I need a new service connection", "dept": "Service Delivery Team", "category": "service"},
    {"issue": "Please configure my account settings", "dept": "Service Delivery Team", "category": "service"},
    {"issue": "I want to upgrade my service plan", "dept": "Service Delivery Team", "category": "service"},
    {"issue": "My product stopped working after installation", "dept": "Product Support Team", "category": "support"},
    {"issue": "I need help setting up the device", "dept": "Product Support Team", "category": "support"},
    {"issue": "The software keeps crashing on startup", "dept": "Product Support Team", "category": "support"},
    {"issue": "I am interested in buying your enterprise package", "dept": "Sales Team", "category": "sales"},
    {"issue": "Can you give me pricing information", "dept": "Sales Team", "category": "sales"},
    {"issue": "I want to schedule a product demo", "dept": "Sales Team", "category": "sales"},
    {"issue": "Your service quality has been terrible", "dept": "Customer Relations Team", "category": "complaint"},
    {"issue": "I want to escalate my unresolved issue", "dept": "Customer Relations Team", "category": "complaint"},
    {"issue": "I am very unhappy with the support I received", "dept": "Customer Relations Team", "category": "complaint"},
]

def seed_routing_data():
    """Seed ChromaDB with routing examples."""
    existing = collection.count()
    if existing > 0:
        return

    documents = [e["issue"] for e in ROUTING_EXAMPLES]
    embeddings = embedding_model.encode(documents).tolist()
    ids = [f"example_{i}" for i in range(len(ROUTING_EXAMPLES))]
    metadatas = [{"dept": e["dept"], "category": e["category"]} for e in ROUTING_EXAMPLES]

    collection.add(
        documents=documents,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas,
    )

def route_ticket(issue_description: str) -> dict:
    """Route a ticket to the correct department using RAG."""
    seed_routing_data()

    query_embedding = embedding_model.encode([issue_description]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=3,
    )

    if not results["metadatas"][0]:
        return {"dept": "General Support", "confidence": 0.5}

    top_match = results["metadatas"][0][0]
    distance = results["distances"][0][0]
    confidence = round(1 - (distance / 2), 2)
    confidence = max(0.5, min(0.99, confidence))

    return {
        "dept": top_match["dept"],
        "category": top_match["category"],
        "confidence": confidence,
    }
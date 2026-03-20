from pymongo import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://qurio_db_user:zu9PLY2ufez799BK@qurioquestions.uuychwv.mongodb.net/?appName=QurioQuestions"

# Create a MongoClient with Server API options
client = MongoClient(
    uri,
    server_api=ServerApi(
        version="1",
        strict=True,
        deprecation_errors=True
    )
)

def run():
    try:
        # Connect to the server
        client.admin.command("ping")
        print("Pinged your deployment. You successfully connected to MongoDB!")
    finally:
        # Close the connection
        client.close()
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from env import MONGO_URI 

uri = MONGO_URI

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
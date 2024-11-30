from flask import Flask, Response
from pymongo import MongoClient
import json

app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["fileOptimizer"]
collection = db["files_python"]

@app.route('/api/files', methods=['GET'])
def stream_files():
    def generate():
        cursor = collection.find({}, {"_id": 1, "name": 1, "size": 1})
        for document in cursor:
            yield json.dumps(document) + '\n'

    return Response(generate(), content_type='application/json')

if __name__ == '__main__':
    app.run(debug=True)

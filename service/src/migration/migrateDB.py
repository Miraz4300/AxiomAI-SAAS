from pymongo import MongoClient
from bson.objectid import ObjectId
from dateutil.parser import parse

def migrate():
    uri = "CONNECTION_STRING/DBNAME?retryWrites=true&w=majority" # replace with your MongoDB connection string
    client = MongoClient(uri)

    try:
        print('Connected to MongoDB')

        userCol = client['DBNAME']['user'] # replace with your database and collection names
        print('Fetched user collection')

        cursor = userCol.find({})
        print('Created cursor for user documents')

        count = 0
        for doc in cursor:
            createTime = parse(doc['createTime'])
            verifyTime = parse(doc['verifyTime']) if 'verifyTime' in doc else None
            updateTime = parse(doc['updateTime']) if 'updateTime' in doc else None
            if createTime or verifyTime or updateTime:
                userCol.update_one({ '_id': ObjectId(doc['_id']) }, { '$set': { 'createTime': createTime, 'verifyTime': verifyTime, 'updateTime': updateTime } })
                count += 1
                print(f'Updated document {count}')

        print(f'Updated {count} documents')
    finally:
        client.close()
        print('Closed MongoDB connection')

# Call the migrate function
migrate()
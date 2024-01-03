import { MongoClient, ObjectId } from 'mongodb'

async function migrate() {
  const uri = 'CONNECTION_STRING/DBNAME?retryWrites=true&w=majority' // replace with your MongoDB connection string
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const userCol = client.db('DBNAME').collection('user') // replace with your database and collection names
    console.log('Fetched user collection')

    const cursor = userCol.find({})
    console.log('Created cursor for user documents')

    let count = 0
    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      const createTime = new Date(doc.createTime)
      const verifyTime = doc.verifyTime ? new Date(doc.verifyTime) : null
      const updateTime = doc.updateTime ? new Date(doc.updateTime) : null
      if (!Number.isNaN(createTime.getTime()) || (verifyTime && !Number.isNaN(verifyTime.getTime())) || (updateTime && !Number.isNaN(updateTime.getTime()))) {
        await userCol.updateOne({ _id: new ObjectId(doc._id) }, { $set: { createTime, verifyTime, updateTime } })
        count++
        console.log(`Updated document ${count}`)
      }
    }
    console.log(`Updated ${count} documents`)
  }
  finally {
    await client.close()
    console.log('Closed MongoDB connection')
  }
}

// Call the migrate function
migrate().catch(console.error)

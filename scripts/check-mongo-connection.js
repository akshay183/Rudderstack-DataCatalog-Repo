// A simple script to check MongoDB connectivity
const { MongoClient } = require('mongodb');

async function checkMongoConnection() {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/test_db';
  console.log('Checking MongoDB connection to:', uri);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // Check for replica set status
    const admin = client.db('admin').admin();
    const result = await admin.command({ replSetGetStatus: 1 });
    
    console.log('Replica set status:');
    console.log('- Set name:', result.set);
    console.log('- Members:', result.members.length);
    console.log('- Primary:', result.members.find(m => m.state === 1)?.name || 'None');
    
    return true;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    return false;
  } finally {
    await client.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkMongoConnection()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = { checkMongoConnection };

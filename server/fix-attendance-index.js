require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  try {
    const db = mongoose.connection.db;
    const collection = db.collection('attendances');

    // Drop all existing indexes (keeps _id index)
    await collection.dropIndexes();
    console.log('All attendance indexes dropped successfully.');

    // Drop all existing bad attendance documents with empty coordinates
    const result = await collection.deleteMany({
      $or: [
        { 'checkIn.geolocation.coordinates': { $size: 0 } },
        { 'checkOut.geolocation.coordinates': { $size: 0 } },
      ],
    });
    console.log(`Cleaned up ${result.deletedCount} malformed attendance record(s).`);
  } catch (err) {
    console.log('Index drop info:', err.message);
  }

  await mongoose.disconnect();
  console.log('Done. You can now restart your server.');
  process.exit(0);
}

fixIndex().catch(console.error);
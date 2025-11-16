// migrate_replace_localhost_images.js
// Run with: node migrate_replace_localhost_images.js
// Requires MONGODB_URI env var set to your Atlas connection string.

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Please set MONGODB_URI in env before running this script.");
  process.exit(1);
}

const OLD_HOST = process.env.OLD_IMAGE_HOST || "http://localhost:4000";
const NEW_HOST = process.env.NEW_IMAGE_HOST || "https://dormdash-aynr.onrender.com";

async function run() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  // Collections to check
  const collections = ["meals", "users"];

  for (const collName of collections) {
    const coll = db.collection(collName);
    const query = { image: { $regex: `^${OLD_HOST}` } };
    const docs = await coll.find(query).toArray();
    console.log(`Found ${docs.length} docs in ${collName} with ${OLD_HOST}`);

    if (docs.length === 0) continue;

    for (const doc of docs) {
      const old = doc.image;
      const updated = old.replace(OLD_HOST, NEW_HOST);
      await coll.updateOne({ _id: doc._id }, { $set: { image: updated } });
      console.log(`Updated ${collName} ${doc._id}: ${old} -> ${updated}`);
    }
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

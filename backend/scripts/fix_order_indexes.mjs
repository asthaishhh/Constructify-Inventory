import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing in .env");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri);

  const collection = mongoose.connection.db.collection("orders");
  const indexes = await collection.indexes();
  const indexNames = indexes.map((idx) => idx.name);

  if (indexNames.includes("id_1")) {
    await collection.dropIndex("id_1");
    console.log("Dropped stale index: id_1");
  } else {
    console.log("No stale index found: id_1");
  }

  const hasCompanyIdUnique = indexes.some(
    (idx) => idx.name === "companyId_1_id_1" && idx.unique === true
  );

  if (!hasCompanyIdUnique) {
    await collection.createIndex({ companyId: 1, id: 1 }, { unique: true });
    console.log("Created unique index: companyId_1_id_1");
  } else {
    console.log("Unique index already present: companyId_1_id_1");
  }

  await mongoose.disconnect();
  console.log("Order index repair complete.");
};

run().catch(async (err) => {
  console.error("Failed to repair order indexes:", err.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors in failure path
  }
  process.exit(1);
});

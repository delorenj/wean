const admin = require('firebase-admin');
const fs = require('fs');
const readline = require('readline');

var serviceAccount = require("../wean-17739-firebase-adminsdk-d2rru-a6b501f358.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
  const fileStream = fs.createReadStream('./documents/seed-doses.json');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const docData = JSON.parse(line);
    const userId = docData.userId;
    const timestamp = Math.round(new Date(docData.timestamp).getTime() / 1000); // Convert to epoch time in seconds

    // Remove the userId and timestamp fields from the dose event data
    delete docData.userId;
    delete docData.timestamp;

    // Add the dose event data to the user's doses collection, with the document ID being the timestamp
    await db.collection(`doses-${userId}`).doc(String(timestamp)).set(docData);
  }
}

importData().catch(console.error);

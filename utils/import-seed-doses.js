const admin = require('firebase-admin');
const fs = require('fs');
const readline = require('readline');

var serviceAccount = require("../wean-17739-firebase-adminsdk-d2rru-6d7c16a5f3.json");

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
    await db.collection('doses').add(docData);
  }
}

importData().catch(console.error);

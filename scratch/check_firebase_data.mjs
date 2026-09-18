import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgF8tuNl7MJz-9EHWNdf0XxcO7J24AKoY",
  authDomain: "local-service-finder-web.firebaseapp.com",
  projectId: "local-service-finder-web",
  storageBucket: "local-service-finder-web.firebasestorage.app",
  messagingSenderId: "293027698306",
  appId: "1:293027698306:web:f2ca6ff127e7d320b5c69b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCollection(name) {
  try {
    console.log(`\n--- Checking collection: ${name} ---`);
    const snap = await getDocs(collection(db, name));
    console.log(`Found ${snap.size} documents in ${name}:`);
    snap.forEach((doc) => {
      console.log(`ID: ${doc.id} =>`, JSON.stringify(doc.data(), null, 2));
    });
  } catch (err) {
    console.error(`Error querying ${name}:`, err.message || err);
  }
}

async function main() {
  await checkCollection('providers');
  await checkCollection('providers_draft');
  await checkCollection('users');
  await checkCollection('admins');
  await checkCollection('reviews');
}

main().then(() => {
  console.log('\nDone.');
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});

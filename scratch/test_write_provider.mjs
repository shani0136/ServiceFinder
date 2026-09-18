import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';

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

async function testWrite() {
  try {
    const testDoc = {
      name: "Test Electrician",
      service: "Electrician",
      primaryService: "Electrician",
      serviceArea: "Borivali",
      serviceAreas: ["Borivali"],
      phone: "9876543210",
      whatsapp: "9876543210",
      experienceYears: 5,
      description: "Test description for electrician",
      skills: ["Electrician", "Wiring"],
      status: "pending",
      verified: false,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'providers', 'test-prov-1'), testDoc);
    console.log('Successfully wrote to providers collection!');
  } catch (err) {
    console.error('Failed to write to providers collection:', err.message || err);
  }
}

testWrite().then(() => process.exit(0));

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

async function cleanFakeData() {
  console.log('--- Cleaning Fake Data from Firestore ---');

  // 1. Delete fake seeded providers
  const fakeIds = [
    'mumbai-pro-ramesh',
    'mumbai-pro-sunita',
    'mumbai-pro-dinesh',
    'mumbai-pro-rajesh',
    'test-prov-1',
    'h1abnlpYxwTBn45wdXeAvHRvv4T2',
    'jYcXTHESs1TjVeiFyHVdXa7md853'
  ];

  for (const id of fakeIds) {
    try {
      await deleteDoc(doc(db, 'providers', id));
      console.log(`Deleted fake provider doc: ${id}`);
    } catch (e) {
      console.warn(`Could not delete ${id}:`, e.message);
    }
  }

  // 2. Clean real provider records so they have zero fabricated details
  const realProviders = [
    {
      id: 'ITlSNBJ89rT2aFqywLaaleNRJnl2',
      uid: 'ITlSNBJ89rT2aFqywLaaleNRJnl2',
      name: 'Abhishek',
      email: 'abhi123@gmail.com',
      phone: '8423773933',
      whatsapp: '8423773933',
      whatsappPhone: '8423773933',
      service: 'Electrician',
      primaryService: 'Electrician',
      serviceArea: 'Borivali',
      serviceAreas: ['Borivali'],
      experienceYears: 1,
      description: '',
      skills: ['Electrician'],
      status: 'pending',
      verified: false,
      rating: null,
      reviewCount: 0,
      workProof: '',
      submittedProof: '',
      createdAt: '2026-09-13T19:27:15.190Z',
    },
    {
      id: 'tCpk8Bw1xWXjDdH5k6JKPrxb8Dq2',
      uid: 'tCpk8Bw1xWXjDdH5k6JKPrxb8Dq2',
      name: 'Shani Sharma',
      email: 'shani321@gmail.com',
      phone: '7054964511',
      whatsapp: '7054964511',
      whatsappPhone: '7054964511',
      service: 'Electrician',
      primaryService: 'Electrician',
      serviceArea: 'Borivali',
      serviceAreas: ['Borivali'],
      experienceYears: 1,
      description: '',
      skills: ['Electrician'],
      status: 'pending',
      verified: false,
      rating: null,
      reviewCount: 0,
      workProof: '',
      submittedProof: '',
      createdAt: '2026-09-14T08:47:29.356Z',
    }
  ];

  for (const prov of realProviders) {
    await setDoc(doc(db, 'providers', prov.id), prov);
    console.log(`Cleaned genuine provider record: ${prov.name} (${prov.id})`);
  }

  // 3. Print remaining providers
  console.log('\n--- Final Genuine Providers in Firestore: ---');
  const snap = await getDocs(collection(db, 'providers'));
  console.log(`Total genuine providers: ${snap.size}`);
  snap.forEach((d) => {
    console.log(d.id, '=>', JSON.stringify(d.data(), null, 2));
  });
}

cleanFakeData().then(() => {
  console.log('\nCleaning completed successfully.');
  process.exit(0);
}).catch((e) => {
  console.error('Error cleaning fake data:', e);
  process.exit(1);
});

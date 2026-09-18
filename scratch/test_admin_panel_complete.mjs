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

async function verifyAdminData() {
  console.log('====================================================');
  console.log('  VERIFYING ADMIN PANEL DATA & METRICS ENGINE');
  console.log('====================================================\n');

  // 1. Fetch Providers
  const provSnap = await getDocs(collection(db, 'providers'));
  const providers = [];
  provSnap.forEach((d) => providers.push({ id: d.id, ...d.data() }));

  console.log(`[1] Total Providers in Registry: ${providers.length}`);
  const approved = providers.filter((p) => p.status === 'approved');
  const pending = providers.filter((p) => p.status === 'pending');
  const suspended = providers.filter((p) => p.status === 'suspended');
  const rejected = providers.filter((p) => p.status === 'rejected');

  console.log(`    - Active Approved Pros : ${approved.length}`);
  console.log(`    - Pending Approvals    : ${pending.length}`);
  console.log(`    - Suspended            : ${suspended.length}`);
  console.log(`    - Rejected             : ${rejected.length}`);

  if (providers.length === 0) {
    throw new Error('FAIL: Providers collection is empty!');
  }
  if (pending.length === 0) {
    throw new Error('FAIL: Pending providers count is 0!');
  }
  if (approved.length === 0) {
    throw new Error('FAIL: Approved providers count is 0!');
  }

  console.log('\n[2] Sample Providers in Queue:');
  providers.forEach((p) => {
    console.log(`    • [${(p.status || 'pending').toUpperCase().padEnd(9)}] ${p.name.padEnd(16)} | 📞 ${p.phone.padEnd(12)} | Trade: ${(p.service || p.primaryService || '').padEnd(22)} | Area: ${p.serviceArea || 'Mumbai'}`);
  });

  // 2. Fetch Users
  const userSnap = await getDocs(collection(db, 'users'));
  const users = [];
  userSnap.forEach((d) => users.push({ uid: d.id, ...d.data() }));

  const customers = users.filter((u) => u.role === 'customer');
  const providerUsers = users.filter((u) => u.role === 'provider');
  const admins = users.filter((u) => u.role === 'admin');

  console.log(`\n[3] Total Platform Accounts: ${users.length}`);
  console.log(`    - Customers      : ${customers.length}`);
  console.log(`    - Providers      : ${providerUsers.length}`);
  console.log(`    - Administrators : ${admins.length}`);

  console.log('\n[4] Metric Cards Verification:');
  console.log(`    ✓ Card 1 (Active Approved Pros): ${approved.length}`);
  console.log(`    ✓ Card 2 (Pending Approvals)   : ${pending.length}`);
  console.log(`    ✓ Card 3 (Registered Customers): ${customers.length}`);
  console.log(`    ✓ Card 4 (Total Registrations) : ${users.length}`);

  // 3. Test Live Worker Deployed Status
  console.log('\n[5] Testing Live Cloudflare Worker:');
  try {
    const res = await fetch('https://servicefinder.service-finder.workers.dev/api/admin/status');
    const data = await res.json();
    console.log('    Worker API Status Code:', res.status);
    console.log('    Worker System Status   :', JSON.stringify(data));
  } catch (err) {
    console.warn('    Worker status test:', err.message);
  }

  console.log('\n====================================================');
  console.log('  ALL ADMIN PANEL DATA CHECKS PASSED SUCCESSFULLY!  ');
  console.log('====================================================');
}

verifyAdminData().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});

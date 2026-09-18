/**
 * ServiceFinder - Server-Side Admin Role Assignment Script
 *
 * This script runs in the trusted Node.js server/backend environment using the Firebase Admin SDK.
 * It assigns genuine server-side custom claims { admin: true } to the authorized administrator
 * account (shani145@gmail.com) and provisions the protected /admins/{uid} Firestore record.
 *
 * Requirements:
 *   npm install --save-dev firebase-admin (if running with live service account)
 *
 * Usage:
 *   node scripts/assign_admin.mjs [path-to-service-account-key.json]
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TARGET_ADMIN_EMAIL = 'shani145@gmail.com';

async function main() {
  console.log('====================================================');
  console.log('  ServiceFinder - Server-Side Admin Role Assignment  ');
  console.log('====================================================');
  console.log(`Target Administrator: ${TARGET_ADMIN_EMAIL}`);

  const keyPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!keyPath || !existsSync(resolve(keyPath))) {
    console.log('\n[INFO] No Firebase service account file supplied.');
    console.log('To mint custom claims using Firebase Admin SDK:');
    console.log('  1. Download your service account private key from Firebase Console:');
    console.log('     Project Settings -> Service Accounts -> Generate New Private Key');
    console.log('  2. Run: node scripts/assign_admin.mjs ./serviceAccountKey.json\n');
    console.log('NOTE: Server-side API endpoint (/api/admin/verify) and Firestore Security Rules');
    console.log(`already recognize "${TARGET_ADMIN_EMAIL}" with cryptographic validation.`);
    return;
  }

  let admin;
  try {
    const adminModule = await import('firebase-admin');
    admin = adminModule.default;
  } catch {
    console.error('\n[ERROR] "firebase-admin" is not installed.');
    console.error('Run: npm install --save-dev firebase-admin');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(readFileSync(resolve(keyPath), 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const auth = admin.auth();
  const db = admin.firestore();

  try {
    console.log(`\n1. Fetching user record for ${TARGET_ADMIN_EMAIL}...`);
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(TARGET_ADMIN_EMAIL);
      console.log(`✓ User found with UID: ${userRecord.uid}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log(`User not found. Creating admin user record for ${TARGET_ADMIN_EMAIL}...`);
        userRecord = await auth.createUser({
          email: TARGET_ADMIN_EMAIL,
          emailVerified: true,
          displayName: 'Administrator (shani145)',
        });
        console.log(`✓ Created admin user with UID: ${userRecord.uid}`);
      } else {
        throw err;
      }
    }

    console.log('\n2. Assigning custom claims: { admin: true }...');
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('✓ Custom claim { admin: true } set successfully!');

    console.log('\n3. Recording admin document in /admins/{uid} collection...');
    await db.collection('admins').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: TARGET_ADMIN_EMAIL,
      role: 'admin',
      assignedVia: 'firebase-admin-sdk-script',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log('✓ Firestore /admins/' + userRecord.uid + ' document written successfully!');

    console.log('\n4. Syncing /users/{uid} document with role: "admin"...');
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: TARGET_ADMIN_EMAIL,
      role: 'admin',
      name: 'Administrator',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log('✓ Firestore /users/' + userRecord.uid + ' role set to admin!');

    console.log('\n====================================================');
    console.log('SUCCESS: Admin role fully provisioned from trusted server environment!');
    console.log(`Account ${TARGET_ADMIN_EMAIL} is now recognized as Admin.`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n[ERROR] Failed to assign admin claims:', error);
    process.exit(1);
  }
}

main();

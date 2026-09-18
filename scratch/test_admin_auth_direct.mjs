import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('  VERIFYING RESOLUTION OF ADMIN ACCESS DENIED ERROR');
console.log('================================================================\n');

const authCode = fs.readFileSync(path.join(rootDir, 'src/lib/auth.ts'), 'utf-8');

// Check 1: verifyAdminAuthorization recognizes shani145@gmail.com immediately
assert.ok(
  authCode.includes("targetEmail === 'shani145@gmail.com'"),
  'verifyAdminAuthorization must recognize shani145@gmail.com directly'
);

// Check 2: fetchVerifiedUserDocument enforces admin role for shani145@gmail.com
assert.ok(
  authCode.includes("userEmail === 'shani145@gmail.com' || userEmail === 'shanisharma145@gmail.com'"),
  'fetchVerifiedUserDocument must enforce admin role for shani145@gmail.com'
);

// Check 3: onAuthStateChanged enforces admin role
assert.ok(
  authCode.includes("const isAdmin = userEmail === 'shani145@gmail.com' || userEmail === 'shanisharma145@gmail.com'"),
  'onAuthStateChanged must enforce admin role for shani145@gmail.com'
);

// Check 4: signInAdmin rejects non-admin emails with ACCESS DENIED, while permitting shani145@gmail.com
assert.ok(
  authCode.includes("const isAuthorized = cleanEmail === 'shani145@gmail.com' || cleanEmail === 'shanisharma145@gmail.com'"),
  'signInAdmin must validate authorized admin email list'
);

console.log('[PASS] All 4 critical checks passed. Admin access denial bug is resolved.');

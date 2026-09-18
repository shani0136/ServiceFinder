import fs from 'fs';
import path from 'path';

console.log('=== SERVICEFINDER COMPREHENSIVE VERIFICATION ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`✗ [FAIL] ${message}`);
  }
}

const rootDir = process.cwd();

// Test 1: Verify top pill removal
const customerHomePath = path.join(rootDir, 'src', 'pages', 'CustomerHomePage.tsx');
const customerHomeContent = fs.readFileSync(customerHomePath, 'utf-8');
assert(
  !customerHomeContent.includes('Direct Local Discovery • Zero Commission • Real Specialists'),
  'Top pill "Direct Local Discovery • Zero Commission • Real Specialists" is completely removed from CustomerHomePage.tsx'
);
assert(
  !customerHomeContent.includes('styles.heroTag'),
  'styles.heroTag container for the top pill is removed'
);

// Test 2: Contact gating in ProviderCard
const providerCardPath = path.join(rootDir, 'src', 'components', 'ui', 'ProviderCard.tsx');
const providerCardContent = fs.readFileSync(providerCardPath, 'utf-8');
assert(
  providerCardContent.includes('e.preventDefault()') &&
  providerCardContent.includes('promptContactLogin'),
  'ProviderCard prevents default dialer/WhatsApp launch and prompts contact login when logged out'
);
assert(
  providerCardContent.includes('href={state.user ? `tel:${provider.phone}` : \'#\'}'),
  'ProviderCard masks tel: link when user is logged out'
);
assert(
  providerCardContent.includes('href={state.user ? whatsappUrl : \'#\'}'),
  'ProviderCard masks WhatsApp link when user is logged out'
);

// Test 3: Contact gating in ProviderDetailsModal
const detailsModalPath = path.join(rootDir, 'src', 'components', 'ui', 'ProviderDetailsModal.tsx');
const detailsModalContent = fs.readFileSync(detailsModalPath, 'utf-8');
assert(
  detailsModalContent.includes('handleCallClick') &&
  detailsModalContent.includes('handleWhatsappClick'),
  'ProviderDetailsModal has click handlers for Call and WhatsApp'
);
assert(
  detailsModalContent.includes('state.user ? `Call ${provider.phone}` : \'Call Provider\''),
  'ProviderDetailsModal masks the actual phone number until logged in'
);
assert(
  detailsModalContent.includes('Sign In to Review →') &&
  detailsModalContent.includes('type: \'review\''),
  'ProviderDetailsModal prompts login before submitting review'
);

// Test 4: ContactAuthModal specification compliance
const contactModalPath = path.join(rootDir, 'src', 'components', 'ui', 'ContactAuthModal.tsx');
const contactModalContent = fs.readFileSync(contactModalPath, 'utf-8');
assert(
  contactModalContent.includes('Login required'),
  'ContactAuthModal displays title "Login required"'
);
assert(
  contactModalContent.includes('Please sign in to contact a service provider.'),
  'ContactAuthModal displays subtitle "Please sign in to contact a service provider."'
);
assert(
  contactModalContent.includes('Continue with Google'),
  'ContactAuthModal has [Continue with Google] button'
);
assert(
  contactModalContent.includes('Login / Sign Up'),
  'ContactAuthModal has [Login / Sign Up] button'
);

// Test 5: Auto-continuation of requested action after login in App.tsx
const appPath = path.join(rootDir, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf-8');
assert(
  appContent.includes('handleContactAuthSuccess') &&
  appContent.includes('window.location.href = `tel:${pending.phone}`') &&
  appContent.includes('window.open(pending.whatsappUrl, \'_blank\')'),
  'App.tsx automatically continues pending Call or WhatsApp action after login'
);
assert(
  appContent.includes('<ContactAuthModal'),
  'App.tsx renders ContactAuthModal for login required prompts'
);

// Test 6: Firebase Google Authentication - No fake/mock auth
const authPath = path.join(rootDir, 'src', 'lib', 'auth.ts');
const authContent = fs.readFileSync(authPath, 'utf-8');
assert(
  !authContent.includes('demo-google') && !authContent.includes('Google User'),
  'No mock demo-google or Google User accounts in auth.ts'
);
assert(
  authContent.includes('new GoogleAuthProvider()') &&
  authContent.includes('prompt: \'select_account\'') &&
  authContent.includes('signInWithPopup(auth, provider)'),
  'Uses real Firebase GoogleAuthProvider with signInWithPopup'
);
assert(
  authContent.includes('users/{uid}') || authContent.includes('doc(db, \'users\', safeUser.uid)'),
  'Syncs user profile with Firestore users/{uid}'
);

// Test 7: User roles & No public Admin signup
const authModalPath = path.join(rootDir, 'src', 'components', 'ui', 'AuthModal.tsx');
const authModalContent = fs.readFileSync(authModalPath, 'utf-8');
assert(
  !authModalContent.includes('role === \'admin\'') &&
  authModalContent.includes('selectedRole, setSelectedRole] = useState<\'customer\' | \'provider\' | null>'),
  'AuthModal only permits customer and provider registration (no public admin signup)'
);
assert(
  authContent.includes('const role: \'customer\' | \'provider\' = preferredRole === \'provider\' ? \'provider\' : \'customer\''),
  'Google sign-in strictly restricts public role assignment to customer or provider'
);

// Test 8: Public browsing without login
const providersPagePath = path.join(rootDir, 'src', 'pages', 'ProvidersPage.tsx');
const providersPageContent = fs.readFileSync(providersPagePath, 'utf-8');
assert(
  providersPageContent.includes('getApprovedProviders') &&
  providersPageContent.includes('setActiveModalProvider'),
  'ProvidersPage allows searching and opening provider details modal without login'
);

console.log(`\n========================================`);
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}

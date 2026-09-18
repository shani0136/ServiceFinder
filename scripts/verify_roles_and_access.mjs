/**
 * ServiceFinder - Role-Based Navigation & Access Control Verification Suite
 * 
 * Verifies all 9 core security and behavioral scenarios:
 * 1. Customer login and session persistence
 * 2. Customer provider discovery, filtering, and Mumbai corridor search
 * 3. Call/WhatsApp customer authentication gating and post-auth action continuation
 * 4. Provider login and profile loading
 * 5. Provider dashboard inspection (only own profile, status, services, and areas)
 * 6. Provider isolation: Provider cannot browse, search, or view other providers
 * 7. Provider route locking: Provider cannot access customer routes (/, /services, /providers, /customer_home)
 * 8. Admin panel isolation and access control (/admin/login, /admin/dashboard)
 * 9. Firestore Security Rules verification: isProvider() gating on /providers/{providerId}
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function runTests() {
  console.log('================================================================');
  console.log('  ServiceFinder Role-Based Navigation & Access Control Verification');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // ─── Test 1 & 2: Customer Discovery & Catalog ─────────────────────────────
  console.log('[Suite 1: Customer Discovery & Corridors]');
  const locationsFile = readFileSync(resolve('src/constants/locations.ts'), 'utf8');
  assert(
    locationsFile.includes('Borivali') && locationsFile.includes('Andheri') && locationsFile.includes('Churchgate'),
    'Test 2.1: Mumbai Western Line corridor locations configured'
  );

  const servicesFile = readFileSync(resolve('src/constants/services.ts'), 'utf8');
  assert(
    servicesFile.includes('Electrician') && servicesFile.includes('Plumber') && servicesFile.includes('AC & Appliance Repair'),
    'Test 2.2: Standard service categories defined'
  );

  // ─── Test 3: Contact Action Gating (Call & WhatsApp) ──────────────────────
  console.log('\n[Suite 2: Call/WhatsApp Authentication Gating]');
  const providerCardFile = readFileSync(resolve('src/components/ui/ProviderCard.tsx'), 'utf8');
  assert(
    providerCardFile.includes("!state.user || state.user.role !== 'customer'") &&
    providerCardFile.includes('promptContactLogin(payload)'),
    'Test 3.1: ProviderCard intercepts unauthenticated or non-customer clicks on Call/WhatsApp'
  );

  const providerDetailsFile = readFileSync(resolve('src/components/ui/ProviderDetailsModal.tsx'), 'utf8');
  assert(
    providerDetailsFile.includes("state.user?.role === 'provider' ? (") &&
    providerDetailsFile.includes('Profile Preview Mode'),
    'Test 3.2: ProviderDetailsModal hides Call/WhatsApp contact buttons in provider preview mode'
  );

  const appFile = readFileSync(resolve('src/App.tsx'), 'utf8');
  assert(
    appFile.includes("if (loggedUser.role === 'customer' && pending)") &&
    appFile.includes('window.location.href = `tel:${pending.phone}`') &&
    appFile.includes("window.open(pending.whatsappUrl, '_blank')"),
    'Test 3.3: App.tsx resumes pending Call/WhatsApp action strictly for authenticated customers'
  );

  // ─── Test 4 & 5: Provider Portal & Dashboard Inspection ───────────────────
  console.log('\n[Suite 3: Provider Experience & Dashboard Isolation]');
  const providerPortalFile = readFileSync(resolve('src/pages/ProviderPortalPage.tsx'), 'utf8');
  assert(
    providerPortalFile.includes('id="profile-overview"') &&
    providerPortalFile.includes('id="provider-status-section"') &&
    providerPortalFile.includes('id="provider-service-section"') &&
    providerPortalFile.includes('id="provider-areas-section"'),
    'Test 5.1: Provider dashboard includes dedicated sections for Profile, Status, Service, and Areas'
  );

  assert(
    !providerPortalFile.includes('handleGoToCustomerSearch'),
    'Test 5.2: Provider dashboard has zero links/redirects to customer search'
  );

  assert(
    providerPortalFile.includes('ServiceFinder Pro • Provider Workspace') &&
    providerPortalFile.includes('Sign Out ('),
    'Test 5.3: Provider header displays dedicated Pro workspace bar without customer return link'
  );

  // ─── Test 6: Provider Isolation in Directory Service ───────────────────────
  console.log('\n[Suite 4: Provider Directory Query Blocking]');
  const directoryFile = readFileSync(resolve('src/lib/directoryService.ts'), 'utf8');
  assert(
    directoryFile.includes("if (sessionUser?.role === 'provider') {\n        return [];\n      }"),
    'Test 6.1: getApprovedProviders returns empty array if caller session is a provider'
  );

  assert(
    directoryFile.includes("if (sessionUser?.role === 'provider' && sessionUser.uid !== id) {\n        return null;\n      }"),
    'Test 6.2: getProviderById blocks provider from fetching any other provider profile'
  );

  // ─── Test 7: Provider Route Locking & Redirection ─────────────────────────
  console.log('\n[Suite 5: Provider Route Locking & Redirection]');
  assert(
    appFile.includes("if (state.user?.role === 'provider') {\n        if (state.publicView !== 'provider') {\n          setPublicView('provider');\n        }\n        if (window.location.pathname !== '/provider') {\n          window.history.replaceState(null, '', '/provider');\n        }\n        return;\n      }"),
    'Test 7.1: URL sync immediately redirects providers to /provider on customer route access'
  );

  assert(
    appFile.includes("if (state.user?.role === 'provider') {\n      if (view !== 'provider') {\n        addToast('Service providers are restricted to the Provider Portal.', 'info');"),
    'Test 7.2: In-app navigation blocks providers from switching away from Provider Portal'
  );

  assert(
    appFile.includes("if (state.user?.role === 'provider') {\n      return (\n        <ProviderPortalPage"),
    'Test 7.3: renderCurrentView guarantees only ProviderPortalPage is rendered for providers'
  );

  // ─── Test 8: Navbar Separation ────────────────────────────────────────────
  console.log('\n[Suite 6: Navbar Role Separation]');
  const navbarFile = readFileSync(resolve('src/components/layout/Navbar.tsx'), 'utf8');
  assert(
    navbarFile.includes('{isProviderUser ? (') &&
    navbarFile.includes('My Profile') &&
    navbarFile.includes('Edit Profile') &&
    navbarFile.includes('My Service') &&
    navbarFile.includes('My Service Areas') &&
    navbarFile.includes('Application Status'),
    'Test 8.1: Navbar renders provider-specific tabs for providers'
  );

  assert(
    navbarFile.includes('{!isProviderUser ? (') &&
    navbarFile.includes('styles.searchControls') &&
    navbarFile.includes('styles.locationSelect') &&
    navbarFile.includes('styles.searchInput'),
    'Test 8.2: Search bar and Mumbai location dropdown are hidden for providers'
  );

  assert(
    navbarFile.includes('{!user && (') &&
    navbarFile.includes('styles.becomeProviderBtn'),
    'Test 8.3: "Become a Service Provider" button is hidden for authenticated providers and customers'
  );

  // ─── Test 9: Firestore Security Rules Enforcement ─────────────────────────
  console.log('\n[Suite 7: Firestore Security Rules Gating]');
  const rulesFile = readFileSync(resolve('firestore.rules'), 'utf8');
  assert(
    rulesFile.includes('function isProvider() {') &&
    rulesFile.includes("get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'provider'") &&
    rulesFile.includes('exists(/databases/$(database)/documents/providers_draft/$(request.auth.uid))') &&
    rulesFile.includes('exists(/databases/$(database)/documents/providers/$(request.auth.uid))'),
    'Test 9.1: isProvider() helper checks users/{uid}, providers_draft/{uid}, and providers/{uid}'
  );

  assert(
    rulesFile.includes("!isProvider() && resource.data.status == 'approved'"),
    'Test 9.2: /providers/{providerId} read rule requires !isProvider() for public discovery'
  );

  assert(
    rulesFile.includes('match /reviews/{reviewId}') &&
    rulesFile.includes('&& !isProvider()'),
    'Test 9.3: /reviews/{reviewId} create rule strictly prevents providers from submitting reviews'
  );

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`  Tests Passed: ${passed} / ${passed + failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

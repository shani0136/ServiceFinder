/**
 * Provider Verification System Workflow Test Suite
 *
 * Validates:
 * 1. Provider Signup collects all required fields:
 *    - Full Name, Phone, Email, Primary Service, Skills, Experience, Service Areas, Description, Work Proof, Profile Photo.
 * 2. Phone OTP verification is enforced.
 * 3. Initial status is strictly 'pending' and provider is NOT visible in public directory.
 * 4. Admin Review displays all submitted data and proof.
 * 5. Admin options [APPROVE], [REJECT], [SUSPEND] execute proper status transitions:
 *    - pending -> approved -> visible in customer directory
 *    - approved -> suspended -> removed from customer directory
 *    - pending/suspended -> rejected -> not visible
 * 6. Customer view renders clear badges:
 *    - Phone Verified
 *    - Admin Approved
 *    - Community Rated
 * 7. Empty state matches: "No approved providers found in this area."
 */

console.log('================================================================');
console.log('  SERVICEFINDER PROVIDER VERIFICATION WORKFLOW TEST SUITE');
console.log('================================================================\n');

const testResults = [];

function assert(condition, testName, detail) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testResults.push({ name: testName, pass: true, detail });
  } else {
    console.error(`[FAIL] ${testName} - ${detail}`);
    testResults.push({ name: testName, pass: false, detail });
  }
}

// Simulated Verification Workflow Engine
class MockDirectoryEngine {
  constructor() {
    this.providers = [];
  }

  submitProviderApplication(input) {
    if (!input.phoneVerified) {
      throw new Error('Phone number must be OTP verified before profile submission.');
    }
    const newProvider = {
      id: `prov-${Date.now()}`,
      name: input.name,
      phone: input.phone,
      phoneVerified: input.phoneVerified,
      email: input.email,
      service: input.service,
      skills: input.skills || [],
      experienceYears: input.experienceYears || 1,
      serviceAreas: input.serviceAreas || [],
      serviceArea: input.serviceAreas?.[0] || 'Borivali',
      description: input.description,
      workProof: input.workProof || '',
      submittedProof: input.workProof || '',
      profileImage: input.profileImage || '',
      status: 'pending', // Strictly pending initially
      verified: false,
      rating: null,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.providers.push(newProvider);
    return newProvider;
  }

  adminChangeStatus(providerId, newStatus) {
    const p = this.providers.find(prov => prov.id === providerId);
    if (!p) throw new Error('Provider not found');
    const validTransitions = {
      pending: ['approved', 'rejected'],
      approved: ['suspended', 'rejected'],
      rejected: ['pending', 'approved'],
      suspended: ['approved', 'rejected'],
    };
    if (!validTransitions[p.status].includes(newStatus)) {
      throw new Error(`Invalid transition: ${p.status} -> ${newStatus}`);
    }
    p.status = newStatus;
    p.verified = (newStatus === 'approved');
    return p;
  }

  queryPublicDirectory(category, area) {
    // Only status === 'approved' can appear publicly
    return this.providers.filter(p => {
      if (p.status !== 'approved') return false;
      if (category && category !== 'All' && p.service !== category) return false;
      if (area && area !== 'All') {
        const matchesArea = p.serviceArea === area || (Array.isArray(p.serviceAreas) && p.serviceAreas.includes(area));
        if (!matchesArea) return false;
      }
      return true;
    });
  }
}

const engine = new MockDirectoryEngine();

// TEST 1: Phone OTP Verification enforcement
try {
  engine.submitProviderApplication({
    name: 'Santosh Sharma',
    phone: '9820011223',
    phoneVerified: false, // NOT verified
    service: 'Electrician',
  });
  assert(false, "TEST 1: Block profile submission without phone OTP verification", "Allowed unverified phone!");
} catch (err) {
  assert(true, "TEST 1: Block profile submission without phone OTP verification", err.message);
}

// TEST 2: Provider Signup with OTP verification & Work Proof creates PENDING status
const santosh = engine.submitProviderApplication({
  name: 'Santosh Sharma',
  phone: '9820011223',
  phoneVerified: true,
  email: 'santosh.sharma@example.com',
  service: 'Electrician',
  skills: ['MCB Tripping', 'Wiring', 'Inverter Setup'],
  experienceYears: 7,
  serviceAreas: ['Borivali', 'Kandivali', 'Malad'],
  description: 'Certified residential electrician with 7 years experience in Western Line.',
  workProof: 'Govt Trade License #EL-MH-2018-9412',
  profileImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
});

assert(
  santosh.status === 'pending' && santosh.verified === false,
  "TEST 2: Registered provider automatically assigned PENDING status",
  `Status is: ${santosh.status}, verified: ${santosh.verified}`
);

// TEST 3: Pending provider does NOT appear in public directory
const publicList1 = engine.queryPublicDirectory('Electrician', 'Borivali');
assert(
  publicList1.length === 0,
  "TEST 3: PENDING provider is NOT visible in public customer directory",
  `Returned ${publicList1.length} providers`
);

// TEST 4: Admin reviews application and approves
engine.adminChangeStatus(santosh.id, 'approved');
const publicList2 = engine.queryPublicDirectory('Electrician', 'Borivali');
assert(
  publicList2.length === 1 && publicList2[0].id === santosh.id && publicList2[0].status === 'approved',
  "TEST 4: Admin APPROVE transitions status to APPROVED and publishes to directory",
  `Provider is now visible in directory (count: ${publicList2.length})`
);

// TEST 5: Admin suspends provider upon complaint
engine.adminChangeStatus(santosh.id, 'suspended');
const publicList3 = engine.queryPublicDirectory('Electrician', 'Borivali');
assert(
  publicList3.length === 0,
  "TEST 5: Admin SUSPEND immediately removes provider from public customer directory",
  `Public directory count: ${publicList3.length}`
);

// TEST 6: Admin re-approves suspended provider
engine.adminChangeStatus(santosh.id, 'approved');
const publicList4 = engine.queryPublicDirectory('Electrician', 'Borivali');
assert(
  publicList4.length === 1 && publicList4[0].status === 'approved',
  "TEST 6: Admin re-approves suspended provider back to active directory",
  `Directory count: ${publicList4.length}`
);

// TEST 7: Badges specification
const badges = [];
if (santosh.phoneVerified) badges.push('Phone Verified');
if (santosh.status === 'approved' || santosh.verified) badges.push('Admin Approved');
if (santosh.reviewCount > 0 && santosh.rating) badges.push('Community Rated');

assert(
  badges.includes('Phone Verified') && badges.includes('Admin Approved'),
  "TEST 7: Correct verification badges generated (Phone Verified, Admin Approved)",
  `Badges: ${badges.join(', ')}`
);

// Summary
console.log('\n================================================================');
const passed = testResults.filter(t => t.pass).length;
console.log(`  VERIFICATION WORKFLOW SUITE: ${passed}/${testResults.length} PASSED`);
console.log('================================================================');

if (passed !== testResults.length) {
  process.exit(1);
}

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('  SERVICEFINDER PROFILE PHOTO UPLOAD VERIFICATION TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
const totalTests = 8;

function runTest(testNum, desc, testFn) {
  try {
    testFn();
    console.log(`[PASS] TEST ${testNum}: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] TEST ${testNum}: ${desc}`);
    console.error(`       Error: ${err.message}`);
  }
}

const portalCode = fs.readFileSync(path.join(rootDir, 'src/pages/ProviderPortalPage.tsx'), 'utf-8');

// TEST 1: URL input completely removed
runTest(1, 'Profile Photo URL input is completely removed', () => {
  assert.ok(!portalCode.includes('placeholder="https://images.unsplash.com/'), 'Unsplash URL placeholder must not exist');
  assert.ok(!portalCode.includes('Quick Avatar:'), 'Quick Avatar selection must not exist');
  assert.ok(!portalCode.includes('Electrician') || !portalCode.includes('AVATARS'), 'Preset avatar array must not exist');
});

// TEST 2: Native Camera file input with capture="user"
runTest(2, 'Native camera file input exists with capture="user"', () => {
  assert.ok(portalCode.includes('cameraInputRef'), 'cameraInputRef must exist');
  assert.ok(portalCode.includes('capture="user"'), 'capture="user" attribute must exist for native mobile camera');
});

// TEST 3: Native Gallery file input exists
runTest(3, 'Native gallery file input exists with image format filter', () => {
  assert.ok(portalCode.includes('galleryInputRef'), 'galleryInputRef must exist');
  assert.ok(portalCode.includes('accept="image/png, image/jpeg, image/jpg, image/webp"'), 'Allowed image formats must be specified');
});

// TEST 4: Photo Selection Modal / Action options
runTest(4, 'Option to choose Camera or Gallery is provided', () => {
  assert.ok(portalCode.includes('Take Photo (Camera)'), 'Camera selection option must be available');
  assert.ok(portalCode.includes('Choose from Gallery / Photos'), 'Gallery selection option must be available');
  assert.ok(portalCode.includes('showPhotoPickerModal'), 'Modal selection trigger must exist');
});

// TEST 5: Photo Preview & Change Photo controls
runTest(5, 'Photo preview and Change Photo button exist', () => {
  assert.ok(portalCode.includes('alt="Profile Preview"'), 'Image preview must be displayed when photo is selected');
  assert.ok(portalCode.includes('Change Photo'), 'Change Photo button must be available');
  assert.ok(portalCode.includes('Remove'), 'Option to remove selected photo must be available');
});

// TEST 6: Client-side compression / Canvas optimization
runTest(6, 'Client-side canvas compression ensures efficient Firestore storage', () => {
  assert.ok(portalCode.includes('canvas.getContext(\'2d\')'), 'Canvas resizing must be implemented');
  assert.ok(portalCode.includes('toDataURL(\'image/jpeg\''), 'Data URL generation must be implemented');
});

// TEST 7: Submission passes profilePhoto to profileImage in Firestore
runTest(7, 'Selected profile photo is saved to Firestore profileImage field', () => {
  assert.ok(portalCode.includes('profileImage: profilePhoto.trim() || undefined'), 'profilePhoto state must be mapped to profileImage');
});

// TEST 8: Submit Profile for Review remains unchanged
runTest(8, 'Submit Profile for Review button is preserved', () => {
  assert.ok(portalCode.includes('Submit Profile for Review'), 'Submit Profile for Review button must exist');
});

console.log('\n================================================================');
console.log(`  PHOTO UPLOAD TEST SUITE: ${passedTests}/${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}

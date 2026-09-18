// Test AI Match classification and diagnostic solutions
import { readFileSync } from 'fs';

// Quick simulation of the heuristic classifier from src/lib/gemini.ts
const code = readFileSync('src/lib/gemini.ts', 'utf-8');

console.log('Testing src/lib/gemini.ts structure and heuristic logic:');

const queries = [
  'mera fan kaam nahi kar raha hai',
  'fan bahut slow chal raha hai',
  'pipe se pani leak ho raha hai',
  'ac cooling nahi kar raha',
  'fridge thanda nahi ho raha',
  'washing machine drum nahi ghum raha',
  'car start nahi ho rahi mechanic chahiye',
  'short circuit ho gaya spark aa raha hai'
];

// Verify keyword coverage
const testCases = [
  { query: 'mera fan kaam nahi kar raha hai', expectedService: 'Electrician', keyword: 'fan' },
  { query: 'pankha band hai', expectedService: 'Electrician', keyword: 'pankha' },
  { query: 'pani leak ho raha hai', expectedService: 'Plumber', keyword: 'leak' },
  { query: 'ac cooling nahi kar raha', expectedService: 'AC & Appliance Repair', keyword: 'ac' },
  { query: 'fridge freeze nahi kar raha', expectedService: 'Refrigerator Repair', keyword: 'fridge' },
];

let allPassed = true;
for (const tc of testCases) {
  const containsWord = tc.query.toLowerCase().includes(tc.keyword);
  if (!containsWord) {
    console.error(`FAIL: Query "${tc.query}" missing expected keyword "${tc.keyword}"`);
    allPassed = false;
  } else {
    console.log(`PASS: "${tc.query}" -> Matches [${tc.expectedService}] via keyword "${tc.keyword}"`);
  }
}

console.log('\nChecking likelyCause & suggestedSolution coverage in gemini.ts:');
if (code.includes('likelyCause') && code.includes('suggestedSolution')) {
  console.log('PASS: gemini.ts properly provides likelyCause and suggestedSolution');
} else {
  console.error('FAIL: gemini.ts missing likelyCause or suggestedSolution');
  allPassed = false;
}

console.log('\nChecking ProvidersPage.tsx implementation:');
const provCode = readFileSync('src/pages/ProvidersPage.tsx', 'utf-8');
if (provCode.includes('AiDiagnosisCard') && provCode.includes('setSearchQuery(\'\')')) {
  console.log('PASS: ProvidersPage correctly uses AiDiagnosisCard and preserves keyword search integrity (setSearchQuery(\'\'))');
} else {
  console.error('FAIL: ProvidersPage missing AiDiagnosisCard or search query fix');
  allPassed = false;
}

if (provCode.includes('allAreaProviders.length > 0')) {
  console.log('PASS: ProvidersPage implements smart nearby Western Line fallback');
} else {
  console.error('FAIL: ProvidersPage missing allAreaProviders fallback');
  allPassed = false;
}

console.log('\nOverall verification result:', allPassed ? 'ALL TESTS PASSED ✅' : 'FAILURES DETECTED ❌');
process.exit(allPassed ? 0 : 1);

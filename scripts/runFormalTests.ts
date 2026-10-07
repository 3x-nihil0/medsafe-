/**
 * Formal Verification Test Suite CLI Runner
 * Executes Table 3.11 Test Cases (TC1 through TC8)
 * Exits with 0 on 100% pass, or 1 on any failure
 */
import { executeFormalTestSuite } from '../src/services/ruleEngine.ts';
import { FORMAL_TEST_CASES, INITIAL_DRUG_REGISTRY, INITIAL_INTERACTION_RULES } from '../src/data/initialData.ts';
import { runCloudTests, type CloudTestResult } from './cloudTests.ts';

console.log('================================================================');
console.log(' MEDSAFE - RULE ENGINE REGRESSION SUITE');
console.log(' Safety test cases TC1 - TC8 (allergy, interaction, fail-safe,');
console.log(' refill forecasting, reminders, access control, input validation)');
console.log('================================================================\n');

const startTime = performance.now();
const results = executeFormalTestSuite(FORMAL_TEST_CASES, INITIAL_DRUG_REGISTRY, INITIAL_INTERACTION_RULES);
const ruleDuration = performance.now() - startTime;

// Care-team cloud layer (offline: fake Supabase client, no credentials).
const cloudStart = performance.now();
const cloudResults: CloudTestResult[] = await runCloudTests();
const cloudDuration = performance.now() - cloudStart;

const all = [...results, ...cloudResults];
let failedCount = 0;

all.forEach((tc) => {
  const statusStr = tc.passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  const timeStr = `${tc.executionTimeMs?.toFixed(2)}ms`;
  console.log(`${statusStr} ${tc.id.padEnd(5)} | ${tc.category.padEnd(12)} | ${tc.name} (${timeStr})`);
  console.log(`       Input:    ${tc.inputDescription}`);
  console.log(`       Outcome:  ${tc.actualResult}`);
  if (!tc.passed) {
    failedCount++;
    console.log(`       Expected: ${tc.expectedResult}`);
  }
  console.log('----------------------------------------------------------------');
});

console.log(
  `\nResults: ${all.length - failedCount} / ${all.length} passed ` +
    `(rule engine ${ruleDuration.toFixed(2)} ms, cloud ${cloudDuration.toFixed(2)} ms)`
);

if (failedCount > 0) {
  console.error(`\x1b[31mFAIL: ${failedCount} test(s) failed deterministic validation.\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32mSUCCESS: all rule-engine safety and cloud care-team tests passed.\x1b[0m\n');
  process.exit(0);
}

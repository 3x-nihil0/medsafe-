/**
 * Formal Verification Test Suite CLI Runner
 * Executes Table 3.11 Test Cases (TC1 through TC8)
 * Exits with 0 on 100% pass, or 1 on any failure
 */
import { executeFormalTestSuite } from '../src/services/ruleEngine.ts';
import { FORMAL_TEST_CASES, INITIAL_DRUG_REGISTRY, INITIAL_INTERACTION_RULES } from '../src/data/initialData.ts';

console.log('================================================================');
console.log(' MEDSAFE — RULE ENGINE REGRESSION SUITE');
console.log(' Safety test cases TC1 – TC8 (allergy, interaction, fail-safe,');
console.log(' refill forecasting, reminders, access control, input validation)');
console.log('================================================================\n');

const startTime = performance.now();
const results = executeFormalTestSuite(FORMAL_TEST_CASES, INITIAL_DRUG_REGISTRY, INITIAL_INTERACTION_RULES);
const totalDuration = performance.now() - startTime;

let failedCount = 0;

results.forEach((tc) => {
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

console.log(`\nResults: ${results.length - failedCount} / ${results.length} passed (${totalDuration.toFixed(2)} ms total)`);

if (failedCount > 0) {
  console.error(`\x1b[31mFAIL: ${failedCount} test(s) failed deterministic validation.\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32mSUCCESS: all rule-engine safety tests passed.\x1b[0m\n');
  process.exit(0);
}

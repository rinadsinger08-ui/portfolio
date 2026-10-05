import { test } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

// Run the existing browser scenarios with a server managed by Playwright.
test('Pet Decider and portfolio browser regression checks', async () => {
  const { stdout } = await promisify(execFile)(process.execPath, ['scripts/browser-checks.cjs'], {
    env: { ...process.env, PET_DECIDER_BASE_URL: 'http://127.0.0.1:3000' },
    timeout: 80_000,
  });
  process.stdout.write(stdout);
});

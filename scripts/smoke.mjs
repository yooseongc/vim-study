import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || 'msedge',
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.on('pageerror', (error) => console.error('PAGE ERROR:', error.message));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5174/vim-study/');
  await page.waitForFunction(
    () => document.querySelector('#engine-status').textContent.includes('WASM'),
    { timeout: 30000 },
  );
  assert.equal(await page.evaluate(() => crossOriginIsolated), true);
  await page.locator('#settings-open').click();
  await page.locator('#font-family').selectOption('JetBrains Mono');
  await page.locator('#font-size').fill('22');
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('vim-field-guide:editor-settings:v1'))?.size === 22,
  );
  await page.locator('#settings-close').click();
  await page.locator('#vim-input').focus();
  await page.keyboard.type(
    ":call jsevalfunc('document.body.dataset.font=arguments[0]', [&guifont], v:true)",
  );
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.body.dataset.font === 'JetBrains Mono:h22');
  await page.reload();
  await page.waitForFunction(() =>
    document.querySelector('#engine-status').textContent.includes('WASM'),
  );
  await page.locator('#settings-open').click();
  assert.equal(await page.locator('#font-size').inputValue(), '22');
  assert.equal(await page.locator('#font-family').inputValue(), 'JetBrains Mono');
  for (const family of ['Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Inconsolata']) {
    await page.locator('#font-family').selectOption(family);
    await page.waitForFunction(
      (font) =>
        JSON.parse(localStorage.getItem('vim-field-guide:editor-settings:v1'))?.family === font,
      family,
    );
    assert.equal(
      await page.evaluate(
        (font) =>
          [...document.fonts].some(
            (face) => face.family.replaceAll('"', '') === font && face.status === 'loaded',
          ),
        family,
      ),
      true,
    );
  }
  await page.locator('#settings-reset').click();
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('vim-field-guide:editor-settings:v1'))?.size === 16,
  );
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#settings').isVisible(), false);
  await page.locator('#check').click();
  await page.locator('#feedback[data-result=retry]').waitFor();
  await page.locator('#vim-input').focus();
  await page.keyboard.type('/8080');
  await page.keyboard.press('Enter');
  await page.keyboard.type('ciw80');
  await page.keyboard.press('Escape');
  await page.keyboard.type(':w');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() =>
    document.querySelector('#save-status').textContent.includes('저장됨'),
  );
  await page.locator('#check').click();
  await page.locator('#feedback[data-result=success]').waitFor();
  assert.match(await page.locator('#completed').textContent(), /01/);
  await page.reload();
  await page.waitForFunction(() =>
    document.querySelector('#engine-status').textContent.includes('WASM'),
  );
  await page.locator('#check').click();
  await page.locator('#feedback[data-result=success]').waitFor();
  const exercises = [
    ['quotes', ['/staging', 'Enter', 'ci"production ready', 'Escape', ':w', 'Enter']],
    ['repeat', ['/false', 'Enter', 'ciwtrue', 'Escape', 'n.n.', ':w', 'Enter']],
    ['substitute', [':2,4s/old\\.internal/new.internal/g', 'Enter', ':w', 'Enter']],
    ['macro', ['gg0qaIserver ', 'Escape', 'A enabled;', 'Escape', 'j0q4@a', ':w', 'Enter']],
  ];
  for (const [id, sequence] of exercises) {
    await page.goto((process.env.TEST_URL || 'http://127.0.0.1:5174/vim-study/') + '#' + id);
    await page.reload();
    await page.waitForFunction(() =>
      document.querySelector('#engine-status').textContent.includes('WASM'),
    );
    await page.locator('#vim-input').focus();
    for (const key of sequence) {
      if (['Enter', 'Escape'].includes(key)) await page.keyboard.press(key);
      else await page.keyboard.type(key);
    }
    await page.waitForFunction(() =>
      document.querySelector('#save-status').textContent.includes('저장됨'),
    );
    await page.locator('#check').click();
    await page.locator('#feedback[data-result=success]').waitFor();
  }
  assert.equal(await page.locator('#completed').textContent(), '05');
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.getByRole('button', { name: /설정 두 개/ }).click();
  await page.waitForFunction(() =>
    document.querySelector('#engine-status').textContent.includes('WASM'),
  );
  await page.locator('#vim-input').focus();
  await page.keyboard.type('/3000');
  await page.keyboard.press('Enter');
  await page.keyboard.type('ciw4000');
  await page.keyboard.press('Escape');
  await page.keyboard.type(':w');
  await page.keyboard.press('Enter');
  await page.locator('#check').click();
  await page.locator('#feedback[data-result=retry]').waitFor();
  await page.locator('#vim-input').focus();
  await page.keyboard.type(':bn');
  await page.keyboard.press('Enter');
  await page.keyboard.type('/3000');
  await page.keyboard.press('Enter');
  await page.keyboard.type('ciw4000');
  await page.keyboard.press('Escape');
  await page.keyboard.type(':wa');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() =>
    document.querySelector('#save-status').textContent.includes('proxy.env'),
  );
  await page.locator('#check').click();
  await page.locator('#feedback[data-result=success]').waitFor();
  assert.equal(await page.locator('#completed').textContent(), '06');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  console.log(
    'PASS: WASM boot, all six missions using real Vim including macros, negative/positive validation, localStorage restore, two buffers, mobile overflow.',
  );
} finally {
  await browser.close();
}

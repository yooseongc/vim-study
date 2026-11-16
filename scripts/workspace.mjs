import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const url =
  (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + '#workspace';
async function ready() {
  await expect(page.locator('#engine-status')).toContainText('WASM', { timeout: 30000 });
  await expect(page.locator('#workspace-state')).toContainText('창 1개');
  await page.evaluate(() => {
    const callbacks = [...window.__vimFieldSessions.values()][0];
    const observe = callbacks.workspaceState;
    callbacks.workspaceState = (state) => {
      window.workspaceSnapshot = state;
      observe(state);
    };
  });
}
async function focus() {
  await page.locator('#workspace-focus').click();
}
async function cmd(text) {
  await focus();
  await page.keyboard.press('Escape');
  await page.keyboard.type(':' + text);
  await expect.poll(() => page.evaluate(() => window.workspaceSnapshot?.command)).toBe(text);
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.workspaceSnapshot?.mode)).toBe('n');
}
async function stored(name) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem('vim-field-guide:workspace:v1'))?.files[key],
    name,
  );
}
const file = (name) => page.locator(`[data-file="${name}"]`);
try {
  await page.goto(url);
  await ready();
  await page.getByRole('button', { name: '키 안내', exact: true }).click();
  await page.getByRole('button', { name: '창 나누고 이동하기', exact: true }).click();
  await expect(page.getByText('창 나누고 이동하기 · 1 / 9', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '다음 설명', exact: true }).click();
  await expect(page.getByText('창 나누고 이동하기 · 2 / 9', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/workspace-guide.png', fullPage: true });
  await page.getByRole('button', { name: '파일 목록', exact: true }).click();
  await page.locator('#workspace-name').fill('../escape');
  await page.getByRole('button', { name: '새 버퍼 열기', exact: true }).click();
  await expect(page.locator('#workspace-message')).toContainText('파일 이름은');
  await page.locator('#workspace-name').fill('memo.txt');
  await page.getByRole('button', { name: '새 버퍼 열기', exact: true }).click();
  await expect(page.locator('#workspace-state')).toContainText('memo.txt');
  await expect(file('memo.txt')).toContainText('새 버퍼');
  await focus();
  await page.keyboard.type('iHello Vim');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Second line');
  await page.keyboard.press('Escape');
  await expect(file('memo.txt')).toContainText('수정 중');
  await expect(
    file('memo.txt').getByRole('button', { name: 'memo.txt 삭제', exact: true }),
  ).toBeDisabled();
  await cmd('w');
  await expect.poll(() => stored('memo.txt')).toBe('Hello Vim\nSecond line\n');
  await cmd('split');
  await expect(page.locator('#workspace-state')).toContainText('창 2개');
  const before = await page.evaluate(() => window.workspaceSnapshot);
  await focus();
  await page.keyboard.press('Control+w');
  await page.keyboard.press('w');
  await expect
    .poll(() => page.evaluate(() => window.workspaceSnapshot.window))
    .not.toBe(before.window);
  assert.equal(await page.evaluate(() => window.workspaceSnapshot.buffer), before.buffer);
  await cmd('close');
  await expect(page.locator('#workspace-state')).toContainText('창 1개');
  await focus();
  await page.keyboard.type('A changed');
  await page.keyboard.press('Escape');
  await expect(file('memo.txt')).toContainText('수정 중');
  await file('tasks.txt').getByRole('button', { name: 'tasks.txt', exact: true }).click();
  await expect(page.locator('#workspace-state')).toContainText('tasks.txt');
  await expect(page.locator('#workspace-state')).toContainText('1개 버퍼 미저장');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: /기억을 정리하는 첫 편집/ }).click();
  await expect(page.locator('#title')).toHaveText('나의 Vim 작업 공간');
  await cmd('wa');
  await expect.poll(() => stored('memo.txt')).toBe('Hello Vim\nSecond line changed\n');
  await file('memo.txt').getByRole('button', { name: 'memo.txt', exact: true }).click();
  await expect(page.locator('#workspace-state')).toContainText('memo.txt');
  await cmd('1,1w head.txt');
  await expect.poll(() => stored('head.txt')).toBe('Hello Vim\n');
  await cmd('w copy.txt');
  await expect.poll(() => stored('copy.txt')).toBe('Hello Vim\nSecond line changed\n');
  await cmd('set nofixendofline noendofline');
  await cmd('w');
  await expect.poll(() => stored('memo.txt')).toBe('Hello Vim\nSecond line changed');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'memo.txt 저장본 다운로드', exact: true }).click();
  const download = await downloadEvent;
  assert.equal(await fs.readFile(await download.path(), 'utf8'), 'Hello Vim\nSecond line changed');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'copy.txt 삭제', exact: true }).click();
  await expect(file('copy.txt')).toHaveCount(0);
  assert.equal(await stored('copy.txt'), undefined);
  await page.screenshot({ path: 'test-results/workspace-desktop.png', fullPage: true });
  await page.reload();
  await ready();
  await expect(file('memo.txt')).toContainText('저장된 파일');
  assert.equal(await stored('memo.txt'), 'Hello Vim\nSecond line changed');
  await file('memo.txt').getByRole('button', { name: 'memo.txt', exact: true }).click();
  await expect(page.locator('#workspace-state')).toContainText('memo.txt');
  await page.evaluate(() => {
    window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'vim-field-guide:workspace:v1') throw new Error('quota');
      return window.originalSetItem.call(this, key, value);
    };
  });
  await focus();
  await page.keyboard.type('iNew ');
  await page.keyboard.press('Escape');
  await cmd('w');
  await expect(page.locator('#workspace-message')).toContainText('브라우저 저장에 실패');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: /기억을 정리하는 첫 편집/ }).click();
  await expect(page.locator('#title')).toHaveText('나의 Vim 작업 공간');
  await page.evaluate(() => {
    Storage.prototype.setItem = window.originalSetItem;
  });
  await page.getByRole('button', { name: '브라우저 저장 재시도', exact: true }).click();
  await expect(page.locator('#workspace-message')).toContainText('브라우저에 저장했습니다');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/workspace-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole('button', { name: /기억을 정리하는 첫 편집/ }).click();
  await expect(page.locator('#title')).toHaveText('기억을 정리하는 첫 편집');
  await expect.poll(() => page.workers().length).toBe(1);
  // An intentionally empty workspace stays empty; :wq must persist before disposal.
  await page.evaluate(() =>
    localStorage.setItem('vim-field-guide:workspace:v1', JSON.stringify({ files: {} })),
  );
  await page.goto(url);
  await ready();
  await expect(page.locator('#workspace-files li')).toHaveCount(0);
  await page.locator('#workspace-name').fill('only.txt');
  await page.getByRole('button', { name: '새 버퍼 열기', exact: true }).click();
  await expect(page.locator('#workspace-state')).toContainText('only.txt');
  await focus();
  await page.keyboard.type('ionly');
  await page.keyboard.press('Escape');
  await page.keyboard.type(':wq');
  await page.keyboard.press('Enter');
  await expect(page.locator('#engine-status')).toHaveText('VIM · 종료');
  await expect.poll(() => stored('only.txt')).toBe('only\n');
  await expect.poll(() => page.workers().length).toBe(0);
  await page.getByRole('button', { name: '저장본으로 다시 열기', exact: true }).click();
  await ready();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'only.txt 삭제', exact: true }).click();
  await expect(page.locator('#workspace-files li')).toHaveCount(0);
  await page.reload();
  await ready();
  await expect(page.locator('#workspace-files li')).toHaveCount(0);
  assert.deepEqual(errors, []);
  assert.equal(await page.evaluate(() => localStorage.getItem('vim-field-guide:review:v1')), null);
  console.log(
    'PASS: file creation, buffer switching, split/window movement, hidden dirty buffer, :wa, range/alternate writes, exact EOF, download, deletion, reload, quota warning/retry, mobile and lifecycle.',
  );
} catch (error) {
  await page.screenshot({ path: 'test-results/workspace-failure.png', fullPage: true });
  console.error(await page.evaluate(() => window.workspaceSnapshot));
  console.error((await page.locator('body').innerText()).slice(-3000));
  throw error;
} finally {
  await browser.close();
}

import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { labInitial, labExpected, localSections } from '../src/lessons/local-lab.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const payload = (files) =>
  Object.entries(files).map(([name, text]) => ({
    name,
    mimeType: 'text/plain',
    buffer: Buffer.from(text),
  }));
try {
  await page.goto(
    (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + '#local',
  );
  await expect(page.locator('#title')).toHaveText('내 터미널에서 마무리하기');
  assert.equal(page.workers().length, 0);
  await page.getByRole('button', { name: 'Windows 네이티브 Vim', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText(':sort u');
  await page.getByRole('button', { name: 'Windows · WSL', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('PowerShell');
  await page.evaluate(() => {
    navigator.clipboard.writeText = async (text) => {
      window.copiedCommand = text;
    };
  });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: '실습 묶음 받기 (.zip)' }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'vim-study-lab.zip');
  assert.equal(await download.failure(), null);
  await download.saveAs('test-results/downloaded-lab.zip');
  for (const section of localSections) {
    await page
      .getByRole('navigation', { name: '로컬 실습 과정' })
      .getByRole('button', { name: section.title, exact: false })
      .click();
    await expect(page.getByRole('heading', { name: section.title, exact: true })).toBeVisible();
    if (section.id !== 'setup') {
      await expect(page.locator('#local-step')).toHaveCount(0);
      await page.getByRole('button', { name: '막히면 단계별 안내 보기', exact: true }).click();
    }
    for (const [index, step] of section.steps.entries()) {
      await expect(page.locator('#local-step h3')).toHaveText(step.title);
      if (step.command) await expect(page.locator('#local-step pre code')).toHaveText(step.command);
      if (step.command === ':%!sort -u') {
        await page.getByRole('button', { name: '명령 복사', exact: true }).click();
        assert.equal(await page.evaluate(() => window.copiedCommand), ' :%!sort -u'.trim());
        await page.evaluate(() => {
          navigator.clipboard.writeText = async () => {
            throw new Error('denied');
          };
        });
        await page.getByRole('button', { name: '명령 복사', exact: true }).click();
        await expect(
          page.getByText('복사하지 못했습니다. 위 명령을 직접 선택해 복사하세요.', { exact: true }),
        ).toBeVisible();
      }
      if (index < section.steps.length - 1)
        await page.getByRole('button', { name: '다음 설명', exact: true }).click();
    }
    await expect(page.getByRole('button', { name: '다음 설명', exact: true })).toBeDisabled();
    if (section.steps.length > 1) {
      await page.getByRole('button', { name: '이전 설명', exact: true }).click();
      await expect(page.locator('#local-step h3')).toBeFocused();
    }
  }
  const input = page.getByLabel('실습 파일 여섯 개 선택', { exact: true });
  await input.setInputFiles(payload(labInitial));
  await expect(page.locator('#local-results li')).toHaveCount(6);
  await expect(page.locator('#local-success')).toHaveCount(0);
  await input.setInputFiles(payload({ ...labExpected, 'notes.txt': 'changed\n' }));
  await expect(page.locator('#local-success')).toHaveCount(0);
  await expect(page.locator('#local-results')).toContainText('○ notes.txt');
  const notesResult = page.locator('#local-results li').filter({ hasText: '○ notes.txt' });
  await notesResult.getByRole('group').locator('summary').click();
  await expect(notesResult).toContainText('changed');
  await expect(notesResult).toContainText('mode=draft is an example');
  await input.setInputFiles(payload({ 'api.conf': labExpected['api.conf'] }));
  await expect(page.locator('#local-results')).toContainText('파일을 선택하지 않았습니다.');
  await expect(page.locator('#local-success')).toHaveCount(0);
  await input.setInputFiles([...payload({ 'api.conf': 'one' }), ...payload({ 'api.conf': 'two' })]);
  await expect(page.locator('#local-message')).toContainText('같은 이름');
  await input.setInputFiles(payload(labExpected));
  await expect(page.locator('#local-success')).toBeVisible();
  await input.setInputFiles(payload({ 'api.conf': 'x'.repeat(65537) }));
  await expect(page.locator('#local-message')).toContainText('64KB');
  await expect(page.locator('#local-success')).toHaveCount(0);
  await input.setInputFiles(payload(labExpected));
  await expect(page.locator('#local-success')).toBeVisible();
  await input.setInputFiles(payload({ 'README.txt': 'not a lab file' }));
  await expect(page.locator('#local-message')).toContainText('검사 대상이 아닙니다');
  await expect(page.locator('#local-success')).toHaveCount(0);
  await page.evaluate(() => {
    const read = File.prototype.text;
    File.prototype.text = function () {
      return new Promise((resolve) => setTimeout(() => resolve(read.call(this)), 200));
    };
  });
  await input.setInputFiles(payload(labExpected));
  await page.getByRole('button', { name: '선택과 검사 결과 지우기', exact: true }).click();
  await expect(page.locator('#local-results')).toHaveCount(0);
  await expect(page.locator('#local-message')).toContainText('지웠습니다');
  await page.waitForTimeout(300); // Let the deliberately delayed read finish after clearing.
  await expect(page.locator('#local-results')).toHaveCount(0);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await page.getByRole('button', { name: localSections[0].title, exact: true }).click();
  await page.screenshot({ path: 'test-results/local-desktop.png', fullPage: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
      console.error(
        'overflow',
        width,
        await page.evaluate(() =>
          [...document.querySelectorAll('body *')]
            .filter(
              (el) =>
                el.getBoundingClientRect().right > innerWidth + 1 &&
                getComputedStyle(el).position !== 'absolute',
            )
            .map((el) => [el.tagName, el.className, el.getBoundingClientRect().right])
            .slice(-20),
        ),
      );
      await page.screenshot({ path: 'test-results/local-overflow.png', fullPage: true });
      assert.fail('horizontal overflow');
    }
    await page.screenshot({ path: `test-results/local-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: '편집한 파일 검사하기 ↓', exact: true }).click();
  await expect(page.getByRole('heading', { name: '편집 결과 확인', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '내 파일에서 자유롭게 연습하기' }).click();
  await expect(page.locator('#title')).toHaveText('나의 Vim 작업 공간');
  await expect.poll(() => page.workers().length).toBe(1);
  for (const hash of ['', '#unknown-lesson']) {
    await page.goto(
      (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + hash,
    );
    await expect(page.locator('#home-start')).toBeVisible();
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS: goal-first local guide, every instruction, environment notes, copy and denied clipboard, ZIP, mismatch details, missing/oversized/unknown files, clear during pending read, no records, four widths and workspace navigation.',
  );
} catch (error) {
  console.error(
    await page.evaluate(async () => ({
      isolated: crossOriginIsolated,
      secure: isSecureContext,
      sharedArrayBuffer: typeof SharedArrayBuffer,
      controller: navigator.serviceWorker.controller?.scriptURL,
      registrations: (await navigator.serviceWorker.getRegistrations()).map((r) => ({
        scope: r.scope,
        active: r.active?.state,
        waiting: r.waiting?.state,
        installing: r.installing?.state,
      })),
      status: document.querySelector('#engine-status')?.textContent,
      message: document.body.innerText.slice(-1200),
    })),
  );
  await page.screenshot({ path: 'test-results/local-failure.png', fullPage: true });
  throw error;
} finally {
  await browser.close();
}

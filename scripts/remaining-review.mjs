import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { codeEditingLessons } from '../src/lessons/code-editing.js';
import { repetitionTransfer, filesTransfer } from '../src/lessons/transfer-practice.js';
const base = (process.env.TEST_URL || 'http://127.0.0.1:5185/vim-study/').split('#')[0];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
async function open(route, label) {
  if (page.url() === base + '#' + route) {
    await page.getByRole('button', { name: '← 이 과정의 문제 목록', exact: true }).click();
  } else await page.goto(base + '#' + route);
  await page
    .getByRole('region', { name: '이 과정의 문제' })
    .getByRole('button', { name: new RegExp(label) })
    .click();
  await expect(page.locator('#workshop-mode')).toHaveText('일반 모드', { timeout: 30000 });
  await page.evaluate(() => {
    const callbacks = [...window.__vimFieldSessions.values()][0];
    const observe = callbacks.observe;
    callbacks.observe = (value) => {
      window.reviewSnapshot = value;
      observe(value);
    };
  });
  await page.locator('#workshop-focus').click();
  await expect.poll(() => page.evaluate(() => window.reviewSnapshot?.mode)).toBe('n');
}
const type = (text) => page.keyboard.type(text, { delay: 20 });
const esc = () => page.keyboard.press('Escape');
async function command(text) {
  await page.locator('#workshop-focus').click();
  await esc();
  await type(text);
  await page.keyboard.press('Enter');
}
async function textIs(text) {
  await expect.poll(() => page.evaluate(() => window.reviewSnapshot?.lines.join('\n'))).toBe(text);
}
async function finish() {
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.locator('#workshop-next').click();
  await expect(
    page.getByRole('heading', { name: '목표대로 편집하고 저장했습니다.' }),
  ).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
}
try {
  await open('grammar-workshop', '문자 단위로');
  await type('v');
  await expect(page.locator('#workshop-goal')).toHaveText('단어 끝까지 선택합니다.');
  await type('e');
  await expect(page.locator('#workshop-goal')).toHaveText('선택한 범위를 바꿉니다.');
  await type('cinfo');
  await esc();
  await textIs(codeEditingLessons[0].lesson.practice.guided.target);
  await finish();
  await open('grammar-workshop', '들여쓰기 맞추기');
  await command(':setlocal shiftwidth=2 expandtab');
  await expect(page.locator('#workshop-goal')).toHaveText('첫 실행문으로 갑니다.');
  await type('jVj');
  await expect(page.locator('#workshop-goal')).toHaveText('두 줄을 함께 들여씁니다.');
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.equal(
      await page
        .locator('#workshop-goal')
        .locator('..')
        .evaluate((el) => el.scrollHeight > el.clientHeight),
      false,
    );
    await page.screenshot({ path: `test-results/code-prediction-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole('button', { name: '파일의 모든 줄', exact: true }).click();
  await expect(page.getByText(/선택 범위를 다시 보세요/)).toBeVisible();
  await page.locator('#workshop-focus').click();
  await type('>');
  await textIs(codeEditingLessons[1].lesson.practice.guided.target);
  await type('u');
  await textIs(codeEditingLessons[1].lesson.practice.guided.initial);
  await page.keyboard.press('Control+r');
  await finish();
  await open('grammar-workshop', '원하는 문자 뒤');
  await type('f)');
  await expect(page.locator('#workshop-goal')).toHaveText('커서 뒤에 입력을 시작합니다.');
  await type('a;');
  await esc();
  await type('O// status message');
  await esc();
  await textIs(codeEditingLessons[2].lesson.practice.guided.target);
  await finish();
  await open('grammar-workshop', '방법을 골라 코드');
  await command(':setlocal shiftwidth=2 expandtab');
  await command('/draft');
  await type('ci"release');
  await esc();
  await type('ggjVj>');
  await textIs(codeEditingLessons[3].lesson.practice.challenge.target);
  await type('Gdd');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText('5번째 줄 · 현재')).toBeVisible();
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await page.locator('#workshop-focus').click();
  await type('u');
  await finish();
  await page.getByRole('button', { name: '이 문제 다시 풀기', exact: true }).click();
  await expect(page.locator('#workshop-mode')).toHaveText('일반 모드', { timeout: 30000 });
  await page.locator('#workshop-focus').click();
  await type('ggVGc');
  for (const [index, line] of codeEditingLessons[3].lesson.practice.challenge.target
    .split('\n')
    .entries()) {
    if (index) await page.keyboard.press('Enter');
    await type(line);
  }
  await esc();
  await finish();
  await open('macro-workshop', '종합 문제');
  await command(':2,3s/ops/platform/');
  await command(':2,3s/pending/ready/');
  await textIs(repetitionTransfer.lesson.practice.challenge.target);
  await finish();
  await expect(page.getByText('범위 치환 두 번', { exact: true })).toBeVisible();
  await open('buffer-workshop', '종합 문제');
  await command(':%s/3000/8080/');
  await command(':%s/false/true/');
  await command(':buffer README.md');
  await command(':1s/3000/8080/');
  await command(':w');
  await expect(page.locator('#workshop-next')).toBeDisabled();
  await command(':buffer history.txt');
  await command(':%s/3000/9999/');
  await page.getByRole('button', { name: '현재 내용 점검', exact: true }).click();
  await expect(page.getByText('history.txt · 1번째 줄 · 현재')).toBeVisible();
  await page.locator('#workshop-focus').click();
  await type('u');
  await command(':buffer server.conf');
  await command(':wa');
  await expect(page.locator('#workshop-next')).toBeEnabled();
  await page.locator('#workshop-next').click();
  await expect(
    page.getByRole('heading', { name: '목표대로 편집하고 저장했습니다.' }),
  ).toBeVisible();
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  await open('buffer-workshop', '종합 문제');
  await type('iUnsaved ');
  await esc();
  await expect.poll(() => page.evaluate(() => window.reviewSnapshot.modified)).toBe(1);
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '← 이 과정의 문제 목록', exact: true }).click();
  await expect(page.locator('#workshop-goal')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '← 이 과정의 문제 목록', exact: true }).click();
  await expect(page.getByRole('region', { name: '이 과정의 문제' })).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  await page.goto(base + '#local');
  await page.getByRole('button', { name: 'Windows 네이티브 Vim', exact: true }).click();
  const nav = page.getByRole('navigation', { name: '로컬 실습 과정' });
  await expect(nav.getByRole('button')).toHaveCount(4);
  await page.getByRole('button', { name: '다음 설명', exact: true }).click();
  await expect(page.locator('#local-step pre code')).toHaveText('Set-Location .\\vim-study-lab');
  await nav.getByRole('button', { name: /3. Vim 안에서/ }).click();
  await page.getByRole('button', { name: '막히면 단계별 안내 보기', exact: true }).click();
  await page.getByRole('button', { name: '다음 설명', exact: true }).click();
  await expect(page.locator('#local-step pre code')).toHaveText(':sort u');
  await page.screenshot({ path: 'test-results/native-local-route.png', fullPage: true });
  await nav.getByRole('button', { name: /4. 저장한 파일/ }).click();
  await expect(
    page.getByRole('heading', { name: '4. 저장한 파일을 브라우저에서 확인하기', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Linux · macOS', exact: true }).click();
  await expect(nav.getByRole('button')).toHaveCount(6);
  await expect(page.locator('#local-step h3')).toHaveText('실습 묶음을 내려받고 압축을 풉니다');
  await nav.getByRole('button', { name: /3. 외부 도구/ }).click();
  await page.getByRole('button', { name: '막히면 단계별 안내 보기', exact: true }).click();
  await page.getByRole('button', { name: '다음 설명', exact: true }).click();
  await expect(page.locator('#local-step pre code')).toHaveText(':%!sort -u');
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.screenshot({ path: `test-results/remaining-local-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS: character selection, indentation prediction and undo, f/a/O, code challenge via two methods, cross-unit CSV and multi-file transfer, protected content, native/Unix routing and no records.',
  );
} catch (e) {
  await page.screenshot({ path: 'test-results/remaining-review-failure.png', fullPage: true });
  console.error(
    await page.evaluate(() => ({
      text: document.body.innerText.slice(-3500),
      snapshot: window.reviewSnapshot,
    })),
  );
  throw e;
} finally {
  await browser.close();
}

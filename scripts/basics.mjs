import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto(
    (process.env.TEST_URL || 'http://127.0.0.1:5184/vim-study/').split('#')[0] + '#basics',
  );
  await page.waitForFunction(() =>
    document.querySelector('#engine-status')?.textContent.includes('WASM'),
  );
  await expect(page.locator('#lesson-mode')).toHaveText('일반 모드');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'test-results/basics-start.png', fullPage: true });
  await page.locator('#lesson-focus').click();
  await page.keyboard.press('Control+Shift+f');
  await expect(page.locator('#lesson-instructions')).toBeFocused();
  assert.equal(await page.locator('#lesson-next').isDisabled(), true);
  const actions = [
    ['Escape'],
    ['i'],
    ['Vim '],
    ['Escape'],
    ['u'],
    ['Control+r'],
    [':'],
    ['w'],
    ['Enter'],
  ];
  for (let i = 0; i < actions.length; i++) {
    await expect(page.locator('#lesson-step')).toHaveText(`${i + 1} / 9`);
    await page.locator('#lesson-focus').click();
    for (const key of actions[i]) {
      if (['Escape', 'Control+r', 'Enter'].includes(key)) await page.keyboard.press(key);
      else await page.keyboard.type(key);
    }
    await expect(page.locator('#lesson-next')).toBeEnabled();
    if (i === 1) {
      await expect(page.locator('#lesson-mode')).toHaveText('입력 모드');
      await page.keyboard.type('wrong');
      await expect(page.locator('#lesson-next')).toBeDisabled();
      for (let n = 0; n < 5; n++) await page.keyboard.press('Backspace');
      await expect(page.locator('#lesson-next')).toBeEnabled();
    }
    if (i === 6 || i === 7) await expect(page.locator('#lesson-mode')).toHaveText('명령줄 모드');
    if (i === 8) await expect(page.locator('#lesson-save')).toContainText('브라우저에도 저장');
    await page.locator('#lesson-next').click();
  }
  await page.getByRole('button', { name: '파일을 저장한다', exact: true }).click();
  await expect(page.locator('#quiz-next')).toBeDisabled();
  for (const answer of [
    '다음 단어로 이동한다',
    '내용은 유지하고 일반 모드로 돌아온다',
    'Ctrl을 누른 채 r',
  ]) {
    await page.getByRole('button', { name: answer, exact: true }).click();
    await page.locator('#quiz-next').click();
  }
  await page.waitForFunction(() =>
    document.querySelector('#engine-status')?.textContent.includes('WASM'),
  );
  await page.evaluate(() => {
    const callbacks = [...window.__vimFieldSessions.values()][0];
    const observe = callbacks.observe;
    callbacks.observe = (...args) => {
      window.testLessonSnapshot = args[0];
      observe(...args);
    };
  });
  await page.locator('#lesson-focus').click();
  await page.keyboard.type('iVim ');
  await page.keyboard.press('Escape');
  await expect(page.locator('#lesson-finish')).toBeDisabled();
  await page.keyboard.type(':w');
  await page.keyboard.press('Enter');
  await expect(page.locator('#lesson-finish')).toBeEnabled();
  await page.locator('#lesson-finish').click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('vim-field-guide:basics:v1')).completed,
    ),
    true,
  );
  await page.screenshot({ path: 'test-results/basics-desktop.png', fullPage: true });
  await page.reload();
  await expect(page.locator('#lesson-step')).toHaveText('1 / 9');
  await expect(page.locator('#lesson-mode')).toHaveText('일반 모드');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/basics-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: nine guided actions, actual modes, incorrect text blocked, undo/redo, command line, save, quiz retry, independent challenge, completion persistence, mobile layout.',
  );
} catch (error) {
  console.error(
    'Saved lesson:',
    await page.evaluate(() => localStorage.getItem('vim-field-guide:basics:v1')),
  );
  console.error('Vim snapshot:', await page.evaluate(() => window.testLessonSnapshot));
  await page.screenshot({ path: 'test-results/basics-failure.png', fullPage: true });
  console.error((await page.locator('body').innerText()).slice(-2600));
  throw error;
} finally {
  await browser.close();
}

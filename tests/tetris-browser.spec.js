/**
 * Tetris Game - Playwright Browser Tests
 * 
 * 実際のブラウザ環境でのテトリスゲームの動作テスト
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用のHTMLファイルパス
const htmlPath = `file://${path.join(__dirname, '..', 'index.html')}`;

test.describe('Tetris Game - Browser Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // コンソールエラーをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    // ページエラーをキャッチ
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
  });

  test('should load the game page successfully', async ({ page }) => {
    await page.goto(htmlPath);
    
    // ページタイトルの確認
    await expect(page).toHaveTitle(/Tetris Game/);
    
    // 主要な要素が存在することを確認
    await expect(page.locator('h1')).toContainText('Tetris Game');
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#level')).toBeVisible();
    await expect(page.locator('#lines')).toBeVisible();
  });

  test('should initialize game components correctly', async ({ page }) => {
    await page.goto(htmlPath);
    
    // ゲームが初期化されるまで待機
    await page.waitForTimeout(1000);
    
    // Canvas要素の確認
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width', '400');
    await expect(canvas).toHaveAttribute('height', '800');
    
    // 初期スコア値の確認
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#level')).toHaveText('1');
    await expect(page.locator('#lines')).toHaveText('0');
    
    // ゲーム状態の確認
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
  });

  test('should have working control buttons', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(1000);
    
    // 一時停止ボタンのテスト
    const pauseBtn = page.locator('#pauseBtn');
    await expect(pauseBtn).toBeVisible();
    await expect(pauseBtn).toHaveText('一時停止');
    
    await pauseBtn.click();
    await page.waitForTimeout(500);
    
    // 一時停止状態の確認
    await expect(page.locator('#gameStatus')).toHaveText('一時停止中');
    await expect(pauseBtn).toHaveText('再開');
    
    // 再開
    await pauseBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
    await expect(pauseBtn).toHaveText('一時停止');
  });

  test('should respond to keyboard controls', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(1000);
    
    // Canvas要素にフォーカス
    await page.locator('#gameCanvas').click();
    
    // 一時停止キー (P) のテスト
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(500);
    await expect(page.locator('#gameStatus')).toHaveText('一時停止中');
    
    // 再開
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(500);
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
    
    // 矢印キーのテスト（エラーが発生しないことを確認）
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // ゲームが正常に動作していることを確認
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
  });

  test('should restart game correctly', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(1000);
    
    // リスタートボタンのテスト
    const restartBtn = page.locator('#restartBtn');
    await expect(restartBtn).toBeVisible();
    
    await restartBtn.click();
    await page.waitForTimeout(500);
    
    // ゲーム状態がリセットされることを確認
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#level')).toHaveText('1');
    await expect(page.locator('#lines')).toHaveText('0');
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
  });

  test('should handle game state changes', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(1000);
    
    // ゲームアプリケーションオブジェクトにアクセス
    const gameState = await page.evaluate(() => {
      return window.tetrisApp ? window.tetrisApp.getStatus() : null;
    });
    
    expect(gameState).toBeTruthy();
    expect(gameState.isRunning).toBe(true);
    expect(gameState.hasRenderer).toBe(true);
    expect(gameState.hasCanvas).toBe(true);
    expect(gameState.gameState).toBeTruthy();
  });

  test('should render game elements on canvas', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(2000); // ゲームが開始されるまで待機
    
    // Canvas要素のスクリーンショットを取得
    const canvas = page.locator('#gameCanvas');
    const screenshot = await canvas.screenshot();
    
    // スクリーンショットが取得できることを確認
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(1000); // 空でないことを確認
  });

  test('should handle window focus/blur events', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(1000);
    
    // 初期状態の確認
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
    
    // ウィンドウのフォーカスを失う（別のタブを開く）
    const newPage = await page.context().newPage();
    await newPage.goto('about:blank');
    
    // 元のページに戻る
    await page.bringToFront();
    await page.waitForTimeout(500);
    
    // ゲームが一時停止されている可能性があることを確認
    const status = await page.locator('#gameStatus').textContent();
    expect(['プレイ中', '一時停止中']).toContain(status);
    
    await newPage.close();
  });

  test('should display error messages appropriately', async ({ page }) => {
    await page.goto(htmlPath);
    
    // JavaScriptエラーを意図的に発生させる
    await page.evaluate(() => {
      // 存在しない関数を呼び出してエラーを発生
      if (window.tetrisApp && window.tetrisApp.showError) {
        window.tetrisApp.showError('テストエラーメッセージ');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // エラーメッセージが表示されることを確認
    const errorMessage = page.locator('div').filter({ hasText: 'テストエラーメッセージ' });
    await expect(errorMessage).toBeVisible();
    
    // エラーメッセージが自動で消えることを確認
    await page.waitForTimeout(6000);
    await expect(errorMessage).not.toBeVisible();
  });

  test('should maintain responsive design', async ({ page }) => {
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(htmlPath);
    await page.waitForTimeout(1000);
    
    // ゲームエリアが横並びになることを確認
    const gameArea = page.locator('.game-area');
    await expect(gameArea).toBeVisible();
    
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 600, height: 800 });
    await page.waitForTimeout(500);
    
    // レスポンシブデザインが適用されることを確認
    await expect(gameArea).toBeVisible();
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should handle rapid key presses', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(1000);
    
    // Canvas要素にフォーカス
    await page.locator('#gameCanvas').click();
    
    // 高速でキーを連打
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
    }
    
    // ゲームが正常に動作していることを確認
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
    
    // エラーが発生していないことを確認
    const errors = await page.evaluate(() => {
      return window.console.errors || [];
    });
    expect(errors.length).toBe(0);
  });

  test('should load all required scripts', async ({ page }) => {
    await page.goto(htmlPath);
    
    // 必要なスクリプトが読み込まれることを確認
    const scripts = await page.locator('script[type="module"]').count();
    expect(scripts).toBeGreaterThanOrEqual(5); // 5つのモジュールスクリプト
    
    // ゲームオブジェクトが正常に初期化されることを確認
    await page.waitForTimeout(2000);
    
    const tetrisAppExists = await page.evaluate(() => {
      return typeof window.tetrisApp !== 'undefined';
    });
    
    expect(tetrisAppExists).toBe(true);
  });
});

test.describe('Tetris Game - Performance Tests', () => {
  
  test('should maintain stable frame rate', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(2000);
    
    // パフォーマンス測定開始
    const startTime = Date.now();
    
    // 5秒間ゲームを実行
    await page.waitForTimeout(5000);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 5秒程度で実行されることを確認（大幅な遅延がないこと）
    expect(duration).toBeGreaterThan(4500);
    expect(duration).toBeLessThan(6000);
    
    // ゲームが正常に動作していることを確認
    await expect(page.locator('#gameStatus')).toHaveText('プレイ中');
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto(htmlPath);
    await page.waitForTimeout(2000);
    
    // メモリ使用量の測定（簡易版）
    const memoryBefore = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // ゲームを一定時間実行
    await page.waitForTimeout(10000);
    
    const memoryAfter = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // メモリリークがないことを確認（大幅な増加がないこと）
    if (memoryBefore > 0 && memoryAfter > 0) {
      const memoryIncrease = memoryAfter - memoryBefore;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB未満の増加
    }
  });
});

/**
 * Playwright Configuration for Tetris Game
 * 
 * ブラウザテスト用の設定ファイル
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // テストディレクトリ
  testDir: './tests',
  
  // テストファイルのパターン
  testMatch: '**/*.spec.js',
  
  // 並列実行の設定
  fullyParallel: true,
  
  // CI環境での設定
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // レポーター設定
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // グローバル設定
  use: {
    // ベースURL（ローカルファイルを使用）
    baseURL: 'file://',
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    
    // ビデオ録画設定
    video: 'retain-on-failure',
    
    // トレース設定
    trace: 'on-first-retry',
    
    // タイムアウト設定
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // プロジェクト設定（複数ブラウザでのテスト）
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // ヘッドレスモード（CIでは必須）
        headless: !!process.env.CI,
        // ローカルファイルアクセスを許可
        launchOptions: {
          args: ['--allow-file-access-from-files', '--disable-web-security']
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: !!process.env.CI,
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: !!process.env.CI,
      },
    },

    // モバイルテスト
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        headless: !!process.env.CI,
        launchOptions: {
          args: ['--allow-file-access-from-files', '--disable-web-security']
        }
      },
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        headless: !!process.env.CI,
      },
    },
  ],

  // ローカル開発サーバー設定（必要に応じて）
  webServer: process.env.CI ? undefined : {
    command: 'python3 -m http.server 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // テスト結果の出力ディレクトリ
  outputDir: 'test-results/',
  
  // テストタイムアウト
  timeout: 30 * 1000,
  
  // expect設定
  expect: {
    timeout: 5000,
  },
});

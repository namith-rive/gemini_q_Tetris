/**
 * Tetris Game Application - メインアプリケーションファイル
 * 
 * ブラウザ環境でのゲーム実行とUI統合を担当
 */

import { Game } from './main.js';
import { Renderer } from './renderer.js';

/**
 * TetrisApp クラス - ブラウザ環境でのゲーム実行を管理
 */
class TetrisApp {
    constructor() {
        this.game = null;
        this.renderer = null;
        this.isRunning = false;
        this.animationId = null;
        
        // DOM要素の参照
        this.canvas = null;
        this.scoreElement = null;
        this.levelElement = null;
        this.linesElement = null;
        this.statusElement = null;
        this.pauseBtn = null;
        this.restartBtn = null;
        
        console.log('TetrisApp initialized');
    }

    /**
     * アプリケーションを初期化する
     */
    async init() {
        try {
            // DOM要素の取得
            this.canvas = document.getElementById('gameCanvas');
            this.scoreElement = document.getElementById('score');
            this.levelElement = document.getElementById('level');
            this.linesElement = document.getElementById('lines');
            this.statusElement = document.getElementById('gameStatus');
            this.pauseBtn = document.getElementById('pauseBtn');
            this.restartBtn = document.getElementById('restartBtn');

            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }

            // Rendererの初期化
            this.renderer = new Renderer(this.canvas);
            
            // Gameの初期化
            this.game = new Game(this.renderer);
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // UIの初期更新
            this.updateUI();
            
            // 最初のテトリミノを生成
            this.game.spawnNewTetromino();
            
            console.log('TetrisApp initialized successfully');
            
            // ゲーム開始
            this.start();
            
        } catch (error) {
            console.error('Failed to initialize TetrisApp:', error);
            this.showError('ゲームの初期化に失敗しました: ' + error.message);
        }
    }

    /**
     * イベントリスナーを設定する
     */
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        // ボタンイベント
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }

        // ウィンドウフォーカスイベント
        window.addEventListener('blur', () => {
            if (this.isRunning && !this.game.paused) {
                this.togglePause();
            }
        });

        console.log('Event listeners set up');
    }

    /**
     * キーボード入力を処理する
     */
    handleKeyDown(event) {
        if (!this.game || this.game.gameOver) {
            return;
        }

        // デフォルトの動作を防ぐ
        if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(event.code)) {
            event.preventDefault();
        }

        switch (event.code) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'ArrowDown':
                this.softDrop();
                break;
            case 'ArrowUp':
            case 'KeyX':
                this.rotateRight();
                break;
            case 'KeyZ':
                this.rotateLeft();
                break;
            case 'Space':
                this.hardDrop();
                break;
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyR':
                this.restart();
                break;
        }
    }

    /**
     * テトリミノを左に移動
     */
    moveLeft() {
        if (this.game.currentTetromino && !this.game.paused) {
            const tetromino = this.game.currentTetromino;
            const newX = tetromino.x - 1;
            
            // 衝突判定
            if (!this.game.checkCollision(this.game.board, tetromino.shape, newX, tetromino.y)) {
                tetromino.x = newX;
            }
        }
    }

    /**
     * テトリミノを右に移動
     */
    moveRight() {
        if (this.game.currentTetromino && !this.game.paused) {
            const tetromino = this.game.currentTetromino;
            const newX = tetromino.x + 1;
            
            // 衝突判定
            if (!this.game.checkCollision(this.game.board, tetromino.shape, newX, tetromino.y)) {
                tetromino.x = newX;
            }
        }
    }

    /**
     * ソフトドロップ
     */
    softDrop() {
        if (this.game.currentTetromino && !this.game.paused) {
            this.game.dropCurrentTetromino();
        }
    }

    /**
     * 右回転（未実装 - フェーズ2で実装予定）
     */
    rotateRight() {
        console.log('Right rotation - Coming in Phase 2');
    }

    /**
     * 左回転（未実装 - フェーズ2で実装予定）
     */
    rotateLeft() {
        console.log('Left rotation - Coming in Phase 2');
    }

    /**
     * ハードドロップ（未実装 - フェーズ2で実装予定）
     */
    hardDrop() {
        console.log('Hard drop - Coming in Phase 2');
    }

    /**
     * 一時停止の切り替え
     */
    togglePause() {
        if (this.game) {
            this.game.togglePause();
            this.updateUI();
        }
    }

    /**
     * ゲームをリスタート
     */
    restart() {
        if (this.game) {
            this.game.reset();
            this.game.spawnNewTetromino();
            this.updateUI();
            
            if (!this.isRunning) {
                this.start();
            }
        }
    }

    /**
     * ゲームを開始
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
            console.log('Game started');
        }
    }

    /**
     * ゲームを停止
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('Game stopped');
    }

    /**
     * メインゲームループ
     */
    gameLoop() {
        if (!this.isRunning) {
            return;
        }

        try {
            // ゲーム状態の更新
            this.game.update(performance.now());
            
            // 描画
            this.game.render();
            
            // UIの更新
            this.updateUI();
            
            // 次のフレームをスケジュール
            this.animationId = requestAnimationFrame(() => this.gameLoop());
            
        } catch (error) {
            console.error('Error in game loop:', error);
            this.stop();
            this.showError('ゲーム実行中にエラーが発生しました: ' + error.message);
        }
    }

    /**
     * UIを更新する
     */
    updateUI() {
        if (!this.game) return;

        // スコア更新
        if (this.scoreElement) {
            const newScore = this.game.score.toString();
            if (this.scoreElement.textContent !== newScore) {
                this.scoreElement.textContent = newScore;
                this.scoreElement.classList.add('updated');
                setTimeout(() => {
                    this.scoreElement.classList.remove('updated');
                }, 300);
            }
        }

        // レベル更新
        if (this.levelElement) {
            this.levelElement.textContent = this.game.level.toString();
        }

        // ライン数更新
        if (this.linesElement) {
            this.linesElement.textContent = this.game.lines.toString();
        }

        // ゲーム状態更新
        if (this.statusElement) {
            if (this.game.gameOver) {
                this.statusElement.textContent = 'ゲームオーバー';
                this.statusElement.className = 'status-gameover';
                this.showGameOver();
            } else if (this.game.paused) {
                this.statusElement.textContent = '一時停止中';
                this.statusElement.className = 'status-paused';
            } else {
                this.statusElement.textContent = 'プレイ中';
                this.statusElement.className = 'status-normal';
            }
        }

        // ボタン状態更新
        if (this.pauseBtn) {
            this.pauseBtn.textContent = this.game.paused ? '再開' : '一時停止';
            this.pauseBtn.disabled = this.game.gameOver;
        }
    }

    /**
     * ゲームオーバー画面を表示
     */
    showGameOver() {
        // 既存のオーバーレイを削除
        const existingOverlay = document.querySelector('.game-over-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // ゲームオーバーオーバーレイを作成
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        
        const message = document.createElement('div');
        message.className = 'game-over-message';
        message.innerHTML = `
            <h2>🎮 ゲームオーバー</h2>
            <p>最終スコア: ${this.game.score}</p>
            <p>レベル: ${this.game.level}</p>
            <p>消去ライン: ${this.game.lines}</p>
            <br>
            <p>Rキーまたはリスタートボタンで再開</p>
        `;
        
        overlay.appendChild(message);
        document.body.appendChild(overlay);

        // 3秒後に自動で非表示
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 5000);
    }

    /**
     * エラーメッセージを表示
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1001;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * アプリケーションの状態を取得（デバッグ用）
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            gameState: this.game ? this.game.getGameState() : null,
            hasRenderer: !!this.renderer,
            hasCanvas: !!this.canvas
        };
    }
}

// DOM読み込み完了後にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing Tetris app...');
    
    // グローバルにアプリケーションインスタンスを保存（デバッグ用）
    window.tetrisApp = new TetrisApp();
    
    try {
        await window.tetrisApp.init();
        console.log('Tetris app ready!');
    } catch (error) {
        console.error('Failed to start Tetris app:', error);
    }
});

// エクスポート（テスト用）
export { TetrisApp };

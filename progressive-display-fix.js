/**
 * 修复 ProgressiveAnswerDisplayV2 的空指针错误
 * 确保在自动练习模式等特殊环境下也能正常工作
 */

(function() {
    'use strict';
    
    // 等待 DOM 加载完成后再执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFix);
    } else {
        initFix();
    }
    
    function initFix() {
        // 确保 ProgressiveAnswerDisplayV2 已经加载
        if (typeof ProgressiveAnswerDisplayV2 === 'undefined') {
            console.warn('ProgressiveAnswerDisplayV2 not loaded yet, retrying...');
            setTimeout(initFix, 100);
            return;
        }
        
        // 直接修复原型方法，不需要保存原始方法
        
        // 修复 autoPlay 方法
        const originalAutoPlay = ProgressiveAnswerDisplayV2.prototype.autoPlay;
        ProgressiveAnswerDisplayV2.prototype.autoPlay = function() {
            if (this.autoPlayInterval) {
                this.pauseAutoPlay();
                return;
            }
            
            const autoPlayBtn = this.container ? this.container.querySelector('.auto-play-text') : null;
            if (autoPlayBtn) {
                autoPlayBtn.textContent = '暂停';
            }
            
            this.autoPlayInterval = setInterval(() => {
                if (this.currentStage < this.maxStage) {
                    this.nextStage();
                } else {
                    this.pauseAutoPlay();
                }
            }, this.displaySpeed);
        };
        
        // 修复 pauseAutoPlay 方法
        const originalPauseAutoPlay = ProgressiveAnswerDisplayV2.prototype.pauseAutoPlay;
        ProgressiveAnswerDisplayV2.prototype.pauseAutoPlay = function() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
                
                const autoPlayBtn = this.container ? this.container.querySelector('.auto-play-text') : null;
                if (autoPlayBtn) {
                    autoPlayBtn.textContent = '自动播放';
                }
            }
        };
        
        console.log('✅ ProgressiveAnswerDisplayV2 空指针修复已应用');
    }
})();
    
    // 重写控制面板创建方法，添加更好的兼容性
    ProgressiveAnswerDisplayV2.prototype.createEnhancedDisplayControls = function() {
        const controlsContainer = this.container.querySelector('.progressive-controls-container');
        if (!controlsContainer) {
            console.warn('Controls container not found');
            return;
        }
        
        const controlsHtml = `
            <!-- 阶段指示器 -->
            <div class="stage-indicators">
                <div class="stage-item active" data-stage="0">原句</div>
                <div class="stage-item" data-stage="1">主干</div>
                <div class="stage-item" data-stage="2">从句</div>
                <div class="stage-item" data-stage="3">状语</div>
                <div class="stage-item" data-stage="4">完整</div>
            </div>
            
            <!-- 阶段说明 -->
            <div class="stage-explanation" id="stageExplanation">
                完整的句子，包含所有成分
            </div>
            
            <!-- 骨架句展示 -->
            <div class="skeleton-display" id="skeletonDisplay"></div>
            
            <!-- 控制按钮 - 确保有正确的 span 标签 -->
            <div class="display-controls">
                <button class="control-btn" onclick="if(window.progressiveAnswerDisplay) window.progressiveAnswerDisplay.previousStage()">
                    ← 上一步
                </button>
                <button class="control-btn" onclick="if(window.progressiveAnswerDisplay) window.progressiveAnswerDisplay.nextStage()">
                    下一步 →
                </button>
                <button class="control-btn secondary" onclick="if(window.progressiveAnswerDisplay) window.progressiveAnswerDisplay.toggleAutoPlay()">
                    <span class="auto-play-text">自动播放</span>
                </button>
                <button class="control-btn secondary" onclick="if(window.progressiveAnswerDisplay) window.progressiveAnswerDisplay.reset()">
                    重置
                </button>
            </div>
            
            <!-- 用户答案对比图例 -->
            <div class="answer-legend" style="display: none;">
                <div class="answer-legend-item">
                    <div class="answer-legend-box correct"></div>
                    <span>选对了</span>
                </div>
                <div class="answer-legend-item">
                    <div class="answer-legend-box wrong"></div>
                    <span>选错了</span>
                </div>
                <div class="answer-legend-item">
                    <div class="answer-legend-box missed"></div>
                    <span>漏选了</span>
                </div>
            </div>
            
            <!-- 键盘提示 -->
            <div class="keyboard-hint">
                提示：使用方向键 ← → 控制进度，空格键播放/暂停
            </div>
        `;
        
        controlsContainer.innerHTML = controlsHtml;
        
        // 绑定全局实例
        window.progressiveAnswerDisplay = this;
        
        // 添加键盘事件
        this.addKeyboardControls();
    };
    
    // 为自动练习模式添加简化版控制
    const originalShowCorrectAnswer = ProgressiveAnswerDisplayV2.prototype.showCorrectAnswerEnhanced;
    
    ProgressiveAnswerDisplayV2.prototype.showCorrectAnswerEnhanced = function(challenge, selectedTokens, container) {
        // 检查是否在自动练习模式中
        const isAutoMode = container.id === 'auto-sentence-display';
        
        if (isAutoMode) {
            // 为自动练习模式创建简化的容器结构
            this.currentChallenge = challenge;
            this.selectedTokens = selectedTokens;
            this.container = container;
            
            // 创建简化的展示容器
            const displayHtml = `
                <div class="progressive-answer-display auto-mode">
                    <div class="sentence-display-container"></div>
                    <div class="progressive-controls-container" style="display: none;"></div>
                </div>
            `;
            
            this.container.innerHTML = displayHtml;
            
            // 创建句子元素
            const sentenceDisplay = this.createSentenceDisplay();
            
            // 创建增强的单词映射
            const wordMapping = this.createEnhancedWordMapping(sentenceDisplay);
            
            // 初始化渐进展示
            this.initEnhancedProgressiveDisplay(sentenceDisplay, wordMapping);
            
            // 自动开始渐进展示，不创建控制按钮
            setTimeout(() => {
                this.autoPlay();
            }, 300);
        } else {
            // 正常的挑战模式
            originalShowCorrectAnswer.call(this, challenge, selectedTokens, container);
        }
    };
    
    console.log('✅ ProgressiveAnswerDisplayV2 错误修复已加载');
})();
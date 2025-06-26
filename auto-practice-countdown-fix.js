/**
 * 修复自动练习模式中缺失的 startCountdown 方法
 */

(function() {
    'use strict';
    
    console.log('🔧 Fixing missing startCountdown method...');
    
    const checkInterval = setInterval(() => {
        if (typeof AutoPracticeMode !== 'undefined' && window.autoPracticeMode) {
            clearInterval(checkInterval);
            
            // 确保倒计时元素存在
            const ensureCountdownElement = () => {
                let countdownEl = document.getElementById('countdown-timer');
                if (!countdownEl) {
                    // 创建倒计时显示元素
                    countdownEl = document.createElement('div');
                    countdownEl.id = 'countdown-timer';
                    countdownEl.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 72px;
                        font-weight: bold;
                        color: #5B21B6;
                        background: rgba(255, 255, 255, 0.9);
                        padding: 20px 40px;
                        border-radius: 20px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                        z-index: 1000;
                        display: none;
                    `;
                    document.body.appendChild(countdownEl);
                }
                return countdownEl;
            };
            
            // 确保提示元素存在
            const ensureHintElement = () => {
                let hintEl = document.getElementById('stage-hint');
                if (!hintEl) {
                    hintEl = document.createElement('div');
                    hintEl.id = 'stage-hint';
                    hintEl.style.cssText = `
                        position: absolute;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #fef3c7;
                        color: #92400e;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        display: none;
                    `;
                    hintEl.textContent = '准备开始分析...';
                    const container = document.getElementById('auto-sentence-display');
                    if (container) {
                        container.style.position = 'relative';
                        container.appendChild(hintEl);
                    }
                }
                return hintEl;
            };
            
            // 添加 startCountdown 方法
            window.autoPracticeMode.startCountdown = function(seconds) {
                console.log(`⏱️ Starting countdown: ${seconds} seconds`);
                
                const countdownEl = ensureCountdownElement();
                let remaining = Math.ceil(seconds);
                countdownEl.textContent = remaining;
                countdownEl.style.display = 'block';
                
                const countdownInterval = setInterval(() => {
                    remaining--;
                    if (remaining <= 0) {
                        clearInterval(countdownInterval);
                        countdownEl.style.display = 'none';
                    } else {
                        countdownEl.textContent = remaining;
                    }
                }, 1000);
                
                // 保存定时器引用以便清理
                this.countdownInterval = countdownInterval;
            };
            
            // 添加 stopAudio 方法（如果不存在）
            if (!window.autoPracticeMode.stopAudio) {
                window.autoPracticeMode.stopAudio = function() {
                    console.log('🔇 Stopping audio (placeholder)');
                    // 这里可以添加实际的音频停止逻辑
                };
            }
            
            // 确保在停止时清理倒计时
            const originalStop = window.autoPracticeMode.stop;
            window.autoPracticeMode.stop = function() {
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                }
                const countdownEl = document.getElementById('countdown-timer');
                if (countdownEl) {
                    countdownEl.style.display = 'none';
                }
                if (originalStop) {
                    originalStop.call(this);
                }
            };
            
            // 初始化元素
            ensureCountdownElement();
            ensureHintElement();
            
            console.log('✅ Missing methods and UI elements added successfully');
        }
    }, 100);
})();
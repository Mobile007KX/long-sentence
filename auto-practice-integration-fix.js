/**
 * 自动练习模式集成修复
 * 确保所有增强功能（TTS、动态时间、渐进显示）正确协同工作
 */

(function() {
    'use strict';
    
    // 等待所有依赖加载完成
    function waitForDependencies(callback) {
        const checkInterval = setInterval(() => {
            if (typeof AutoPracticeMode !== 'undefined' && 
                typeof progressiveAnswerDisplayV2 !== 'undefined' &&
                document.getElementById('auto-sentence-display')) {
                clearInterval(checkInterval);
                callback();
            }
        }, 100);
    }
    
    waitForDependencies(() => {
        // 集成所有功能的渐进显示方法
        AutoPracticeMode.prototype.displaySentenceProgressive = function() {
            const container = document.getElementById('auto-sentence-display');
            this.currentStage = 0;
            
            // 计算动态时间（如果动态时间功能可用）
            let timing = this.autoPlaySpeed;
            if (typeof calculateReadingTime !== 'undefined') {
                const dynamicTimings = calculateReadingTime(this.currentSentence);
                const speedTimings = dynamicTimings[this.config.speed];
                timing = speedTimings.original;
            }
            
            // 先显示原句
            container.innerHTML = `
                <div class="original-sentence-display">
                    <div class="stage-label">Original Sentence</div>
                    <div class="sentence-text">${this.currentSentence.sentence}</div>
                    <div class="sentence-stats">
                        <span class="word-count">Words: ${this.currentSentence.sentence.split(' ').length}</span>
                        <span class="complexity">Complexity: ${this.currentSentence.complexity_score || 'N/A'}</span>
                        <span class="reading-time">Reading time: ${Math.round(timing / 1000)}s</span>
                    </div>
                </div>
            `;
            
            // 播放TTS（如果已启用）
            if (this.ttsEnabled && typeof this.generateTTS === 'function') {
                console.log('Playing TTS for:', this.currentSentence.sentence.substring(0, 50) + '...');
                this.generateTTS(this.currentSentence.sentence);
            }
            
            // 显示倒计时（如果倒计时功能可用）
            if (typeof this.startCountdown === 'function') {
                this.startCountdown(Math.round(timing / 1000));
            }
            
            // 更新提示
            const hintEl = document.getElementById('stage-hint');
            if (hintEl) {
                hintEl.style.display = 'block';
            }
            
            // 等待后开始渐进展示
            setTimeout(() => {
                // 停止音频
                if (typeof this.stopAudio === 'function') {
                    this.stopAudio();
                }
                
                // 隐藏提示
                if (hintEl) {
                    hintEl.style.display = 'none';
                }
                
                // 使用渐进式显示系统
                if (typeof progressiveAnswerDisplayV2 !== 'undefined' && 
                    progressiveAnswerDisplayV2.showCorrectAnswerEnhanced) {
                    
                    // 模拟用户选择
                    const words = this.currentSentence.sentence.split(' ');
                    const selectedTokens = new Set();
                    
                    const skeletonWords = this.currentSentence.skeleton.toLowerCase().split(' ');
                    words.forEach((word, index) => {
                        if (skeletonWords.includes(word.toLowerCase()) && Math.random() > 0.3) {
                            selectedTokens.add(index);
                        }
                    });
                    
                    // 使用渐进式展示
                    progressiveAnswerDisplayV2.showCorrectAnswerEnhanced(
                        this.currentSentence,
                        selectedTokens,
                        container
                    );
                    
                    // 设置下一句的时间
                    const totalTime = timing + (this.autoPlaySpeed * 4); // 原句时间 + 4个阶段
                    setTimeout(() => {
                        this.playNextSentence();
                    }, totalTime - timing);
                    
                } else {
                    // 降级到简单显示
                    this.displaySentenceSimple(container);
                }
            }, timing);
        };
        
        // 修复TTS生成函数（确保使用正确的参数）
        if (AutoPracticeMode.prototype.generateTTS) {
            const originalGenerateTTS = AutoPracticeMode.prototype.generateTTS;
            AutoPracticeMode.prototype.generateTTS = async function(text) {
                if (!this.ttsEnabled || !text) return;
                
                try {
                    const voice = this.selectedVoice || 'af_maple';
                    console.log('Generating TTS with voice:', voice);
                    
                    const response = await fetch(this.ttsEndpoint || 'http://localhost:5050/api/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            text: text,
                            voice: voice,
                            language: 'en'
                        })
                    });
                    
                    if (!response.ok) {
                        const error = await response.text();
                        throw new Error(`TTS generation failed: ${error}`);
                    }
                    
                    const data = await response.json();
                    
                    // 播放音频
                    if (data.audio_data) {
                        console.log('Playing audio...');
                        this.playAudio(data.audio_data);
                    } else {
                        console.warn('No audio data in response');
                    }
                } catch (error) {
                    console.error('TTS error:', error);
                }
            };
        }
        
        console.log('✅ 自动练习模式集成修复已应用');
    });
})();
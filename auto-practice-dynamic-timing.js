/**
 * 自动练习模式 - 动态时间计算增强
 * 根据句子长度和复杂度动态调整原句显示时间
 */

(function() {
    'use strict';
    
    // 确保AutoPracticeMode已经加载
    if (typeof AutoPracticeMode === 'undefined') {
        console.error('AutoPracticeMode not found. Please load auto-practice-mode.js first.');
        return;
    }
    
    /**
     * 计算句子的阅读时间
     * @param {Object} sentenceData - 句子数据对象
     * @returns {Object} 时间配置对象
     */
    function calculateReadingTime(sentenceData) {
        const sentence = sentenceData.sentence;
        const words = sentence.split(' ').length;
        const complexity = sentenceData.complexity_score || 7.5;
        
        // 基础阅读速度（每分钟单词数）- 调慢一些
        const baseWPM = {
            slow: 120,    // 慢速：120词/分钟（从150降低）
            normal: 160,  // 正常：160词/分钟（从200降低）
            fast: 200     // 快速：200词/分钟（从250降低）
        };
        
        // 根据复杂度调整阅读速度
        // 复杂度越高，阅读速度越慢
        const complexityFactor = 1 + (complexity - 5) * 0.15; // 从0.1增加到0.15
        
        // 计算各速度下的基础阅读时间（毫秒）
        const baseTimes = {
            slow: (words / baseWPM.slow) * 60 * 1000 * complexityFactor,
            normal: (words / baseWPM.normal) * 60 * 1000 * complexityFactor,
            fast: (words / baseWPM.fast) * 60 * 1000 * complexityFactor
        };
        
        // 添加额外的理解时间（基于句子特征）
        let extraTime = 0;
        
        // 检查从句数量
        if (sentenceData.clauses && sentenceData.clauses.length > 0) {
            extraTime += sentenceData.clauses.length * 800; // 每个从句额外800ms（从500ms增加）
        }
        
        // 检查是否有专业词汇（通过词长判断）
        const longWords = sentence.split(' ').filter(word => word.length > 10).length;
        extraTime += longWords * 300; // 每个长词额外300ms（从200ms增加）
        
        // 添加固定的停留时间（读完后的缓冲）
        const pauseTime = 1500; // 1.5秒停留时间（从3秒减少）
        
        // 最终时间计算
        const timings = {
            slow: {
                original: Math.max(10000, Math.min(25000, baseTimes.slow + extraTime + pauseTime)), // 10-25秒
                skeleton: 5000,
                clauses: 5000,
                adverbs: 5000,
                complete: 8000
            },
            normal: {
                original: Math.max(7000, Math.min(18000, baseTimes.normal + extraTime + pauseTime)), // 7-18秒
                skeleton: 3000,
                clauses: 3000,
                adverbs: 3000,
                complete: 5000
            },
            fast: {
                original: Math.max(5000, Math.min(12000, baseTimes.fast + extraTime + pauseTime)), // 5-12秒
                skeleton: 1500,
                clauses: 1500,
                adverbs: 1500,
                complete: 2500
            }
        };
        
        // 打印调试信息
        console.log(`📊 时间计算: ${words}词, 复杂度${complexity}, 基础时间${Math.round(baseTimes.normal/1000)}秒, 最终${Math.round(timings.normal.original/1000)}秒`);
        
        return timings;
    }
    
    /**
     * 显示阅读时间提示
     * @param {number} seconds - 剩余秒数
     * @param {number} totalSeconds - 总秒数
     */
    function updateReadingTimeHint(seconds, totalSeconds) {
        const hintEl = document.getElementById('stage-hint');
        if (hintEl) {
            const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
            hintEl.innerHTML = `
                <div class="reading-time-hint">
                    <div class="time-progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="time-text">
                        阅读时间：${seconds}秒
                        <span class="time-tip">（根据句子长度自动调整）</span>
                    </div>
                </div>
            `;
        }
    }
    
    // 保存原始方法
    const originalDisplayProgressive = AutoPracticeMode.prototype.displaySentenceProgressive;
    const originalDisplaySimple = AutoPracticeMode.prototype.displaySentenceSimple;
    const originalDisplayInstant = AutoPracticeMode.prototype.displaySentenceInstant;
    
    // 重写渐进式显示方法
    AutoPracticeMode.prototype.displaySentenceProgressive = function() {
        const container = document.getElementById('auto-sentence-display');
        this.currentStage = 0;
        
        // 计算动态时间
        const dynamicTimings = calculateReadingTime(this.currentSentence);
        const speedTimings = dynamicTimings[this.config.speed];
        
        // 使用新的渐进式显示系统
        if (typeof progressiveAnswerDisplayV2 !== 'undefined') {
            // 先显示原句
            container.innerHTML = `
                <div class="original-sentence-display">
                    <div class="stage-label">原始句子</div>
                    <div class="sentence-text">${this.currentSentence.sentence}</div>
                    <div class="sentence-stats">
                        <span class="word-count">单词数：${this.currentSentence.sentence.split(' ').length}</span>
                        <span class="complexity">复杂度：${this.currentSentence.complexity_score || 'N/A'}</span>
                        <span class="reading-time">预计阅读：${Math.round(speedTimings.original / 1000)}秒</span>
                    </div>
                </div>
            `;
            
            // 播放TTS（如果启用）
            if (this.ttsEnabled && typeof this.generateTTS === 'function') {
                this.generateTTS(this.currentSentence.sentence);
            }
            
            // 更新提示和倒计时
            const hintEl = document.getElementById('stage-hint');
            if (hintEl) {
                hintEl.style.display = 'block';
            }
            
            // 开始倒计时
            this.startCountdown(speedTimings.original / 1000);
            
            // 等待原句展示时间后，开始渐进展示
            setTimeout(() => {
                // 隐藏提示
                if (hintEl) {
                    hintEl.style.display = 'none';
                }
                
                // 停止音频
                if (typeof this.stopAudio === 'function') {
                    this.stopAudio();
                }
                
                // 模拟用户选择
                const words = this.currentSentence.sentence.split(' ');
                const selectedTokens = new Set();
                
                // 随机选择60-80%的核心词
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
                
                // 设置后续阶段速度
                if (progressiveAnswerDisplayV2.displaySpeed !== speedTimings.skeleton) {
                    progressiveAnswerDisplayV2.displaySpeed = speedTimings.skeleton;
                }
                
                // 计算总时间并设置下一句
                const totalTime = speedTimings.original + 
                                 (speedTimings.skeleton + speedTimings.clauses + 
                                  speedTimings.adverbs + speedTimings.complete);
                                  
                setTimeout(() => {
                    this.playNextSentence();
                }, totalTime - speedTimings.original);
                
            }, speedTimings.original);
        } else {
            // 降级方案
            this.displaySentenceSimple(container);
        }
    };
    
    // 重写简单显示方法
    AutoPracticeMode.prototype.displaySentenceSimple = function(container) {
        // 计算动态时间
        const dynamicTimings = calculateReadingTime(this.currentSentence);
        const timing = dynamicTimings[this.config.speed];
        
        const stages = [
            // 阶段0：原句（动态时间）
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-original">
                        <div class="stage-label">原句</div>
                        <div class="sentence-text">${this.currentSentence.sentence}</div>
                        <div class="sentence-stats">
                            <span class="word-count">单词数：${this.currentSentence.sentence.split(' ').length}</span>
                            <span class="reading-time">阅读时间：${Math.round(timing.original / 1000)}秒</span>
                        </div>
                    </div>
                `;
                
                // 播放TTS
                if (this.ttsEnabled && typeof this.generateTTS === 'function') {
                    this.generateTTS(this.currentSentence.sentence);
                }
                
                // 开始倒计时
                this.startCountdown(timing.original / 1000);
            },
            // 阶段1：标记主干
            () => {
                if (typeof this.stopAudio === 'function') {
                    this.stopAudio();
                }
                container.innerHTML = `
                    <div class="sentence-stage stage-skeleton">
                        <div class="stage-label">句子主干</div>
                        <div class="sentence-text">${this.markSentence(this.currentSentence)}</div>
                    </div>
                `;
            },
            // 其他阶段保持不变...
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-core">
                        <div class="stage-label">核心结构</div>
                        <div class="skeleton-display">
                            ${this.currentSentence.skeleton}
                        </div>
                        <div class="pattern-info">句型：${this.currentSentence.pattern}</div>
                    </div>
                `;
            },
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-analysis">
                        <div class="stage-label">成分分析</div>
                        <div class="components-breakdown">
                            ${this.renderComponents(this.currentSentence.components)}
                        </div>
                    </div>
                `;
            }
        ];
        
        // 执行当前阶段
        if (this.currentStage < stages.length) {
            stages[this.currentStage]();
            this.currentStage++;
            
            // 设置下一阶段的时间
            let nextStageTime = timing.skeleton; // 默认为skeleton时间
            if (this.currentStage === 1) {
                nextStageTime = timing.original; // 原句显示时间
            }
            
            setTimeout(() => {
                if (this.currentStage < stages.length) {
                    this.displaySentenceSimple(container);
                } else {
                    // 所有阶段完成，播放下一句
                    setTimeout(() => this.playNextSentence(), timing.complete);
                }
            }, nextStageTime);
        }
    };
    
    // 重写直接显示方法
    AutoPracticeMode.prototype.displaySentenceInstant = function() {
        const container = document.getElementById('auto-sentence-display');
        
        // 计算动态时间
        const dynamicTimings = calculateReadingTime(this.currentSentence);
        const timing = dynamicTimings[this.config.speed];
        
        // 先显示原句
        container.innerHTML = `
            <div class="original-sentence-display">
                <div class="stage-label">原始句子</div>
                <div class="sentence-text">${this.currentSentence.sentence}</div>
                <div class="sentence-stats">
                    <span class="word-count">单词数：${this.currentSentence.sentence.split(' ').length}</span>
                    <span class="complexity">复杂度：${this.currentSentence.complexity_score || 'N/A'}</span>
                    <span class="reading-time">阅读时间：${Math.round(timing.original / 1000)}秒</span>
                </div>
            </div>
        `;
        
        // 播放TTS
        if (this.ttsEnabled && typeof this.generateTTS === 'function') {
            this.generateTTS(this.currentSentence.sentence);
        }
        
        // 显示倒计时
        const hintEl = document.getElementById('stage-hint');
        if (hintEl) {
            hintEl.style.display = 'block';
        }
        this.startCountdown(timing.original / 1000);
        
        // 等待后显示完整分析
        setTimeout(() => {
            if (typeof this.stopAudio === 'function') {
                this.stopAudio();
            }
            if (hintEl) hintEl.style.display = 'none';
            
            container.innerHTML = `
                <div class="instant-display">
                    <div class="sentence-marked">
                        ${this.markSentence(this.currentSentence)}
                    </div>
                    <div class="sentence-info">
                        <span class="pattern-badge">${this.currentSentence.pattern}</span>
                        <span class="difficulty-badge ${this.currentSentence.difficulty}">
                            ${this.currentSentence.difficulty}
                        </span>
                        <span class="complexity-score">
                            复杂度: ${this.currentSentence.complexity_score || 'N/A'}
                        </span>
                    </div>
                </div>
            `;
            
            // 设置播放下一句
            setTimeout(() => this.playNextSentence(), timing.complete * 2);
        }, timing.original);
    };
    
    // 导出到全局作用域，供其他模块使用
    window.calculateReadingTime = calculateReadingTime;
    
    console.log('✅ 自动练习动态时间增强已加载');
})();
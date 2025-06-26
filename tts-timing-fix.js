/**
 * 修复TTS播放时间和平滑显示
 * 确保语音完整播放后再开始标注
 */

(function() {
    'use strict';
    
    console.log('🔊 Loading TTS timing fix...');
    
    // 等待依赖加载
    function waitForDependencies(callback) {
        const checkInterval = setInterval(() => {
            if (typeof AutoPracticeMode !== 'undefined' && 
                window.autoPracticeMode &&
                typeof progressiveAnswerDisplayV2 !== 'undefined') {
                clearInterval(checkInterval);
                callback();
            }
        }, 100);
    }
    
    waitForDependencies(() => {
        // 重写显示渐进式方法
        AutoPracticeMode.prototype.displaySentenceProgressive = function() {
            const container = document.getElementById('auto-sentence-display');
            this.currentStage = 0;
            
            // 计算动态时间
            let readingTime = 10000; // 默认10秒
            if (typeof calculateReadingTime !== 'undefined') {
                const dynamicTimings = calculateReadingTime(this.currentSentence);
                const speedTimings = dynamicTimings[this.config.speed];
                readingTime = speedTimings.original;
            }
            
            // 显示原句 - 使用固定布局
            container.innerHTML = `
                <div class="sentence-display-wrapper">
                    <div class="stage-label">Original Sentence</div>
                    <div class="sentence-display progressive-display stage-0" id="main-sentence">
                        ${this.createStableSentenceHTML(this.currentSentence)}
                    </div>
                    <div class="sentence-stats">
                        <span class="word-count">Words: ${this.currentSentence.sentence.split(' ').length}</span>
                        <span class="complexity">Complexity: ${this.currentSentence.complexity_score || 'N/A'}</span>
                        <span class="reading-time">Reading time: ${Math.round(readingTime / 1000)}s</span>
                    </div>
                    <div class="playback-status" id="playback-status" style="margin-top: 10px; text-align: center; color: #666;">
                        🎵 Playing audio...
                    </div>
                </div>
            `;
            
            // 应用单词映射
            this.applyWordMapping();
            
            // 播放TTS并等待完成
            if (this.ttsEnabled && typeof this.simpleTTS === 'function') {
                console.log('🎤 Starting TTS playback...');
                this.playTTSAndWait(this.currentSentence.sentence, readingTime);
            } else {
                // 没有TTS时直接开始
                this.startProgressiveDisplay(readingTime);
            }
        };
        
        // 创建稳定的句子HTML
        AutoPracticeMode.prototype.createStableSentenceHTML = function(sentenceData) {
            const words = sentenceData.sentence.split(' ');
            return words.map((word, index) => {
                const cleanWord = word.replace(/[.,!?;:]/, '');
                const punctuation = word.match(/[.,!?;:]/)?.[0] || '';
                
                return `<span class="word-token" data-index="${index}" data-word="${cleanWord}">
                    ${cleanWord}${punctuation ? `<span class="punctuation">${punctuation}</span>` : ''}
                </span>`;
            }).join(' ');
        };
        
        // 应用单词映射（预设所有类）
        AutoPracticeMode.prototype.applyWordMapping = function() {
            const sentenceEl = document.getElementById('main-sentence');
            if (!sentenceEl) return;
            
            const words = sentenceEl.querySelectorAll('.word-token');
            const components = this.currentSentence.components;
            const skeleton = this.currentSentence.skeleton.toLowerCase().split(' ');
            
            words.forEach((token, index) => {
                const word = token.dataset.word.toLowerCase();
                
                // 检查是否是句子成分
                for (const [compType, compText] of Object.entries(components)) {
                    if (!compText) continue;
                    
                    const compWords = compText.toLowerCase().split(/\s+/);
                    if (compWords.includes(word)) {
                        token.classList.add(compType);
                        
                        // 标记核心词
                        if (skeleton.includes(word)) {
                            token.classList.add('is-core');
                        }
                    }
                }
                
                // 简单标记从句（基于关键词）
                const sentenceText = this.currentSentence.sentence.toLowerCase();
                const wordsBefore = sentenceText.substring(0, sentenceText.indexOf(word));
                
                if (wordsBefore.includes('who') || wordsBefore.includes('which') || wordsBefore.includes('that')) {
                    token.classList.add('in-relative-clause');
                }
                
                // 标记状语
                const adverbs = ['carefully', 'ultimately', 'finally', 'recently', 'quickly', 'slowly'];
                if (adverbs.includes(word)) {
                    token.classList.add('adverb');
                }
            });
        };
        
        // 播放TTS并等待完成
        AutoPracticeMode.prototype.playTTSAndWait = async function(text, estimatedTime) {
            const statusEl = document.getElementById('playback-status');
            
            try {
                const response = await fetch('http://localhost:5050/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: text,
                        voice: 'af_maple',
                        language: 'en'
                    })
                });
                
                const data = await response.json();
                if (data.audio_data) {
                    const audio = new Audio(data.audio_data);
                    
                    // 监听播放结束
                    audio.onended = () => {
                        console.log('✅ Audio playback completed');
                        if (statusEl) statusEl.innerHTML = '✅ Audio completed. Waiting 3 seconds...';
                        
                        // 播放完成后等待3秒
                        setTimeout(() => {
                            this.startProgressiveDisplay(0);
                        }, 3000);
                    };
                    
                    // 播放错误时的处理
                    audio.onerror = () => {
                        console.error('❌ Audio playback error');
                        this.startProgressiveDisplay(estimatedTime);
                    };
                    
                    // 开始播放
                    audio.play().catch(err => {
                        console.error('❌ Failed to play audio:', err);
                        this.startProgressiveDisplay(estimatedTime);
                    });
                }
            } catch (error) {
                console.error('❌ TTS Error:', error);
                // TTS失败时使用估计时间
                this.startProgressiveDisplay(estimatedTime);
            }
        };
        
        // 开始渐进式显示
        AutoPracticeMode.prototype.startProgressiveDisplay = function(waitTime) {
            const statusEl = document.getElementById('playback-status');
            if (statusEl) statusEl.style.display = 'none';
            
            // 如果需要等待
            if (waitTime > 0) {
                setTimeout(() => {
                    this.showProgressiveStages();
                }, waitTime);
            } else {
                // 立即开始
                this.showProgressiveStages();
            }
        };
        
        // 显示渐进式阶段
        AutoPracticeMode.prototype.showProgressiveStages = function() {
            const sentenceEl = document.getElementById('main-sentence');
            if (!sentenceEl) return;
            
            let currentStage = 0;
            const stages = 5;
            const stageInterval = 2000; // 每个阶段2秒
            
            const showNextStage = () => {
                if (currentStage < stages) {
                    // 更新阶段类
                    sentenceEl.className = `sentence-display progressive-display stage-${currentStage}`;
                    console.log(`📍 Showing stage ${currentStage}`);
                    
                    currentStage++;
                    
                    if (currentStage < stages) {
                        setTimeout(showNextStage, stageInterval);
                    } else {
                        // 所有阶段完成，等待后播放下一句
                        setTimeout(() => {
                            this.playNextSentence();
                        }, 3000);
                    }
                }
            };
            
            // 开始第一个阶段
            showNextStage();
        };
        
        console.log('✅ TTS timing fix applied');
    });
})();
/**
 * 自动练习模式完整修复
 * 确保从第一阶段就使用平滑显示效果
 */

(function() {
    'use strict';
    
    console.log('🎯 Loading complete auto-practice fix...');
    
    // 等待所有依赖加载
    function waitForAll(callback) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof AutoPracticeMode !== 'undefined' && 
                window.autoPracticeMode &&
                document.getElementById('auto-sentence-display')) {
                clearInterval(checkInterval);
                callback();
            } else if (attempts > 50) {
                clearInterval(checkInterval);
                console.error('Dependencies not loaded');
            }
        }, 100);
    }
    
    waitForAll(() => {
        // 完全重写显示方法
        AutoPracticeMode.prototype.displaySentenceProgressive = function() {
            const container = document.getElementById('auto-sentence-display');
            if (!container) return;
            
            this.currentStage = 0;
            
            // 计算时间
            let readingTime = 12000; // 默认12秒
            if (typeof calculateReadingTime !== 'undefined') {
                const dynamicTimings = calculateReadingTime(this.currentSentence);
                readingTime = dynamicTimings[this.config.speed].original;
            }
            
            // 创建句子HTML（带有所有预设类）
            const sentenceHTML = this.createAnnotatedSentenceHTML();
            
            // 显示容器
            container.innerHTML = `
                <div class="auto-practice-sentence-container">
                    <div class="stage-indicator">Original Sentence</div>
                    <div class="sentence-display progressive-display stage-0" id="auto-practice-sentence">
                        ${sentenceHTML}
                    </div>
                    <div class="sentence-info">
                        <span class="info-item">📝 Words: ${this.currentSentence.sentence.split(' ').length}</span>
                        <span class="info-item">📊 Complexity: ${this.currentSentence.complexity_score || 'N/A'}</span>
                        <span class="info-item">⏱️ Reading time: ${Math.round(readingTime / 1000)}s</span>
                    </div>
                    <div class="audio-status" id="audio-status">
                        <span class="status-icon">🎵</span>
                        <span class="status-text">Playing audio...</span>
                    </div>
                </div>
            `;
            
            // 播放TTS
            this.playAudioWithCallback(readingTime);
        };
        
        // 创建带标注的句子HTML
        AutoPracticeMode.prototype.createAnnotatedSentenceHTML = function() {
            const sentence = this.currentSentence.sentence;
            const words = sentence.split(' ');
            const components = this.currentSentence.components || {};
            const skeleton = (this.currentSentence.skeleton || '').toLowerCase().split(' ');
            
            return words.map((word, index) => {
                const cleanWord = word.replace(/[.,!?;:'"]/g, '');
                const punctuation = word.match(/[.,!?;:'"]/g) || [];
                const lowerWord = cleanWord.toLowerCase();
                
                let classes = ['word-token'];
                classes.push(`word-${index}`);
                
                // 检查是否是句子成分
                Object.entries(components).forEach(([type, text]) => {
                    if (text && text.toLowerCase().includes(lowerWord)) {
                        classes.push(type);
                        
                        // 是否是核心词
                        if (skeleton.includes(lowerWord)) {
                            classes.push('is-core');
                        }
                    }
                });
                
                // 检查是否在从句中
                if (this.isInClause(word, index, sentence)) {
                    classes.push('in-relative-clause');
                }
                
                // 检查是否是状语
                if (this.isAdverb(lowerWord)) {
                    classes.push('adverb');
                }
                
                return `<span class="${classes.join(' ')}" data-index="${index}" data-word="${cleanWord}">` +
                       `${cleanWord}${punctuation.map(p => `<span class="punctuation">${p}</span>`).join('')}` +
                       `</span>`;
            }).join(' ');
        };
        
        // 检查是否在从句中
        AutoPracticeMode.prototype.isInClause = function(word, index, sentence) {
            const beforeText = sentence.substring(0, sentence.indexOf(word)).toLowerCase();
            return beforeText.includes('who') || 
                   beforeText.includes('which') || 
                   beforeText.includes('that') || 
                   beforeText.includes('when') ||
                   beforeText.includes('where');
        };
        
        // 检查是否是状语
        AutoPracticeMode.prototype.isAdverb = function(word) {
            const adverbs = [
                'carefully', 'deeply', 'ultimately', 'finally', 'quickly', 
                'slowly', 'thoroughly', 'completely', 'partially', 'fully',
                'recently', 'soon', 'often', 'always', 'never', 'sometimes'
            ];
            return adverbs.includes(word.toLowerCase()) || word.endsWith('ly');
        };
        
        // 播放音频并设置回调
        AutoPracticeMode.prototype.playAudioWithCallback = function(estimatedTime) {
            const statusEl = document.getElementById('audio-status');
            
            if (!this.ttsEnabled) {
                // 没有TTS时直接开始渐进显示
                if (statusEl) statusEl.style.display = 'none';
                setTimeout(() => this.startProgressiveStages(), estimatedTime * 0.6);
                return;
            }
            
            // 生成并播放TTS
            this.generateAndPlayTTS(this.currentSentence.sentence, () => {
                // 播放完成回调
                if (statusEl) {
                    statusEl.innerHTML = '<span class="status-icon">✅</span><span class="status-text">Completed. Wait 3s...</span>';
                }
                
                // 等待3秒后开始渐进显示
                setTimeout(() => {
                    if (statusEl) statusEl.style.display = 'none';
                    this.startProgressiveStages();
                }, 3000);
            }, () => {
                // 播放失败回调
                if (statusEl) statusEl.style.display = 'none';
                setTimeout(() => this.startProgressiveStages(), estimatedTime * 0.6);
            });
        };
        
        // 生成并播放TTS
        AutoPracticeMode.prototype.generateAndPlayTTS = async function(text, onComplete, onError) {
            try {
                const response = await fetch('http://localhost:5050/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: text,
                        voice: this.selectedVoice || 'af_maple',
                        language: 'en'
                    })
                });
                
                if (!response.ok) throw new Error('TTS request failed');
                
                const data = await response.json();
                if (!data.audio_data) throw new Error('No audio data');
                
                const audio = new Audio(data.audio_data);
                
                audio.onended = () => {
                    console.log('✅ Audio playback completed');
                    if (onComplete) onComplete();
                };
                
                audio.onerror = (error) => {
                    console.error('❌ Audio error:', error);
                    if (onError) onError();
                };
                
                await audio.play();
                
            } catch (error) {
                console.error('❌ TTS Error:', error);
                if (onError) onError();
            }
        };
        
        // 开始渐进式阶段显示
        AutoPracticeMode.prototype.startProgressiveStages = function() {
            const sentenceEl = document.getElementById('auto-practice-sentence');
            if (!sentenceEl) return;
            
            let stage = 1;
            const maxStage = 4;
            const stageDuration = 2000; // 每阶段2秒
            
            const nextStage = () => {
                if (stage <= maxStage) {
                    // 更新句子的阶段类
                    sentenceEl.className = `sentence-display progressive-display stage-${stage}`;
                    console.log(`📍 Stage ${stage}`);
                    
                    // 更新阶段指示器
                    const indicator = document.querySelector('.stage-indicator');
                    if (indicator) {
                        const stageNames = {
                            1: 'Core Structure',
                            2: 'With Clauses',
                            3: 'With Adverbs',
                            4: 'Complete Analysis'
                        };
                        indicator.textContent = stageNames[stage] || '';
                    }
                    
                    stage++;
                    
                    if (stage <= maxStage) {
                        setTimeout(nextStage, stageDuration);
                    } else {
                        // 完成所有阶段，等待后播放下一句
                        setTimeout(() => {
                            this.playNextSentence();
                        }, 3000);
                    }
                }
            };
            
            // 开始第一阶段
            nextStage();
        };
        
        // 添加必要的样式
        const style = document.createElement('style');
        style.textContent = `
            .auto-practice-sentence-container {
                padding: 40px 20px;
                text-align: center;
            }
            
            .stage-indicator {
                font-size: 14px;
                color: #6B7280;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 20px;
                font-weight: 500;
            }
            
            #auto-practice-sentence {
                font-size: 28px !important;
                line-height: 2.2 !important;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .sentence-info {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 25px;
                font-size: 14px;
                color: #6B7280;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .audio-status {
                margin-top: 20px;
                font-size: 14px;
                color: #6B7280;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .status-icon {
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Complete auto-practice fix applied');
    });
})();
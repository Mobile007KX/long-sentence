/**
 * 自动练习模式音频整合修复
 * 直接在AutoPracticeMode中集成TTS功能
 */

(function() {
    'use strict';
    
    console.log('🔊 Loading integrated audio fix...');
    
    // 等待AutoPracticeMode加载
    const checkInterval = setInterval(() => {
        if (typeof AutoPracticeMode !== 'undefined' && window.autoPracticeMode) {
            clearInterval(checkInterval);
            
            console.log('✅ AutoPracticeMode found, applying audio integration...');
            
            // 添加TTS配置
            window.autoPracticeMode.ttsEnabled = true;
            window.autoPracticeMode.selectedVoice = 'af_maple';
            window.autoPracticeMode.ttsEndpoint = 'http://localhost:5050/api/generate';
            
            // 添加TTS播放方法
            window.autoPracticeMode.playTTS = async function(text) {
                if (!this.ttsEnabled || !text) return null;
                
                console.log('🎤 Playing TTS for:', text.substring(0, 50) + '...');
                
                try {
                    const response = await fetch(this.ttsEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            text: text,
                            voice: this.selectedVoice,
                            language: 'en'
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.audio_data) {
                        const audio = new Audio(data.audio_data);
                        
                        return new Promise((resolve) => {
                            audio.onended = () => {
                                console.log('✅ TTS playback completed');
                                resolve();
                            };
                            
                            audio.onerror = () => {
                                console.error('❌ Audio playback error');
                                resolve(); // 继续流程
                            };
                            
                            audio.play().catch(() => {
                                console.error('❌ Play failed');
                                resolve(); // 继续流程
                            });
                        });
                    }
                } catch (error) {
                    console.error('❌ TTS error:', error);
                    return null;
                }
            };
            
            // 保存原始的displaySentenceProgressive方法
            const originalDisplayProgressive = window.autoPracticeMode.displaySentenceProgressive;
            
            // 重写displaySentenceProgressive以包含TTS
            window.autoPracticeMode.displaySentenceProgressive = function() {
                const container = document.getElementById('auto-sentence-display');
                if (!container || !this.currentSentence) return;
                
                // 清空容器
                container.innerHTML = '';
                
                // 创建句子显示元素
                const sentenceEl = document.createElement('div');
                sentenceEl.className = 'sentence-display';
                sentenceEl.innerHTML = `
                    <div class="sentence-info">
                        <span class="sentence-number">#${this.sentenceCount}</span>
                        <span class="sentence-pattern">${this.currentSentence.pattern}</span>
                        <span class="sentence-difficulty">难度 ${'★'.repeat(this.currentSentence.difficulty)}</span>
                    </div>
                    <div class="sentence-text" id="practice-sentence"></div>
                `;
                container.appendChild(sentenceEl);
                
                const textEl = sentenceEl.querySelector('.sentence-text');
                
                // 立即显示句子（大字体）
                textEl.textContent = this.currentSentence.sentence;
                textEl.style.fontSize = '32px';
                textEl.style.fontWeight = '600';
                textEl.style.color = '#1F2937';
                textEl.style.lineHeight = '1.6';
                textEl.style.animation = 'fadeIn 0.5s ease';
                
                // 播放TTS
                this.playTTS(this.currentSentence.sentence).then(() => {
                    console.log('🎬 TTS completed, starting analysis stages...');
                    
                    // 等待2秒后开始分析阶段
                    setTimeout(() => {
                        this.startAnalysisStages(textEl);
                    }, 2000);
                });
            };
            
            // 添加分析阶段方法
            window.autoPracticeMode.startAnalysisStages = function(textEl) {
                if (!this.isRunning) return;
                
                const stages = [
                    () => {
                        console.log('Stage 1: Marking components');
                        // 标记成分
                        textEl.innerHTML = this.markComponents(this.currentSentence.sentence, this.currentSentence.pattern);
                        textEl.style.fontSize = '28px';
                    },
                    () => {
                        console.log('Stage 2: Folding extras');
                        // 折叠修饰
                        textEl.innerHTML = this.foldExtras(this.currentSentence.sentence, this.currentSentence.pattern);
                        textEl.style.fontSize = '26px';
                    },
                    () => {
                        console.log('Stage 3: Showing skeleton');
                        // 显示骨架
                        textEl.innerHTML = this.showSkeleton(this.currentSentence.sentence, this.currentSentence.pattern);
                        textEl.style.fontSize = '24px';
                    }
                ];
                
                let currentStage = 0;
                const stageInterval = setInterval(() => {
                    if (!this.isRunning || currentStage >= stages.length) {
                        clearInterval(stageInterval);
                        if (this.isRunning) {
                            // 等待3秒后播放下一句
                            setTimeout(() => {
                                this.playNextSentence();
                            }, 3000);
                        }
                        return;
                    }
                    
                    stages[currentStage]();
                    currentStage++;
                }, this.autoPlaySpeed);
            };
            
            // 添加分析方法（如果不存在）
            if (!window.autoPracticeMode.markComponents) {
                window.autoPracticeMode.markComponents = function(sentence, pattern) {
                    // 简单的成分标记
                    return `<span class="subject">Subject</span> <span class="verb">Verb</span> <span class="object">Object</span>`;
                };
                
                window.autoPracticeMode.foldExtras = function(sentence, pattern) {
                    // 简单的折叠显示
                    return `<span class="subject">S</span> <span class="verb">V</span> <span class="object">O</span> <details><summary>...</summary>${sentence}</details>`;
                };
                
                window.autoPracticeMode.showSkeleton = function(sentence, pattern) {
                    // 显示句型骨架
                    return `<strong>${pattern}</strong>: ${sentence}`;
                };
            }
            
            console.log('✅ Audio integration complete!');
        }
    }, 100);
    
    // 添加必要的CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
})();
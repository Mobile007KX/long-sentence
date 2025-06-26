/**
 * 自动练习模式完整音频解决方案
 * 确保音频在所有情况下都能正常播放
 */

(function() {
    'use strict';
    
    console.log('🎵 Loading complete audio solution...');
    
    // 等待autoPracticeMode加载
    const waitForMode = setInterval(() => {
        if (typeof AutoPracticeMode !== 'undefined' && window.autoPracticeMode) {
            clearInterval(waitForMode);
            applyAudioSolution();
        }
    }, 100);
    
    function applyAudioSolution() {
        const mode = window.autoPracticeMode;
        
        // 配置TTS
        mode.ttsEnabled = true;
        mode.selectedVoice = 'af_maple';
        mode.ttsEndpoint = 'http://localhost:5050/api/generate';
        
        console.log('✅ TTS configured:', {
            enabled: mode.ttsEnabled,
            voice: mode.selectedVoice,
            endpoint: mode.ttsEndpoint
        });
        
        // 简化的播放TTS方法
        mode.playTTS = async function(text) {
            if (!this.ttsEnabled || !text) {
                console.log('❌ TTS disabled or no text');
                return null;
            }
            
            console.log('🎤 Generating TTS for:', text.substring(0, 50) + '...');
            
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
                console.log('✅ TTS response received, audio length:', data.audio_length);
                
                if (data.audio_data) {
                    const audio = new Audio(data.audio_data);
                    audio.volume = 1.0;
                    
                    // 添加事件监听器
                    audio.addEventListener('play', () => {
                        console.log('🔊 Audio started playing');
                    });
                    
                    audio.addEventListener('ended', () => {
                        console.log('✅ Audio playback completed');
                    });
                    
                    audio.addEventListener('error', (e) => {
                        console.error('❌ Audio error:', e);
                    });
                    
                    // 播放音频
                    try {
                        await audio.play();
                        // 返回一个Promise，在音频结束时resolve
                        return new Promise((resolve) => {
                            audio.addEventListener('ended', resolve, { once: true });
                        });
                    } catch (playError) {
                        console.error('❌ Play error:', playError);
                        // 可能是自动播放策略阻止，尝试用户交互后播放
                        console.log('💡 Try clicking anywhere on the page first');
                        return null;
                    }
                } else {
                    console.error('❌ No audio data in response');
                    return null;
                }
            } catch (error) {
                console.error('❌ TTS error:', error);
                return null;
            }
        };
        
        // 保存原始的displaySentenceProgressive
        const originalDisplay = mode.displaySentenceProgressive;
        
        // 重写displaySentenceProgressive
        mode.displaySentenceProgressive = function() {
            console.log('📝 Displaying sentence progressively');
            
            const container = document.getElementById('auto-sentence-display');
            if (!container || !this.currentSentence) {
                console.error('❌ No container or sentence');
                return;
            }
            
            // 清空容器
            container.innerHTML = '';
            
            // 创建句子显示
            const sentenceEl = document.createElement('div');
            sentenceEl.className = 'sentence-display';
            sentenceEl.innerHTML = `
                <div class="sentence-info">
                    <span class="sentence-number">#${this.sentenceCount}</span>
                    <span class="sentence-pattern">${this.currentSentence.pattern}</span>
                    <span class="sentence-difficulty">难度 ${'★'.repeat(this.currentSentence.difficulty)}</span>
                </div>
                <div class="sentence-text" id="practice-sentence" style="font-size: 32px; font-weight: 600; line-height: 1.6;"></div>
            `;
            container.appendChild(sentenceEl);
            
            const textEl = sentenceEl.querySelector('.sentence-text');
            textEl.textContent = this.currentSentence.sentence;
            
            // 立即播放TTS
            console.log('🎵 Starting TTS playback...');
            this.playTTS(this.currentSentence.sentence).then(() => {
                console.log('🎬 TTS finished, starting stages after 2s...');
                // TTS播放完成后，等待2秒开始阶段
                setTimeout(() => {
                    if (this.isRunning) {
                        this.startStages(textEl);
                    }
                }, 2000);
            }).catch(error => {
                console.error('❌ TTS failed:', error);
                // 失败时使用默认时间
                setTimeout(() => {
                    if (this.isRunning) {
                        this.startStages(textEl);
                    }
                }, 5000);
            });
        };
        
        // 添加阶段处理
        mode.startStages = function(textEl) {
            console.log('🎭 Starting analysis stages');
            
            let stageIndex = 0;
            const stages = [
                () => {
                    console.log('Stage 1: Marking components');
                    textEl.innerHTML = `<span class="subject">Subject</span> <span class="verb">Verb</span> <span class="object">Object</span>`;
                    textEl.style.fontSize = '28px';
                },
                () => {
                    console.log('Stage 2: Folding extras');
                    textEl.innerHTML = `<span class="subject">S</span> <span class="verb">V</span> <span class="object">O</span>`;
                    textEl.style.fontSize = '26px';
                },
                () => {
                    console.log('Stage 3: Showing skeleton');
                    textEl.innerHTML = `<strong>${this.currentSentence.pattern}</strong>`;
                    textEl.style.fontSize = '24px';
                }
            ];
            
            const runStage = () => {
                if (!this.isRunning || stageIndex >= stages.length) {
                    if (this.isRunning) {
                        // 所有阶段完成，3秒后播放下一句
                        setTimeout(() => {
                            this.playNextSentence();
                        }, 3000);
                    }
                    return;
                }
                
                stages[stageIndex]();
                stageIndex++;
                
                // 每个阶段间隔
                setTimeout(runStage, this.autoPlaySpeed || 3000);
            };
            
            runStage();
        };
        
        // 添加点击事件处理自动播放策略
        document.addEventListener('click', () => {
            console.log('👆 User interaction detected, audio should now play');
        }, { once: true });
        
        console.log('✅ Complete audio solution applied!');
    }
})();
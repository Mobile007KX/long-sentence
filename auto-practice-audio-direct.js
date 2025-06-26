/**
 * 自动练习模式音频修复 - 直接集成版
 * 不依赖window.autoPracticeMode，直接修改全局变量
 */

(function() {
    'use strict';
    
    console.log('🔊 Auto Practice Audio Fix - Direct Integration');
    
    // 等待autoPracticeMode变量存在
    let checkCount = 0;
    const maxChecks = 50;
    
    const checkInterval = setInterval(() => {
        checkCount++;
        
        // 检查全局变量autoPracticeMode（不是window.autoPracticeMode）
        if (typeof autoPracticeMode !== 'undefined') {
            clearInterval(checkInterval);
            console.log('✅ autoPracticeMode found after', checkCount * 100, 'ms');
            setupAudio();
        } else if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            console.error('❌ autoPracticeMode not found after 5 seconds');
            // 尝试手动查找
            if (typeof AutoPracticeMode !== 'undefined') {
                console.log('🔧 Found AutoPracticeMode class, creating instance...');
                window.autoPracticeMode = new AutoPracticeMode();
                setupAudio();
            }
        }
    }, 100);
    
    function setupAudio() {
        // 使用全局的autoPracticeMode
        const mode = typeof autoPracticeMode !== 'undefined' ? autoPracticeMode : window.autoPracticeMode;
        
        if (!mode) {
            console.error('❌ No autoPracticeMode instance found');
            return;
        }
        
        // 设置TTS配置
        mode.ttsEnabled = true;
        mode.selectedVoice = 'af_maple';
        mode.ttsEndpoint = 'http://localhost:5050/api/generate';
        
        console.log('📢 TTS Settings configured:', {
            enabled: mode.ttsEnabled,
            voice: mode.selectedVoice,
            endpoint: mode.ttsEndpoint
        });
        
        // 创建TTS播放函数
        mode.playSimpleTTS = async function(text) {
            if (!text || !this.ttsEnabled) {
                console.log('⚠️ TTS skipped: no text or disabled');
                return null;
            }
            
            console.log('🎤 Generating audio for:', text.substring(0, 30) + '...');
            
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
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                console.log('✅ Audio data received, length:', data.audio_length, 'seconds');
                
                if (data.audio_data) {
                    const audio = new Audio(data.audio_data);
                    audio.volume = 1.0;
                    
                    return new Promise((resolve, reject) => {
                        audio.onended = () => {
                            console.log('✅ Audio playback finished');
                            resolve();
                        };
                        
                        audio.onerror = (error) => {
                            console.error('❌ Audio error:', error);
                            resolve(); // 继续流程，不要阻塞
                        };
                        
                        audio.play().then(() => {
                            console.log('🔊 Audio playing...');
                        }).catch(err => {
                            console.error('❌ Play failed:', err);
                            console.log('💡 Click anywhere on the page to enable audio');
                            resolve(); // 继续流程
                        });
                    });
                } else {
                    console.error('❌ No audio data in response');
                    return null;
                }
            } catch (error) {
                console.error('❌ TTS request failed:', error);
                return null;
            }
        };
        
        // Hook到displaySentenceProgressive
        const originalDisplay = mode.displaySentenceProgressive;
        mode.displaySentenceProgressive = function() {
            console.log('🎯 Displaying sentence with audio');
            
            const container = document.getElementById('auto-sentence-display');
            if (!container || !this.currentSentence) {
                console.error('❌ Missing container or sentence');
                return;
            }
            
            // 清空并创建显示
            container.innerHTML = '';
            const sentenceEl = document.createElement('div');
            sentenceEl.className = 'sentence-display';
            sentenceEl.innerHTML = `
                <div class="sentence-info">
                    <span class="sentence-number">#${this.sentenceCount}</span>
                    <span class="sentence-pattern">${this.currentSentence.pattern}</span>
                    <span class="sentence-difficulty">难度 ${'★'.repeat(this.currentSentence.difficulty)}</span>
                </div>
                <div class="sentence-text" id="practice-sentence" style="font-size: 32px; font-weight: 600; line-height: 1.6; color: #1F2937;">
                    ${this.currentSentence.sentence}
                </div>
            `;
            container.appendChild(sentenceEl);
            
            // 播放音频
            console.log('🎵 Starting audio playback...');
            this.playSimpleTTS(this.currentSentence.sentence);
            
            // 继续原有的渐进显示逻辑（如果有）
            if (originalDisplay && originalDisplay !== this.displaySentenceProgressive) {
                // 延迟调用原始方法，避免覆盖我们的显示
                setTimeout(() => {
                    originalDisplay.call(this);
                }, 100);
            }
        };
        
        // 也hook displaySentenceInstant
        const originalInstant = mode.displaySentenceInstant;
        mode.displaySentenceInstant = function() {
            console.log('🎯 Displaying sentence instantly with audio');
            
            // 调用原始方法
            if (originalInstant) {
                originalInstant.call(this);
            }
            
            // 播放音频
            if (this.currentSentence && this.currentSentence.sentence) {
                this.playSimpleTTS(this.currentSentence.sentence);
            }
        };
        
        // 监听用户交互
        document.addEventListener('click', () => {
            console.log('👆 User interaction detected');
        }, { once: true });
        
        console.log('✅ Audio integration complete!');
        
        // 将实例挂载到window以便调试
        window.autoPracticeMode = mode;
    }
})();
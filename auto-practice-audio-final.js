/**
 * 自动练习模式音频修复 - 最终版本
 * 确保TTS在正确的时机被调用
 */

(function() {
    'use strict';
    
    console.log('🔊 Auto Practice Audio Fix - Final Version');
    
    // 等待AutoPracticeMode完全加载
    let checkCount = 0;
    const maxChecks = 50; // 最多检查5秒
    
    const checkInterval = setInterval(() => {
        checkCount++;
        
        if (typeof AutoPracticeMode !== 'undefined' && window.autoPracticeMode) {
            clearInterval(checkInterval);
            console.log('✅ AutoPracticeMode found after', checkCount * 100, 'ms');
            setupAudio();
        } else if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            console.error('❌ AutoPracticeMode not found after 5 seconds');
        }
    }, 100);
    
    function setupAudio() {
        const mode = window.autoPracticeMode;
        
        // 设置TTS配置
        mode.ttsEnabled = true;
        mode.selectedVoice = 'af_maple';
        mode.ttsEndpoint = 'http://localhost:5050/api/generate';
        
        console.log('📢 TTS Settings:', {
            enabled: mode.ttsEnabled,
            voice: mode.selectedVoice,
            endpoint: mode.ttsEndpoint
        });
        
        // 创建简单的TTS播放函数
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
                
                const data = await response.json();
                console.log('✅ Audio data received, length:', data.audio_length, 'seconds');
                
                if (data.audio_data) {
                    const audio = new Audio(data.audio_data);
                    
                    // 播放音频并返回Promise
                    return new Promise((resolve, reject) => {
                        audio.onended = () => {
                            console.log('✅ Audio playback finished');
                            resolve();
                        };
                        
                        audio.onerror = (error) => {
                            console.error('❌ Audio error:', error);
                            reject(error);
                        };
                        
                        audio.play().then(() => {
                            console.log('🔊 Audio playing...');
                        }).catch(err => {
                            console.error('❌ Play failed:', err);
                            console.log('💡 Click anywhere on the page to enable audio');
                            reject(err);
                        });
                    });
                }
            } catch (error) {
                console.error('❌ TTS request failed:', error);
                return null;
            }
        };
        
        // 保存原始的displaySentenceProgressive
        const originalDisplay = mode.displaySentenceProgressive;
        
        // 重写displaySentenceProgressive来包含TTS
        mode.displaySentenceProgressive = function() {
            console.log('🎯 Display sentence with TTS');
            
            // 首先调用原始方法（如果存在）
            if (originalDisplay) {
                originalDisplay.call(this);
            }
            
            const container = document.getElementById('auto-sentence-display');
            if (!container || !this.currentSentence) {
                console.error('❌ Missing container or sentence');
                return;
            }
            
            // 如果原始方法没有创建内容，我们创建
            if (!container.querySelector('.sentence-text')) {
                container.innerHTML = '';
                const sentenceEl = document.createElement('div');
                sentenceEl.className = 'sentence-display';
                sentenceEl.innerHTML = `
                    <div class="sentence-info">
                        <span class="sentence-number">#${this.sentenceCount}</span>
                        <span class="sentence-pattern">${this.currentSentence.pattern}</span>
                        <span class="sentence-difficulty">难度 ${'★'.repeat(this.currentSentence.difficulty)}</span>
                    </div>
                    <div class="sentence-text" style="font-size: 32px; font-weight: 600; line-height: 1.6;">
                        ${this.currentSentence.sentence}
                    </div>
                `;
                container.appendChild(sentenceEl);
            }
            
            // 播放TTS
            console.log('🎵 Playing TTS for current sentence...');
            this.playSimpleTTS(this.currentSentence.sentence)
                .then(() => {
                    console.log('✅ TTS completed successfully');
                })
                .catch(error => {
                    console.error('❌ TTS failed:', error);
                });
        };
        
        // 同时hook displaySentenceInstant以防万一
        const originalInstant = mode.displaySentenceInstant;
        mode.displaySentenceInstant = function() {
            console.log('🎯 Display sentence instantly with TTS');
            
            if (originalInstant) {
                originalInstant.call(this);
            }
            
            // 播放TTS
            if (this.currentSentence && this.currentSentence.sentence) {
                this.playSimpleTTS(this.currentSentence.sentence);
            }
        };
        
        // 添加用户交互提示
        let interactionDetected = false;
        document.addEventListener('click', () => {
            if (!interactionDetected) {
                interactionDetected = true;
                console.log('✅ User interaction detected - audio should now work');
            }
        });
        
        console.log('✅ Audio fix applied successfully!');
    }
})();
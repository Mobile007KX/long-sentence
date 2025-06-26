/**
 * 自动练习模式音频修复
 * 确保TTS正确初始化和播放
 */

(function() {
    'use strict';
    
    console.log('🔊 Loading audio fix...');
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioFix);
    } else {
        initAudioFix();
    }
    
    function initAudioFix() {
        // 确保AutoPracticeMode有必要的属性
        const checkInterval = setInterval(() => {
            if (typeof AutoPracticeMode !== 'undefined' && window.autoPracticeMode) {
                clearInterval(checkInterval);
                
                // 确保TTS属性存在
                if (!window.autoPracticeMode.ttsEnabled) {
                    window.autoPracticeMode.ttsEnabled = true;
                }
                if (!window.autoPracticeMode.selectedVoice) {
                    window.autoPracticeMode.selectedVoice = 'af_maple';
                }
                if (!window.autoPracticeMode.ttsEndpoint) {
                    window.autoPracticeMode.ttsEndpoint = 'http://localhost:5050/api/generate';
                }
                
                console.log('✅ TTS settings:', {
                    enabled: window.autoPracticeMode.ttsEnabled,
                    voice: window.autoPracticeMode.selectedVoice,
                    endpoint: window.autoPracticeMode.ttsEndpoint
                });
                
                // 添加简单的TTS播放方法
                if (!window.autoPracticeMode.playSimpleTTS) {
                    window.autoPracticeMode.playSimpleTTS = async function(text) {
                        console.log('🎤 playSimpleTTS called with:', text.substring(0, 50) + '...');
                        
                        if (!this.ttsEnabled || !text) {
                            console.log('❌ TTS disabled or no text');
                            return null;
                        }
                        
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
                            console.log('✅ TTS response received');
                            
                            if (data.audio_data) {
                                const audio = new Audio(data.audio_data);
                                
                                // 返回一个Promise，在音频播放完成时resolve
                                return new Promise((resolve, reject) => {
                                    audio.onended = () => {
                                        console.log('✅ Audio playback completed');
                                        resolve();
                                    };
                                    
                                    audio.onerror = (error) => {
                                        console.error('❌ Audio error:', error);
                                        reject(error);
                                    };
                                    
                                    audio.play().then(() => {
                                        console.log('🔊 Audio started playing');
                                    }).catch((err) => {
                                        console.error('❌ Play failed:', err);
                                        reject(err);
                                    });
                                });
                            } else {
                                console.error('❌ No audio data in response');
                                return null;
                            }
                        } catch (error) {
                            console.error('❌ TTS error:', error);
                            return null;
                        }
                    };
                }
                
                // 重写播放下一句方法，确保包含TTS
                const originalPlayNext = window.autoPracticeMode.playNextSentence;
                window.autoPracticeMode.playNextSentence = function() {
                    console.log('📍 Enhanced playNextSentence called');
                    
                    // 调用原始方法
                    if (originalPlayNext) {
                        originalPlayNext.call(this);
                    }
                    
                    // 播放TTS（如果有当前句子）
                    if (this.currentSentence && this.currentSentence.sentence && this.ttsEnabled) {
                        // 延迟一点，确保DOM已更新
                        setTimeout(() => {
                            this.playSimpleTTS(this.currentSentence.sentence)
                                .then(() => {
                                    console.log('✅ TTS completed, waiting 3s...');
                                    // 等待3秒后开始下一阶段
                                    setTimeout(() => {
                                        this.startProgressiveStages();
                                    }, 3000);
                                })
                                .catch((error) => {
                                    console.error('❌ TTS failed:', error);
                                    // 失败时使用备用时间
                                    setTimeout(() => {
                                        this.startProgressiveStages();
                                    }, 10000);
                                });
                        }, 100);
                    }
                };
                
                // 添加渐进阶段方法（如果不存在）
                if (!window.autoPracticeMode.startProgressiveStages) {
                    window.autoPracticeMode.startProgressiveStages = function() {
                        console.log('🎬 Starting progressive stages');
                        const sentenceEl = document.querySelector('#auto-sentence-display .sentence-text, #practice-sentence');
                        if (!sentenceEl) return;
                        
                        // 这里可以添加渐进显示逻辑
                        // 暂时只是等待后播放下一句
                        setTimeout(() => {
                            if (this.isRunning) {
                                this.playNextSentence();
                            }
                        }, 10000);
                    };
                }
                
                console.log('✅ Audio fix applied');
            }
        }, 100);
    }
})();
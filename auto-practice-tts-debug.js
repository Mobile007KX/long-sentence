/**
 * 自动练习模式TTS调试版本
 * 直接确保TTS功能正常工作
 */

(function() {
    'use strict';
    
    console.log('🔧 开始加载TTS调试版本...');
    
    // 等待AutoPracticeMode加载
    const checkInterval = setInterval(() => {
        if (typeof AutoPracticeMode !== 'undefined' && window.autoPracticeMode) {
            clearInterval(checkInterval);
            console.log('✅ AutoPracticeMode已加载，开始应用TTS修复');
            applyTTSFix();
        }
    }, 100);
    
    function applyTTSFix() {
        // 确保autoPracticeMode实例有TTS相关属性
        if (!window.autoPracticeMode.ttsEnabled) {
            window.autoPracticeMode.ttsEnabled = true;
        }
        if (!window.autoPracticeMode.selectedVoice) {
            window.autoPracticeMode.selectedVoice = 'af_maple';
        }
        if (!window.autoPracticeMode.ttsEndpoint) {
            window.autoPracticeMode.ttsEndpoint = 'http://localhost:5050/api/generate';
        }
        
        // 添加简单的TTS播放函数
        window.autoPracticeMode.playTTS = async function(text) {
            console.log('🎵 playTTS called with text:', text.substring(0, 50) + '...');
            
            if (!text) return;
            
            try {
                const response = await fetch('http://localhost:5050/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        voice: this.selectedVoice || 'af_maple',
                        language: 'en'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('TTS request failed');
                }
                
                const data = await response.json();
                console.log('✅ TTS response received:', data);
                
                if (data.audio_data) {
                    // 停止之前的音频
                    if (this.currentAudio) {
                        this.currentAudio.pause();
                        this.currentAudio = null;
                    }
                    
                    // 播放新音频
                    this.currentAudio = new Audio(data.audio_data);
                    this.currentAudio.play().then(() => {
                        console.log('🔊 Audio playing successfully');
                    }).catch(err => {
                        console.error('❌ Audio play error:', err);
                    });
                } else {
                    console.error('❌ No audio_data in response');
                }
            } catch (error) {
                console.error('❌ TTS error:', error);
            }
        };
        
        // 重写playNextSentence，确保调用TTS
        const originalPlayNext = window.autoPracticeMode.playNextSentence;
        window.autoPracticeMode.playNextSentence = function() {
            console.log('📍 playNextSentence called');
            
            // 调用原始方法
            if (originalPlayNext) {
                originalPlayNext.call(this);
            }
            
            // 确保播放TTS
            if (this.currentSentence && this.currentSentence.sentence && this.ttsEnabled) {
                console.log('🎯 Playing TTS for current sentence');
                // 延迟一点播放，确保UI已更新
                setTimeout(() => {
                    this.playTTS(this.currentSentence.sentence);
                }, 100);
            }
        };
        
        // 重写displaySentenceProgressive，确保调用TTS
        const originalDisplay = window.autoPracticeMode.displaySentenceProgressive;
        window.autoPracticeMode.displaySentenceProgressive = function() {
            console.log('📍 displaySentenceProgressive called');
            
            const container = document.getElementById('auto-sentence-display');
            if (!container) return;
            
            // 显示原句
            if (this.currentSentence) {
                container.innerHTML = `
                    <div class="original-sentence-display">
                        <div class="stage-label">Original Sentence</div>
                        <div class="sentence-text">${this.currentSentence.sentence}</div>
                        <div class="tts-status" id="tts-debug-status" style="margin-top: 10px; color: #666; font-size: 14px;">
                            🎵 TTS: ${this.ttsEnabled ? 'Enabled' : 'Disabled'} | Voice: ${this.selectedVoice}
                        </div>
                    </div>
                `;
                
                // 播放TTS
                if (this.ttsEnabled) {
                    console.log('🎤 Calling playTTS from displaySentenceProgressive');
                    this.playTTS(this.currentSentence.sentence);
                }
            }
            
            // 调用原始显示逻辑（如果存在）
            if (originalDisplay) {
                // 延迟调用，避免立即覆盖
                setTimeout(() => {
                    originalDisplay.call(this);
                }, 5000); // 给5秒时间读原句
            }
        };
        
        console.log('✅ TTS调试修复已应用');
        console.log('📊 当前TTS设置:', {
            enabled: window.autoPracticeMode.ttsEnabled,
            voice: window.autoPracticeMode.selectedVoice,
            endpoint: window.autoPracticeMode.ttsEndpoint
        });
    }
})();
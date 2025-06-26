/**
 * 简单直接的TTS修复
 * 直接在AutoPracticeMode原型上添加TTS功能
 */

(function() {
    'use strict';
    
    console.log('🎵 Loading Simple TTS Fix...');
    
    // 立即给AutoPracticeMode添加TTS功能
    if (typeof AutoPracticeMode !== 'undefined') {
        
        // 添加播放TTS的方法
        AutoPracticeMode.prototype.simpleTTS = async function(text) {
            console.log('🔊 simpleTTS called:', text.substring(0, 30) + '...');
            
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
                    audio.play();
                    console.log('✅ Playing audio');
                }
            } catch (error) {
                console.error('❌ TTS Error:', error);
            }
        };
        
        // 修改displaySentenceProgressive
        const originalDisplay = AutoPracticeMode.prototype.displaySentenceProgressive;
        AutoPracticeMode.prototype.displaySentenceProgressive = function() {
            console.log('🎯 Modified displaySentenceProgressive called');
            
            // 播放TTS
            if (this.currentSentence && this.currentSentence.sentence) {
                this.simpleTTS(this.currentSentence.sentence);
            }
            
            // 调用原始方法
            if (originalDisplay) {
                originalDisplay.call(this);
            }
        };
        
        // 修改displaySentenceSimple
        const originalSimple = AutoPracticeMode.prototype.displaySentenceSimple;
        AutoPracticeMode.prototype.displaySentenceSimple = function(container) {
            console.log('🎯 Modified displaySentenceSimple called');
            
            // 播放TTS
            if (this.currentSentence && this.currentSentence.sentence) {
                this.simpleTTS(this.currentSentence.sentence);
            }
            
            // 调用原始方法
            if (originalSimple) {
                originalSimple.call(this, container);
            }
        };
        
        console.log('✅ Simple TTS Fix Applied');
    } else {
        console.error('❌ AutoPracticeMode not found');
    }
})();
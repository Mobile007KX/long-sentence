/**
 * 禁用其他音频播放，确保只有一个音频源
 */

(function() {
    'use strict';
    
    console.log('🔇 Disabling duplicate audio sources...');
    
    // 等待所有模块加载
    setTimeout(() => {
        if (typeof autoPracticeMode !== 'undefined' || window.autoPracticeMode) {
            const mode = autoPracticeMode || window.autoPracticeMode;
            
            // 查找并禁用其他音频播放函数
            const audioFunctions = [
                'playTTS',
                'generateTTS', 
                'playAudio',
                'speakText',
                'textToSpeech'
            ];
            
            audioFunctions.forEach(funcName => {
                if (mode[funcName] && funcName !== 'playSimpleTTS') {
                    console.log(`🚫 Disabling duplicate audio function: ${funcName}`);
                    mode[funcName] = function() {
                        console.log(`⏭️ Skipped duplicate audio call from ${funcName}`);
                        return Promise.resolve();
                    };
                }
            });
            
            console.log('✅ Duplicate audio sources disabled');
        }
    }, 1000);
})();
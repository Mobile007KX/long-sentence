/**
 * 禁用 auto-practice-final-fix.js 中的音频播放
 * 避免双重音频
 */

(function() {
    'use strict';
    
    console.log('🔇 Disabling audio in final-fix.js...');
    
    // 等待AutoPracticeMode加载完成
    setTimeout(() => {
        if (typeof AutoPracticeMode !== 'undefined') {
            // 重写playTTSWithFullDuration，让它什么都不做
            AutoPracticeMode.prototype.playTTSWithFullDuration = function() {
                console.log('⏭️ Skipping duplicate TTS playback in final-fix');
                // 直接使用备用时间
                this.fallbackTiming();
            };
            
            console.log('✅ Duplicate audio disabled in final-fix.js');
        }
    }, 500);
})();
/**
 * 自动练习模式强制样式修复
 * 确保大字体和样式一定生效
 */

(function() {
    'use strict';
    
    console.log('💪 Applying FORCE style fix...');
    
    // 强制添加样式到页面
    function forceStyles() {
        // 移除旧样式
        const oldStyle = document.getElementById('auto-practice-force-styles');
        if (oldStyle) oldStyle.remove();
        
        // 添加新样式
        const style = document.createElement('style');
        style.id = 'auto-practice-force-styles';
        style.textContent = `
            /* 强制自动练习模式样式 */
            #auto-sentence-display {
                text-align: center !important;
                padding: 40px 20px !important;
            }
            
            /* 原始句子显示 - 超大字体 */
            #auto-sentence-display .sentence-display,
            #auto-sentence-display .sentence-text,
            #auto-sentence-display .original-sentence-display .sentence-text,
            #auto-sentence-display .sentence-stage .sentence-text,
            #practice-sentence {
                font-size: 32px !important;
                line-height: 2.4 !important;
                font-weight: 400 !important;
                color: #1F2937 !important;
                max-width: 1200px !important;
                margin: 0 auto !important;
                padding: 20px !important;
                display: block !important;
            }
            
            /* 确保所有单词继承字体大小 */
            #auto-sentence-display .word-token,
            #auto-sentence-display span {
                font-size: inherit !important;
                line-height: inherit !important;
            }
            
            /* 阶段标签 */
            #auto-sentence-display .stage-label,
            #auto-sentence-display .stage-indicator {
                font-size: 14px !important;
                color: #6B7280 !important;
                text-transform: uppercase !important;
                letter-spacing: 1px !important;
                margin-bottom: 20px !important;
                font-weight: 500 !important;
            }
            
            /* 句子信息 */
            #auto-sentence-display .sentence-stats,
            #auto-sentence-display .sentence-info {
                font-size: 14px !important;
                color: #6B7280 !important;
                margin-top: 20px !important;
            }
            
            /* Stage 0-4 样式 */
            .stage-0 .word-token { 
                color: #1F2937 !important; 
                background: transparent !important;
            }
            
            .stage-1 .word-token { 
                color: #9CA3AF !important; 
            }
            .stage-1 .word-token.is-core,
            .stage-1 .word-token.verb {
                color: #1F2937 !important;
                font-weight: 700 !important;
                border-bottom: 3px solid !important;
            }
            .stage-1 .subject.is-core { border-color: #3B82F6 !important; }
            .stage-1 .verb { border-color: #EF4444 !important; color: #EF4444 !important; }
            .stage-1 .object.is-core { border-color: #10B981 !important; }
            
            .stage-2 .word-token.in-clause,
            .stage-2 .word-token.in-relative-clause {
                background: rgba(139, 92, 246, 0.1) !important;
                color: #1F2937 !important;
            }
            
            .stage-3 .word-token.adverb {
                background: rgba(251, 146, 60, 0.15) !important;
                color: #1F2937 !important;
            }
            
            .stage-4 .word-token {
                color: #1F2937 !important;
            }
            .stage-4 .subject { background: rgba(59, 130, 246, 0.15) !important; }
            .stage-4 .verb { background: rgba(239, 68, 68, 0.15) !important; }
            .stage-4 .object { background: rgba(16, 185, 129, 0.15) !important; }
            
            /* 中文标签隐藏 */
            #auto-sentence-display > div:first-child:not(.final-practice-container):not(.auto-practice-sentence-container):not(.sentence-display-wrapper):not(.original-sentence-display) {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 立即应用样式
    forceStyles();
    
    // 监听DOM变化，确保样式持续生效
    const observer = new MutationObserver((mutations) => {
        const container = document.getElementById('auto-sentence-display');
        if (container && container.querySelector('.sentence-text, .sentence-display')) {
            // 检查字体大小
            const sentenceEl = container.querySelector('.sentence-text, .sentence-display');
            const fontSize = window.getComputedStyle(sentenceEl).fontSize;
            if (fontSize !== '32px') {
                console.log('⚠️ Font size incorrect, reapplying styles...');
                forceStyles();
            }
        }
    });
    
    // 开始观察
    const targetNode = document.getElementById('auto-sentence-display');
    if (targetNode) {
        observer.observe(targetNode, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
    
    // 定期检查（保险措施）
    setInterval(() => {
        const container = document.getElementById('auto-sentence-display');
        if (container && container.querySelector('.sentence-text')) {
            const sentenceEl = container.querySelector('.sentence-text');
            const fontSize = window.getComputedStyle(sentenceEl).fontSize;
            if (fontSize !== '32px') {
                forceStyles();
            }
        }
    }, 1000);
    
    console.log('✅ Force style fix applied');
})();
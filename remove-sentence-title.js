/**
 * 移除ORIGINAL SENTENCE标题，优化空间利用
 */

(function() {
    'use strict';
    
    console.log('🎯 Optimizing sentence display layout...');
    
    // 等待页面加载
    const checkInterval = setInterval(() => {
        if (document.body) {
            clearInterval(checkInterval);
            optimizeLayout();
        }
    }, 100);
    
    function optimizeLayout() {
        // 创建样式
        const style = document.createElement('style');
        style.textContent = `
            /* 隐藏ORIGINAL SENTENCE标题 */
            .original-box > h3,
            .original-box > .section-title,
            .sentence-section > h3,
            .section-header {
                display: none !important;
            }
            
            /* 调整原句框的内边距 */
            .original-box {
                padding: 30px 40px !important;
                min-height: 120px !important;
            }
            
            /* 确保句子文本直接显示 */
            .sentence-text {
                margin-top: 0 !important;
            }
            
            /* 调整分析框的间距 */
            .analysis-box {
                margin-top: 20px !important;
            }
            
            /* 优化整体布局高度 */
            .content-area {
                gap: 15px !important;
            }
            
            /* 确保在一屏内显示 */
            .tab-content {
                padding-top: 10px !important;
            }
            
            /* 调整挑战模式的标题 */
            .challenge-question h3 {
                display: none !important;
            }
            
            .challenge-question {
                padding-top: 20px !important;
            }
        `;
        document.head.appendChild(style);
        
        // 动态移除标题元素
        const removeTitle = () => {
            // 查找并移除所有可能的标题
            const titles = document.querySelectorAll('.original-box h3, .section-title, .section-header');
            titles.forEach(title => {
                if (title.textContent.includes('ORIGINAL') || title.textContent.includes('原句')) {
                    title.style.display = 'none';
                }
            });
        };
        
        // 初始移除
        removeTitle();
        
        // 监听DOM变化，确保新加载的内容也被处理
        const observer = new MutationObserver(() => {
            removeTitle();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Layout optimization applied');
    }
})();
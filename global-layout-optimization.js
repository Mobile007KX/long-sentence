/**
 * 全局布局优化 - 确保内容在一屏内显示
 */

(function() {
    'use strict';
    
    console.log('📐 Applying global layout optimization...');
    
    // 创建全局优化样式
    const style = document.createElement('style');
    style.textContent = `
        /* 减少整体内边距 */
        body {
            padding: 10px !important;
        }
        
        /* 优化容器高度 */
        .container {
            height: calc(100vh - 60px) !important;
            gap: 15px !important;
        }
        
        /* 压缩头部 */
        .header {
            padding: 20px 0 10px !important;
        }
        
        .header h1 {
            font-size: 28px !important;
            margin-bottom: 4px !important;
        }
        
        .header p {
            font-size: 14px !important;
        }
        
        /* 压缩标签导航 */
        .tab-navigation {
            padding: 6px !important;
            margin-bottom: 15px !important;
        }
        
        .tab-button {
            padding: 10px 20px !important;
            font-size: 15px !important;
        }
        
        /* 句型分析标签页优化 */
        #analysis-tab .pattern-selector {
            padding: 20px !important;
            margin-bottom: 15px !important;
        }
        
        .pattern-title {
            font-size: 14px !important;
            margin-bottom: 12px !important;
        }
        
        .pattern-card {
            padding: 15px !important;
        }
        
        .pattern-name {
            font-size: 18px !important;
        }
        
        .pattern-desc {
            font-size: 12px !important;
        }
        
        /* 数字选择器优化 */
        .number-selector {
            padding: 15px !important;
            margin-bottom: 15px !important;
        }
        
        .number-btn {
            width: 40px !important;
            height: 40px !important;
            font-size: 14px !important;
        }
        
        /* 内容区域优化 */
        .content-area {
            gap: 15px !important;
        }
        
        /* 原句框优化 */
        .original-box {
            padding: 25px 35px !important;
            min-height: 100px !important;
            margin-bottom: 0 !important;
        }
        
        .difficulty-badge {
            top: 15px !important;
            right: 15px !important;
            padding: 4px 12px !important;
            font-size: 12px !important;
        }
        
        .sentence-text {
            font-size: 24px !important;
            line-height: 1.6 !important;
        }
        
        /* 分析框优化 */
        .analysis-box {
            padding: 30px 35px !important;
            min-height: 180px !important;
        }
        
        .analysis-content {
            font-size: 24px !important;
            line-height: 1.6 !important;
            min-height: 120px !important;
            padding-top: 10px !important;
        }
        
        /* 控制按钮优化 */
        .controls {
            margin-top: 15px !important;
            gap: 10px !important;
        }
        
        .btn {
            padding: 12px 28px !important;
            font-size: 15px !important;
        }
        
        /* 阶段指示器优化 */
        .stage-indicator {
            top: 15px !important;
            right: 15px !important;
        }
        
        .stage-dot {
            width: 6px !important;
            height: 6px !important;
        }
        
        /* 分析标题优化 */
        .analysis-title {
            top: 15px !important;
            left: 30px !important;
            font-size: 13px !important;
        }
        
        /* 空状态优化 */
        .empty-state {
            font-size: 16px !important;
            padding: 30px !important;
        }
        
        /* 确保不需要滚动 */
        .tab-content {
            overflow: hidden !important;
            height: 100% !important;
        }
        
        .tab-content.active {
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
        }
        
        /* 响应式优化 */
        @media (max-height: 700px) {
            .header {
                padding: 15px 0 5px !important;
            }
            
            .header h1 {
                font-size: 24px !important;
            }
            
            .pattern-card {
                padding: 12px !important;
            }
            
            .original-box,
            .analysis-box {
                padding: 20px 30px !important;
            }
            
            .sentence-text,
            .analysis-content {
                font-size: 20px !important;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    console.log('✅ Global layout optimization applied');
})();
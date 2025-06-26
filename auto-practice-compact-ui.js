/**
 * 自动练习模式紧凑UI初始化
 * 优化布局，让句子成为主要视觉焦点
 */

(function() {
    'use strict';
    
    console.log('🎨 Applying compact layout for auto practice mode...');
    
    // 等待AutoPracticeMode加载
    const waitForMode = setInterval(() => {
        if (typeof autoPracticeMode !== 'undefined' && autoPracticeMode.initializeUI) {
            clearInterval(waitForMode);
            overrideUI();
        }
    }, 100);
    
    function overrideUI() {
        // 保存原始的initializeUI
        const originalInit = autoPracticeMode.initializeUI;
        
        // 重写initializeUI方法
        autoPracticeMode.initializeUI = function(container) {
            console.log('🎨 Creating compact UI layout...');
            
            container.innerHTML = `
                <div class="auto-practice-container">
                    <!-- 紧凑的顶部控制栏 -->
                    <div class="auto-practice-header">
                        <!-- 难度选择 -->
                        <div class="settings-group">
                            <label>难度级别</label>
                            <div class="compact-setting">
                                <button class="speed-btn" data-difficulty="1">困难</button>
                                <button class="speed-btn active" data-difficulty="2">专家</button>
                                <button class="speed-btn" data-difficulty="3">极限</button>
                            </div>
                        </div>
                        
                        <!-- 播放速度 -->
                        <div class="settings-group">
                            <label>播放速度</label>
                            <div class="compact-setting">
                                <button class="speed-btn" data-speed="slow">慢速</button>
                                <button class="speed-btn active" data-speed="normal">正常</button>
                                <button class="speed-btn" data-speed="fast">快速</button>
                            </div>
                        </div>
                        
                        <!-- 显示方式 -->
                        <div class="settings-group">
                            <label>显示方式</label>
                            <div class="display-mode-toggle">
                                <button class="display-mode-btn active" data-mode="progressive">渐进式</button>
                                <button class="display-mode-btn" data-mode="instant">直接显示</button>
                            </div>
                        </div>
                        
                        <!-- 主控制按钮 -->
                        <button class="main-control-btn btn-start" onclick="autoPracticeMode.start()">
                            <span>▶️</span>
                            <span>开始练习</span>
                        </button>
                        <button class="main-control-btn btn-stop" onclick="autoPracticeMode.stop()" style="display: none;">
                            <span>⏹️</span>
                            <span>暂停</span>
                        </button>
                    </div>
                    
                    <!-- 主要句子显示区域 -->
                    <div id="auto-sentence-display">
                        <div class="empty-state">
                            点击"开始练习"开始自动练习模式
                        </div>
                    </div>
                    
                    <!-- 底部状态栏 -->
                    <div class="auto-practice-footer">
                        <!-- 练习统计 -->
                        <div class="practice-stats">
                            <div class="stat-item">
                                <span>已练习</span>
                                <span class="stat-value" id="sentence-count">0</span>
                                <span>句</span>
                            </div>
                            <div class="stat-item">
                                <span>练习时间</span>
                                <span class="stat-value" id="practice-time">00:00</span>
                            </div>
                            <div class="stat-item">
                                <span>队列</span>
                                <span class="stat-value" id="queue-count">0</span>
                                <span>句</span>
                            </div>
                        </div>
                        
                        <!-- 生成状态 -->
                        <div id="generation-status" style="display: none;">
                            <span class="status-spinner"></span>
                            <span>正在生成新句子...</span>
                        </div>
                    </div>
                </div>
            `;
            
            // 绑定事件
            this.bindCompactEvents();
            
            // 添加样式
            if (!document.getElementById('compact-layout-styles')) {
                const link = document.createElement('link');
                link.id = 'compact-layout-styles';
                link.rel = 'stylesheet';
                link.href = 'auto-practice-compact-layout.css';
                document.head.appendChild(link);
            }
        };
        
        // 绑定紧凑布局的事件
        autoPracticeMode.bindCompactEvents = function() {
            // 难度选择
            document.querySelectorAll('[data-difficulty]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const difficulty = parseInt(e.target.dataset.difficulty);
                    this.config.difficulty = { min: difficulty, max: difficulty + 2 };
                    console.log('Difficulty set to:', this.config.difficulty);
                });
            });
            
            // 速度选择
            document.querySelectorAll('[data-speed]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.config.speed = e.target.dataset.speed;
                    this.autoPlaySpeed = {
                        slow: 5000,
                        normal: 3000,
                        fast: 2000
                    }[this.config.speed];
                    console.log('Speed set to:', this.config.speed);
                });
            });
            
            // 显示模式
            document.querySelectorAll('[data-mode]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.config.displayMode = e.target.dataset.mode;
                    console.log('Display mode set to:', this.config.displayMode);
                });
            });
        };
        
        // 更新UI状态的方法
        const originalUpdateUI = autoPracticeMode.updateUIState;
        autoPracticeMode.updateUIState = function(isRunning) {
            const startBtn = document.querySelector('.btn-start');
            const stopBtn = document.querySelector('.btn-stop');
            
            if (startBtn && stopBtn) {
                startBtn.style.display = isRunning ? 'none' : 'flex';
                stopBtn.style.display = isRunning ? 'flex' : 'none';
            }
            
            // 调用原始方法（如果存在）
            if (originalUpdateUI) {
                originalUpdateUI.call(this, isRunning);
            }
        };
        
        console.log('✅ Compact layout override complete!');
    }
})();
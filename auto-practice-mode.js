/**
 * 自动练习模式 - 磨眼睛专用
 * 自动生成超高难度句子，自动播放展示
 */

class AutoPracticeMode {
    constructor() {
        this.isRunning = false;
        this.currentSentence = null;
        this.sentenceQueue = [];
        this.displayInterval = null;
        this.generationInterval = null;
        this.currentStage = 0;
        this.autoPlaySpeed = 3000; // 每个阶段3秒
        this.sentenceCount = 0;
        
        // TTS设置
        this.ttsEnabled = true;
        this.selectedVoice = 'af_maple';
        this.ttsEndpoint = 'http://localhost:5050/api/generate';
        
        // 配置选项
        this.config = {
            difficulty: 'expert', // 默认专家级难度
            speed: 'normal', // normal, fast, slow
            displayMode: 'progressive', // progressive, instant
            generateAhead: 3, // 提前生成的句子数量
            themes: [
                'advanced scientific research',
                'complex philosophical concepts',
                'intricate economic theories',
                'sophisticated technological innovations',
                'elaborate historical analyses',
                'nuanced literary criticism',
                'comprehensive medical studies',
                'detailed legal arguments',
                'multifaceted environmental issues',
                'abstract mathematical theorems'
            ]
        };
        
        // 速度设置
        this.speedSettings = {
            slow: 5000,
            normal: 3000,
            fast: 1500
        };
    }

    /**
     * 初始化自动练习界面
     */
    initializeUI(container) {
        container.innerHTML = `
            <div class="auto-practice-container">
                <!-- 控制面板 -->
                <div class="control-panel">
                    <div class="mode-header">
                        <h2>🔄 自动练习模式</h2>
                        <p class="mode-description">AI生成超高难度句子，自动展示句子结构</p>
                    </div>
                    
                    <div class="control-grid">
                        <!-- 难度选择 -->
                        <div class="control-group">
                            <label>难度级别</label>
                            <div class="difficulty-selector">
                                <button class="diff-btn" data-difficulty="hard">困难</button>
                                <button class="diff-btn active" data-difficulty="expert">专家</button>
                                <button class="diff-btn" data-difficulty="extreme">极限</button>
                            </div>
                        </div>
                        
                        <!-- 速度控制 -->
                        <div class="control-group">
                            <label>播放速度</label>
                            <div class="speed-selector">
                                <button class="speed-btn" data-speed="slow">慢速</button>
                                <button class="speed-btn active" data-speed="normal">正常</button>
                                <button class="speed-btn" data-speed="fast">快速</button>
                            </div>
                        </div>
                        
                        <!-- 显示模式 -->
                        <div class="control-group">
                            <label>展示方式</label>
                            <div class="display-selector">
                                <button class="display-btn active" data-mode="progressive">渐进式</button>
                                <button class="display-btn" data-mode="instant">直接显示</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 主控制按钮 -->
                    <div class="main-controls">
                        <button class="btn-start" onclick="autoPracticeMode.start()">
                            <span class="btn-icon">▶️</span>
                            <span class="btn-text">开始练习</span>
                        </button>
                        <button class="btn-stop" onclick="autoPracticeMode.stop()" style="display: none;">
                            <span class="btn-icon">⏸️</span>
                            <span class="btn-text">暂停</span>
                        </button>
                    </div>
                    
                    <!-- 统计信息 -->
                    <div class="practice-stats">
                        <div class="stat">
                            <span class="stat-label">已练习</span>
                            <span class="stat-value" id="sentence-count">0</span>
                            <span class="stat-unit">句</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">练习时间</span>
                            <span class="stat-value" id="practice-time">00:00</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">队列</span>
                            <span class="stat-value" id="queue-count">0</span>
                            <span class="stat-unit">句</span>
                        </div>
                    </div>
                </div>
                
                <!-- 句子展示区域 -->
                <div class="sentence-display-area">
                    <div class="current-sentence" id="auto-sentence-display">
                        <div class="welcome-message">
                            <h3>准备开始磨眼睛训练</h3>
                            <p>系统将自动生成超高难度的复杂句子，帮助您快速提升句子结构识别能力</p>
                            <p class="tips">💡 建议：放松眼睛，专注观察句子结构的变化</p>
                        </div>
                    </div>
                </div>
                
                <!-- 生成状态指示器 -->
                <div class="generation-status" id="generation-status" style="display: none;">
                    <div class="status-icon">🤖</div>
                    <div class="status-text">AI正在生成新句子...</div>
                </div>
            </div>
        `;
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定UI事件
     */
    bindEvents() {
        // 难度选择
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.config.difficulty = e.target.dataset.difficulty;
            });
        });
        
        // 速度选择
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.config.speed = e.target.dataset.speed;
                this.autoPlaySpeed = this.speedSettings[this.config.speed];
            });
        });
        
        // 显示模式选择
        document.querySelectorAll('.display-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.display-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.config.displayMode = e.target.dataset.mode;
            });
        });
    }

    /**
     * 开始自动练习
     */
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.sentenceCount = 0;
        this.startTime = Date.now();
        
        // 更新UI
        document.querySelector('.btn-start').style.display = 'none';
        document.querySelector('.btn-stop').style.display = 'inline-flex';
        document.getElementById('generation-status').style.display = 'flex';
        
        // 开始计时
        this.startTimer();
        
        // 预生成句子
        await this.preGenerateSentences();
        
        // 开始自动播放
        this.startAutoPlay();
        
        // 开始后台生成
        this.startBackgroundGeneration();
    }

    /**
     * 停止练习
     */
    stop() {
        this.isRunning = false;
        
        // 清除所有定时器
        if (this.displayInterval) clearInterval(this.displayInterval);
        if (this.generationInterval) clearInterval(this.generationInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // 更新UI
        document.querySelector('.btn-start').style.display = 'inline-flex';
        document.querySelector('.btn-stop').style.display = 'none';
        document.getElementById('generation-status').style.display = 'none';
        
        // 显示总结
        this.showSummary();
    }

    /**
     * 预生成句子
     */
    async preGenerateSentences() {
        const promises = [];
        for (let i = 0; i < this.config.generateAhead; i++) {
            promises.push(this.generateSentence());
        }
        
        const sentences = await Promise.all(promises);
        this.sentenceQueue.push(...sentences.filter(s => s !== null));
        this.updateQueueCount();
    }

    /**
     * 生成句子
     */
    async generateSentence() {
        const theme = this.config.themes[Math.floor(Math.random() * this.config.themes.length)];
        const difficulty = this.config.difficulty;
        
        // 根据难度调整复杂度要求
        let complexityRequirements = '';
        if (difficulty === 'extreme') {
            complexityRequirements = `
- 句子长度：50-70个单词
- 必须包含多个嵌套从句（至少3个）
- 使用高级学术词汇和罕见表达
- 包含复杂的逻辑关系和修辞手法
- 类似GRE/GMAT阅读材料的复杂度`;
        } else if (difficulty === 'expert') {
            complexityRequirements = `
- 句子长度：40-50个单词
- 包含多个从句结构（定语从句、状语从句等）
- 使用学术词汇和正式表达
- 句子结构复杂但逻辑清晰`;
        } else {
            complexityRequirements = `
- 句子长度：30-40个单词
- 包含至少一个复杂从句
- 使用较高级的词汇`;
        }
        
        const prompt = `生成一个关于"${theme}"的${difficulty === 'extreme' ? '极限' : difficulty === 'expert' ? '专家' : '困难'}难度英语句子。

要求：${complexityRequirements}
- 主题相关度高，内容有深度
- 句子必须语法正确，逻辑通顺
- 句型：随机选择但倾向于复杂句型（SVOO或SVOC）

返回JSON格式：
{
  "sentence": "完整句子",
  "pattern": "句型",
  "skeleton": "句子主干（只包含核心词）",
  "components": {
    "subject": "主语",
    "verb": "谓语",
    "object": "宾语",
    "complement": "补语",
    "indirectObject": "间接宾语"
  },
  "clauses": [
    {"type": "relative", "text": "定语从句内容"},
    {"type": "adverbial", "text": "状语从句内容"}
  ],
  "complexity_score": 8.5
}

只返回JSON，不要解释。`;

        try {
            const response = await this.callAI(prompt);
            const sentenceData = JSON.parse(response);
            
            // 添加时间戳和ID
            sentenceData.id = Date.now() + Math.random();
            sentenceData.difficulty = difficulty;
            
            return sentenceData;
        } catch (error) {
            console.error('生成句子失败:', error);
            return this.getFallbackSentence(difficulty);
        }
    }

    /**
     * 调用AI API
     */
    async callAI(prompt) {
        if (typeof aiAssistant !== 'undefined' && aiAssistant.sendRequest) {
            try {
                const messages = [{ role: "user", content: prompt }];
                const data = await aiAssistant.sendRequest(messages);
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                let content = data.content || data.choices?.[0]?.message?.content;
                
                // 提取JSON
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return jsonMatch[0];
                }
                
                throw new Error('Invalid response format');
            } catch (error) {
                console.error('AI API调用失败:', error);
                throw error;
            }
        } else {
            throw new Error('AI Assistant not available');
        }
    }

    /**
     * 获取备用句子
     */
    getFallbackSentence(difficulty) {
        const fallbackSentences = {
            extreme: [
                {
                    sentence: "The quantum physicists who had been meticulously analyzing the paradoxical behavior of subatomic particles in superposition states, which seemingly defied all classical interpretations of reality that scientists had previously held sacrosanct, ultimately revolutionized our fundamental understanding of the universe's underlying mechanisms through their groundbreaking theoretical frameworks.",
                    pattern: "SVO",
                    skeleton: "physicists revolutionized understanding",
                    components: {
                        subject: "physicists",
                        verb: "revolutionized",
                        object: "understanding"
                    },
                    clauses: [
                        {"type": "relative", "text": "who had been meticulously analyzing the paradoxical behavior"},
                        {"type": "relative", "text": "which seemingly defied all classical interpretations"}
                    ],
                    complexity_score: 9.2
                }
            ],
            expert: [
                {
                    sentence: "The researchers conducting longitudinal studies on neuroplasticity discovered that consistent meditation practice significantly enhances cognitive flexibility and emotional regulation in ways that traditional pharmaceutical interventions had failed to achieve.",
                    pattern: "SVO",
                    skeleton: "researchers discovered that practice enhances flexibility",
                    components: {
                        subject: "researchers",
                        verb: "discovered",
                        object: "that practice enhances flexibility"
                    },
                    clauses: [
                        {"type": "participial", "text": "conducting longitudinal studies on neuroplasticity"},
                        {"type": "relative", "text": "that traditional pharmaceutical interventions had failed to achieve"}
                    ],
                    complexity_score: 7.8
                }
            ]
        };
        
        const pool = fallbackSentences[difficulty] || fallbackSentences.expert;
        const sentence = pool[Math.floor(Math.random() * pool.length)];
        sentence.id = Date.now() + Math.random();
        sentence.difficulty = difficulty;
        return sentence;
    }

    /**
     * 开始自动播放
     */
    startAutoPlay() {
        this.playNextSentence();
    }

    /**
     * 播放下一个句子
     */
    playNextSentence() {
        if (!this.isRunning) return;
        
        // 从队列获取句子
        if (this.sentenceQueue.length > 0) {
            this.currentSentence = this.sentenceQueue.shift();
            this.updateQueueCount();
            
            // 更新计数
            this.sentenceCount++;
            document.getElementById('sentence-count').textContent = this.sentenceCount;
            
            // 显示句子
            if (this.config.displayMode === 'progressive') {
                this.displaySentenceProgressive();
            } else {
                this.displaySentenceInstant();
            }
        } else {
            // 队列为空，等待生成
            setTimeout(() => this.playNextSentence(), 1000);
        }
    }

    /**
     * 渐进式显示句子
     */
    displaySentenceProgressive() {
        const container = document.getElementById('auto-sentence-display');
        this.currentStage = 0;
        
        // 使用新的渐进式显示系统
        if (typeof progressiveAnswerDisplayV2 !== 'undefined') {
            // 模拟用户选择（随机选择一些词）
            const words = this.currentSentence.sentence.split(' ');
            const selectedTokens = new Set();
            
            // 随机选择60-80%的核心词
            const skeletonWords = this.currentSentence.skeleton.toLowerCase().split(' ');
            words.forEach((word, index) => {
                if (skeletonWords.includes(word.toLowerCase()) && Math.random() > 0.3) {
                    selectedTokens.add(index);
                }
            });
            
            progressiveAnswerDisplayV2.showCorrectAnswerEnhanced(
                this.currentSentence,
                selectedTokens,
                container
            );
            
            // 设置自动进入下一句
            setTimeout(() => {
                this.playNextSentence();
            }, this.autoPlaySpeed * 5); // 5个阶段
        } else {
            // 降级方案
            this.displaySentenceSimple(container);
        }
    }

    /**
     * 简单显示方案
     */
    displaySentenceSimple(container) {
        const stages = [
            // 阶段0：原句
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-original">
                        <div class="stage-label">原句</div>
                        <div class="sentence-text">${this.currentSentence.sentence}</div>
                    </div>
                `;
            },
            // 阶段1：标记主干
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-skeleton">
                        <div class="stage-label">句子主干</div>
                        <div class="sentence-text">${this.markSentence(this.currentSentence)}</div>
                    </div>
                `;
            },
            // 阶段2：显示骨架
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-core">
                        <div class="stage-label">核心结构</div>
                        <div class="skeleton-display">
                            ${this.currentSentence.skeleton}
                        </div>
                        <div class="pattern-info">句型：${this.currentSentence.pattern}</div>
                    </div>
                `;
            },
            // 阶段3：成分分析
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-analysis">
                        <div class="stage-label">成分分析</div>
                        <div class="components-breakdown">
                            ${this.renderComponents(this.currentSentence.components)}
                        </div>
                    </div>
                `;
            }
        ];
        
        // 执行当前阶段
        if (this.currentStage < stages.length) {
            stages[this.currentStage]();
            this.currentStage++;
            
            // 设置下一阶段
            setTimeout(() => {
                if (this.currentStage < stages.length) {
                    this.displaySentenceSimple(container);
                } else {
                    // 所有阶段完成，播放下一句
                    setTimeout(() => this.playNextSentence(), this.autoPlaySpeed);
                }
            }, this.autoPlaySpeed);
        }
    }

    /**
     * 直接显示句子
     */
    displaySentenceInstant() {
        const container = document.getElementById('auto-sentence-display');
        container.innerHTML = `
            <div class="instant-display">
                <div class="sentence-marked">
                    ${this.markSentence(this.currentSentence)}
                </div>
                <div class="sentence-info">
                    <span class="pattern-badge">${this.currentSentence.pattern}</span>
                    <span class="difficulty-badge ${this.currentSentence.difficulty}">
                        ${this.currentSentence.difficulty}
                    </span>
                    <span class="complexity-score">
                        复杂度: ${this.currentSentence.complexity_score || 'N/A'}
                    </span>
                </div>
            </div>
        `;
        
        // 设置播放下一句
        setTimeout(() => this.playNextSentence(), this.autoPlaySpeed * 2);
    }

    /**
     * 标记句子
     */
    markSentence(sentenceData) {
        const { sentence, components } = sentenceData;
        const words = sentence.split(' ');
        
        return words.map(word => {
            const cleanWord = word.replace(/[.,!?;:]/, '');
            const punctuation = word.match(/[.,!?;:]/)?.[0] || '';
            const lowerWord = cleanWord.toLowerCase();
            
            // 检查是否是成分词
            for (const [type, text] of Object.entries(components)) {
                if (text && text.toLowerCase().includes(lowerWord)) {
                    return `<span class="${type} component">${cleanWord}</span>${punctuation}`;
                }
            }
            
            return `<span class="modifier">${cleanWord}</span>${punctuation}`;
        }).join(' ');
    }

    /**
     * 渲染成分
     */
    renderComponents(components) {
        const labels = {
            subject: '主语',
            verb: '谓语',
            object: '宾语',
            complement: '补语',
            indirectObject: '间接宾语'
        };
        
        return Object.entries(components)
            .filter(([_, value]) => value)
            .map(([key, value]) => `
                <div class="component-item">
                    <span class="component-label ${key}">${labels[key]}:</span>
                    <span class="component-text">${value}</span>
                </div>
            `).join('');
    }

    /**
     * 后台生成句子
     */
    startBackgroundGeneration() {
        this.generationInterval = setInterval(async () => {
            if (this.sentenceQueue.length < this.config.generateAhead) {
                const sentence = await this.generateSentence();
                if (sentence) {
                    this.sentenceQueue.push(sentence);
                    this.updateQueueCount();
                }
            }
        }, 5000); // 每5秒检查一次
    }

    /**
     * 更新队列计数
     */
    updateQueueCount() {
        document.getElementById('queue-count').textContent = this.sentenceQueue.length;
    }

    /**
     * 开始计时
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('practice-time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    /**
     * 显示练习总结
     */
    showSummary() {
        const container = document.getElementById('auto-sentence-display');
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        
        container.innerHTML = `
            <div class="practice-summary">
                <h3>练习完成！</h3>
                <div class="summary-stats-grid">
                    <div class="summary-stat">
                        <div class="stat-icon">📚</div>
                        <div class="stat-number">${this.sentenceCount}</div>
                        <div class="stat-label">练习句数</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-number">${minutes}:${seconds.toString().padStart(2, '0')}</div>
                        <div class="stat-label">练习时长</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-number">${this.config.difficulty}</div>
                        <div class="stat-label">难度级别</div>
                    </div>
                </div>
                <div class="summary-message">
                    <p>恭喜您完成了${this.sentenceCount}个${this.config.difficulty}难度句子的练习！</p>
                    <p>持续练习可以显著提升您的句子结构识别能力。</p>
                </div>
            </div>
        `;
    }
}

// 创建全局实例
const autoPracticeMode = new AutoPracticeMode();
// 确保可以通过window访问
window.autoPracticeMode = autoPracticeMode;
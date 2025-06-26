/**
 * 自动练习模式 - 磨眼睛专用 V2
 * 增加TTS语音支持和优化的时间控制
 */

class AutoPracticeModeV2 {
    constructor() {
        this.isRunning = false;
        this.currentSentence = null;
        this.sentenceQueue = [];
        this.displayInterval = null;
        this.generationInterval = null;
        this.currentStage = 0;
        this.sentenceCount = 0;
        
        // TTS配置
        this.ttsEnabled = true;
        this.ttsEndpoint = 'http://localhost:5000/generate'; // Kokoro TTS API
        this.currentAudio = null;
        this.selectedVoice = 'am_michael'; // 默认使用美式英语男声
        
        // 配置选项
        this.config = {
            difficulty: 'expert',
            speed: 'normal',
            displayMode: 'progressive',
            generateAhead: 3,
            ttsVoice: 'zf_shishan', // 默认使用诗珊音色
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
        
        // 时间设置 - 原句停留时间更长
        this.stageTimings = {
            slow: {
                original: 10000,    // 原句10秒（让用户有时间分析）
                skeleton: 5000,     // 主干5秒
                clauses: 5000,      // 从句5秒
                adverbs: 5000,      // 状语5秒
                complete: 5000      // 完整5秒
            },
            normal: {
                original: 7000,     // 原句7秒
                skeleton: 3000,     // 主干3秒
                clauses: 3000,      // 从句3秒
                adverbs: 3000,      // 状语3秒
                complete: 3000      // 完整3秒
            },
            fast: {
                original: 5000,     // 原句5秒
                skeleton: 2000,     // 主干2秒
                clauses: 2000,      // 从句2秒
                adverbs: 2000,      // 状语2秒
                complete: 2000      // 完整2秒
            }
        };
        
        // 可用的TTS音色 - 标准英语声音
        this.availableVoices = {
            american: [
                { id: 'am_michael', name: 'Michael', desc: 'Natural American Male' },
                { id: 'am_adam', name: 'Adam', desc: 'Clear American Male' }
            ],
            british: [
                { id: 'bf_emma', name: 'Emma', desc: 'Elegant British Female' },
                { id: 'bf_isabella', name: 'Isabella', desc: 'Professional British Female' },
                { id: 'bm_george', name: 'George', desc: 'Distinguished British Male' },
                { id: 'bm_lewis', name: 'Lewis', desc: 'Friendly British Male' }
            ]
        };
    }

    /**
     * 初始化自动练习界面 V2
     */
    initializeUI(container) {
        container.innerHTML = `
            <div class="auto-practice-container">
                <!-- 控制面板 -->
                <div class="control-panel">
                    <div class="mode-header">
                        <h2>🔄 自动练习模式</h2>
                        <p class="mode-description">AI生成超高难度句子，自动展示句子结构（支持语音朗读）</p>
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
                    
                    <!-- TTS设置 -->
                    <div class="tts-settings">
                        <div class="tts-toggle">
                            <label class="switch">
                                <input type="checkbox" id="tts-enable" checked>
                                <span class="slider"></span>
                            </label>
                            <span>Enable Voice</span>
                        </div>
                        
                        <div class="voice-selector" id="voice-selector">
                            <label>Voice:</label>
                            <select id="voice-select">
                                <optgroup label="American English">
                                    <option value="am_michael" selected>Michael (Natural)</option>
                                    <option value="am_adam">Adam (Clear)</option>
                                </optgroup>
                                <optgroup label="British English">
                                    <option value="bf_emma">Emma (Elegant)</option>
                                    <option value="bf_isabella">Isabella (Professional)</option>
                                    <option value="bm_george">George (Distinguished)</option>
                                    <option value="bm_lewis">Lewis (Friendly)</option>
                                </optgroup>
                            </select>
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
                            <p class="tips">💡 建议：在原句展示阶段，尝试自己分析句子结构</p>
                            <div class="tts-status" id="tts-status" style="display: none;">
                                <span class="status-icon">🔊</span>
                                <span class="status-text">TTS服务未连接</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 阶段提示 -->
                    <div class="stage-hint" id="stage-hint" style="display: none;">
                        <span class="hint-text">原句展示中，请仔细分析句子结构...</span>
                        <span class="countdown" id="countdown"></span>
                    </div>
                </div>
                
                <!-- 生成状态指示器 -->
                <div class="generation-status" id="generation-status" style="display: none;">
                    <div class="status-icon">🤖</div>
                    <div class="status-text">AI正在生成新句子...</div>
                </div>
                
                <!-- 音频控制（隐藏） -->
                <audio id="tts-audio" style="display: none;"></audio>
            </div>
        `;
        
        // 绑定事件
        this.bindEvents();
        
        // 检查TTS服务
        this.checkTTSService();
    }

    /**
     * 绑定UI事件
     */
    bindEvents() {
        // 原有的事件绑定...
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.config.difficulty = e.target.dataset.difficulty;
            });
        });
        
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.config.speed = e.target.dataset.speed;
            });
        });
        
        document.querySelectorAll('.display-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.display-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.config.displayMode = e.target.dataset.mode;
            });
        });
        
        // TTS相关事件
        const ttsToggle = document.getElementById('tts-enable');
        if (ttsToggle) {
            ttsToggle.addEventListener('change', (e) => {
                this.ttsEnabled = e.target.checked;
                document.getElementById('voice-selector').style.opacity = this.ttsEnabled ? '1' : '0.5';
            });
        }
        
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.config.ttsVoice = e.target.value;
            });
        }
    }

    /**
     * 检查TTS服务状态
     */
    async checkTTSService() {
        try {
            const response = await fetch('http://localhost:5000/health', {
                method: 'GET',
                mode: 'cors'
            });
            
            if (response.ok) {
                console.log('✅ TTS服务已连接');
                const statusEl = document.getElementById('tts-status');
                if (statusEl) {
                    statusEl.style.display = 'none';
                }
            } else {
                throw new Error('TTS服务未响应');
            }
        } catch (error) {
            console.warn('⚠️ TTS服务未启动:', error);
            const statusEl = document.getElementById('tts-status');
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.querySelector('.status-text').textContent = 'TTS服务未启动（请运行 kokoro-tts-zh）';
            }
            // 不禁用TTS，用户可能稍后启动服务
        }
    }

    /**
     * 生成TTS语音
     */
    async generateTTS(text) {
        if (!this.ttsEnabled) return;
        
        try {
            const response = await fetch(this.ttsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voice: this.config.ttsVoice,
                    speed: 1.0,
                    save_audio: false,
                    language: 'en'  // 明确指定英语
                })
            });
            
            if (!response.ok) {
                throw new Error('TTS生成失败');
            }
            
            const data = await response.json();
            
            if (data.audio_base64) {
                // 播放音频
                this.playAudio(data.audio_base64);
            }
        } catch (error) {
            console.error('TTS错误:', error);
            // 静默失败，不影响文本展示
        }
    }

    /**
     * 播放音频
     */
    playAudio(base64Audio) {
        const audio = document.getElementById('tts-audio');
        if (audio) {
            // 停止当前播放
            audio.pause();
            
            // 设置新音频
            audio.src = 'data:audio/wav;base64,' + base64Audio;
            
            // 播放
            audio.play().catch(err => {
                console.error('音频播放失败:', err);
            });
            
            this.currentAudio = audio;
        }
    }

    /**
     * 停止音频播放
     */
    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
    }

    /**
     * 渐进式显示句子（优化版）
     */
    displaySentenceProgressive() {
        const container = document.getElementById('auto-sentence-display');
        const hintEl = document.getElementById('stage-hint');
        this.currentStage = 0;
        
        // 显示阶段提示
        if (hintEl) {
            hintEl.style.display = 'block';
        }
        
        // 使用新的渐进式显示系统
        if (typeof progressiveAnswerDisplayV2 !== 'undefined') {
            // 先显示原句并播放TTS
            container.innerHTML = `
                <div class="original-sentence-display">
                    <div class="stage-label">原始句子</div>
                    <div class="sentence-text">${this.currentSentence.sentence}</div>
                </div>
            `;
            
            // 播放TTS
            this.generateTTS(this.currentSentence.sentence);
            
            // 更新提示和倒计时
            const timing = this.stageTimings[this.config.speed];
            this.startCountdown(timing.original / 1000);
            
            // 等待原句展示时间后，开始渐进展示
            setTimeout(() => {
                // 隐藏提示
                if (hintEl) {
                    hintEl.style.display = 'none';
                }
                
                // 停止音频
                this.stopAudio();
                
                // 模拟用户选择
                const words = this.currentSentence.sentence.split(' ');
                const selectedTokens = new Set();
                
                const skeletonWords = this.currentSentence.skeleton.toLowerCase().split(' ');
                words.forEach((word, index) => {
                    if (skeletonWords.includes(word.toLowerCase()) && Math.random() > 0.3) {
                        selectedTokens.add(index);
                    }
                });
                
                // 使用渐进式展示
                progressiveAnswerDisplayV2.showCorrectAnswerEnhanced(
                    this.currentSentence,
                    selectedTokens,
                    container
                );
                
                // 设置自动播放速度
                progressiveAnswerDisplayV2.displaySpeed = timing.skeleton;
                
                // 计算总时间并设置下一句
                const totalTime = timing.original + (timing.skeleton * 4); // 4个后续阶段
                setTimeout(() => {
                    this.playNextSentence();
                }, totalTime);
                
            }, timing.original);
            
        } else {
            // 降级方案
            this.displaySentenceSimple(container);
        }
    }

    /**
     * 开始倒计时
     */
    startCountdown(seconds) {
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;
        
        let remaining = seconds;
        countdownEl.textContent = `${remaining}秒`;
        
        const countdownInterval = setInterval(() => {
            remaining--;
            if (remaining >= 0) {
                countdownEl.textContent = `${remaining}秒`;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    // ... 其他方法保持不变 ...

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
        
        // 再次检查TTS服务
        await this.checkTTSService();
        
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
        
        // 停止音频
        this.stopAudio();
        
        // 清除所有定时器
        if (this.displayInterval) clearInterval(this.displayInterval);
        if (this.generationInterval) clearInterval(this.generationInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        // 更新UI
        document.querySelector('.btn-start').style.display = 'inline-flex';
        document.querySelector('.btn-stop').style.display = 'none';
        document.getElementById('generation-status').style.display = 'none';
        document.getElementById('stage-hint').style.display = 'none';
        
        // 显示总结
        this.showSummary();
    }

    // ... 继承其他原有方法 ...
}

// 保留原有的全局实例名称以保持兼容性
const autoPracticeMode = new AutoPracticeModeV2();
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
            ],
            hard: [
                {
                    sentence: "Environmental scientists studying climate change patterns have conclusively demonstrated that human industrial activities are accelerating global warming at unprecedented rates.",
                    pattern: "SVO",
                    skeleton: "scientists have demonstrated that activities are accelerating warming",
                    components: {
                        subject: "scientists",
                        verb: "have demonstrated",
                        object: "that activities are accelerating warming"
                    },
                    clauses: [
                        {"type": "participial", "text": "studying climate change patterns"}
                    ],
                    complexity_score: 6.5
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
        
        if (this.sentenceQueue.length > 0) {
            this.currentSentence = this.sentenceQueue.shift();
            this.updateQueueCount();
            
            this.sentenceCount++;
            document.getElementById('sentence-count').textContent = this.sentenceCount;
            
            if (this.config.displayMode === 'progressive') {
                this.displaySentenceProgressive();
            } else {
                this.displaySentenceInstant();
            }
        } else {
            setTimeout(() => this.playNextSentence(), 1000);
        }
    }

    /**
     * 简单显示方案（降级）
     */
    displaySentenceSimple(container) {
        const timing = this.stageTimings[this.config.speed];
        const stages = [
            // 阶段0：原句（更长时间）
            () => {
                container.innerHTML = `
                    <div class="sentence-stage stage-original">
                        <div class="stage-label">原句</div>
                        <div class="sentence-text">${this.currentSentence.sentence}</div>
                    </div>
                `;
                // 播放TTS
                this.generateTTS(this.currentSentence.sentence);
                this.startCountdown(timing.original / 1000);
            },
            // 其他阶段...
            () => {
                this.stopAudio();
                container.innerHTML = `
                    <div class="sentence-stage stage-skeleton">
                        <div class="stage-label">句子主干</div>
                        <div class="sentence-text">${this.markSentence(this.currentSentence)}</div>
                    </div>
                `;
            },
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
        
        if (this.currentStage < stages.length) {
            stages[this.currentStage]();
            this.currentStage++;
            
            // 根据阶段设置不同的延迟时间
            const delay = this.currentStage === 1 ? timing.original : 
                         this.currentStage === 2 ? timing.skeleton :
                         this.currentStage === 3 ? timing.clauses : timing.complete;
            
            setTimeout(() => {
                if (this.currentStage < stages.length) {
                    this.displaySentenceSimple(container);
                } else {
                    setTimeout(() => this.playNextSentence(), 1000);
                }
            }, delay);
        }
    }

    /**
     * 直接显示句子
     */
    displaySentenceInstant() {
        const container = document.getElementById('auto-sentence-display');
        const timing = this.stageTimings[this.config.speed];
        
        // 先显示原句
        container.innerHTML = `
            <div class="original-sentence-display">
                <div class="stage-label">原始句子</div>
                <div class="sentence-text">${this.currentSentence.sentence}</div>
            </div>
        `;
        
        // 播放TTS
        this.generateTTS(this.currentSentence.sentence);
        
        // 显示倒计时
        const hintEl = document.getElementById('stage-hint');
        if (hintEl) {
            hintEl.style.display = 'block';
            this.startCountdown(timing.original / 1000);
        }
        
        // 等待后显示完整分析
        setTimeout(() => {
            this.stopAudio();
            if (hintEl) hintEl.style.display = 'none';
            
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
            
            setTimeout(() => this.playNextSentence(), timing.complete);
        }, timing.original);
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
        }, 5000);
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
                    <div class="summary-stat">
                        <div class="stat-icon">🔊</div>
                        <div class="stat-number">${this.ttsEnabled ? '已启用' : '已关闭'}</div>
                        <div class="stat-label">语音朗读</div>
                    </div>
                </div>
                <div class="summary-message">
                    <p>恭喜您完成了${this.sentenceCount}个${this.config.difficulty}难度句子的练习！</p>
                    <p>持续练习可以显著提升您的句子结构识别能力。</p>
                    ${this.sentenceCount >= 10 ? '<p>🏆 坚持练习，您已经完成了10个以上的句子！</p>' : ''}
                </div>
            </div>
        `;
    }
}
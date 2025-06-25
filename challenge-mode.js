/**
 * 限时挑战模式 - 让用户在倒计时内标记句子骨干
 */

class ChallengeMode {
    constructor() {
        this.currentChallenge = null;
        this.timer = null;
        this.timeLeft = 0;
        this.selectedTokens = new Set();
        this.isCompleted = false;
        this.score = 0;
        
        // 挑战会话
        this.challengeSession = null;
        this.currentChallengeIndex = 0;
        this.sessionScores = [];
        
        // 预生成的挑战
        this.preGeneratedChallenge = null;
        this.isGenerating = false;
        
        // 难度配置
        this.difficulties = {
            easy: {
                name: '简单',
                time: 30,
                sentenceLength: 'medium',
                complexity: 1,
                description: '基础句型，15-20个单词，简单修饰语'
            },
            medium: {
                name: '中等', 
                time: 25,
                sentenceLength: 'long',
                complexity: 2,
                description: '复合句型，20-30个单词，包含从句'
            },
            hard: {
                name: '困难',
                time: 20,
                sentenceLength: 'very_long',
                complexity: 3,
                description: '复杂句型，30-40个单词，多重从句和修饰'
            },
            expert: {
                name: '专家',
                time: 15,
                sentenceLength: 'academic',
                complexity: 4,
                description: '学术级别，40+单词，托福/雅思难度'
            }
        };
    }

    /**
     * 生成挑战句子
     */
    async generateChallenge(difficulty = 'medium') {
        const config = this.difficulties[difficulty];
        
        // 随机选择主题，避免重复
        const themes = [
            'science and research',
            'business and economy',
            'nature and environment',
            'technology and innovation',
            'arts and culture',
            'sports and fitness',
            'travel and adventure',
            'food and cuisine',
            'history and heritage',
            'health and medicine'
        ];
        
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        
        // 简化提示词，减少上下文占用
        // 根据难度调整提示词
        let complexityGuide = '';
        if (difficulty === 'expert') {
            complexityGuide = `
- 必须包含多个从句（定语从句、状语从句等）
- 使用高级词汇和学术表达
- 句子结构要类似托福/雅思阅读材料
- 包含复杂的逻辑关系（因果、转折、递进等）`;
        } else if (difficulty === 'hard') {
            complexityGuide = `
- 包含至少一个从句结构
- 使用较复杂的词汇
- 有多层修饰关系`;
        }
        
        const prompt = `生成一个${config.name}难度的英语句子，要求：
- 句型：随机选择SV/SVP/SVO/SVOO/SVOC之一
- 长度：${this.getSentenceLengthDescription(config.sentenceLength)}
- 主题：${randomTheme}
- 包含修饰成分但主干必须清晰可识别${complexityGuide}

返回格式要求：
1. sentence: 完整句子
2. pattern: 句型（SV/SVP/SVO/SVOO/SVOC）
3. skeleton: 只包含最核心的主干单词，去除所有冠词、形容词、副词等修饰语
4. components: 只写核心单词，不要修饰语

重要规则：
- 谓语动词要包含完整的动词短语（助动词+主动词）
- 例如："have been studying" → 整体作为verb
- 例如："will have completed" → 整体作为verb  
- 被动语态："is being developed" → 整体作为verb
- skeleton应该保留动词的完整形式，其他只要核心词

示例：
句子："The scientists have been developing new technologies for sustainable energy."
输出：
{
  "sentence": "The scientists have been developing new technologies for sustainable energy.",
  "pattern": "SVO",
  "skeleton": "scientists have been developing technologies",
  "components": {
    "subject": "scientists",
    "verb": "have been developing", 
    "object": "technologies"
  }
}

只返回JSON，不要其他内容。`;

        try {
            const response = await this.callAI(prompt);
            const data = JSON.parse(response);
            
            // 生成markedSentence
            data.markedSentence = this.generateMarkedSentence(data);
            
            // 添加挑战配置
            data.difficulty = difficulty;
            data.timeLimit = config.time;
            data.maxScore = this.calculateMaxScore(data);
            
            return data;
        } catch (error) {
            console.error('生成挑战失败:', error);
            // 返回备用句子（从扩展的句子库中随机选择）
            return this.getRandomFallbackChallenge(difficulty);
        }
    }

    /**
     * 生成标记的句子HTML
     */
    generateMarkedSentence(data) {
        const { sentence, skeleton, components } = data;
        const words = sentence.split(' ');
        const skeletonWords = skeleton.toLowerCase().split(' ');
        
        // 创建一个映射来标记每个单词的类型
        const wordTypes = {};
        
        // 标记主干成分
        for (const [key, value] of Object.entries(components)) {
            if (value) {
                const componentWords = value.toLowerCase().split(' ');
                componentWords.forEach(word => {
                    wordTypes[word] = key;
                });
            }
        }
        
        // 生成标记的HTML
        let markedHTML = words.map((word, index) => {
            const cleanWord = word.replace(/[.,!?;:]/, '');
            const punctuation = word.match(/[.,!?;:]/)?.[0] || '';
            const lowerWord = cleanWord.toLowerCase();
            
            // 检查是否是主干成分
            const isCore = skeletonWords.includes(lowerWord);
            const componentType = wordTypes[lowerWord];
            
            if (isCore && componentType) {
                let className = 'core';
                switch(componentType) {
                    case 'subject':
                        className = 'subject core';
                        break;
                    case 'verb':
                        className = 'verb core';
                        break;
                    case 'object':
                        className = 'object core';
                        break;
                    case 'complement':
                        className = 'complement core';
                        break;
                    case 'indirectObject':
                        className = 'indirect-object core';
                        break;
                }
                return `<span class='${className}'>${cleanWord}</span>${punctuation}`;
            } else {
                return `<span class='non-core'>${cleanWord}</span>${punctuation}`;
            }
        }).join(' ');
        
        return markedHTML;
    }

    /**
     * 获取句子长度描述
     */
    getSentenceLengthDescription(length) {
        const descriptions = {
            'medium': '15-20个单词，包含基础修饰语',
            'long': '20-30个单词，包含从句结构',
            'very_long': '30-40个单词，多重从句和复杂修饰',
            'academic': '40个单词以上，学术文章级别的复杂句'
        };
        return descriptions[length] || '20-30个单词';
    }

    /**
     * 计算最高分数
     */
    calculateMaxScore(challengeData) {
        // 基础分：100分
        // 精确率奖励：最高20分
        // 时间奖励：每秒2分
        const baseScore = 100;
        const precisionBonus = 20;
        const timeBonus = challengeData.timeLimit * 2;
        
        return baseScore + precisionBonus + timeBonus;
    }

    /**
     * 获取随机备用挑战句子
     */
    getRandomFallbackChallenge(difficulty) {
        const fallbackPools = {
            easy: [
                {
                    sentence: "The happy children are playing games in the park.",
                    pattern: "SVO",
                    skeleton: "Children are playing games",
                    components: {
                        subject: "children",
                        verb: "are playing",
                        object: "games"
                    },
                    markedSentence: "<span class='non-core'>The happy</span> <span class='subject core'>children</span> <span class='verb core'>are playing</span> <span class='object core'>games</span> <span class='non-core'>in the park</span>.",
                    modifiers: ["The happy", "in the park"]
                },
                {
                    sentence: "Birds fly gracefully across the sky.",
                    pattern: "SV",
                    skeleton: "Birds fly",
                    components: {
                        subject: "birds",
                        verb: "fly"
                    },
                    markedSentence: "<span class='subject core'>Birds</span> <span class='verb core'>fly</span> <span class='non-core'>gracefully across the sky</span>.",
                    modifiers: ["gracefully", "across the sky"]
                },
                {
                    sentence: "The flowers smell wonderful today.",
                    pattern: "SVP",
                    skeleton: "Flowers smell wonderful",
                    components: {
                        subject: "flowers",
                        verb: "smell",
                        complement: "wonderful"
                    },
                    markedSentence: "<span class='non-core'>The</span> <span class='subject core'>flowers</span> <span class='verb core'>smell</span> <span class='complement core'>wonderful</span> <span class='non-core'>today</span>.",
                    modifiers: ["The", "today"]
                },
                {
                    sentence: "My sister reads books every night.",
                    pattern: "SVO",
                    skeleton: "Sister reads books",
                    components: {
                        subject: "sister",
                        verb: "reads",
                        object: "books"
                    },
                    markedSentence: "<span class='non-core'>My</span> <span class='subject core'>sister</span> <span class='verb core'>reads</span> <span class='object core'>books</span> <span class='non-core'>every night</span>.",
                    modifiers: ["My", "every night"]
                },
                {
                    sentence: "The sun rises slowly in the east.",
                    pattern: "SV",
                    skeleton: "Sun rises",
                    components: {
                        subject: "sun",
                        verb: "rises"
                    },
                    markedSentence: "<span class='non-core'>The</span> <span class='subject core'>sun</span> <span class='verb core'>rises</span> <span class='non-core'>slowly in the east</span>.",
                    modifiers: ["The", "slowly", "in the east"]
                }
            ],
            medium: [
                {
                    sentence: "The experienced teacher who loves literature gave her students interesting homework yesterday.",
                    pattern: "SVOO",
                    skeleton: "Teacher gave students homework",
                    components: {
                        subject: "teacher",
                        verb: "gave",
                        indirectObject: "students",
                        object: "homework"
                    },
                    markedSentence: "<span class='non-core'>The experienced</span> <span class='subject core'>teacher</span> <span class='non-core'>who loves literature</span> <span class='verb core'>gave</span> <span class='non-core'>her</span> <span class='indirect-object core'>students</span> <span class='non-core'>interesting</span> <span class='object core'>homework</span> <span class='non-core'>yesterday</span>.",
                    modifiers: ["The experienced", "who loves literature", "her", "interesting", "yesterday"]
                },
                {
                    sentence: "Scientists discovered a revolutionary cure for the disease last month.",
                    pattern: "SVO",
                    skeleton: "Scientists discovered cure",
                    components: {
                        subject: "scientists",
                        verb: "discovered",
                        object: "cure"
                    },
                    markedSentence: "<span class='subject core'>Scientists</span> <span class='verb core'>discovered</span> <span class='non-core'>a revolutionary</span> <span class='object core'>cure</span> <span class='non-core'>for the disease last month</span>.",
                    modifiers: ["a revolutionary", "for the disease", "last month"]
                },
                {
                    sentence: "The board members elected John president after careful consideration.",
                    pattern: "SVOC",
                    skeleton: "Members elected John president",
                    components: {
                        subject: "members",
                        verb: "elected",
                        object: "John",
                        complement: "president"
                    },
                    markedSentence: "<span class='non-core'>The board</span> <span class='subject core'>members</span> <span class='verb core'>elected</span> <span class='object core'>John</span> <span class='complement core'>president</span> <span class='non-core'>after careful consideration</span>.",
                    modifiers: ["The board", "after careful consideration"]
                },
                {
                    sentence: "The company has been developing innovative products since 2020.",
                    pattern: "SVO",
                    skeleton: "Company has been developing products",
                    components: {
                        subject: "company",
                        verb: "has been developing",
                        object: "products"
                    },
                    markedSentence: "<span class='non-core'>The</span> <span class='subject core'>company</span> <span class='verb core'>has been developing</span> <span class='non-core'>innovative</span> <span class='object core'>products</span> <span class='non-core'>since 2020</span>.",
                    modifiers: ["The", "innovative", "since 2020"]
                },
                {
                    sentence: "My grandmother tells us fascinating stories about her childhood.",
                    pattern: "SVOO",
                    skeleton: "Grandmother tells us stories",
                    components: {
                        subject: "grandmother",
                        verb: "tells",
                        indirectObject: "us",
                        object: "stories"
                    },
                    markedSentence: "<span class='non-core'>My</span> <span class='subject core'>grandmother</span> <span class='verb core'>tells</span> <span class='indirect-object core'>us</span> <span class='non-core'>fascinating</span> <span class='object core'>stories</span> <span class='non-core'>about her childhood</span>.",
                    modifiers: ["My", "fascinating", "about her childhood"]
                }
            ],
            hard: [
                {
                    sentence: "The committee members who had reviewed all proposals elected the young entrepreneur with innovative ideas president of the organization.",
                    pattern: "SVOC",
                    skeleton: "Members elected entrepreneur president",
                    components: {
                        subject: "members",
                        verb: "elected",
                        object: "entrepreneur",
                        complement: "president"
                    },
                    markedSentence: "<span class='non-core'>The committee</span> <span class='subject core'>members</span> <span class='non-core'>who had reviewed all proposals</span> <span class='verb core'>elected</span> <span class='non-core'>the young</span> <span class='object core'>entrepreneur</span> <span class='non-core'>with innovative ideas</span> <span class='complement core'>president</span> <span class='non-core'>of the organization</span>.",
                    modifiers: ["The committee", "who had reviewed all proposals", "the young", "with innovative ideas", "of the organization"]
                },
                {
                    sentence: "The researchers analyzing climate data for decades finally published their groundbreaking findings in Nature yesterday.",
                    pattern: "SVO",
                    skeleton: "Researchers published findings",
                    components: {
                        subject: "researchers",
                        verb: "published",
                        object: "findings"
                    },
                    markedSentence: "<span class='non-core'>The</span> <span class='subject core'>researchers</span> <span class='non-core'>analyzing climate data for decades</span> <span class='non-core'>finally</span> <span class='verb core'>published</span> <span class='non-core'>their groundbreaking</span> <span class='object core'>findings</span> <span class='non-core'>in Nature yesterday</span>.",
                    modifiers: ["The", "analyzing climate data for decades", "finally", "their groundbreaking", "in Nature yesterday"]
                }
            ],
            expert: [
                {
                    sentence: "Despite the challenging circumstances, the dedicated researchers who had been working tirelessly on quantum computing finally made their revolutionary discovery public at the international conference.",
                    pattern: "SVOC",
                    skeleton: "Researchers made discovery public",
                    components: {
                        subject: "researchers",
                        verb: "made",
                        object: "discovery",
                        complement: "public"
                    },
                    markedSentence: "<span class='non-core'>Despite the challenging circumstances,</span> <span class='non-core'>the dedicated</span> <span class='subject core'>researchers</span> <span class='non-core'>who had been working tirelessly on quantum computing</span> <span class='non-core'>finally</span> <span class='verb core'>made</span> <span class='non-core'>their revolutionary</span> <span class='object core'>discovery</span> <span class='complement core'>public</span> <span class='non-core'>at the international conference</span>.",
                    modifiers: ["Despite the challenging circumstances", "the dedicated", "who had been working tirelessly on quantum computing", "finally", "their revolutionary", "at the international conference"]
                }
            ]
        };
        
        const pool = fallbackPools[difficulty] || fallbackPools.medium;
        const challenge = pool[Math.floor(Math.random() * pool.length)];
        
        challenge.difficulty = difficulty;
        challenge.timeLimit = this.difficulties[difficulty].time;
        challenge.maxScore = this.calculateMaxScore(challenge);
        
        return challenge;
    }

    /**
     * 调用AI API
     */
    async callAI(prompt) {
        // 使用全局的 AIAssistant 对象
        if (typeof AIAssistant !== 'undefined' && AIAssistant.sendRequest) {
            try {
                const messages = [
                    { role: "user", content: prompt }
                ];
                const data = await AIAssistant.sendRequest(messages);
                
                // 添加调试日志
                console.log('AI Response:', data);
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // 处理不同的响应格式
                let content;
                if (data.success && data.content) {
                    // 新格式：{success: true, content: "..."}
                    content = data.content;
                } else if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                    // OpenAI格式：{choices: [{message: {content: "..."}}]}
                    content = data.choices[0].message.content;
                } else {
                    console.error('Unexpected AI response structure:', data);
                    throw new Error('AI response format error');
                }
                
                console.log('AI Content:', content);
                
                // 尝试解析JSON部分
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return jsonMatch[0];
                }
                
                // 如果没有找到JSON，尝试直接解析整个内容
                try {
                    JSON.parse(content);
                    return content;
                } catch (e) {
                    console.error('JSON parse failed:', e);
                    throw new Error('AI response is not valid JSON');
                }
            } catch (error) {
                console.error('AI API call failed:', error);
                throw error;
            }
        } else {
            console.error('AI Assistant not available');
            throw new Error('AI API not available');
        }
    }

    /**
     * 预生成下一个挑战
     */
    async preGenerateNextChallenge(difficulty) {
        // 如果已经在生成中，不重复生成
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        console.log('开始后台预生成下一个挑战...');
        
        try {
            // 在后台生成新挑战
            const newChallenge = await this.generateChallenge(difficulty);
            this.preGeneratedChallenge = newChallenge;
            console.log('后台预生成完成！');
        } catch (error) {
            console.log('后台预生成失败，将使用备用句子库');
            // 如果生成失败，预生成一个备用句子
            this.preGeneratedChallenge = this.getRandomFallbackChallenge(difficulty);
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * 开始挑战会话
     */
    startChallengeSession(challenges, container) {
        this.challengeSession = challenges;
        this.currentChallengeIndex = 0;
        this.sessionScores = [];
        
        // 开始第一个挑战
        this.startChallenge(challenges[0], container);
    }
    
    /**
     * 开始挑战
     */
    startChallenge(challengeData, container) {
        this.currentChallenge = challengeData;
        this.timeLeft = challengeData.timeLimit;
        this.selectedTokens.clear();
        this.isCompleted = false;
        this.score = 0;
        
        // 渲染挑战界面
        this.renderChallenge(container);
        
        // 启动倒计时
        this.startTimer();
    }

    /**
     * 渲染挑战界面
     */
    renderChallenge(container) {
        // 计算进度
        const progress = this.challengeSession ? 
            `第 ${this.currentChallengeIndex + 1} / ${this.challengeSession.length} 题` : '';
        
        container.innerHTML = `
            <div class="challenge-header">
                <div class="challenge-info">
                    <span class="difficulty-badge ${this.currentChallenge.difficulty}">
                        ${this.difficulties[this.currentChallenge.difficulty].name}
                    </span>
                    <span class="pattern-badge">${this.currentChallenge.pattern}</span>
                    ${progress ? `<span class="progress-badge">${progress}</span>` : ''}
                </div>
                <div class="timer-container">
                    <div class="timer-circle">
                        <svg width="60" height="60">
                            <circle cx="30" cy="30" r="28" class="timer-bg"/>
                            <circle cx="30" cy="30" r="28" class="timer-progress"/>
                        </svg>
                        <span class="timer-text">${this.timeLeft}</span>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn-exit" onclick="challengeMode.exitChallenge()">
                        退出挑战
                    </button>
                    <div class="score-display">
                        <span class="score-label">得分</span>
                        <span class="score-value">0</span>
                    </div>
                </div>
            </div>
            
            <div class="challenge-instruction">
                <p>🎯 点击或划选句子中的<strong>主干成分</strong>（主语、谓语、宾语等）</p>
                <p class="hint">提示：忽略所有修饰语，只标记核心成分</p>
                <p class="score-hint">本题满分：<strong>${this.currentChallenge.maxScore}分</strong>（基础分100 + 时间奖励${this.currentChallenge.timeLimit * 2}）</p>
                <p class="shortcut-hint">快捷键：空格键检查答案 | Enter键下一题 | R键重置</p>
            </div>
            
            <div class="challenge-sentence" id="challenge-sentence">
                ${this.renderSentenceTokens()}
            </div>
            
            <div class="challenge-actions">
                <button class="btn-check" onclick="challengeMode.checkAnswer()">
                    检查答案
                </button>
                <button class="btn-reset" onclick="challengeMode.resetSelection()">
                    重置选择
                </button>
                <button class="btn-give-up" onclick="challengeMode.showAnswer()">
                    放弃（显示答案）
                </button>
            </div>
        `;
        
        // 添加交互事件
        this.addInteractionEvents();
    }

    /**
     * 渲染句子单词
     */
    renderSentenceTokens() {
        // 初始显示时，不要显示任何标注，让用户自己识别
        const words = this.currentChallenge.sentence.split(' ');
        return words.map((word, index) => {
            const cleanWord = word.replace(/[.,!?;:]/, '');
            const punctuation = word.match(/[.,!?;:]/)?.[0] || '';
            
            // 保存单词的核心信息，但不显示
            const isCore = this.isWordInSkeleton(cleanWord);
            
            return `<span class="word-token" data-index="${index}" data-word="${cleanWord}" data-core="${isCore}">
                ${cleanWord}${punctuation ? `<span class="punctuation">${punctuation}</span>` : ''}
            </span>`;
        }).join(' ');
    }
    
    /**
     * 检查单词是否在骨干中
     */
    isWordInSkeleton(word) {
        const skeleton = this.currentChallenge.skeleton.toLowerCase().split(' ');
        return skeleton.includes(word.toLowerCase());
    }

    /**
     * 添加交互事件
     */
    addInteractionEvents() {
        const sentence = document.getElementById('challenge-sentence');
        let isSelecting = false;
        let startIndex = -1;
        
        // 点击选择
        sentence.addEventListener('click', (e) => {
            if (e.target.classList.contains('word-token')) {
                this.toggleWordSelection(e.target);
            }
        });
        
        // 拖拽选择
        sentence.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('word-token')) {
                isSelecting = true;
                startIndex = parseInt(e.target.dataset.index);
                e.preventDefault();
            }
        });
        
        sentence.addEventListener('mousemove', (e) => {
            if (isSelecting && e.target.classList.contains('word-token')) {
                const endIndex = parseInt(e.target.dataset.index);
                this.selectRange(startIndex, endIndex);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isSelecting = false;
            startIndex = -1;
        });
        
        // 触摸支持
        sentence.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('word-token')) {
                isSelecting = true;
                startIndex = parseInt(e.target.dataset.index);
                e.preventDefault();
            }
        });
        
        sentence.addEventListener('touchmove', (e) => {
            if (isSelecting) {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.classList.contains('word-token')) {
                    const endIndex = parseInt(element.dataset.index);
                    this.selectRange(startIndex, endIndex);
                }
            }
        });
        
        sentence.addEventListener('touchend', () => {
            isSelecting = false;
            startIndex = -1;
        });
        
        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            // 如果在挑战模式界面
            if (document.getElementById('challenge-tab').classList.contains('active')) {
                // Enter键：如果已完成，进入下一题
                if (e.key === 'Enter' && this.isCompleted) {
                    e.preventDefault();
                    this.nextChallenge();
                }
                // Space键：如果未完成，检查答案
                else if (e.key === ' ' && !this.isCompleted) {
                    e.preventDefault();
                    this.checkAnswer();
                }
                // R键：重置选择
                else if (e.key === 'r' && !this.isCompleted) {
                    e.preventDefault();
                    this.resetSelection();
                }
            }
        });
    }

    /**
     * 切换单词选择
     */
    toggleWordSelection(element) {
        const index = parseInt(element.dataset.index);
        
        if (this.selectedTokens.has(index)) {
            this.selectedTokens.delete(index);
            element.classList.remove('selected');
        } else {
            this.selectedTokens.add(index);
            element.classList.add('selected');
        }
        
        this.updateSelectionVisual();
    }

    /**
     * 选择范围
     */
    selectRange(start, end) {
        const minIndex = Math.min(start, end);
        const maxIndex = Math.max(start, end);
        
        // 清除之前的选择
        document.querySelectorAll('.word-token').forEach(token => {
            token.classList.remove('selecting');
        });
        
        // 添加新的选择
        for (let i = minIndex; i <= maxIndex; i++) {
            const token = document.querySelector(`[data-index="${i}"]`);
            if (token) {
                token.classList.add('selecting');
            }
        }
    }

    /**
     * 更新选择视觉效果
     */
    updateSelectionVisual() {
        // 可以在这里添加额外的视觉反馈
        const selectedCount = this.selectedTokens.size;
        const totalSkeleton = this.currentChallenge.skeleton.split(' ').length;
        
        // 更新进度提示
        const hint = document.querySelector('.hint');
        if (hint) {
            hint.textContent = `已选择 ${selectedCount} 个单词，骨干约有 ${totalSkeleton} 个单词`;
        }
    }

    /**
     * 启动倒计时
     */
    startTimer() {
        const timerText = document.querySelector('.timer-text');
        const timerProgress = document.querySelector('.timer-progress');
        const totalTime = this.currentChallenge.timeLimit;
        
        // 设置进度圆环
        const circumference = 2 * Math.PI * 28;
        timerProgress.style.strokeDasharray = circumference;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            // 更新显示
            timerText.textContent = this.timeLeft;
            
            // 更新进度圆环
            const progress = this.timeLeft / totalTime;
            const offset = circumference * (1 - progress);
            timerProgress.style.strokeDashoffset = offset;
            
            // 时间警告
            if (this.timeLeft <= 5) {
                timerText.classList.add('warning');
            }
            
            // 时间到
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    /**
     * 时间到
     */
    timeUp() {
        clearInterval(this.timer);
        this.isCompleted = true;
        
        // 计算0分结果
        const result = {
            correct: 0,
            incorrect: this.selectedTokens.size,
            missing: this.currentChallenge.skeleton.split(' ').length,
            accuracy: 0,
            precision: 0,
            timeBonus: 0,
            score: 0
        };
        
        // 显示结果
        this.showResult(result);
        
        // 显示时间到提示
        const actionsDiv = document.querySelector('.challenge-actions');
        const currentContent = actionsDiv.innerHTML;
        actionsDiv.innerHTML = `
            <div class="timeout-message">⏰ 时间到！</div>
        ` + currentContent;
    }
    
    /**
     * 查看答案并继续
     */
    showAnswerAndContinue() {
        // 清空结果区域
        document.getElementById('challenge-result').innerHTML = '';
        // 显示答案
        this.showAnswer(true);
    }

    /**
     * 检查答案
     */
    checkAnswer() {
        if (this.isCompleted) return;
        
        clearInterval(this.timer);
        this.isCompleted = true;
        
        // 获取用户选择的单词
        const selectedWords = Array.from(this.selectedTokens)
            .sort((a, b) => a - b)
            .map(index => {
                const token = document.querySelector(`[data-index="${index}"]`);
                return token.dataset.word;
            });
        
        // 计算得分
        const result = this.calculateScore(selectedWords);
        
        // 显示结果
        this.showResult(result);
    }

    /**
     * 计算得分
     */
    calculateScore(selectedWords) {
        const skeleton = this.currentChallenge.skeleton.toLowerCase().split(' ');
        const selected = selectedWords.map(w => w.toLowerCase());
        
        // 获取动词成分的所有单词
        const verbWords = this.currentChallenge.components.verb ? 
            this.currentChallenge.components.verb.toLowerCase().split(' ') : [];
        
        // 计算准确率 - 更灵活的处理
        let correct = 0;
        let incorrect = 0;
        let coreWordsFound = 0;
        
        // 统计核心词（不包括助动词）
        const coreWords = [];
        if (this.currentChallenge.components.subject) {
            coreWords.push(...this.currentChallenge.components.subject.toLowerCase().split(' '));
        }
        if (this.currentChallenge.components.object) {
            coreWords.push(...this.currentChallenge.components.object.toLowerCase().split(' '));
        }
        if (this.currentChallenge.components.complement) {
            coreWords.push(...this.currentChallenge.components.complement.toLowerCase().split(' '));
        }
        
        // 对于动词，只要选中了主要动词就算对
        const mainVerbs = verbWords.filter(word => 
            !['am', 'is', 'are', 'was', 'were', 'been', 'being', 'be',
              'have', 'has', 'had', 'having', 
              'do', 'does', 'did', 'doing',
              'will', 'would', 'shall', 'should', 'may', 'might', 
              'can', 'could', 'must', 'ought'].includes(word)
        );
        
        if (mainVerbs.length > 0) {
            coreWords.push(...mainVerbs);
        } else {
            // 如果没有主要动词（如系动词），则包含所有动词词汇
            coreWords.push(...verbWords);
        }
        
        // 检查选择的单词
        selected.forEach(word => {
            if (skeleton.includes(word) || verbWords.includes(word)) {
                correct++;
                if (coreWords.includes(word)) {
                    coreWordsFound++;
                }
            } else {
                incorrect++;
            }
        });
        
        // 计算遗漏的核心词
        const missing = coreWords.filter(word => !selected.includes(word)).length;
        
        // 计算分数 - 更宽松的评分标准
        const coreAccuracy = coreWordsFound / coreWords.length;
        const precision = correct / (correct + incorrect || 1);
        const timeBonus = this.timeLeft > 0 ? this.timeLeft * 2 : 0;
        
        // 基础分更高，错误扣分更少
        const baseScore = Math.round(coreAccuracy * 100);
        const precisionBonus = Math.round(precision * 20);
        
        this.score = Math.min(100, baseScore + precisionBonus + timeBonus);
        
        return {
            correct,
            incorrect,
            missing,
            total: coreWords.length,
            accuracy: Math.round(coreAccuracy * 100),
            precision: Math.round(precision * 100),
            timeBonus,
            score: this.score
        };
    }

    /**
     * 显示结果
     */
    showResult(result) {
        // 停止计时
        clearInterval(this.timer);
        this.isCompleted = true;
        
        let grade = 'C';
        if (result.accuracy >= 90) grade = 'S';
        else if (result.accuracy >= 80) grade = 'A';
        else if (result.accuracy >= 70) grade = 'B';
        
        // 在原句上显示正确答案
        this.showCorrectAnswerOnSentence();
        
        // 显示结果统计（不用弹窗）
        const statsHtml = `
            <div class="inline-result">
                <div class="grade-badge grade-${grade}">${grade}</div>
                <div class="score-info">
                    <span class="score-big">${result.score}</span>
                    <span class="score-label">分</span>
                </div>
                <div class="accuracy-info">
                    <div>准确率: ${result.accuracy}%</div>
                    <div class="score-breakdown">
                        基础分: ${Math.round(result.accuracy)} + 
                        精确率: ${Math.round(result.precision * 0.2)} + 
                        时间: ${result.timeBonus}
                    </div>
                </div>
            </div>
        `;
        
        // 在操作按钮区域显示结果
        const actionsDiv = document.querySelector('.challenge-actions');
        actionsDiv.innerHTML = statsHtml + `
            <button class="btn-next-challenge btn-primary" onclick="challengeMode.nextChallenge()">
                下一题 →
            </button>
        `;
        
        // 记录本题分数
        this.sessionScores.push(result.score);
        
        // 更新总分
        const totalScore = this.sessionScores.reduce((sum, s) => sum + s, 0);
        document.querySelector('.score-value').textContent = totalScore;
        
        // 禁用句子交互
        document.getElementById('challenge-sentence').style.pointerEvents = 'none';
    }

    /**
     * 显示答案
     */
    showAnswer(isGiveUp = true) {
        if (!this.isCompleted) {
            clearInterval(this.timer);
            this.isCompleted = true;
            
            // 如果是放弃，分数为0
            const score = isGiveUp ? 0 : this.score;
            
            // 显示0分结果
            const result = {
                correct: 0,
                incorrect: 0,
                missing: this.currentChallenge.skeleton.split(' ').length,
                accuracy: 0,
                precision: 0,
                timeBonus: 0,
                score: 0
            };
            
            this.showResult(result);
        }
    }
    
    /**
     * 渲染颜色图例
     */
    renderColorLegend() {
        return `
            <div class="color-legend">
                <h4>颜色说明：</h4>
                <div class="legend-items">
                    <span class="legend-item">
                        <span class="color-box subject-core"></span>主语
                    </span>
                    <span class="legend-item">
                        <span class="color-box verb-core"></span>谓语
                    </span>
                    <span class="legend-item">
                        <span class="color-box object-core"></span>宾语
                    </span>
                    <span class="legend-item">
                        <span class="color-box complement-core"></span>补语
                    </span>
                    <span class="legend-item">
                        <span class="color-box modifier"></span>修饰语
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * 在句子上显示正确答案
     */
    showCorrectAnswerOnSentence() {
        const words = document.querySelectorAll('.word-token');
        const components = this.currentChallenge.components;
        
        // 创建一个映射，标记每个单词属于哪个成分
        const wordComponentMap = new Map();
        
        // 处理每个成分
        if (components.subject) {
            const subjectWords = components.subject.toLowerCase().split(' ');
            subjectWords.forEach(word => wordComponentMap.set(word, 'subject'));
        }
        
        if (components.verb) {
            const verbWords = components.verb.toLowerCase().split(' ');
            verbWords.forEach(word => wordComponentMap.set(word, 'verb'));
        }
        
        if (components.object) {
            const objectWords = components.object.toLowerCase().split(' ');
            objectWords.forEach(word => wordComponentMap.set(word, 'object'));
        }
        
        if (components.complement) {
            const complementWords = components.complement.toLowerCase().split(' ');
            complementWords.forEach(word => wordComponentMap.set(word, 'complement'));
        }
        
        if (components.indirectObject) {
            const indirectObjectWords = components.indirectObject.toLowerCase().split(' ');
            indirectObjectWords.forEach(word => wordComponentMap.set(word, 'indirect-object'));
        }
        
        // 应用样式
        words.forEach(token => {
            const word = token.dataset.word.toLowerCase();
            const componentType = wordComponentMap.get(word);
            
            if (componentType) {
                // 是骨干成分
                token.classList.add('skeleton-word', `${componentType}-word`);
                
                // 检查用户是否选中了
                if (token.classList.contains('selected')) {
                    token.classList.add('user-correct');
                } else {
                    token.classList.add('user-missed');
                }
            } else {
                // 修饰语
                token.classList.add('modifier-word');
                
                // 如果用户选中了修饰语，标记为错误
                if (token.classList.contains('selected')) {
                    token.classList.add('user-wrong');
                }
            }
            
            // 移除选择状态
            token.classList.remove('selected', 'selecting');
        });
    }

    /**
     * 渲染成分分解
     */
    renderComponentsBreakdown() {
        const components = this.currentChallenge.components;
        const componentNames = {
            subject: '主语',
            verb: '谓语',
            object: '宾语',
            complement: '补语',
            indirectObject: '间接宾语'
        };
        
        let html = '<ul class="components-list">';
        
        for (const [key, value] of Object.entries(components)) {
            if (value) {
                html += `<li><span class="component-name">${componentNames[key]}：</span>${value}</li>`;
            }
        }
        
        html += '</ul>';
        return html;
    }

    /**
     * 获取句型解释
     */
    getPatternExplanation() {
        const explanations = {
            'SV': '主谓结构 - 最简单的句型，只有主语和谓语',
            'SVP': '主系表结构 - 主语 + 系动词 + 表语',
            'SVO': '主谓宾结构 - 主语 + 谓语 + 宾语',
            'SVOO': '主谓双宾结构 - 主语 + 谓语 + 间接宾语 + 直接宾语',
            'SVOC': '主谓宾补结构 - 主语 + 谓语 + 宾语 + 宾语补足语'
        };
        
        return explanations[this.currentChallenge.pattern] || '未知句型';
    }

    /**
     * 重置选择
     */
    resetSelection() {
        if (this.isCompleted) return;
        
        this.selectedTokens.clear();
        document.querySelectorAll('.word-token').forEach(token => {
            token.classList.remove('selected', 'selecting');
        });
        
        this.updateSelectionVisual();
    }

    /**
     * 下一个挑战
     */
    async nextChallenge() {
        const container = document.querySelector('.challenge-container');
        
        // 保存当前得分
        if (this.challengeSession) {
            this.sessionScores.push(this.score);
        }
        
        // 检查是否还有更多挑战
        if (this.challengeSession && this.currentChallengeIndex < this.challengeSession.length - 1) {
            // 进入下一题
            this.currentChallengeIndex++;
            const nextChallenge = this.challengeSession[this.currentChallengeIndex];
            this.startChallenge(nextChallenge, container);
        } else if (this.challengeSession) {
            // 会话结束，显示总结
            this.showSessionSummary(container);
        } else {
            // 单个挑战模式（旧逻辑）
            const difficulty = this.currentChallenge?.difficulty || 'medium';
            
            if (this.preGeneratedChallenge && this.preGeneratedChallenge.difficulty === difficulty) {
                console.log('使用预生成的挑战');
                const challenge = this.preGeneratedChallenge;
                this.preGeneratedChallenge = null;
                this.startChallenge(challenge, container);
            } else {
                container.innerHTML = '<div class="loading">正在生成新挑战...</div>';
                
                try {
                    const newChallenge = await this.generateChallenge(difficulty);
                    this.startChallenge(newChallenge, container);
                } catch (error) {
                    const fallbackChallenge = this.getRandomFallbackChallenge(difficulty);
                    this.startChallenge(fallbackChallenge, container);
                }
            }
        }
    }
    
    /**
     * 退出挑战
     */
    exitChallenge() {
        // 清除计时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 重置状态
        this.currentChallenge = null;
        this.challengeSession = null;
        this.currentChallengeIndex = 0;
        this.sessionScores = [];
        this.isCompleted = false;
        
        // 返回设置界面
        document.querySelector('.challenge-setup').style.display = 'block';
        document.getElementById('challenge-area').style.display = 'none';
    }

    /**
     * 显示会话总结
     */
    showSessionSummary(container) {
        const totalScore = this.sessionScores.reduce((sum, score) => sum + score, 0);
        const avgScore = Math.round(totalScore / this.sessionScores.length);
        const maxScore = Math.max(...this.sessionScores);
        
        let grade = 'C';
        if (avgScore >= 90) grade = 'S';
        else if (avgScore >= 80) grade = 'A';
        else if (avgScore >= 70) grade = 'B';
        
        container.innerHTML = `
            <div class="session-summary">
                <h2>挑战完成！</h2>
                <div class="summary-grade grade-${grade}">${grade}</div>
                
                <div class="summary-stats">
                    <div class="stat-card">
                        <h3>总题数</h3>
                        <p class="stat-number">${this.challengeSession.length}</p>
                    </div>
                    <div class="stat-card">
                        <h3>平均分</h3>
                        <p class="stat-number">${avgScore}</p>
                    </div>
                    <div class="stat-card">
                        <h3>最高分</h3>
                        <p class="stat-number">${maxScore}</p>
                    </div>
                    <div class="stat-card">
                        <h3>总得分</h3>
                        <p class="stat-number">${totalScore}</p>
                    </div>
                </div>
                
                <div class="score-details">
                    <h3>各题得分</h3>
                    <div class="score-list">
                        ${this.sessionScores.map((score, i) => `
                            <div class="score-item">
                                <span>第${i + 1}题</span>
                                <span class="score-bar">
                                    <span class="score-fill" style="width: ${score}%"></span>
                                </span>
                                <span>${score}分</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="summary-actions">
                    <button class="btn btn-secondary" onclick="challengeMode.exitChallenge()">
                        返回选择难度
                    </button>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        再来一轮
                    </button>
                    <button class="btn btn-secondary" onclick="switchTab('analysis')">
                        返回主页
                    </button>
                </div>
            </div>
        `;
    }
}

// 创建全局实例
const challengeMode = new ChallengeMode();

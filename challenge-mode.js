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
        
        // 难度配置
        this.difficulties = {
            easy: {
                name: '简单',
                time: 30,
                sentenceLength: 'short',
                complexity: 1
            },
            medium: {
                name: '中等', 
                time: 20,
                sentenceLength: 'medium',
                complexity: 2
            },
            hard: {
                name: '困难',
                time: 15,
                sentenceLength: 'long',
                complexity: 3
            },
            expert: {
                name: '专家',
                time: 10,
                sentenceLength: 'very_long',
                complexity: 4
            }
        };
    }

    /**
     * 生成挑战句子
     */
    async generateChallenge(difficulty = 'medium') {
        const config = this.difficulties[difficulty];
        
        // 构建提示词
        const prompt = `生成一个英语句子用于句型分析挑战，要求：
1. 难度等级：${config.name}
2. 句子长度：${this.getSentenceLengthDescription(config.sentenceLength)}
3. 复杂度：${config.complexity}/4
4. 必须是五大基本句型之一（SV/SVP/SVO/SVOO/SVOC）
5. 包含一些修饰成分，但主干要清晰

返回JSON格式：
{
    "sentence": "完整句子",
    "pattern": "句型（SV/SVP/SVO/SVOO/SVOC）",
    "skeleton": "句子骨干（去除所有修饰成分）",
    "components": {
        "subject": "主语（不含修饰语）",
        "verb": "谓语动词",
        "object": "宾语（如果有）",
        "complement": "补语（如果有）",
        "indirectObject": "间接宾语（如果有）"
    },
    "modifiers": ["修饰成分1", "修饰成分2", ...]
}`;

        try {
            const response = await this.callAI(prompt);
            const data = JSON.parse(response);
            
            // 添加挑战配置
            data.difficulty = difficulty;
            data.timeLimit = config.time;
            data.maxScore = this.calculateMaxScore(data);
            
            return data;
        } catch (error) {
            console.error('生成挑战失败:', error);
            // 返回备用句子
            return this.getFallbackChallenge(difficulty);
        }
    }

    /**
     * 获取句子长度描述
     */
    getSentenceLengthDescription(length) {
        const descriptions = {
            'short': '10-15个单词',
            'medium': '15-25个单词',
            'long': '25-35个单词',
            'very_long': '35个单词以上'
        };
        return descriptions[length] || '15-25个单词';
    }

    /**
     * 计算最高分数
     */
    calculateMaxScore(challengeData) {
        // 基础分：找到所有骨干成分
        let score = 100;
        
        // 时间奖励：根据难度给予额外分数
        const timeBonus = {
            easy: 20,
            medium: 30,
            hard: 40,
            expert: 50
        };
        
        score += timeBonus[challengeData.difficulty] || 30;
        
        return score;
    }

    /**
     * 获取备用挑战句子
     */
    getFallbackChallenge(difficulty) {
        const fallbacks = {
            easy: {
                sentence: "The happy children are playing games in the park.",
                pattern: "SVO",
                skeleton: "Children are playing games",
                components: {
                    subject: "children",
                    verb: "are playing",
                    object: "games"
                },
                modifiers: ["The happy", "in the park"]
            },
            medium: {
                sentence: "The experienced teacher who loves literature gave her students interesting homework yesterday.",
                pattern: "SVOO",
                skeleton: "Teacher gave students homework",
                components: {
                    subject: "teacher",
                    verb: "gave",
                    indirectObject: "students",
                    object: "homework"
                },
                modifiers: ["The experienced", "who loves literature", "her", "interesting", "yesterday"]
            },
            hard: {
                sentence: "The committee members elected the young entrepreneur with innovative ideas president of the organization.",
                pattern: "SVOC",
                skeleton: "Members elected entrepreneur president",
                components: {
                    subject: "members",
                    verb: "elected",
                    object: "entrepreneur",
                    complement: "president"
                },
                modifiers: ["The committee", "the young", "with innovative ideas", "of the organization"]
            },
            expert: {
                sentence: "Despite the challenging circumstances, the dedicated researchers who had been working tirelessly finally made their groundbreaking discovery public at the international conference.",
                pattern: "SVOC",
                skeleton: "Researchers made discovery public",
                components: {
                    subject: "researchers",
                    verb: "made",
                    object: "discovery",
                    complement: "public"
                },
                modifiers: ["Despite the challenging circumstances", "the dedicated", "who had been working tirelessly", "finally", "their groundbreaking", "at the international conference"]
            }
        };
        
        const challenge = fallbacks[difficulty] || fallbacks.medium;
        challenge.difficulty = difficulty;
        challenge.timeLimit = this.difficulties[difficulty].time;
        challenge.maxScore = this.calculateMaxScore(challenge);
        
        return challenge;
    }

    /**
     * 调用AI API
     */
    async callAI(prompt) {
        // 使用全局的 AI 助手实例
        if (typeof aiAssistant !== 'undefined' && aiAssistant.callQwenAPI) {
            try {
                const response = await aiAssistant.callQwenAPI(prompt);
                return response;
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
        container.innerHTML = `
            <div class="challenge-header">
                <div class="challenge-info">
                    <span class="difficulty-badge ${this.currentChallenge.difficulty}">
                        ${this.difficulties[this.currentChallenge.difficulty].name}
                    </span>
                    <span class="pattern-badge">${this.currentChallenge.pattern}</span>
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
                <div class="score-display">
                    <span class="score-label">得分</span>
                    <span class="score-value">0</span>
                </div>
            </div>
            
            <div class="challenge-instruction">
                <p>🎯 点击或划选句子中的<strong>主干成分</strong>（主语、谓语、宾语等）</p>
                <p class="hint">提示：忽略所有修饰语，只标记核心成分</p>
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
            
            <div class="challenge-result" id="challenge-result" style="display: none;">
            </div>
        `;
        
        // 添加交互事件
        this.addInteractionEvents();
    }

    /**
     * 渲染句子单词
     */
    renderSentenceTokens() {
        const words = this.currentChallenge.sentence.split(' ');
        return words.map((word, index) => {
            const cleanWord = word.replace(/[.,!?;:]/, '');
            const punctuation = word.match(/[.,!?;:]/)?.[0] || '';
            
            return `<span class="word-token" data-index="${index}" data-word="${cleanWord}">
                ${cleanWord}${punctuation ? `<span class="punctuation">${punctuation}</span>` : ''}
            </span>`;
        }).join(' ');
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
        
        // 自动显示答案
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
        
        // 计算准确率
        let correct = 0;
        let incorrect = 0;
        
        selected.forEach(word => {
            if (skeleton.includes(word)) {
                correct++;
            } else {
                incorrect++;
            }
        });
        
        const missing = skeleton.filter(word => !selected.includes(word)).length;
        
        // 计算分数
        const accuracy = correct / skeleton.length;
        const precision = correct / (correct + incorrect || 1);
        const timeBonus = this.timeLeft > 0 ? this.timeLeft * 2 : 0;
        
        this.score = Math.round(accuracy * 100 + precision * 30 + timeBonus);
        
        return {
            correct,
            incorrect,
            missing,
            total: skeleton.length,
            accuracy: Math.round(accuracy * 100),
            precision: Math.round(precision * 100),
            timeBonus,
            score: this.score
        };
    }

    /**
     * 显示结果
     */
    showResult(result) {
        const resultDiv = document.getElementById('challenge-result');
        
        let grade = 'C';
        if (result.accuracy >= 90) grade = 'S';
        else if (result.accuracy >= 80) grade = 'A';
        else if (result.accuracy >= 70) grade = 'B';
        
        resultDiv.innerHTML = `
            <div class="result-card">
                <h3>挑战结果</h3>
                <div class="grade-display grade-${grade}">${grade}</div>
                
                <div class="result-stats">
                    <div class="stat-item">
                        <span class="stat-label">准确率</span>
                        <span class="stat-value">${result.accuracy}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">精确率</span>
                        <span class="stat-value">${result.precision}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">时间奖励</span>
                        <span class="stat-value">+${result.timeBonus}</span>
                    </div>
                </div>
                
                <div class="result-details">
                    <p>✅ 正确标记：${result.correct} 个</p>
                    <p>❌ 错误标记：${result.incorrect} 个</p>
                    <p>⚠️ 遗漏单词：${result.missing} 个</p>
                </div>
                
                <div class="final-score">
                    <span class="score-label">最终得分</span>
                    <span class="score-number">${result.score}</span>
                </div>
                
                <button class="btn-show-answer" onclick="challengeMode.showAnswer()">
                    查看正确答案
                </button>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        
        // 更新分数显示
        document.querySelector('.score-value').textContent = result.score;
    }

    /**
     * 显示答案
     */
    showAnswer(isTimeUp = false) {
        if (!this.isCompleted) {
            clearInterval(this.timer);
            this.isCompleted = true;
        }
        
        // 标记正确答案
        const skeleton = this.currentChallenge.skeleton.toLowerCase().split(' ');
        const words = document.querySelectorAll('.word-token');
        
        words.forEach(token => {
            const word = token.dataset.word.toLowerCase();
            if (skeleton.includes(word)) {
                token.classList.add('correct-answer');
            } else {
                token.classList.add('modifier');
            }
        });
        
        // 显示答案解析
        const resultDiv = document.getElementById('challenge-result');
        const analysisHTML = `
            <div class="answer-analysis">
                <h3>${isTimeUp ? '⏰ 时间到！' : '📖 答案解析'}</h3>
                
                <div class="skeleton-display">
                    <p class="skeleton-label">句子骨干：</p>
                    <p class="skeleton-text">${this.currentChallenge.skeleton}</p>
                </div>
                
                <div class="components-breakdown">
                    <h4>成分分析：</h4>
                    ${this.renderComponentsBreakdown()}
                </div>
                
                <div class="pattern-explanation">
                    <h4>句型说明：</h4>
                    <p>${this.getPatternExplanation()}</p>
                </div>
                
                <button class="btn-next-challenge" onclick="challengeMode.nextChallenge()">
                    下一个挑战
                </button>
            </div>
        `;
        
        if (resultDiv.innerHTML === '') {
            resultDiv.innerHTML = analysisHTML;
        } else {
            resultDiv.innerHTML += analysisHTML;
        }
        
        resultDiv.style.display = 'block';
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
        container.innerHTML = '<div class="loading">正在生成新挑战...</div>';
        
        // 生成新挑战
        const difficulty = this.currentChallenge?.difficulty || 'medium';
        const newChallenge = await this.generateChallenge(difficulty);
        
        // 开始新挑战
        this.startChallenge(newChallenge, container);
    }
}

// 创建全局实例
const challengeMode = new ChallengeMode();

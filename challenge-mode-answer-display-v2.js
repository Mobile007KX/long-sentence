/**
 * 挑战模式答案渐进式展示优化 V2
 * 基于progressive-display-demo.html的实现进行优化
 */

class ProgressiveAnswerDisplayV2 {
    constructor() {
        this.currentStage = 0;
        this.maxStage = 4;
        this.autoPlayInterval = null;
        this.displaySpeed = 2500; // 从3000ms优化为2500ms
        
        // 阶段说明文字
        this.stageExplanations = {
            0: "完整的句子，包含所有成分",
            1: "突出显示句子主干：主语核心词 + 谓语 + 宾语核心词",
            2: "显示定语从句，它们修饰并丰富了主语和宾语",
            3: "显示状语，提供时间、地点和方式信息",
            4: "完整的句子结构，不同颜色表示不同成分"
        };
    }

    /**
     * 改进的显示正确答案方法
     */
    showCorrectAnswerEnhanced(challenge, selectedTokens, container) {
        this.currentChallenge = challenge;
        this.selectedTokens = selectedTokens;
        this.container = container;
        
        // 创建展示容器
        this.createDisplayContainer();
        
        // 创建句子元素
        const sentenceDisplay = this.createSentenceDisplay();
        
        // 创建增强的单词映射
        const wordMapping = this.createEnhancedWordMapping(sentenceDisplay);
        
        // 初始化渐进展示
        this.initEnhancedProgressiveDisplay(sentenceDisplay, wordMapping);
        
        // 创建增强的控制面板
        this.createEnhancedDisplayControls();
        
        // 自动开始渐进展示
        setTimeout(() => {
            this.autoPlay();
        }, 300);
    }

    /**
     * 创建展示容器
     */
    createDisplayContainer() {
        const displayHtml = `
            <div class="progressive-answer-display">
                <div class="display-header">
                    <h3>答案解析</h3>
                    <div class="pattern-info">
                        <span class="pattern-badge">${this.currentChallenge.pattern}</span>
                        <span class="skeleton-info">主干：${this.currentChallenge.skeleton}</span>
                    </div>
                </div>
                <div class="sentence-display-container"></div>
                <div class="progressive-controls-container"></div>
            </div>
        `;
        
        this.container.innerHTML = displayHtml;
    }

    /**
     * 创建句子展示元素
     */
    createSentenceDisplay() {
        const words = this.currentChallenge.sentence.split(' ');
        const sentenceContainer = this.container.querySelector('.sentence-display-container');
        
        const sentenceHtml = `
            <div class="sentence-display progressive-display stage-0">
                ${words.map((word, index) => {
                    const cleanWord = word.replace(/[.,!?;:]/, '');
                    const punctuation = word.match(/[.,!?;:]/)?.[0] || '';
                    
                    return `<span class="word-token" data-index="${index}" data-word="${cleanWord}">
                        ${cleanWord}${punctuation ? `<span class="punctuation">${punctuation}</span>` : ''}
                    </span>`;
                }).join(' ')}
            </div>
        `;
        
        sentenceContainer.innerHTML = sentenceHtml;
        return sentenceContainer.querySelector('.sentence-display');
    }

    /**
     * 创建增强的单词到成分映射
     */
    createEnhancedWordMapping(sentenceDisplay) {
        const words = sentenceDisplay.querySelectorAll('.word-token');
        const components = this.currentChallenge.components;
        const sentenceText = this.currentChallenge.sentence;
        const mapping = new Map();
        
        // 识别定语从句和状语从句
        const clausePatterns = {
            relative: /\b(who|which|that|whom|whose|where|when)\b[^,.]*/gi,
            participial: /\b(\w+ing|\w+ed)\s+[^,.]*/gi,
            prepositional: /\b(in|on|at|with|for|from|to|by|about|after|before|during)\s+[^,.]*/gi
        };
        
        // 提取从句
        const clauses = {
            relative: [],
            participial: [],
            prepositional: []
        };
        
        for (const [type, pattern] of Object.entries(clausePatterns)) {
            const matches = sentenceText.match(pattern) || [];
            clauses[type] = matches;
        }

        // 为每个单词分配成分和属性
        words.forEach((token, index) => {
            const word = token.dataset.word;
            const wordLower = word.toLowerCase();
            let componentType = null;
            let subType = null;
            let isCore = false;
            let isInClause = false;
            let clauseType = null;
            
            // 检查是否在从句中
            const wordPosition = sentenceText.indexOf(word);
            for (const [type, clauseList] of Object.entries(clauses)) {
                for (const clause of clauseList) {
                    if (sentenceText.indexOf(clause) <= wordPosition && 
                        wordPosition < sentenceText.indexOf(clause) + clause.length) {
                        isInClause = true;
                        clauseType = type;
                        break;
                    }
                }
            }
            
            // 检查每个成分
            for (const [compType, compText] of Object.entries(components)) {
                if (!compText) continue;
                
                const compWords = compText.toLowerCase().split(/\s+/);
                const wordIndex = compWords.indexOf(wordLower);
                
                if (wordIndex !== -1) {
                    componentType = compType;
                    
                    // 判断是否为核心词
                    if (compType === 'subject') {
                        // 主语的第一个实词为核心词
                        const nonArticles = compWords.filter(w => !['the', 'a', 'an'].includes(w));
                        isCore = wordLower === nonArticles[0];
                    } else if (compType === 'verb') {
                        // 所有动词成分都标记为核心
                        isCore = true;
                    } else if (compType === 'object') {
                        // 宾语的最后一个实词为核心词
                        const nonPreps = compWords.filter(w => !['of', 'for', 'to', 'with'].includes(w));
                        isCore = wordLower === nonPreps[nonPreps.length - 1];
                    } else if (compType === 'complement') {
                        isCore = true;
                    } else if (compType === 'indirectObject') {
                        isCore = true;
                    }
                    
                    break;
                }
            }
            
            // 识别状语
            const adverbPatterns = {
                time: /^(yesterday|today|tomorrow|finally|recently|soon|always|often|sometimes|never|now|then|later|earlier|afterwards)$/i,
                place: /^(here|there|everywhere|somewhere|anywhere|nowhere|home|abroad|outside|inside)$/i,
                manner: /^(carefully|quickly|slowly|well|badly|easily|hardly|happily|sadly|quietly|loudly)$/i,
                degree: /^(very|quite|too|so|rather|extremely|fairly|pretty|somewhat)$/i
            };
            
            for (const [advType, pattern] of Object.entries(adverbPatterns)) {
                if (pattern.test(wordLower)) {
                    componentType = 'adverb';
                    subType = advType;
                    break;
                }
            }
            
            mapping.set(index, {
                word: word,
                componentType: componentType,
                subType: subType,
                isCore: isCore,
                isInClause: isInClause,
                clauseType: clauseType,
                element: token,
                isUserSelected: this.selectedTokens && this.selectedTokens.has(index)
            });
        });
        
        return mapping;
    }

    /**
     * 初始化增强的渐进展示
     */
    initEnhancedProgressiveDisplay(sentenceDisplay, mapping) {
        sentenceDisplay.classList.add('progressive-display', 'stage-0');
        
        // 为每个单词添加必要的类
        mapping.forEach((info, index) => {
            const token = info.element;
            
            // 清除之前的类
            token.className = 'word-token';
            
            // 添加基础类
            if (info.componentType) {
                token.classList.add(info.componentType);
                
                if (info.isCore) {
                    token.classList.add('core');
                }
                
                if (info.subType) {
                    token.classList.add(info.subType);
                }
                
                if (info.isInClause) {
                    token.classList.add('in-clause', `${info.clauseType}-clause`);
                }
            } else {
                token.classList.add('non-core');
            }
            
            // 标记用户选择
            if (info.isUserSelected) {
                token.setAttribute('data-user-selected', 'true');
            }
        });
        
        this.wordMapping = mapping;
        this.sentenceDisplay = sentenceDisplay;
        this.currentStage = 0;
    }

    /**
     * 创建增强的控制面板
     */
    createEnhancedDisplayControls() {
        const controlsContainer = this.container.querySelector('.progressive-controls-container');
        
        const controlsHtml = `
            <!-- 阶段指示器 -->
            <div class="stage-indicator">
                <div class="stage-item active" data-stage="0">
                    <div class="stage-dot"></div>
                    <span>原句</span>
                </div>
                <div class="stage-item" data-stage="1">
                    <div class="stage-dot"></div>
                    <span>主干</span>
                </div>
                <div class="stage-item" data-stage="2">
                    <div class="stage-dot"></div>
                    <span>从句</span>
                </div>
                <div class="stage-item" data-stage="3">
                    <div class="stage-dot"></div>
                    <span>状语</span>
                </div>
                <div class="stage-item" data-stage="4">
                    <div class="stage-dot"></div>
                    <span>完整</span>
                </div>
            </div>
            
            <!-- 说明文字 -->
            <div class="stage-explanation" id="stageExplanation">
                ${this.stageExplanations[0]}
            </div>
            
            <!-- 骨架句展示 -->
            <div class="skeleton-display" id="skeletonDisplay"></div>
            
            <!-- 控制按钮 -->
            <div class="controls-buttons">
                <button class="control-btn" onclick="window.progressiveAnswerDisplay.previousStage()">
                    ← 上一步
                </button>
                <button class="control-btn" onclick="window.progressiveAnswerDisplay.nextStage()">
                    下一步 →
                </button>
                <button class="control-btn secondary" onclick="window.progressiveAnswerDisplay.toggleAutoPlay()">
                    <span class="auto-play-text">暂停</span>
                </button>
                <button class="control-btn secondary" onclick="window.progressiveAnswerDisplay.reset()">
                    重置
                </button>
            </div>
            
            <!-- 用户答案对比图例 -->
            <div class="answer-legend" style="display: none;">
                <div class="answer-legend-item">
                    <div class="answer-legend-box correct"></div>
                    <span>选对了</span>
                </div>
                <div class="answer-legend-item">
                    <div class="answer-legend-box wrong"></div>
                    <span>选错了</span>
                </div>
                <div class="answer-legend-item">
                    <div class="answer-legend-box missed"></div>
                    <span>漏选了</span>
                </div>
            </div>
            
            <!-- 键盘提示 -->
            <div class="keyboard-hint">
                提示：使用方向键 ← → 控制进度，空格键播放/暂停
            </div>
        `;
        
        controlsContainer.innerHTML = controlsHtml;
        
        // 绑定全局实例
        window.progressiveAnswerDisplay = this;
        
        // 添加键盘事件
        this.addKeyboardControls();
    }

    /**
     * 更新展示阶段
     */
    updateStage(stage) {
        this.currentStage = stage;
        const skeletonDisplay = document.getElementById('skeletonDisplay');
        const explanation = document.getElementById('stageExplanation');
        const answerLegend = this.container.querySelector('.answer-legend');
        
        // 更新句子显示类
        this.sentenceDisplay.className = `sentence-display progressive-display stage-${stage}`;
        
        // 更新阶段指示器
        document.querySelectorAll('.stage-item').forEach((item, index) => {
            item.classList.toggle('active', index <= stage);
        });
        
        // 更新说明文字
        explanation.textContent = this.stageExplanations[stage];
        
        // 阶段1：显示骨架句
        if (stage === 1) {
            this.showEnhancedSkeletonSentence(skeletonDisplay);
        } else {
            skeletonDisplay.classList.remove('show');
        }
        
        // 阶段4：显示用户答案对比
        if (stage === 4) {
            this.showUserAnswerComparison();
            answerLegend.style.display = 'flex';
        } else {
            answerLegend.style.display = 'none';
        }
    }

    /**
     * 显示增强的骨架句
     */
    showEnhancedSkeletonSentence(container) {
        const skeletonParts = [];
        const components = this.currentChallenge.components;
        
        // 按照句子顺序提取核心词
        const orderedComponents = ['subject', 'verb', 'indirectObject', 'object', 'complement'];
        
        orderedComponents.forEach(compType => {
            if (components[compType]) {
                const compWords = components[compType].split(' ');
                
                // 为每个成分找到核心词
                let coreWord = '';
                if (compType === 'subject') {
                    // 主语：第一个实词
                    coreWord = compWords.find(w => !['the', 'a', 'an', 'my', 'your', 'his', 'her', 'their', 'our'].includes(w.toLowerCase())) || compWords[0];
                } else if (compType === 'verb') {
                    // 动词：保留完整动词短语
                    coreWord = components[compType];
                } else if (compType === 'object' || compType === 'complement' || compType === 'indirectObject') {
                    // 宾语/补语：最后一个实词
                    const filtered = compWords.filter(w => !['the', 'a', 'an', 'of', 'for', 'to'].includes(w.toLowerCase()));
                    coreWord = filtered[filtered.length - 1] || compWords[compWords.length - 1];
                }
                
                if (coreWord) {
                    skeletonParts.push({
                        text: coreWord,
                        type: compType
                    });
                }
            }
        });
        
        // 渲染骨架句，带动画延迟
        container.innerHTML = skeletonParts.map((part, index) => 
            `<span class="skeleton-word ${part.type}-skeleton" 
                   style="--delay: ${0.2 + index * 0.3}s">
                ${part.text}
            </span>`
        ).join(' ');
        
        container.classList.add('show');
    }

    /**
     * 显示用户答案对比
     */
    showUserAnswerComparison() {
        let correctCount = 0;
        let wrongCount = 0;
        let missedCount = 0;
        
        // 为用户选择的词添加特殊标记
        this.wordMapping.forEach((info, index) => {
            const token = info.element;
            
            if (info.isUserSelected) {
                if (info.componentType && info.isCore) {
                    // 用户选对了核心词
                    token.classList.add('user-correct');
                    correctCount++;
                } else {
                    // 用户选了非核心词
                    token.classList.add('user-wrong');
                    wrongCount++;
                }
            } else if (info.componentType && info.isCore) {
                // 用户漏选了核心词
                token.classList.add('user-missed');
                missedCount++;
            }
        });
        
        // 更新说明文字
        const explanation = document.getElementById('stageExplanation');
        explanation.innerHTML = `
            ${this.stageExplanations[4]}
            <div class="comparison-stats">
                正确: <span class="stat-correct">${correctCount}</span> | 
                错误: <span class="stat-wrong">${wrongCount}</span> | 
                漏选: <span class="stat-missed">${missedCount}</span>
            </div>
        `;
    }

    /**
     * 下一步
     */
    nextStage() {
        if (this.currentStage < this.maxStage) {
            this.updateStage(this.currentStage + 1);
        }
    }

    /**
     * 上一步
     */
    previousStage() {
        if (this.currentStage > 0) {
            this.updateStage(this.currentStage - 1);
        }
    }

    /**
     * 自动播放
     */
    autoPlay() {
        if (this.autoPlayInterval) {
            this.pauseAutoPlay();
            return;
        }
        
        const autoPlayBtn = this.container.querySelector('.auto-play-text');
        autoPlayBtn.textContent = '暂停';
        
        this.autoPlayInterval = setInterval(() => {
            if (this.currentStage < this.maxStage) {
                this.nextStage();
            } else {
                this.pauseAutoPlay();
            }
        }, this.displaySpeed);
    }

    /**
     * 暂停自动播放
     */
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            
            const autoPlayBtn = this.container.querySelector('.auto-play-text');
            autoPlayBtn.textContent = '自动播放';
        }
    }

    /**
     * 切换自动播放
     */
    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.pauseAutoPlay();
        } else {
            this.autoPlay();
        }
    }

    /**
     * 重置
     */
    reset() {
        this.pauseAutoPlay();
        this.updateStage(0);
    }

    /**
     * 添加键盘控制
     */
    addKeyboardControls() {
        const handleKeyPress = (e) => {
            // 只在答案展示期间响应
            if (!this.container || !this.container.querySelector('.progressive-answer-display')) {
                return;
            }
            
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextStage();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousStage();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.reset();
                    break;
            }
        };
        
        // 移除之前的监听器（如果存在）
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
        
        this.keyboardHandler = handleKeyPress;
        document.addEventListener('keydown', this.keyboardHandler);
    }
}

// 创建全局实例
const progressiveAnswerDisplayV2 = new ProgressiveAnswerDisplayV2();
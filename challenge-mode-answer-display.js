/**
 * 挑战模式答案渐进式展示优化
 * 参考progressive-display-demo.html的实现
 */

class ProgressiveAnswerDisplay {
    constructor() {
        this.currentStage = 0;
        this.maxStage = 4;
        this.autoPlayInterval = null;
        
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
    showCorrectAnswerEnhanced(challenge, selectedTokens) {
        const words = document.querySelectorAll('.word-token');
        const components = challenge.components;
        
        // 创建增强的单词映射
        const wordMapping = this.createEnhancedWordMapping(words, components);
        
        // 初始化渐进展示
        this.initEnhancedProgressiveDisplay(words, wordMapping, selectedTokens);
        
        // 创建增强的控制面板
        this.createEnhancedDisplayControls();
        
        // 开始渐进展示
        this.startProgressiveDisplay();
    }

    /**
     * 创建增强的单词到成分映射
     */
    createEnhancedWordMapping(words, components) {
        const mapping = new Map();
        const sentenceText = Array.from(words).map(w => w.dataset.word).join(' ');
        
        // 识别定语从句（简单的括号识别）
        const relativeClausePattern = /\([^)]+\)/g;
        const relativeClauses = sentenceText.match(relativeClausePattern) || [];
        
        words.forEach((token, index) => {
            const word = token.dataset.word;
            const wordLower = word.toLowerCase();
            let componentType = null;
            let subType = null;
            let isCore = false;
            
            // 检查是否在定语从句中
            const isInRelativeClause = relativeClauses.some(clause => 
                clause.toLowerCase().includes(wordLower)
            );
            
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
                        isCore = wordIndex === 0 || (wordIndex === 1 && compWords[0] === 'the');
                        if (isInRelativeClause) subType = 'relative-clause';
                    } else if (compType === 'verb') {
                        // 所有动词都是核心词
                        isCore = true;
                    } else if (compType === 'object') {
                        // 宾语的最后一个实词为核心词
                        isCore = wordIndex === compWords.length - 1 || 
                                (wordIndex === compWords.length - 2 && compWords[compWords.length - 1] === '.');
                        if (isInRelativeClause) subType = 'relative-clause';
                    } else if (compType === 'complement') {
                        isCore = wordIndex === 0;
                    }
                    
                    break;
                }
            }
            
            // 识别状语（时间、地点、方式）
            const adverbPatterns = {
                time: /^(yesterday|today|tomorrow|finally|recently|soon)$/i,
                manner: /^(carefully|quickly|slowly|well|badly)$/i,
                frequency: /^(always|often|sometimes|never|rarely)$/i
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
                isInRelativeClause: isInRelativeClause,
                element: token
            });
        });
        
        return mapping;
    }

    /**
     * 初始化增强的渐进展示
     */
    initEnhancedProgressiveDisplay(words, mapping, selectedTokens) {
        const sentenceElement = document.querySelector('.sentence-display');
        sentenceElement.classList.add('progressive-display', 'stage-0');
        
        // 重新构建句子元素，添加必要的span包装
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
                
                if (info.isInRelativeClause) {
                    token.classList.add('relative-clause');
                }
            } else {
                token.classList.add('non-core');
            }
            
            // 标记用户选择
            if (selectedTokens && selectedTokens.has(index)) {
                token.setAttribute('data-user-selected', 'true');
            }
        });
        
        this.wordMapping = mapping;
        this.currentStage = 0;
    }

    /**
     * 创建增强的控制面板
     */
    createEnhancedDisplayControls() {
        const controlsHtml = `
            <div class="progressive-controls">
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
                    <button class="control-btn" onclick="progressiveAnswerDisplay.previousStage()">
                        ← 上一步
                    </button>
                    <button class="control-btn" onclick="progressiveAnswerDisplay.nextStage()">
                        下一步 →
                    </button>
                    <button class="control-btn secondary" onclick="progressiveAnswerDisplay.autoPlay()">
                        自动播放
                    </button>
                    <button class="control-btn secondary" onclick="progressiveAnswerDisplay.reset()">
                        重置
                    </button>
                </div>
            </div>
        `;
        
        const sentenceDisplay = document.querySelector('.sentence-display');
        sentenceDisplay.insertAdjacentHTML('afterend', controlsHtml);
    }

    /**
     * 更新展示阶段
     */
    updateStage(stage) {
        this.currentStage = stage;
        const sentenceElement = document.querySelector('.sentence-display');
        const skeletonDisplay = document.getElementById('skeletonDisplay');
        const explanation = document.getElementById('stageExplanation');
        
        // 更新句子显示类
        sentenceElement.className = `sentence-display progressive-display stage-${stage}`;
        
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
        }
    }

    /**
     * 显示增强的骨架句
     */
    showEnhancedSkeletonSentence(container) {
        const skeletonParts = [];
        
        // 从wordMapping中提取核心词
        this.wordMapping.forEach((info) => {
            if (info.isCore) {
                skeletonParts.push({
                    text: info.word,
                    type: info.componentType
                });
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
        // 为用户选择的词添加特殊标记
        document.querySelectorAll('.word-token[data-user-selected="true"]').forEach(token => {
            const info = this.wordMapping.get(parseInt(token.dataset.index));
            
            if (info && info.componentType) {
                // 用户选对了
                token.classList.add('user-correct');
            } else {
                // 用户选错了
                token.classList.add('user-wrong');
            }
        });
        
        // 标记用户漏选的词
        this.wordMapping.forEach((info, index) => {
            if (info.componentType && info.isCore) {
                const token = info.element;
                if (!token.hasAttribute('data-user-selected')) {
                    token.classList.add('user-missed');
                }
            }
        });
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
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            return;
        }
        
        this.reset();
        this.autoPlayInterval = setInterval(() => {
            if (this.currentStage < this.maxStage) {
                this.nextStage();
            } else {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }, 3000); // 3秒间隔，给用户充足的观察时间
    }

    /**
     * 重置
     */
    reset() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.updateStage(0);
    }

    /**
     * 开始渐进展示
     */
    startProgressiveDisplay() {
        // 延迟开始自动播放
        setTimeout(() => {
            this.autoPlay();
        }, 500);
    }
}

// 创建全局实例
const progressiveAnswerDisplay = new ProgressiveAnswerDisplay();

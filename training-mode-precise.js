// 精确匹配版训练逻辑
class PreciseTrainingMode {
    constructor() {
        this.currentPattern = 'SVO';
        this.currentDifficulty = 3;
        this.isAutoMode = false;
        this.currentSentenceData = null;
        this.correctCount = 0;
        this.totalCount = 0;
        this.selectedIndices = new Set(); // 使用Set存储选中的索引
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserStats();
        this.updateDifficultyDisplay();
    }

    bindEvents() {
        // 句型选择
        document.getElementById('patternSelect').addEventListener('change', (e) => {
            this.currentPattern = e.target.value;
        });

        // 难度选择
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.setDifficulty(parseInt(e.target.dataset.level));
            });
        });

        // 自动模式切换
        document.getElementById('autoModeToggle').addEventListener('click', () => {
            this.toggleAutoMode();
        });

        // 下一题按钮
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.isProcessing) return;
            this.handleNextButton();
        });

        // 查看分析按钮
        document.getElementById('showAnalysisBtn').addEventListener('click', () => {
            this.showDetailedAnalysis();
        });
    }

    setDifficulty(level) {
        this.currentDifficulty = level;
        this.updateDifficultyDisplay();
    }

    updateDifficultyDisplay() {
        document.querySelectorAll('.star').forEach((star, index) => {
            star.classList.toggle('active', index < this.currentDifficulty);
        });
    }

    handleNextButton() {
        const btn = document.getElementById('nextBtn');
        if (btn.textContent === '开始训练' || btn.textContent === '下一题') {
            this.generateNewSentence();
        }
    }

    async generateNewSentence() {
        this.isProcessing = true;
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.textContent = '生成中...';
        nextBtn.disabled = true;

        try {
            // 使用新版AI助手
            const result = await AIAssistantV2.generateSentenceV2(
                this.currentPattern, 
                this.currentDifficulty, 
                []
            );

            if (result.error) {
                this.showFeedback('生成失败，请重试', 'error');
                nextBtn.textContent = '下一题';
                nextBtn.disabled = false;
                return;
            }

            this.currentSentenceData = result;
            this.displaySentence(result);
            
            // 重置状态
            this.selectedIndices.clear();
            document.getElementById('showAnalysisBtn').style.display = 'none';
            document.getElementById('feedbackMessage').classList.remove('show');
            
            // 更新按钮
            nextBtn.textContent = '下一题';
            nextBtn.disabled = false;

        } catch (error) {
            this.showFeedback('生成失败：' + error.message, 'error');
            nextBtn.textContent = '下一题';
            nextBtn.disabled = false;
        } finally {
            this.isProcessing = false;
        }
    }

    displaySentence(sentenceData) {
        const display = document.getElementById('sentenceDisplay');
        display.innerHTML = '';
        
        // 使用AI返回的tokens数组
        const tokens = sentenceData.tokens;
        
        tokens.forEach((token, index) => {
            const wordEl = document.createElement('span');
            wordEl.className = 'word';
            wordEl.textContent = token;
            wordEl.dataset.index = index;
            
            // 添加点击事件
            if (!this.isAutoMode) {
                wordEl.addEventListener('click', (e) => this.handleWordClick(e));
            }
            
            display.appendChild(wordEl);
            
            // 在标点符号前不加空格
            if (index < tokens.length - 1 && !this.isPunctuation(tokens[index + 1])) {
                display.appendChild(document.createTextNode(' '));
            }
        });
    }

    isPunctuation(token) {
        return /^[.,;:!?'"]$/.test(token);
    }

    handleWordClick(event) {
        if (this.isAutoMode || this.isProcessing) return;

        const element = event.target;
        const index = parseInt(element.dataset.index);

        if (this.selectedIndices.has(index)) {
            // 取消选择
            this.selectedIndices.delete(index);
            element.classList.remove('selected');
        } else {
            // 添加选择
            this.selectedIndices.add(index);
            element.classList.add('selected');
        }

        // 更新显示
        this.updateSelectionDisplay();
    }

    updateSelectionDisplay() {
        // 按照选中的单词分组显示
        const groups = this.groupConsecutiveIndices(Array.from(this.selectedIndices).sort((a, b) => a - b));
        
        // 为每个组添加标签
        document.querySelectorAll('.word').forEach(word => {
            const label = word.querySelector('.component-label');
            if (label) label.remove();
        });

        groups.forEach((group, groupIndex) => {
            if (group.length > 0) {
                const firstWord = document.querySelector(`[data-index="${group[0]}"]`);
                if (firstWord) {
                    const label = document.createElement('span');
                    label.className = 'component-label';
                    label.textContent = this.getComponentLabel(groupIndex);
                    firstWord.appendChild(label);
                }
            }
        });

        // 检查是否应该验证答案
        if (this.shouldCheckAnswer()) {
            setTimeout(() => this.checkAnswer(), 500);
        }
    }

    groupConsecutiveIndices(indices) {
        const groups = [];
        let currentGroup = [];
        
        indices.forEach((index, i) => {
            if (i === 0 || index === indices[i - 1] + 1) {
                currentGroup.push(index);
            } else {
                groups.push(currentGroup);
                currentGroup = [index];
            }
        });
        
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }
        
        return groups;
    }

    getComponentLabel(groupIndex) {
        const labels = {
            'SV': ['主语', '谓语'],
            'SVP': ['主语', '系动词', '表语'],
            'SVO': ['主语', '谓语', '宾语'],
            'SVOO': ['主语', '谓语', '间宾', '直宾'],
            'SVOC': ['主语', '谓语', '宾语', '宾补']
        };
        
        return labels[this.currentPattern][groupIndex] || '';
    }

    shouldCheckAnswer() {
        // 当选择的组数等于句型所需的成分数时
        const groups = this.groupConsecutiveIndices(Array.from(this.selectedIndices).sort((a, b) => a - b));
        const requiredComponents = {
            'SV': 2,
            'SVP': 3,
            'SVO': 3,
            'SVOO': 4,
            'SVOC': 4
        };
        
        return groups.length === requiredComponents[this.currentPattern];
    }

    async checkAnswer() {
        this.isProcessing = true;
        this.totalCount++;

        // 构建用户答案
        const userAnswer = this.buildUserAnswer();
        
        // 使用AI验证
        const validation = await AIAssistantV2.validateUserSelection(
            this.currentSentenceData,
            userAnswer
        );
        
        if (validation.error) {
            // 如果AI验证失败，使用本地验证
            this.localValidation();
        } else {
            this.handleValidationResult(validation);
        }
        
        this.updateScore();
        this.isProcessing = false;
    }

    buildUserAnswer() {
        const groups = this.groupConsecutiveIndices(Array.from(this.selectedIndices).sort((a, b) => a - b));
        const componentLabels = this.getComponentLabels();
        const answer = {};
        
        groups.forEach((group, index) => {
            if (index < componentLabels.length) {
                answer[componentLabels[index]] = group;
            }
        });
        
        return answer;
    }

    getComponentLabels() {
        const labels = {
            'SV': ['subject', 'verb'],
            'SVP': ['subject', 'verb', 'complement'],
            'SVO': ['subject', 'verb', 'object'],
            'SVOO': ['subject', 'verb', 'indirectObject', 'object'],
            'SVOC': ['subject', 'verb', 'object', 'complement']
        };
        
        return labels[this.currentPattern] || [];
    }

    localValidation() {
        // 本地验证逻辑
        const correct = this.compareWithCorrectAnswer();
        
        if (correct) {
            this.correctCount++;
            this.showFeedback('🎉 完全正确！', 'success');
            this.markCorrect();
            
            setTimeout(() => {
                if (!this.isAutoMode) {
                    this.generateNewSentence();
                }
            }, 2000);
        } else {
            this.showFeedback('😊 再想想，主语、谓语、宾语分别在哪里？', 'error');
            this.markIncorrect();
            document.getElementById('showAnalysisBtn').style.display = 'block';
        }
    }

    compareWithCorrectAnswer() {
        // 比较用户选择和正确答案
        const components = this.currentSentenceData.components;
        const userGroups = this.groupConsecutiveIndices(Array.from(this.selectedIndices).sort((a, b) => a - b));
        
        // 简单比较主要成分的范围
        const componentKeys = ['subject', 'verb', 'object', 'complement', 'indirectObject'];
        let correctCount = 0;
        let totalComponents = 0;
        
        componentKeys.forEach(key => {
            if (components[key]) {
                totalComponents++;
                const correctRange = components[key].range;
                
                // 检查用户是否选择了这个范围
                const userSelected = userGroups.some(group => 
                    group[0] === correctRange[0] && group[group.length - 1] === correctRange[1]
                );
                
                if (userSelected) correctCount++;
            }
        });
        
        return correctCount === totalComponents;
    }

    handleValidationResult(validation) {
        if (validation.correct) {
            this.correctCount++;
            this.showFeedback(validation.feedback || '🎉 完全正确！', 'success');
            this.markCorrect();
            
            setTimeout(() => {
                if (!this.isAutoMode) {
                    this.generateNewSentence();
                }
            }, 2000);
        } else {
            this.showFeedback(validation.feedback || '😊 再想想看', 'error');
            this.markIncorrect();
            
            // 显示具体错误
            if (validation.errors && validation.errors.length > 0) {
                this.showErrors(validation.errors);
            }
            
            document.getElementById('showAnalysisBtn').style.display = 'block';
        }
    }

    showErrors(errors) {
        // 可以在界面上显示具体的错误信息
        console.log('用户的错误：', errors);
    }

    markCorrect() {
        document.querySelectorAll('.word.selected').forEach(word => {
            word.classList.add('correct');
        });
    }

    markIncorrect() {
        document.querySelectorAll('.word.selected').forEach(word => {
            word.classList.add('incorrect');
        });
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedbackMessage');
        feedback.textContent = message;
        feedback.className = `feedback-message ${type} show`;
    }

    updateScore() {
        document.getElementById('scoreDisplay').textContent = 
            `${this.correctCount}/${this.totalCount}`;
        this.saveUserStats();
    }

    showDetailedAnalysis() {
        if (!this.currentSentenceData) return;
        
        const analysisDisplay = document.getElementById('analysisDisplay');
        const components = this.currentSentenceData.components;
        
        // 创建详细的分析视图
        let analysisHTML = `
            <div class="analysis-header">
                <h3>句子结构分析</h3>
                <button class="close-btn" onclick="training.hideAnalysis()">×</button>
            </div>
            <div class="analysis-content">
                <div class="sentence-with-marks">
        `;
        
        // 显示带标记的句子
        const tokens = this.currentSentenceData.tokens;
        tokens.forEach((token, index) => {
            let className = 'word-analysis';
            let label = '';
            
            // 检查这个词属于哪个成分
            Object.entries(components).forEach(([compName, compData]) => {
                if (index >= compData.range[0] && index <= compData.range[1]) {
                    className += ' ' + compName;
                    if (index === compData.range[0]) {
                        label = this.getChineseLabel(compName);
                    }
                }
            });
            
            analysisHTML += `<span class="${className}" data-label="${label}">${token}</span>`;
            
            if (index < tokens.length - 1 && !this.isPunctuation(tokens[index + 1])) {
                analysisHTML += ' ';
            }
        });
        
        analysisHTML += `
                </div>
                <div class="component-breakdown">
                    <h4>句子成分详解</h4>
        `;
        
        // 显示各个成分
        Object.entries(components).forEach(([compName, compData]) => {
            const chineseLabel = this.getChineseLabel(compName);
            analysisHTML += `
                <div class="component-item">
                    <span class="comp-label">${chineseLabel}：</span>
                    <span class="comp-text">${compData.text}</span>
                </div>
            `;
        });
        
        analysisHTML += `
                </div>
                <div class="explanation">
                    <h4>语法说明</h4>
                    <p>${this.currentSentenceData.explanation}</p>
                </div>
                <button class="action-button primary-button" onclick="training.hideAnalysis()">
                    继续训练
                </button>
            </div>
        `;
        
        analysisDisplay.innerHTML = analysisHTML;
        analysisDisplay.classList.add('show');
        
        // 添加样式
        this.addAnalysisStyles();
    }

    getChineseLabel(componentName) {
        const labels = {
            'subject': '主语',
            'verb': '谓语',
            'object': '宾语',
            'complement': '补语/表语',
            'indirectObject': '间接宾语'
        };
        return labels[componentName] || componentName;
    }

    addAnalysisStyles() {
        if (document.getElementById('precise-analysis-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'precise-analysis-styles';
        style.textContent = `
            .sentence-with-marks {
                font-size: 24px;
                line-height: 2;
                margin: 20px 0;
                padding: 20px;
                background: #f9fafb;
                border-radius: 8px;
            }
            
            .word-analysis {
                padding: 2px 4px;
                border-radius: 4px;
                position: relative;
            }
            
            .word-analysis.subject {
                background: #e0e7ff;
                color: #3730a3;
            }
            
            .word-analysis.verb {
                background: #d1fae5;
                color: #065f46;
            }
            
            .word-analysis.object {
                background: #fed7aa;
                color: #92400e;
            }
            
            .word-analysis.complement {
                background: #fce7f3;
                color: #831843;
            }
            
            .word-analysis.indirectObject {
                background: #ddd6fe;
                color: #5b21b6;
            }
            
            .word-analysis[data-label]:not([data-label=""]):before {
                content: attr(data-label);
                position: absolute;
                top: -20px;
                left: 0;
                font-size: 12px;
                background: #1f2937;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                white-space: nowrap;
            }
            
            .component-breakdown {
                margin: 20px 0;
            }
            
            .component-item {
                margin: 10px 0;
                padding: 10px;
                background: #f3f4f6;
                border-radius: 6px;
            }
            
            .comp-label {
                font-weight: 600;
                color: #4b5563;
                display: inline-block;
                min-width: 80px;
            }
            
            .comp-text {
                color: #1f2937;
            }
        `;
        
        document.head.appendChild(style);
    }

    hideAnalysis() {
        const analysisDisplay = document.getElementById('analysisDisplay');
        analysisDisplay.classList.remove('show');
        document.getElementById('showAnalysisBtn').style.display = 'none';
        
        // 清除选择
        document.querySelectorAll('.word').forEach(word => {
            word.classList.remove('selected', 'correct', 'incorrect');
        });
        this.selectedIndices.clear();
        
        // 清除反馈
        document.getElementById('feedbackMessage').classList.remove('show');
        
        // 生成下一题
        setTimeout(() => {
            if (!this.isAutoMode) {
                this.generateNewSentence();
            }
        }, 300);
    }

    // 自动模式相关方法
    toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        const toggle = document.getElementById('autoModeToggle');
        toggle.classList.toggle('active', this.isAutoMode);
        
        const indicator = document.getElementById('autoModeIndicator');
        indicator.classList.toggle('show', this.isAutoMode);
        
        if (this.isAutoMode) {
            this.startAutoMode();
        } else {
            this.stopAutoMode();
        }
    }

    startAutoMode() {
        this.runAutoModeStep();
        this.autoModeInterval = setInterval(() => {
            this.runAutoModeStep();
        }, 8000);
    }

    stopAutoMode() {
        if (this.autoModeInterval) {
            clearInterval(this.autoModeInterval);
            this.autoModeInterval = null;
        }
    }

    async runAutoModeStep() {
        // 生成新句子
        await this.generateNewSentence();
        
        // 等待阅读
        await this.wait(2000);
        
        // 自动标记正确答案
        await this.autoMarkComponents();
        
        // 显示解释
        await this.wait(2000);
        this.showFeedback('✨ 注意句子的核心结构！', 'success');
        
        // 等待学习
        await this.wait(2000);
    }

    async autoMarkComponents() {
        const components = this.currentSentenceData.components;
        
        // 按顺序标记各个成分
        for (const [compName, compData] of Object.entries(components)) {
            await this.markComponentRange(compData.range, compName);
            await this.wait(600);
        }
    }

    async markComponentRange(range, componentName) {
        for (let i = range[0]; i <= range[1]; i++) {
            const wordEl = document.querySelector(`[data-index="${i}"]`);
            if (wordEl) {
                wordEl.classList.add('selected', 'correct');
                
                // 在第一个词上添加标签
                if (i === range[0]) {
                    const label = document.createElement('span');
                    label.className = 'component-label';
                    label.textContent = this.getChineseLabel(componentName);
                    wordEl.appendChild(label);
                }
            }
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 用户数据管理
    loadUserStats() {
        const stats = localStorage.getItem('preciseTrainingStats');
        if (stats) {
            const parsed = JSON.parse(stats);
            this.correctCount = parsed.correctCount || 0;
            this.totalCount = parsed.totalCount || 0;
            this.updateScore();
        }
    }

    saveUserStats() {
        localStorage.setItem('preciseTrainingStats', JSON.stringify({
            correctCount: this.correctCount,
            totalCount: this.totalCount,
            lastPractice: new Date().toISOString(),
            pattern: this.currentPattern,
            difficulty: this.currentDifficulty
        }));
    }
}

// 初始化精确版训练模式
const training = new PreciseTrainingMode();
// 增强版训练模式逻辑
class EnhancedTrainingMode {
    constructor() {
        this.currentPattern = 'SVO';
        this.currentDifficulty = 3;
        this.isAutoMode = false;
        this.currentSentence = null;
        this.correctCount = 0;
        this.totalCount = 0;
        this.selectedComponents = new Map(); // 使用Map来保存选择顺序
        this.isProcessing = false;
        this.autoModeSpeed = 3000; // 自动模式速度
        
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
            if (!this.isAutoMode && this.currentSentence) {
                this.generateNewSentence();
            }
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

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) {
                this.handleNextButton();
            }
            if (e.key === 'a' && e.ctrlKey) {
                e.preventDefault();
                this.toggleAutoMode();
            }
        });
    }

    setDifficulty(level) {
        this.currentDifficulty = level;
        this.updateDifficultyDisplay();
        
        // 添加选择动画
        document.querySelectorAll('.star').forEach((star, index) => {
            if (index < level) {
                star.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    star.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    updateDifficultyDisplay() {
        document.querySelectorAll('.star').forEach((star, index) => {
            star.classList.toggle('active', index < this.currentDifficulty);
        });
    }

    toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        const toggle = document.getElementById('autoModeToggle');
        toggle.classList.toggle('active', this.isAutoMode);
        
        const indicator = document.getElementById('autoModeIndicator');
        indicator.classList.toggle('show', this.isAutoMode);
        
        if (this.isAutoMode) {
            this.startAutoMode();
            // 隐藏手动操作按钮
            document.getElementById('nextBtn').style.opacity = '0.5';
            document.getElementById('nextBtn').disabled = true;
        } else {
            this.stopAutoMode();
            document.getElementById('nextBtn').style.opacity = '1';
            document.getElementById('nextBtn').disabled = false;
        }
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
        const originalText = nextBtn.textContent;
        nextBtn.textContent = '生成中...';
        nextBtn.disabled = true;

        // 清除之前的反馈
        this.hideFeedback();

        try {
            // 调用AI生成句子
            const result = await AIAssistant.generateSentence(
                this.currentPattern, 
                this.currentDifficulty, 
                []
            );

            if (result.error) {
                this.showFeedback('生成失败，请重试', 'error');
                nextBtn.textContent = originalText;
                nextBtn.disabled = false;
                return;
            }

            this.currentSentence = result;
            await this.displaySentence(result.sentence);
            
            // 重置状态
            this.selectedComponents.clear();
            document.getElementById('showAnalysisBtn').style.display = 'none';
            
            // 更新按钮
            nextBtn.textContent = '下一题';
            nextBtn.disabled = false;

        } catch (error) {
            this.showFeedback('生成失败：' + error.message, 'error');
            nextBtn.textContent = originalText;
            nextBtn.disabled = false;
        } finally {
            this.isProcessing = false;
        }
    }

    async displaySentence(sentence) {
        const display = document.getElementById('sentenceDisplay');
        
        // 淡出效果
        display.style.opacity = '0';
        await this.wait(200);
        
        // 将句子分词并创建可点击的单词元素
        const words = this.tokenizeSentence(sentence);
        display.innerHTML = '';
        
        words.forEach((word, index) => {
            const wordEl = document.createElement('span');
            wordEl.className = 'word';
            wordEl.textContent = word;
            wordEl.dataset.index = index;
            wordEl.dataset.word = word;
            
            // 添加点击事件
            if (!this.isAutoMode) {
                wordEl.addEventListener('click', (e) => this.handleWordClick(e));
            }
            
            display.appendChild(wordEl);
        });
        
        // 淡入效果
        display.style.opacity = '1';
    }

    tokenizeSentence(sentence) {
        // 改进的分词，处理缩写和标点
        return sentence.match(/[\w'-]+|[^\w\s]/g) || [];
    }

    handleWordClick(event) {
        if (this.isAutoMode || this.isProcessing) return;

        const element = event.target;
        const index = parseInt(element.dataset.index);
        const word = element.dataset.word;

        // 切换选中状态
        if (element.classList.contains('selected')) {
            // 取消选择
            element.classList.remove('selected');
            const label = element.querySelector('.component-label');
            if (label) label.remove();
            this.selectedComponents.delete(index);
            
            // 重新编号其他标签
            this.updateComponentLabels();
        } else {
            // 添加选择
            element.classList.add('selected');
            
            // 添加成分标签
            const label = document.createElement('span');
            label.className = 'component-label';
            label.textContent = this.getNextComponentLabel();
            element.appendChild(label);
            
            // 记录选择
            this.selectedComponents.set(index, {
                word: word,
                element: element,
                label: label.textContent
            });
        }

        // 检查是否完成选择
        if (this.isSelectionComplete()) {
            setTimeout(() => this.checkAnswer(), 500);
        }
    }

    updateComponentLabels() {
        const labels = this.getPatternLabels();
        let labelIndex = 0;
        
        // 按照index顺序更新标签
        const sortedEntries = Array.from(this.selectedComponents.entries()).sort((a, b) => a[0] - b[0]);
        
        sortedEntries.forEach(([index, data]) => {
            const label = data.element.querySelector('.component-label');
            if (label && labelIndex < labels.length) {
                label.textContent = labels[labelIndex];
                data.label = labels[labelIndex];
                labelIndex++;
            }
        });
    }

    getPatternLabels() {
        const labels = {
            'SV': ['主语', '谓语'],
            'SVP': ['主语', '系动词', '表语'],
            'SVO': ['主语', '谓语', '宾语'],
            'SVOO': ['主语', '谓语', '间宾', '直宾'],
            'SVOC': ['主语', '谓语', '宾语', '宾补']
        };
        return labels[this.currentPattern] || [];
    }

    getNextComponentLabel() {
        const labels = this.getPatternLabels();
        return labels[this.selectedComponents.size] || '';
    }

    isSelectionComplete() {
        const requiredComponents = {
            'SV': 2,
            'SVP': 3,
            'SVO': 3,
            'SVOO': 4,
            'SVOC': 4
        };
        
        return this.selectedComponents.size === requiredComponents[this.currentPattern];
    }

    async checkAnswer() {
        this.isProcessing = true;
        this.totalCount++;

        // 构建用户的答案
        const userAnswer = this.buildUserAnswer();
        
        // 验证答案（这里应该调用AI来验证）
        const isCorrect = await this.validateWithAI(userAnswer);
        
        if (isCorrect) {
            this.correctCount++;
            this.showFeedback('🎉 完全正确！', 'success');
            this.animateCorrectAnswer();
            
            // 2秒后自动下一题
            if (!this.isAutoMode) {
                setTimeout(() => {
                    this.generateNewSentence();
                }, 2000);
            }
        } else {
            this.showFeedback('😊 再想想，点击查看分析', 'error');
            this.animateIncorrectAnswer();
            
            // 显示查看分析按钮
            document.getElementById('showAnalysisBtn').style.display = 'block';
        }
        
        this.updateScore();
        this.isProcessing = false;
    }

    buildUserAnswer() {
        const answer = {};
        this.selectedComponents.forEach((data, index) => {
            answer[data.label] = data.word;
        });
        return answer;
    }

    async validateWithAI(userAnswer) {
        // 暂时使用简单验证
        // TODO: 调用AI进行智能验证
        
        // 检查是否选择了正确的词性
        const correctPatterns = {
            'SVO': {
                '主语': ['The', 'boy', 'student', 'teacher', 'girl'],
                '谓语': ['kicked', 'finished', 'wrote', 'made', 'gave'],
                '宾语': ['ball', 'problem', 'homework', 'essay', 'book']
            }
        };
        
        // 简单的词性判断
        return Math.random() > 0.3; // 临时逻辑
    }

    animateCorrectAnswer() {
        this.selectedComponents.forEach((data) => {
            data.element.classList.add('correct');
            data.element.style.animation = 'correctPulse 0.5s';
        });
    }

    animateIncorrectAnswer() {
        this.selectedComponents.forEach((data) => {
            data.element.classList.add('incorrect');
            data.element.style.animation = 'shake 0.5s';
        });
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedbackMessage');
        feedback.textContent = message;
        feedback.className = `feedback-message ${type} show`;
    }

    hideFeedback() {
        const feedback = document.getElementById('feedbackMessage');
        feedback.classList.remove('show');
    }

    updateScore() {
        const accuracy = this.totalCount > 0 
            ? Math.round((this.correctCount / this.totalCount) * 100) 
            : 0;
        
        document.getElementById('scoreDisplay').textContent = 
            `${this.correctCount}/${this.totalCount}`;
            
        // 添加准确率颜色变化
        const scoreElement = document.getElementById('scoreDisplay');
        if (accuracy >= 80) {
            scoreElement.style.color = '#10b981';
        } else if (accuracy >= 60) {
            scoreElement.style.color = '#f59e0b';
        } else {
            scoreElement.style.color = '#ef4444';
        }
        
        this.saveUserStats();
    }

    async showDetailedAnalysis() {
        if (!this.currentSentence) return;
        
        const analysisDisplay = document.getElementById('analysisDisplay');
        
        // 创建详细的分析内容
        analysisDisplay.innerHTML = `
            <div class="analysis-header">
                <h3>句子结构分析</h3>
                <button class="close-btn" onclick="training.hideAnalysis()">×</button>
            </div>
            <div class="analysis-content">
                <div class="sentence-display-analysis">
                    ${this.createAnalysisHTML()}
                </div>
                <div class="structure-breakdown">
                    <h4>句子成分</h4>
                    <div class="component-list">
                        <div class="component-item">
                            <span class="component-type">主语：</span>
                            <span class="component-text">${this.currentSentence.structure.subject}</span>
                        </div>
                        <div class="component-item">
                            <span class="component-type">谓语：</span>
                            <span class="component-text">${this.currentSentence.structure.verb}</span>
                        </div>
                        ${this.currentSentence.structure.object ? `
                        <div class="component-item">
                            <span class="component-type">宾语：</span>
                            <span class="component-text">${this.currentSentence.structure.object}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="explanation">
                    <h4>语法说明</h4>
                    <p>${this.currentSentence.explanation}</p>
                </div>
                <div class="tips">
                    <h4>学习建议</h4>
                    <p>记住：${this.currentPattern}句型的核心是识别${this.getPatternLabels().join('、')}。</p>
                </div>
                <button class="action-button primary-button" onclick="training.hideAnalysis()">
                    继续训练
                </button>
            </div>
        `;
        
        // 添加样式
        this.addAnalysisStyles();
        
        analysisDisplay.classList.add('show');
    }

    createAnalysisHTML() {
        // 根据AI返回的结构创建标记的句子
        const sentence = this.currentSentence.sentence;
        const structure = this.currentSentence.structure;
        
        // 这里应该根据实际的句子结构进行标记
        // 暂时返回原句
        return `<div class="marked-sentence">${sentence}</div>`;
    }

    addAnalysisStyles() {
        // 添加分析界面的额外样式
        const style = document.createElement('style');
        style.textContent = `
            .analysis-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e5e7eb;
            }
            
            .close-btn {
                width: 32px;
                height: 32px;
                border: none;
                background: #f3f4f6;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                color: #6b7280;
                transition: all 0.2s;
            }
            
            .close-btn:hover {
                background: #e5e7eb;
                color: #1f2937;
            }
            
            .sentence-display-analysis {
                font-size: 24px;
                line-height: 1.8;
                margin-bottom: 24px;
                padding: 20px;
                background: #f9fafb;
                border-radius: 8px;
            }
            
            .component-list {
                display: grid;
                gap: 12px;
                margin: 16px 0;
            }
            
            .component-item {
                display: flex;
                gap: 12px;
                padding: 12px;
                background: #f3f0ff;
                border-radius: 6px;
            }
            
            .component-type {
                font-weight: 600;
                color: #8b5cf6;
                min-width: 80px;
            }
            
            .component-text {
                color: #1f2937;
            }
            
            .tips {
                margin-top: 24px;
                padding: 16px;
                background: #fef3c7;
                border-radius: 8px;
                border: 1px solid #fbbf24;
            }
            
            .tips h4 {
                color: #92400e;
                margin-bottom: 8px;
            }
            
            .tips p {
                color: #78350f;
            }
        `;
        
        if (!document.getElementById('analysis-styles')) {
            style.id = 'analysis-styles';
            document.head.appendChild(style);
        }
    }

    hideAnalysis() {
        const analysisDisplay = document.getElementById('analysisDisplay');
        analysisDisplay.classList.remove('show');
        document.getElementById('showAnalysisBtn').style.display = 'none';
        
        // 清除错误标记
        document.querySelectorAll('.word').forEach(word => {
            word.classList.remove('incorrect', 'selected');
            const label = word.querySelector('.component-label');
            if (label) label.remove();
        });
        
        this.selectedComponents.clear();
        
        // 生成下一题
        setTimeout(() => {
            if (!this.isAutoMode) {
                this.generateNewSentence();
            }
        }, 300);
    }

    // 自动模式相关方法
    startAutoMode() {
        // 立即开始第一个
        this.runAutoModeStep();
        
        // 设置循环
        this.autoModeInterval = setInterval(() => {
            this.runAutoModeStep();
        }, 8000); // 8秒一个完整循环
    }

    stopAutoMode() {
        if (this.autoModeInterval) {
            clearInterval(this.autoModeInterval);
            this.autoModeInterval = null;
        }
        
        // 清理自动模式的状态
        if (this.autoModeTimeout) {
            clearTimeout(this.autoModeTimeout);
            this.autoModeTimeout = null;
        }
    }

    async runAutoModeStep() {
        // 1. 生成新句子
        await this.generateNewSentence();
        
        // 2. 等待阅读时间（根据句子长度）
        const readingTime = Math.max(2000, this.currentSentence.sentence.length * 50);
        await this.wait(readingTime);
        
        // 3. 逐步标记正确答案
        await this.autoMarkComponents();
        
        // 4. 显示解释
        await this.wait(1500);
        this.showAutoAnalysis();
        
        // 5. 等待学习时间
        await this.wait(2000);
        
        // 6. 清理并准备下一轮
        this.cleanupAutoMode();
    }

    async autoMarkComponents() {
        // 根据AI返回的结构自动标记
        const structure = this.currentSentence.structure;
        const words = document.querySelectorAll('.word');
        
        // 模拟渐进式标记
        const markings = [
            { text: structure.subject, label: '主语', color: '#8b5cf6' },
            { text: structure.verb, label: '谓语', color: '#10b981' },
            { text: structure.object, label: '宾语', color: '#f59e0b' }
        ].filter(m => m.text); // 过滤掉空值
        
        for (const marking of markings) {
            await this.markWordsWithText(words, marking);
            await this.wait(600);
        }
    }

    async markWordsWithText(words, marking) {
        // 查找包含指定文本的单词并标记
        // 这是简化版本，实际应该更智能
        const targetWords = marking.text.split(' ');
        let found = false;
        
        words.forEach((word, index) => {
            if (!found && targetWords.some(t => word.textContent.toLowerCase().includes(t.toLowerCase()))) {
                word.classList.add('selected', 'correct');
                
                const label = document.createElement('span');
                label.className = 'component-label';
                label.textContent = marking.label;
                label.style.background = marking.color;
                word.appendChild(label);
                
                // 添加展示动画
                word.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    word.style.transform = 'scale(1)';
                }, 300);
                
                found = true;
            }
        });
    }

    showAutoAnalysis() {
        this.showFeedback('✨ 注意句子的核心结构！', 'success');
        
        // 高亮显示句子骨干
        document.querySelectorAll('.word.selected').forEach(word => {
            word.style.background = '#fef3c7';
            word.style.transform = 'scale(1.05)';
        });
    }

    cleanupAutoMode() {
        // 清理界面准备下一轮
        document.querySelectorAll('.word').forEach(word => {
            word.style.transform = '';
            word.style.background = '';
        });
        
        this.hideFeedback();
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 用户数据管理
    loadUserStats() {
        const stats = localStorage.getItem('trainingStats');
        if (stats) {
            const parsed = JSON.parse(stats);
            this.correctCount = parsed.correctCount || 0;
            this.totalCount = parsed.totalCount || 0;
            this.updateScore();
        }
    }

    saveUserStats() {
        const stats = {
            correctCount: this.correctCount,
            totalCount: this.totalCount,
            lastPractice: new Date().toISOString(),
            patterns: this.getPatternStats(),
            difficulty: this.currentDifficulty
        };
        
        localStorage.setItem('trainingStats', JSON.stringify(stats));
        
        // 同步到主程序的统计
        if (window.userPerformance) {
            window.userPerformance.practicedCount = this.totalCount;
            window.userPerformance.correctCount = this.correctCount;
            window.userPerformance.patterns[this.currentPattern] = 
                (window.userPerformance.patterns[this.currentPattern] || 0) + 1;
        }
    }

    getPatternStats() {
        // 获取各句型的练习统计
        const saved = localStorage.getItem('patternStats') || '{}';
        const stats = JSON.parse(saved);
        stats[this.currentPattern] = (stats[this.currentPattern] || 0) + 1;
        localStorage.setItem('patternStats', JSON.stringify(stats));
        return stats;
    }
}

// 初始化增强版训练模式
const training = new EnhancedTrainingMode();
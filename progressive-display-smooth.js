/**
 * 平滑渐进式显示实现
 * 保持句子位置稳定，只改变视觉标注
 */

(function() {
    'use strict';
    
    // 等待依赖加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSmoothDisplay);
    } else {
        initSmoothDisplay();
    }
    
    function initSmoothDisplay() {
        // 确保 ProgressiveAnswerDisplayV2 已加载
        if (typeof ProgressiveAnswerDisplayV2 === 'undefined') {
            setTimeout(initSmoothDisplay, 100);
            return;
        }
        
        // 保存原始方法
        const originalCreateDisplay = ProgressiveAnswerDisplayV2.prototype.createSentenceDisplay;
        const originalUpdateStage = ProgressiveAnswerDisplayV2.prototype.updateStage;
        
        // 重写创建句子显示的方法
        ProgressiveAnswerDisplayV2.prototype.createSentenceDisplay = function() {
            const words = this.currentChallenge.sentence.split(' ');
            const sentenceContainer = this.container.querySelector('.sentence-display-container');
            
            // 创建固定布局的句子HTML
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
            
            // 应用成分标记
            const sentenceDisplay = sentenceContainer.querySelector('.sentence-display');
            this.applySmoothWordMapping(sentenceDisplay);
            
            return sentenceDisplay;
        };
        
        // 新增：平滑应用单词映射
        ProgressiveAnswerDisplayV2.prototype.applySmoothWordMapping = function(sentenceDisplay) {
            const words = sentenceDisplay.querySelectorAll('.word-token');
            const components = this.currentChallenge.components;
            const sentenceText = this.currentChallenge.sentence.toLowerCase();
            
            // 为每个单词添加适当的类
            words.forEach((token, index) => {
                const word = token.dataset.word.toLowerCase();
                
                // 检查是否是句子成分
                for (const [compType, compText] of Object.entries(components)) {
                    if (!compText) continue;
                    
                    const compWords = compText.toLowerCase().split(/\s+/);
                    if (compWords.includes(word)) {
                        token.classList.add(compType);
                        
                        // 标记核心词
                        if (this.isCoreTerm(word, compType, compWords)) {
                            token.classList.add('is-core');
                        }
                    }
                }
                
                // 检查是否在从句中
                const wordPosition = this.getWordPosition(word, index, sentenceText);
                const clauseType = this.getClauseType(wordPosition, sentenceText);
                if (clauseType) {
                    token.classList.add(`in-${clauseType}-clause`);
                }
                
                // 检查是否是状语
                if (this.isAdverb(word)) {
                    token.classList.add('adverb');
                }
            });
        };
        
        // 判断是否为核心词
        ProgressiveAnswerDisplayV2.prototype.isCoreTerm = function(word, compType, compWords) {
            if (compType === 'verb') return true;
            
            if (compType === 'subject' || compType === 'object') {
                // 过滤掉冠词和介词
                const filtered = compWords.filter(w => 
                    !['the', 'a', 'an', 'of', 'for', 'to', 'with', 'in', 'on', 'at'].includes(w)
                );
                // 主语取第一个实词，宾语取最后一个实词
                return word === (compType === 'subject' ? filtered[0] : filtered[filtered.length - 1]);
            }
            
            return false;
        };
        
        // 获取单词在句子中的位置
        ProgressiveAnswerDisplayV2.prototype.getWordPosition = function(word, index, sentenceText) {
            // 简化实现，实际使用时需要更精确的定位
            const words = sentenceText.split(' ');
            let position = 0;
            for (let i = 0; i < index; i++) {
                position += words[i].length + 1;
            }
            return position;
        };
        
        // 判断单词所在的从句类型
        ProgressiveAnswerDisplayV2.prototype.getClauseType = function(position, sentenceText) {
            // 定语从句标志
            const relativeMarkers = /\b(who|which|that|whom|whose|where|when)\b/gi;
            // 分词短语标志
            const participialMarkers = /\b(\w+ing|\w+ed)\s+/gi;
            
            // 查找所有从句
            let match;
            while ((match = relativeMarkers.exec(sentenceText)) !== null) {
                if (position >= match.index && position < match.index + 100) {
                    return 'relative';
                }
            }
            
            while ((match = participialMarkers.exec(sentenceText)) !== null) {
                if (position >= match.index && position < match.index + 50) {
                    return 'participial';
                }
            }
            
            // 介词短语
            const prepMarkers = /\b(in|on|at|with|for|from|to|by|about|after|before|during)\s+/gi;
            while ((match = prepMarkers.exec(sentenceText)) !== null) {
                if (position >= match.index && position < match.index + 30) {
                    return 'prepositional';
                }
            }
            
            return null;
        };
        
        // 判断是否为状语
        ProgressiveAnswerDisplayV2.prototype.isAdverb = function(word) {
            const adverbs = [
                'carefully', 'quickly', 'slowly', 'ultimately', 'finally',
                'recently', 'soon', 'always', 'often', 'sometimes', 'never',
                'very', 'quite', 'too', 'so', 'rather', 'extremely'
            ];
            return adverbs.includes(word.toLowerCase());
        };
        
        // 重写更新阶段方法 - 只改变CSS类
        ProgressiveAnswerDisplayV2.prototype.updateStage = function(stage) {
            this.currentStage = stage;
            const sentenceDisplay = this.container.querySelector('.sentence-display');
            
            if (sentenceDisplay) {
                // 移除所有阶段类
                for (let i = 0; i <= this.maxStage; i++) {
                    sentenceDisplay.classList.remove(`stage-${i}`);
                }
                // 添加当前阶段类
                sentenceDisplay.classList.add(`stage-${stage}`);
            }
            
            // 更新其他UI元素
            const skeletonDisplay = document.getElementById('skeletonDisplay');
            const explanation = document.getElementById('stageExplanation');
            const answerLegend = this.container.querySelector('.answer-legend');
            
            // 更新阶段指示器
            document.querySelectorAll('.stage-item').forEach((item, index) => {
                item.classList.toggle('active', index <= stage);
            });
            
            // 更新说明文字
            if (explanation) {
                explanation.textContent = this.stageExplanations[stage];
            }
            
            // 阶段1：显示骨架句
            if (stage === 1 && skeletonDisplay) {
                this.showSmoothSkeletonSentence(skeletonDisplay);
            } else if (skeletonDisplay) {
                skeletonDisplay.classList.remove('show');
            }
            
            // 阶段4：显示用户答案对比
            if (stage === 4) {
                this.showUserAnswerComparison();
                if (answerLegend) {
                    answerLegend.style.display = 'flex';
                }
            } else if (answerLegend) {
                answerLegend.style.display = 'none';
            }
        };
        
        // 平滑显示骨架句
        ProgressiveAnswerDisplayV2.prototype.showSmoothSkeletonSentence = function(container) {
            const skeleton = this.currentChallenge.skeleton;
            container.innerHTML = `<strong>核心结构：</strong>${skeleton}`;
            container.classList.add('show');
        };
        
        console.log('✅ 平滑渐进式显示已应用');
    }
})();
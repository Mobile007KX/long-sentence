/**
 * 改进自动练习模式的句子生成
 * 增加主题多样性，避免重复
 */

(function() {
    'use strict';
    
    console.log('🎯 Enhancing sentence generation diversity...');
    
    // 等待autoPracticeMode加载
    const waitForMode = setInterval(() => {
        if (typeof autoPracticeMode !== 'undefined') {
            clearInterval(waitForMode);
            enhanceGeneration();
        }
    }, 100);
    
    function enhanceGeneration() {
        // 扩展主题列表
        const expandedThemes = [
            // 科学技术
            'quantum computing breakthroughs',
            'artificial intelligence ethics',
            'gene editing controversies',
            'space exploration challenges',
            'renewable energy innovations',
            'nanotechnology applications',
            'cybersecurity threats',
            'biotechnology advancements',
            'climate change solutions',
            'neural network architectures',
            
            // 社会人文
            'cultural identity in globalization',
            'social media impact on democracy',
            'educational inequality',
            'urban planning challenges',
            'mental health awareness',
            'digital privacy rights',
            'sustainable development goals',
            'refugee crisis management',
            'gender equality movements',
            'generational wealth gaps',
            
            // 经济商业
            'cryptocurrency regulations',
            'supply chain disruptions',
            'startup ecosystem dynamics',
            'corporate social responsibility',
            'gig economy implications',
            'international trade tensions',
            'financial technology innovations',
            'market volatility factors',
            'consumer behavior patterns',
            'economic recession indicators',
            
            // 哲学思想
            'consciousness and free will',
            'ethical implications of AI',
            'meaning of existence',
            'nature of reality',
            'moral relativism debates',
            'posthuman philosophy',
            'collective intelligence',
            'simulation hypothesis',
            'cognitive biases',
            'philosophical paradoxes',
            
            // 艺术文化
            'contemporary art movements',
            'cultural appropriation debates',
            'digital media evolution',
            'literary criticism approaches',
            'music industry transformation',
            'film narrative techniques',
            'architectural sustainability',
            'fashion industry ethics',
            'gaming culture impact',
            'virtual reality experiences',
            
            // 健康医疗
            'pandemic preparedness',
            'personalized medicine',
            'mental health interventions',
            'aging population challenges',
            'healthcare accessibility',
            'vaccine development',
            'chronic disease management',
            'medical ethics dilemmas',
            'health data privacy',
            'telemedicine adoption',
            
            // 环境生态
            'biodiversity conservation',
            'ocean acidification',
            'deforestation impacts',
            'renewable resource management',
            'pollution control strategies',
            'ecosystem restoration',
            'sustainable agriculture',
            'wildlife protection',
            'carbon capture technology',
            'environmental justice'
        ];
        
        // 更新主题池
        autoPracticeMode.config.themes = expandedThemes;
        
        // 添加使用过的主题追踪
        autoPracticeMode.usedThemes = new Set();
        autoPracticeMode.recentSentences = new Set();
        
        // 改进生成方法
        const originalGenerate = autoPracticeMode.generateSentence;
        autoPracticeMode.generateSentence = async function() {
            // 如果所有主题都用过了，重置
            if (this.usedThemes.size >= this.config.themes.length * 0.8) {
                console.log('🔄 Resetting used themes pool');
                this.usedThemes.clear();
            }
            
            // 选择未使用的主题
            let theme;
            let attempts = 0;
            do {
                theme = this.config.themes[Math.floor(Math.random() * this.config.themes.length)];
                attempts++;
            } while (this.usedThemes.has(theme) && attempts < 50);
            
            this.usedThemes.add(theme);
            
            // 生成句子时添加更多变化指令
            const variations = [
                'focusing on cause and effect relationships',
                'emphasizing contrasts and comparisons',
                'highlighting historical context',
                'exploring future implications',
                'analyzing multiple perspectives',
                'examining underlying assumptions',
                'considering ethical dimensions',
                'evaluating practical applications',
                'discussing theoretical frameworks',
                'presenting conflicting viewpoints'
            ];
            
            const variation = variations[Math.floor(Math.random() * variations.length)];
            
            // 修改原始prompt
            const difficulty = this.config.difficulty?.max || 3;
            const complexityMap = {
                1: { words: '25-35', clauses: '1-2', vocab: 'intermediate' },
                2: { words: '35-45', clauses: '2-3', vocab: 'advanced' },
                3: { words: '45-55', clauses: '3-4', vocab: 'sophisticated' },
                4: { words: '55-70', clauses: '4-5', vocab: 'highly academic' },
                5: { words: '70-85', clauses: '5-6', vocab: 'extremely complex' }
            };
            
            const complexity = complexityMap[difficulty] || complexityMap[3];
            
            const enhancedPrompt = `Generate a complex English sentence about "${theme}" ${variation}.

Requirements:
- Length: ${complexity.words} words
- Include ${complexity.clauses} subordinate clauses
- Use ${complexity.vocab} vocabulary
- Ensure the sentence is grammatically perfect
- Make it intellectually engaging and thought-provoking
- Avoid clichés and common expressions
- Include specific details or examples

Return ONLY the JSON format:
{
  "sentence": "complete sentence",
  "pattern": "sentence pattern (SVO, SVOO, or SVOC)",
  "difficulty": ${difficulty}
}`;
            
            try {
                // 调用原始方法的AI部分
                const response = await this.callAI(enhancedPrompt);
                const sentenceData = JSON.parse(response);
                
                // 检查是否重复
                const sentenceStart = sentenceData.sentence.substring(0, 50);
                if (this.recentSentences.has(sentenceStart)) {
                    console.log('🔄 Duplicate detected, regenerating...');
                    return this.generateSentence();
                }
                
                this.recentSentences.add(sentenceStart);
                
                // 保持最近句子池大小
                if (this.recentSentences.size > 20) {
                    const firstItem = this.recentSentences.values().next().value;
                    this.recentSentences.delete(firstItem);
                }
                
                // 添加元数据
                sentenceData.id = Date.now() + Math.random();
                sentenceData.theme = theme;
                sentenceData.variation = variation;
                
                return sentenceData;
                
            } catch (error) {
                console.error('Generation failed:', error);
                // 不使用fallback，而是返回null让系统重试
                return null;
            }
        };
        
        // 改进后台生成逻辑
        const originalBackground = autoPracticeMode.startBackgroundGeneration;
        autoPracticeMode.startBackgroundGeneration = function() {
            this.generationInterval = setInterval(async () => {
                if (this.sentenceQueue.length < this.config.generateAhead + 2) {
                    let retries = 0;
                    let sentence = null;
                    
                    // 重试机制
                    while (!sentence && retries < 3) {
                        sentence = await this.generateSentence();
                        retries++;
                    }
                    
                    if (sentence) {
                        this.sentenceQueue.push(sentence);
                        this.updateQueueCount();
                        console.log(`📝 Generated new sentence (${this.sentenceQueue.length} in queue)`);
                    }
                }
            }, 3000); // 每3秒检查一次
        };
        
        console.log('✅ Sentence generation enhanced with', expandedThemes.length, 'themes');
    }
})();
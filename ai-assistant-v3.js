// 改进版 AI Assistant Module V3
// 使用更精确的结构化提示词和本地验证

// 在浏览器环境中创建全局变量
if (typeof window !== 'undefined') {
    window.AIAssistantV3 = {
    // API 配置
    config: {
        apiKey: 'sk-8a9d17f2199449ca87988c5d82ae30be',
        apiUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo-latest',
        temperature: 0.3,  // 降低温度，提高准确性
        maxTokens: 2000
    },

    // 改进的系统提示词 - 更精确的规则
    systemPrompt: `你是一个专业的英语句型教学助手。你必须严格遵循以下规则来分析句子结构：

核心规则：
1. 分词规则：
   - 将句子分成单词和标点符号的数组
   - 每个标点符号单独作为一个token
   - 保持原始大小写

2. 成分识别规则：
   - 主语(subject): 包含主语核心词及其所有修饰语（定语、定语从句等）
   - 谓语(verb): 只包含动词本身，助动词和情态动词分开计算
   - 宾语(object): 包含宾语核心词及其所有修饰语
   - 表语(complement): 在系动词后的成分
   - 间接宾语(indirectObject): 在SVOO结构中的第一个宾语

3. 定语从句规则：
   - 定语从句必须包含在它所修饰的名词所属的成分中
   - 例如："The students who studied hard" - 整个部分都是主语
   - 关系代词（who, which, that等）是定语从句的开始标志

4. 状语识别：
   - 时间状语（yesterday, tomorrow等）不属于主谓宾
   - 地点状语（at home, in the park等）不属于主谓宾
   - 方式状语（quickly, carefully等）不属于主谓宾
   - 这些都应标记为modifiers

5. 范围表示：
   - 使用[起始索引, 结束索引]表示，都是包含的
   - 索引从0开始
   - 如果一个成分是不连续的，使用多个范围`,

    // 本地验证规则
    validationRules: {
        // 定语从句标记词
        relativePronouns: ['who', 'whom', 'whose', 'which', 'that', 'where', 'when', 'why'],
        
        // 系动词列表
        linkingVerbs: ['is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 
                       'become', 'became', 'seem', 'seemed', 'look', 'looked',
                       'feel', 'felt', 'sound', 'sounded', 'taste', 'tasted',
                       'smell', 'smelled', 'appear', 'appeared', 'remain', 'remained'],
        
        // 常见状语
        adverbs: {
            time: ['yesterday', 'today', 'tomorrow', 'now', 'then', 'later', 
                   'soon', 'recently', 'finally', 'eventually', 'always', 'never'],
            place: ['here', 'there', 'everywhere', 'somewhere', 'nowhere'],
            manner: ['quickly', 'slowly', 'carefully', 'happily', 'sadly', 
                    'well', 'badly', 'hard', 'fast']
        }
    },

    // 生成句子 - V3版本
    async generateSentenceV3(patternType, difficulty, previousSentences = []) {
        const examples = this.getPatternExamples(patternType, difficulty);
        
        const prompt = `生成一个${patternType}句型的英文句子。

难度：${difficulty}星
句子长度要求：${this.getLengthRequirement(difficulty)}

参考这些正确的例子来理解如何标记：
${examples}

要求：
1. 生成的句子必须严格符合${patternType}句型
2. 必须包含适当的修饰成分
3. 定语从句必须包含在它修饰的成分中
4. 状语不属于主谓宾，要单独标记

返回JSON格式（严格按照下面的格式）：
{
    "sentence": "完整的句子",
    "tokens": ["单词1", "单词2", "标点"],
    "pattern": "${patternType}",
    "difficulty": ${difficulty},
    "components": {
        "subject": {
            "range": [起始, 结束],
            "text": "完整的主语文本"
        },
        "verb": {
            "range": [起始, 结束],
            "text": "谓语动词"
        }
        // 根据句型添加其他成分
    },
    "modifiers": [
        {
            "type": "时间状语/地点状语/方式状语",
            "range": [起始, 结束],
            "text": "修饰语文本"
        }
    ],
    "explanation": "详细解释句子结构"
}`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                const parsed = JSON.parse(result.content);
                // 本地验证
                const validation = this.validateStructure(parsed);
                if (validation.valid) {
                    return parsed;
                } else {
                    console.error('结构验证失败:', validation.errors);
                    // 尝试自动修正
                    const corrected = this.attemptAutoCorrection(parsed);
                    if (corrected) {
                        return corrected;
                    }
                    return { error: "生成的句子结构不正确: " + validation.errors.join(', ') };
                }
            } catch (e) {
                return { error: "解析失败: " + e.message };
            }
        }
        return { error: result.error };
    },

    // 获取句型示例
    getPatternExamples(pattern, difficulty) {
        const examples = {
            'SVO': {
                3: `例子："The students who studied hard passed the exam."
tokens: ["The", "students", "who", "studied", "hard", "passed", "the", "exam", "."]
主语: [0-4] "The students who studied hard" (包含定语从句)
谓语: [5] "passed"
宾语: [6-7] "the exam"`,
                4: `例子："The teacher carefully explained the concept that confused many students."
tokens: ["The", "teacher", "carefully", "explained", "the", "concept", "that", "confused", "many", "students", "."]
主语: [0-1] "The teacher"
谓语: [3] "explained"
宾语: [4-9] "the concept that confused many students" (包含定语从句)
修饰语: [2] "carefully" (方式状语)`
            },
            'SVP': {
                3: `例子："The book on the table is mine."
tokens: ["The", "book", "on", "the", "table", "is", "mine", "."]
主语: [0-4] "The book on the table" (包含介词短语修饰)
谓语: [5] "is"
表语: [6] "mine"`
            }
            // 可以添加更多示例
        };
        
        return examples[pattern]?.[difficulty] || examples[pattern]?.[3] || '';
    },

    // 获取长度要求
    getLengthRequirement(difficulty) {
        const requirements = {
            1: '8-12个单词',
            2: '12-18个单词',
            3: '18-25个单词',
            4: '25-35个单词',
            5: '35-50个单词'
        };
        return requirements[difficulty] || '15-25个单词';
    },

    // 本地验证结构
    validateStructure(data) {
        const errors = [];
        
        // 检查基本结构
        if (!data.tokens || !Array.isArray(data.tokens)) {
            errors.push('缺少tokens数组');
        }
        
        if (!data.components) {
            errors.push('缺少components对象');
        }
        
        // 检查句型对应的必要成分
        const requiredComponents = this.getRequiredComponents(data.pattern);
        for (const comp of requiredComponents) {
            if (!data.components[comp]) {
                errors.push(`缺少必要成分：${comp}`);
            } else {
                // 检查范围是否有效
                const range = data.components[comp].range;
                if (!this.isValidRange(range, data.tokens.length)) {
                    errors.push(`${comp}的范围无效：[${range}]`);
                }
            }
        }
        
        // 检查定语从句是否正确包含
        if (data.tokens) {
            this.validateRelativeClauses(data, errors);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // 获取句型必需成分
    getRequiredComponents(pattern) {
        const requirements = {
            'SV': ['subject', 'verb'],
            'SVP': ['subject', 'verb', 'complement'],
            'SVO': ['subject', 'verb', 'object'],
            'SVOO': ['subject', 'verb', 'indirectObject', 'object'],
            'SVOC': ['subject', 'verb', 'object', 'complement']
        };
        return requirements[pattern] || [];
    },

    // 检查范围是否有效
    isValidRange(range, tokenLength) {
        if (!Array.isArray(range) || range.length !== 2) return false;
        const [start, end] = range;
        return start >= 0 && end >= start && end < tokenLength;
    },    // 验证定语从句
    validateRelativeClauses(data, errors) {
        const tokens = data.tokens;
        const relativePronouns = this.validationRules.relativePronouns;
        
        // 查找所有定语从句
        tokens.forEach((token, index) => {
            if (relativePronouns.includes(token.toLowerCase())) {
                // 找到定语从句的开始
                // 检查它是否被正确包含在某个成分中
                let isIncluded = false;
                
                Object.entries(data.components).forEach(([comp, info]) => {
                    if (info.range && index >= info.range[0] && index <= info.range[1]) {
                        isIncluded = true;
                        
                        // 特殊检查：定语从句应该和它修饰的名词在同一个成分中
                        if (index > 0) {
                            const prevIndex = index - 1;
                            if (prevIndex < info.range[0]) {
                                errors.push(`定语从句"${token}..."没有和它修饰的名词包含在同一成分中`);
                            }
                        }
                    }
                });
                
                if (!isIncluded) {
                    errors.push(`定语从句标记词"${token}"(位置${index})没有被包含在任何成分中`);
                }
            }
        });
    },

    // 尝试自动修正
    attemptAutoCorrection(data) {
        // 这里可以实现一些简单的自动修正逻辑
        // 比如调整定语从句的边界
        try {
            const corrected = JSON.parse(JSON.stringify(data)); // 深拷贝
            
            // 修正定语从句边界
            const tokens = corrected.tokens;
            const relativePronouns = this.validationRules.relativePronouns;
            
            tokens.forEach((token, index) => {
                if (relativePronouns.includes(token.toLowerCase())) {
                    // 找到定语从句，确保它被包含在正确的成分中
                    // 这里需要更复杂的逻辑来确定从句的结束位置
                    // 暂时简化处理
                }
            });
            
            return corrected;
        } catch (e) {
            return null;
        }
    },

    // 发送请求
    async sendRequest(messages) {
        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        { role: "system", content: this.systemPrompt },
                        ...messages
                    ],
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens
                })
            });

            const data = await response.json();
            
            if (response.ok && data.choices && data.choices[0]) {
                return {
                    success: true,
                    content: data.choices[0].message.content,
                    usage: data.usage
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || '未知错误'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // 解析已有句子的结构
    async parseSentenceStructure(sentence, pattern) {
        const prompt = `分析下面句子的结构。

句子："${sentence}"
句型：${pattern}

请严格按照规则分析：
1. 先进行分词，包括所有标点符号
2. 识别主语（包含所有修饰语和定语从句）
3. 识别谓语（只包含动词本身）
4. 识别其他成分
5. 单独标记状语作为modifiers

返回格式与生成句子相同的JSON。`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                return JSON.parse(result.content);
            } catch (e) {
                return { error: "解析失败: " + e.message };
            }
        }
        return { error: result.error };
    },

    // 批量测试句子
    async testSentences(sentences) {
        const results = [];
        
        for (const sentenceInfo of sentences) {
            const result = await this.parseSentenceStructure(
                sentenceInfo.sentence, 
                sentenceInfo.pattern
            );
            
            results.push({
                sentence: sentenceInfo.sentence,
                pattern: sentenceInfo.pattern,
                expected: sentenceInfo.expected,
                actual: result,
                valid: !result.error
            });
        }
        
        return results;
    },

    // 生成训练句子（改进版）
    async generateTrainingSentence(pattern, difficulty) {
        // 使用V3版本生成
        const result = await this.generateSentenceV3(pattern, difficulty);
        
        if (!result.error) {
            // 额外的后处理，确保用于训练的句子质量
            result.tokens = this.normalizeTokens(result.tokens);
            result.components = this.normalizeComponents(result.components, result.tokens);
        }
        
        return result;
    },

    // 规范化分词
    normalizeTokens(tokens) {
        // 确保标点符号被正确分离
        const normalized = [];
        
        tokens.forEach(token => {
            // 检查是否有附着的标点
            const match = token.match(/^(.+?)([.,!?;:]+)$/);
            if (match) {
                normalized.push(match[1]);
                normalized.push(match[2]);
            } else {
                normalized.push(token);
            }
        });
        
        return normalized;
    },

    // 规范化成分范围
    normalizeComponents(components, tokens) {
        const normalized = {};
        
        Object.entries(components).forEach(([comp, info]) => {
            normalized[comp] = {
                ...info,
                text: tokens.slice(info.range[0], info.range[1] + 1).join(' ')
            };
        });
        
        return normalized;
    }
};
}

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAssistantV3;
}
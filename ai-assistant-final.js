// 最终优化版 AI Assistant Module
// 基于大量测试优化的精确句子结构分析

if (typeof window !== 'undefined') {
    window.AIAssistantFinal = {
    // API 配置
    config: {
        apiKey: 'sk-8a9d17f2199449ca87988c5d82ae30be',
        apiUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo-latest',
        temperature: 0.1,  // 低温度保证一致性
        maxTokens: 1000
    },

    // 最终优化的系统提示词
    systemPrompt: `你是英语句子结构分析专家。请严格按照以下算法分析句子：

【核心算法】
1. 先找到主句的谓语动词（不是从句中的动词）
2. 主语 = 主句谓语前的所有内容（除独立状语）
3. 定语从句必须包含在它修饰的名词所在的成分中

【定语从句判断规则】
- 开始：who, which, that, where, when, whose
- 结束：从句的完整结构结束处（通常在主句谓语前）
- 原则：定语从句不能独立，必须附属于被修饰的名词

【重要示例】
"The students who studied hard finally passed the exam."
- 主句谓语：passed（位置6）
- 主语：[0-4] "The students who studied hard"（不包含finally）
- 状语：[5] "finally"
- 宾语：[7-8] "the exam"

【输出格式】
{
  "tokens": ["单词", "数组", "标点独立"],
  "components": {
    "subject": {"range": [开始, 结束], "text": "完整文本"},
    "verb": {"range": [开始, 结束], "text": "动词"},
    "object": {"range": [开始, 结束], "text": "宾语文本"}
  },
  "modifiers": [
    {"range": [开始, 结束], "type": "类型", "text": "文本"}
  ]
}`,

    // 生成句子（使用最优提示词）
    async generateSentence(patternType, difficulty) {
        const prompt = this.buildGeneratePrompt(patternType, difficulty);
        const messages = [{ role: "user", content: prompt }];
        
        try {
            const result = await this.sendRequest(messages);
            if (result.success) {
                const parsed = JSON.parse(result.content);
                // 验证生成的结构
                if (this.validateStructure(parsed)) {
                    return parsed;
                }
                return { error: "生成的结构不符合要求" };
            }
            return { error: result.error };
        } catch (e) {
            return { error: "处理失败: " + e.message };
        }
    },

    // 分析句子结构（用于训练模式）
    async analyzeSentence(sentence, pattern) {
        const prompt = `分析句子："${sentence}"
句型：${pattern}

请按照系统提示中的算法精确分析。`;

        const messages = [{ role: "user", content: prompt }];
        
        try {
            const result = await this.sendRequest(messages);
            if (result.success) {
                return JSON.parse(result.content);
            }
            return { error: result.error };
        } catch (e) {
            return { error: "分析失败: " + e.message };
        }
    },

    // 构建生成提示词
    buildGeneratePrompt(pattern, difficulty) {
        const lengthMap = {
            1: '8-12个单词',
            2: '12-16个单词',
            3: '16-24个单词',
            4: '24-32个单词',
            5: '32-40个单词'
        };

        const patternExamples = {
            'SV': 'The children who were playing ran.',
            'SVP': 'The book which I bought is interesting.',
            'SVO': 'Students who work hard achieve success.',
            'SVOO': 'The teacher gave students homework.',
            'SVOC': 'They elected him president.'
        };

        return `生成一个${pattern}句型的句子。
要求：
1. 长度：${lengthMap[difficulty]}
2. 必须包含定语从句或其他修饰成分
3. 难度等级：${difficulty}星

参考例句：${patternExamples[pattern]}

返回JSON格式，包含tokens和components。`;
    },

    // 验证生成的结构
    validateStructure(data) {
        // 基本检查
        if (!data.tokens || !Array.isArray(data.tokens)) return false;
        if (!data.components || typeof data.components !== 'object') return false;
        
        // 检查必要成分
        const pattern = data.pattern;
        const required = {
            'SV': ['subject', 'verb'],
            'SVP': ['subject', 'verb', 'complement'],
            'SVO': ['subject', 'verb', 'object'],
            'SVOO': ['subject', 'verb', 'indirectObject', 'object'],
            'SVOC': ['subject', 'verb', 'object', 'complement']
        };
        
        const requiredComps = required[pattern] || required['SVO'];
        for (const comp of requiredComps) {
            if (!data.components[comp]?.range) return false;
        }
        
        // 检查范围合理性
        const tokenCount = data.tokens.length;
        for (const comp of Object.values(data.components)) {
            if (comp.range[0] < 0 || comp.range[1] >= tokenCount) return false;
            if (comp.range[0] > comp.range[1]) return false;
        }
        
        return true;
    },

    // 发送API请求
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
            
            if (response.ok && data.choices?.[0]?.message?.content) {
                return {
                    success: true,
                    content: data.choices[0].message.content
                };
            }
            
            return {
                success: false,
                error: data.error?.message || '未知错误'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // 批量验证用户答案
    async validateUserAnswer(sentenceData, userSelection) {
        // 简单的本地验证
        const correct = this.checkAnswer(sentenceData.components, userSelection);
        
        return {
            correct: correct,
            feedback: correct ? "完全正确！" : "再想想，注意定语从句的范围",
            score: correct ? 100 : 0
        };
    },

    // 检查答案
    checkAnswer(expected, actual) {
        // 检查主要成分是否匹配
        const mainComponents = ['subject', 'verb', 'object', 'complement', 'indirectObject'];
        
        for (const comp of mainComponents) {
            if (expected[comp]) {
                const expRange = expected[comp].range;
                const actRange = actual[comp];
                
                if (!actRange || 
                    actRange[0] !== expRange[0] || 
                    actRange[1] !== expRange[1]) {
                    return false;
                }
            }
        }
        
        return true;
    },

    // 为训练模式生成句子
    async generateTrainingSentence(pattern = 'SVO', difficulty = 3) {
        const result = await this.generateSentence(pattern, difficulty);
        
        if (!result.error) {
            // 确保返回格式适合训练模式
            return {
                sentence: result.sentence,
                tokens: result.tokens,
                pattern: result.pattern || pattern,
                difficulty: result.difficulty || difficulty,
                components: result.components,
                explanation: result.explanation || this.generateExplanation(result)
            };
        }
        
        return result;
    },

    // 生成解释
    generateExplanation(sentenceData) {
        const components = sentenceData.components;
        let explanation = `这是一个${sentenceData.pattern}句型。`;
        
        if (components.subject) {
            explanation += `主语"${components.subject.text}"`;
            if (components.subject.text.includes('who') || 
                components.subject.text.includes('which') || 
                components.subject.text.includes('that')) {
                explanation += '包含定语从句，';
            }
        }
        
        if (components.verb) {
            explanation += `谓语是"${components.verb.text}"，`;
        }
        
        if (components.object) {
            explanation += `宾语是"${components.object.text}"。`;
        }
        
        return explanation;
    }
};
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAssistantFinal;
}
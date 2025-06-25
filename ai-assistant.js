// AI Assistant Module for Long Sentence Learning Tool
// 使用通义千问 API 提供智能辅助功能

const AIAssistant = {
    // API 配置
    config: {
        apiKey: 'sk-8a9d17f2199449ca87988c5d82ae30be',
        apiUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo-latest',
        temperature: 0.7,
        maxTokens: 1500
    },

    // 系统提示词 - 定义AI助手的角色和能力
    systemPrompt: `你是一个专业的英语句型教学助手，专门帮助学生学习和理解英语五大基本句型（SV, SVP, SVO, SVOO, SVOC）。

你的主要能力包括：
1. 根据学生的学习进度和表现，生成合适难度的句子
2. 分析句子结构，标记句子成分
3. 解释语法难点，提供清晰的说明
4. 评估学生的理解程度，给出针对性建议
5. 生成个性化的练习题目

回答要求：
- 使用简洁清晰的中文解释
- 提供的英文句子要符合指定的句型
- 根据学生水平调整句子难度（1-5星）
- 重点突出句子的核心结构`,

    // 发送请求到 Qwen API
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

    // 生成新句子
    async generateSentence(patternType, difficulty, previousSentences = []) {
        const patternNames = {
            'SV': '主谓结构',
            'SVP': '主系表结构',
            'SVO': '主谓宾结构',
            'SVOO': '主谓双宾结构',
            'SVOC': '主谓宾补结构'
        };

        const prompt = `请生成一个${patternNames[patternType]}（${patternType}）的英文句子。

要求：
1. 句型必须是${patternType}
2. 难度等级：${difficulty}星（1-5星，5星最难）
3. 句子要包含适当的修饰成分，使其成为一个长难句
4. 避免与以下句子重复：${previousSentences.join('; ')}

请返回JSON格式：
{
    "sentence": "完整的句子",
    "pattern": "${patternType}",
    "difficulty": ${difficulty},
    "structure": {
        "subject": "主语部分",
        "verb": "谓语部分",
        "object": "宾语部分（如果有）",
        "complement": "补语/表语部分（如果有）",
        "modifiers": ["修饰语1", "修饰语2"]
    },
    "explanation": "句子结构的简要说明"
}`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                return JSON.parse(result.content);
            } catch (e) {
                return { error: "解析响应失败" };
            }
        }
        return { error: result.error };
    },

    // 分析用户的句子理解
    async analyzeUserUnderstanding(sentence, userAnalysis, correctStructure) {
        const prompt = `学生正在分析这个句子：
"${sentence}"

正确的句子结构是：
${JSON.stringify(correctStructure, null, 2)}

学生的分析结果是：
${JSON.stringify(userAnalysis, null, 2)}

请评估学生的分析是否正确，并给出反馈。返回JSON格式：
{
    "score": 0-100的分数,
    "correct": true/false,
    "feedback": "具体的反馈意见",
    "mistakes": ["错误1", "错误2"],
    "suggestions": ["建议1", "建议2"]
}`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                return JSON.parse(result.content);
            } catch (e) {
                return { error: "解析响应失败" };
            }
        }
        return { error: result.error };
    },

    // 生成个性化练习建议
    async generatePracticeRecommendation(userPerformance) {
        const prompt = `根据学生的学习表现数据：
${JSON.stringify(userPerformance, null, 2)}

请生成个性化的练习建议。返回JSON格式：
{
    "recommendedPattern": "推荐练习的句型",
    "recommendedDifficulty": 建议的难度等级,
    "focusAreas": ["需要加强的方面1", "需要加强的方面2"],
    "practiceGoals": ["练习目标1", "练习目标2"],
    "encouragement": "鼓励性的话语"
}`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                return JSON.parse(result.content);
            } catch (e) {
                return { error: "解析响应失败" };
            }
        }
        return { error: result.error };
    },

    // 解释语法难点
    async explainGrammarPoint(sentence, specificQuestion = "") {
        const prompt = `请解释这个句子中的语法难点：
"${sentence}"

${specificQuestion ? `学生的具体问题是：${specificQuestion}` : ''}

请用简洁清晰的中文解释，包括：
1. 句子的基本结构
2. 关键语法点
3. 修饰成分的作用
4. 可能的难点和注意事项`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            return {
                explanation: result.content,
                usage: result.usage
            };
        }
        return { error: result.error };
    },

    // 生成句子扩展步骤
    async generateExpansionSteps(basePattern, targetComplexity) {
        const prompt = `请为${basePattern}句型生成一个从简单到复杂的扩展示例。

要求：
1. 从最简单的基础句型开始
2. 逐步添加修饰成分
3. 最终达到${targetComplexity}星难度
4. 每一步都要保持句子的正确性和自然性

返回JSON格式：
{
    "pattern": "${basePattern}",
    "steps": [
        {
            "step": 1,
            "sentence": "句子内容",
            "description": "这一步添加了什么",
            "newParts": ["新增部分1", "新增部分2"]
        }
    ]
}`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                return JSON.parse(result.content);
            } catch (e) {
                return { error: "解析响应失败" };
            }
        }
        return { error: result.error };
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAssistant;
}
// 改进版 AI Assistant Module
// 使用更精确的结构化提示词

// 在浏览器环境中创建全局变量
if (typeof window !== 'undefined') {
    window.AIAssistantV2 = {
    // API 配置
    config: {
        apiKey: 'sk-8a9d17f2199449ca87988c5d82ae30be',
        apiUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo-latest',
        temperature: 0.7,
        maxTokens: 2000
    },

    // 改进的系统提示词
    systemPrompt: `你是一个专业的英语句型教学助手，专门帮助学生学习和理解英语五大基本句型。

重要规则：
1. 生成句子时，必须返回精确的词索引范围，而不是文本
2. 主语包含所有修饰主语的成分（包括定语从句），但不包括状语
3. 谓语只包含动词本身（不包括助动词和情态动词分开标记）
4. 宾语包含所有修饰宾语的成分，以及介词短语（如to/for someone）
5. 每个成分必须用起始和结束的单词索引表示
6. 状语（如finally, yesterday等）不属于主语，应单独标记为modifier

例如，对于句子：
"The students who studied hard finally passed the difficult exam yesterday."

分词后的数组（从0开始）：
[0:The, 1:students, 2:who, 3:studied, 4:hard, 5:finally, 6:passed, 7:the, 8:difficult, 9:exam, 10:yesterday, 11:.]

正确的标记应该是：
- 主语: [0-4] (The students who studied hard) - 不包含finally
- 谓语: [6] (passed)  
- 宾语: [7-9] (the difficult exam)
- 修饰语: finally是状语[5]，yesterday是状语[10]`,

    // 生成句子 - 改进版
    async generateSentenceV2(patternType, difficulty, previousSentences = []) {
        const patternNames = {
            'SV': '主谓结构',
            'SVP': '主系表结构', 
            'SVO': '主谓宾结构',
            'SVOO': '主谓双宾结构',
            'SVOC': '主谓宾补结构'
        };

        const prompt = `生成一个${patternNames[patternType]}（${patternType}）的英文句子。

要求：
1. 句型必须是${patternType}
2. 难度等级：${difficulty}星（1-5星，5星最难）
3. 句子长度：${difficulty < 3 ? '10-15个单词' : difficulty < 5 ? '15-25个单词' : '25-35个单词'}
4. 必须包含修饰成分使其成为长难句
5. 避免与以下句子重复：${previousSentences.join('; ')}

返回格式要求（JSON）：
{
    "sentence": "完整的句子",
    "tokens": ["单词1", "单词2", ...], // 分词数组，保留所有标点
    "pattern": "${patternType}",
    "difficulty": ${difficulty},
    "components": {
        "subject": {
            "range": [起始索引, 结束索引],
            "text": "主语文本",
            "core": [核心词索引] // 主语的核心词
        },
        "verb": {
            "range": [起始索引, 结束索引],
            "text": "谓语文本"
        },
        "object": {  // 如果有
            "range": [起始索引, 结束索引],
            "text": "宾语文本",
            "core": [核心词索引] // 宾语的核心词
        },
        "complement": { // 如果有表语或宾补
            "range": [起始索引, 结束索引],
            "text": "补语文本"
        },
        "indirectObject": { // 如果是SVOO
            "range": [起始索引, 结束索引],
            "text": "间接宾语文本"
        }
    },
    "modifiers": [ // 修饰成分
        {
            "type": "定语从句/状语/形容词等",
            "range": [起始索引, 结束索引],
            "modifies": "subject/verb/object"
        }
    ],
    "explanation": "句子结构的详细说明"
}

示例：
对于句子 "The boy quickly ate the apple."
tokens: ["The", "boy", "quickly", "ate", "the", "apple", "."]
components: {
    "subject": {"range": [0, 1], "text": "The boy", "core": [1]},
    "verb": {"range": [3, 3], "text": "ate"},
    "object": {"range": [4, 5], "text": "the apple", "core": [5]}
}`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                const parsed = JSON.parse(result.content);
                // 验证返回的数据结构
                if (this.validateSentenceStructure(parsed)) {
                    return parsed;
                } else {
                    return { error: "生成的句子结构不符合要求" };
                }
            } catch (e) {
                return { error: "解析响应失败: " + e.message };
            }
        }
        return { error: result.error };
    },

    // 验证句子结构
    validateSentenceStructure(data) {
        // 检查必要字段
        if (!data.sentence || !data.tokens || !data.components) {
            return false;
        }

        // 检查tokens数组
        if (!Array.isArray(data.tokens) || data.tokens.length === 0) {
            return false;
        }

        // 检查components
        const pattern = data.pattern;
        const required = {
            'SV': ['subject', 'verb'],
            'SVP': ['subject', 'verb', 'complement'],
            'SVO': ['subject', 'verb', 'object'],
            'SVOO': ['subject', 'verb', 'indirectObject', 'object'],
            'SVOC': ['subject', 'verb', 'object', 'complement']
        };

        const requiredComponents = required[pattern] || [];
        for (const comp of requiredComponents) {
            if (!data.components[comp] || !data.components[comp].range) {
                return false;
            }
        }

        return true;
    },

    // 验证用户的选择
    async validateUserSelection(sentenceData, userSelections) {
        const prompt = `用户正在练习识别句子成分。

句子：${sentenceData.sentence}
句型：${sentenceData.pattern}
分词：${JSON.stringify(sentenceData.tokens)}

正确答案：
${JSON.stringify(sentenceData.components, null, 2)}

用户的选择（单词索引）：
${JSON.stringify(userSelections, null, 2)}

请评估用户的选择是否正确。

返回JSON格式：
{
    "correct": true/false,
    "score": 0-100,
    "errors": [
        {
            "type": "missing", // missing, extra, wrong
            "component": "主语/谓语/宾语",
            "expected": [索引范围],
            "actual": [索引范围],
            "description": "错误说明"
        }
    ],
    "feedback": "给用户的反馈",
    "suggestions": ["建议1", "建议2"]
}`;

        const messages = [{ role: "user", content: prompt }];
        const result = await this.sendRequest(messages);
        
        if (result.success) {
            try {
                return JSON.parse(result.content);
            } catch (e) {
                return { error: "解析验证结果失败" };
            }
        }
        return { error: result.error };
    },

    // 发送请求（保持原有）
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
    }
};
} else {
    // Node.js 环境
    const AIAssistantV2 = {
        // 复制上面相同的对象定义
    };
    module.exports = AIAssistantV2;
}
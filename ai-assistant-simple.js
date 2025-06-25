// 简化版AI助手 - 直接生成带标记的句子
const AIAssistantSimple = {
    config: {
        apiKey: 'sk-8a9d17f2199449ca87988c5d82ae30be',
        apiUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo-latest',
        temperature: 0.3
    },

    // 简化的系统提示词
    systemPrompt: `你是英语句子教学助手。生成句子时直接输出带HTML标记的格式。

标记规则：
- 主语：<span class="subject">...</span>
- 谓语：<span class="verb">...</span>
- 宾语：<span class="object">...</span>
- 补语：<span class="complement">...</span>
- 定语从句：<span class="clause">...</span>
- 状语：<span class="modifier">...</span>

示例输出：
{
  "sentence": "<span class='subject'>The students <span class='clause'>who studied hard</span></span> <span class='modifier'>finally</span> <span class='verb'>passed</span> <span class='object'>the exam</span>.",
  "plainText": "The students who studied hard finally passed the exam.",
  "pattern": "SVO",
  "explanation": "主语包含定语从句who studied hard，finally是状语"
}`,

    // 生成带标记的句子
    async generateMarkedSentence(pattern, difficulty) {
        const prompt = `生成一个${pattern}句型的英语句子，难度${difficulty}星。
要求：
1. 直接在句子中用HTML标签标记成分
2. 定语从句要嵌套在它修饰的成分内
3. 同时提供纯文本版本

返回JSON格式。`;

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
                        { role: "user", content: prompt }
                    ],
                    temperature: this.config.temperature,
                    max_tokens: 500
                })
            });

            const data = await response.json();
            if (data.choices?.[0]?.message?.content) {
                return JSON.parse(data.choices[0].message.content);
            }
            throw new Error('API响应错误');
        } catch (error) {
            console.error('生成失败:', error);
            return null;
        }
    },

    // 为不同显示模式转换标记
    convertToDisplayMode(markedSentence, mode) {
        let html = markedSentence;
        
        if (mode === 'traditional') {
            // 传统板书模式：使用括号和下划线
            html = html
                .replace(/<span class='subject'>(.*?)<\/span>/g, '[$1]主')
                .replace(/<span class='verb'>(.*?)<\/span>/g, '<u>$1</u>')
                .replace(/<span class='object'>(.*?)<\/span>/g, '($1)宾')
                .replace(/<span class='modifier'>(.*?)<\/span>/g, '〈$1〉')
                .replace(/<span class='clause'>(.*?)<\/span>/g, '{$1}');
        } else if (mode === 'minimal') {
            // 极简模式：只用颜色
            html = html
                .replace(/class='subject'/g, 'style="color: #e74c3c"')
                .replace(/class='verb'/g, 'style="color: #3498db"')
                .replace(/class='object'/g, 'style="color: #27ae60"')
                .replace(/class='modifier'/g, 'style="color: #9b59b6"')
                .replace(/class='clause'/g, 'style="text-decoration: underline dotted"');
        }
        
        return html;
    }
};

// 测试页面
if (typeof window !== 'undefined') {
    window.AIAssistantSimple = AIAssistantSimple;
}
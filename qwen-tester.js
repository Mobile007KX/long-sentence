// 快速测试和优化AI提示词的脚本
const QwenTester = {
    apiKey: 'sk-8a9d17f2199449ca87988c5d82ae30be',
    apiUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
    
    // 最优提示词模板（根据测试结果不断优化）
    prompts: {
        v1: `分析英语句子结构。规则：
1. 主语包含所有修饰成分和定语从句
2. 定语从句从关系代词开始到从句结束
3. 状语单独标记为modifier
返回JSON格式。`,

        v2: `你是句子结构分析专家。分析规则：
1. 主语范围：从主语开始到谓语动词前（包含所有定语从句）
2. 定语从句识别：who/which/that后的内容属于被修饰的名词
3. 状语(finally/yesterday等)不计入主谓宾
4. 返回精确的索引范围[start,end]

示例：
"The boy who likes apples ate one." 
主语:[0-4] "The boy who likes apples"
谓语:[5-5] "ate"
宾语:[6-6] "one"`,

        v3: `句子成分分析任务。严格规则：

1. 分词：将句子分成单词数组，标点符号单独成元素
2. 主语识别：
   - 包含主语中心词及所有修饰语
   - 定语从句完整包含（从关系词到从句结束）
   - 示例: "The students who studied hard" → 整体是主语[0-4]
3. 谓语识别：只包含动词本身
4. 宾语识别：包含宾语及其修饰语
5. 状语标记：时间/地点/方式状语作为modifier

关键：定语从句边界判断
- who/which/that是开始
- 找到从句的完整谓宾结构
- 从句结束于：逗号、句号或下一个主句成分

返回格式：
{
  "tokens": ["The", "students", "who", "studied", "hard", "finally", "passed", "."],
  "components": {
    "subject": {"range": [0, 4], "text": "The students who studied hard"},
    "verb": {"range": [6, 6], "text": "passed"}
  },
  "modifiers": [{"range": [5, 5], "type": "adverb", "text": "finally"}]
}`,

        v4: `英语句子结构精确分析。你必须按照以下步骤分析：

步骤1：分词
将句子分成单词和标点的数组，每个元素独立。

步骤2：识别主句动词
找到整个句子的主要动词（不是从句中的动词）。

步骤3：识别主语
主语 = 主句动词前的所有内容（除了独立状语）
- 包含：名词、冠词、形容词、定语从句
- 定语从句：who/which/that开始，包含从句的完整主谓(宾)结构

步骤4：识别其他成分
- 谓语：主句动词
- 宾语：动词后的名词短语（包含其修饰语）
- 状语：finally, yesterday等时间/方式副词

重要示例分析：
句子："The students who studied hard finally passed the exam."
1. 找主句动词 → "passed" (位置6)
2. 主语 → "passed"前面除了"finally" → [0-4] "The students who studied hard"
3. 状语 → [5] "finally"
4. 宾语 → [7-8] "the exam"

返回JSON格式`,

        v5: `你是英语句子结构分析专家。请使用以下精确算法：

算法步骤：
1. 分词：按空格分词，标点独立
2. 标记词性：识别名词、动词、关系代词、副词等
3. 找主句谓语：排除从句动词，找到主句的核心动词
4. 划分成分：
   - 主语 = 主句谓语前的名词短语（含所有修饰语）
   - 定语从句必须附属于其修饰的名词

定语从句识别规则：
- 开始标志：who, whom, whose, which, that, where, when, why
- 结束标志：
  a) 遇到逗号
  b) 遇到主句的谓语动词
  c) 遇到句号
  d) 从句的完整语义结束

测试用例验证：
"The students who studied hard finally passed the exam."
→ 主句谓语是"passed"
→ 主语必须包含"who studied hard"因为它修饰"students"
→ "finally"是状语，不属于主语

输出格式：
{
  "tokens": [...],
  "main_verb_index": 6,  // 主句谓语位置
  "components": {
    "subject": {"range": [start, end], "includes_clause": true/false},
    "verb": {"range": [start, end]},
    "object": {"range": [start, end]}
  },
  "modifiers": [...]
}`,

        // 当前最优版本
        current: null
    },

    // 测试用例
    testCases: [
        {
            id: 1,
            sentence: "The students who studied hard finally passed the exam.",
            pattern: "SVO",
            tokens: ["The", "students", "who", "studied", "hard", "finally", "passed", "the", "exam", "."],
            expected: {
                subject: [0, 4],  // The students who studied hard
                verb: [6, 6],     // passed
                object: [7, 8],   // the exam
                modifiers: [[5, 5]] // finally
            }
        },
        {
            id: 2,
            sentence: "The book which I bought yesterday is interesting.",
            pattern: "SVP",
            tokens: ["The", "book", "which", "I", "bought", "yesterday", "is", "interesting", "."],
            expected: {
                subject: [0, 5],  // The book which I bought yesterday
                verb: [6, 6],     // is
                complement: [7, 7] // interesting
            }
        },
        {
            id: 3,
            sentence: "The manager who works overtime gave employees bonuses.",
            pattern: "SVOO",
            tokens: ["The", "manager", "who", "works", "overtime", "gave", "employees", "bonuses", "."],
            expected: {
                subject: [0, 4],  // The manager who works overtime
                verb: [5, 5],     // gave
                indirectObject: [6, 6], // employees
                object: [7, 7]    // bonuses
            }
        },
        {
            id: 4,
            sentence: "The proposal which the committee reviewed carefully needs more work.",
            pattern: "SVO",
            tokens: ["The", "proposal", "which", "the", "committee", "reviewed", "carefully", "needs", "more", "work", "."],
            expected: {
                subject: [0, 6],  // The proposal which the committee reviewed carefully
                verb: [7, 7],     // needs
                object: [8, 9]    // more work
            }
        },
        {
            id: 5,
            sentence: "Students who complete their assignments on time receive extra credit.",
            pattern: "SVO",
            tokens: ["Students", "who", "complete", "their", "assignments", "on", "time", "receive", "extra", "credit", "."],
            expected: {
                subject: [0, 6],  // Students who complete their assignments on time
                verb: [7, 7],     // receive
                object: [8, 9]    // extra credit
            }
        },
        {
            id: 6,
            sentence: "The report that was submitted yesterday contains several errors.",
            pattern: "SVO",
            tokens: ["The", "report", "that", "was", "submitted", "yesterday", "contains", "several", "errors", "."],
            expected: {
                subject: [0, 5],  // The report that was submitted yesterday
                verb: [6, 6],     // contains
                object: [7, 8]    // several errors
            }
        },
        {
            id: 7,
            sentence: "The teacher explained the concept clearly.",
            pattern: "SVO",
            tokens: ["The", "teacher", "explained", "the", "concept", "clearly", "."],
            expected: {
                subject: [0, 1],  // The teacher
                verb: [2, 2],     // explained
                object: [3, 4],   // the concept
                modifiers: [[5, 5]] // clearly
            }
        },
        {
            id: 8,
            sentence: "The children who were playing in the park suddenly ran home.",
            pattern: "SV",
            tokens: ["The", "children", "who", "were", "playing", "in", "the", "park", "suddenly", "ran", "home", "."],
            expected: {
                subject: [0, 7],  // The children who were playing in the park
                verb: [9, 9],     // ran
                modifiers: [[8, 8], [10, 10]] // suddenly, home
            }
        }
    ],

    // 测试单个提示词
    async testPrompt(promptVersion, showDetails = false) {
        console.log(`\n🧪 测试提示词版本: ${promptVersion}`);
        const prompt = this.prompts[promptVersion];
        let successCount = 0;
        const results = [];

        for (const testCase of this.testCases) {
            try {
                const response = await this.callAPI(prompt, testCase.sentence, testCase.pattern);
                const evaluation = this.evaluate(response, testCase.expected, testCase.tokens);
                
                if (evaluation.success) {
                    successCount++;
                    console.log(`✅ 测试用例 ${testCase.id}: 通过`);
                } else {
                    console.log(`❌ 测试用例 ${testCase.id}: 失败`);
                    if (showDetails) {
                        console.log(`   期望: `, testCase.expected);
                        console.log(`   实际: `, response.components);
                        console.log(`   错误: `, evaluation.errors);
                    }
                }
                
                results.push({
                    testCase: testCase.id,
                    success: evaluation.success,
                    score: evaluation.score,
                    errors: evaluation.errors
                });

            } catch (error) {
                console.log(`❌ 测试用例 ${testCase.id}: API错误 - ${error.message}`);
                results.push({
                    testCase: testCase.id,
                    success: false,
                    score: 0,
                    errors: [error.message]
                });
            }
            
            // 延迟避免限流
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const successRate = (successCount / this.testCases.length) * 100;
        console.log(`\n📊 成功率: ${successRate.toFixed(1)}%`);
        
        return {
            version: promptVersion,
            successRate,
            results
        };
    },

    // 调用API
    async callAPI(systemPrompt, sentence, pattern) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'qwen-turbo-latest',
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `分析句子："${sentence}" (句型：${pattern})` }
                ],
                temperature: 0.1,
                max_tokens: 800
            })
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
            try {
                return JSON.parse(data.choices[0].message.content);
            } catch (e) {
                throw new Error('JSON解析失败: ' + data.choices[0].message.content.substring(0, 100));
            }
        }
        throw new Error('API响应格式错误');
    },

    // 评估结果
    evaluate(response, expected, tokens) {
        const errors = [];
        let score = 0;
        let totalChecks = 0;

        // 检查tokens
        if (!response.tokens || !Array.isArray(response.tokens)) {
            errors.push('缺少tokens数组');
        }

        // 检查各个成分
        const checkComponent = (name, responseComp, expectedRange) => {
            totalChecks++;
            if (!responseComp?.range) {
                errors.push(`缺少${name}`);
                return;
            }
            
            const [start, end] = responseComp.range;
            const [expStart, expEnd] = expectedRange;
            
            if (start === expStart && end === expEnd) {
                score++;
            } else {
                errors.push(`${name}范围错误: 期望[${expStart},${expEnd}], 实际[${start},${end}]`);
            }
        };

        // 检查主语
        if (expected.subject) {
            checkComponent('主语', response.components?.subject, expected.subject);
        }

        // 检查谓语
        if (expected.verb) {
            checkComponent('谓语', response.components?.verb, expected.verb);
        }

        // 检查宾语
        if (expected.object) {
            checkComponent('宾语', response.components?.object, expected.object);
        }

        // 检查表语
        if (expected.complement) {
            checkComponent('表语', response.components?.complement, expected.complement);
        }

        // 检查修饰语
        if (expected.modifiers) {
            totalChecks++;
            if (response.modifiers && Array.isArray(response.modifiers)) {
                let modifierMatches = 0;
                for (const expMod of expected.modifiers) {
                    if (response.modifiers.some(mod => 
                        mod.range?.[0] === expMod[0] && mod.range?.[1] === expMod[1]
                    )) {
                        modifierMatches++;
                    }
                }
                if (modifierMatches === expected.modifiers.length) {
                    score++;
                } else {
                    errors.push('修饰语识别不完整');
                }
            } else {
                errors.push('缺少修饰语数组');
            }
        }

        return {
            success: errors.length === 0,
            score: totalChecks > 0 ? score / totalChecks : 0,
            errors
        };
    },

    // 批量测试所有版本
    async testAllVersions() {
        console.log('🚀 开始批量测试所有提示词版本...\n');
        const results = [];

        for (const version in this.prompts) {
            if (version !== 'current') {
                const result = await this.testPrompt(version, true);
                results.push(result);
                console.log('\n' + '='.repeat(50) + '\n');
            }
        }

        // 找出最佳版本
        const best = results.reduce((a, b) => a.successRate > b.successRate ? a : b);
        this.prompts.current = this.prompts[best.version];
        
        console.log(`\n🏆 最佳版本: ${best.version} (成功率: ${best.successRate}%)`);
        return results;
    },

    // 快速测试当前版本
    async quickTest(sentence) {
        if (!this.prompts.current) {
            this.prompts.current = this.prompts.v3;
        }

        console.log(`\n快速测试: "${sentence}"`);
        const result = await this.callAPI(this.prompts.current, sentence, 'SVO');
        console.log('结果:', JSON.stringify(result, null, 2));
        return result;
    }
};

// 如果在浏览器环境，添加到全局
if (typeof window !== 'undefined') {
    window.QwenTester = QwenTester;
}

// 如果在Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QwenTester;
}
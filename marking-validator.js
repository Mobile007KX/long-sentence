// 本地验证系统 - 测试标记方法的可行性
const MarkingValidator = {
    // 测试用例：预期的正确标记结果
    testCases: [
        {
            id: 1,
            plain: "The students who studied hard finally passed the exam.",
            correct: '<span class="subject">The students <span class="clause">who studied hard</span></span> <span class="modifier">finally</span> <span class="verb">passed</span> <span class="object">the exam</span>.',
            pattern: "SVO",
            notes: "主语包含定语从句，finally是状语"
        },
        {
            id: 2,
            plain: "The book is interesting.",
            correct: '<span class="subject">The book</span> <span class="verb">is</span> <span class="complement">interesting</span>.',
            pattern: "SVP",
            notes: "简单的主系表结构"
        },
        {
            id: 3,
            plain: "The teacher gave students homework.",
            correct: '<span class="subject">The teacher</span> <span class="verb">gave</span> <span class="object">students</span> <span class="object">homework</span>.',
            pattern: "SVOO",
            notes: "双宾语结构"
        },
        {
            id: 4,
            plain: "They elected him president.",
            correct: '<span class="subject">They</span> <span class="verb">elected</span> <span class="object">him</span> <span class="complement">president</span>.',
            pattern: "SVOC",
            notes: "宾语补足语结构"
        },
        {
            id: 5,
            plain: "The proposal which the committee reviewed carefully needs more work.",
            correct: '<span class="subject">The proposal <span class="clause">which the committee reviewed carefully</span></span> <span class="verb">needs</span> <span class="object">more work</span>.',
            pattern: "SVO",
            notes: "主语包含较长的定语从句"
        }
    ],

    // 验证标记是否正确
    validateMarking(markedSentence, expectedMarking) {
        // 1. 标准化空格和引号
        const normalize = (str) => str
            .replace(/\s+/g, ' ')
            .replace(/["']/g, '"')
            .trim();
        
        const marked = normalize(markedSentence);
        const expected = normalize(expectedMarking);
        
        // 2. 完全匹配检查
        if (marked === expected) {
            return { valid: true, score: 100, message: "完全正确" };
        }
        
        // 3. 结构检查
        const errors = [];
        
        // 检查是否有基本标记
        if (!marked.includes('<span')) {
            errors.push("缺少HTML标记");
            return { valid: false, score: 0, errors };
        }
        
        // 检查必要成分
        const checkComponent = (className, componentName) => {
            const hasInMarked = marked.includes(`class="${className}"`) || marked.includes(`class='${className}'`);
            const hasInExpected = expected.includes(`class="${className}"`);
            
            if (hasInExpected && !hasInMarked) {
                errors.push(`缺少${componentName}标记`);
            } else if (!hasInExpected && hasInMarked) {
                errors.push(`多余的${componentName}标记`);
            }
        };
        
        checkComponent('subject', '主语');
        checkComponent('verb', '谓语');
        checkComponent('object', '宾语');
        checkComponent('complement', '补语');
        checkComponent('modifier', '状语');
        checkComponent('clause', '从句');
        
        // 4. 嵌套结构检查
        if (expected.includes('<span class="clause">')) {
            // 检查定语从句是否正确嵌套
            const clausePattern = /<span class="subject">.*?<span class="clause">.*?<\/span>.*?<\/span>/;
            if (!clausePattern.test(marked)) {
                errors.push("定语从句未正确嵌套在主语中");
            }
        }
        
        // 5. 计算相似度分数
        const score = this.calculateSimilarity(marked, expected);
        
        return {
            valid: errors.length === 0,
            score: Math.round(score),
            errors: errors,
            marked: marked,
            expected: expected
        };
    },

    // 计算相似度分数
    calculateSimilarity(str1, str2) {
        // 提取所有标记的成分
        const extractComponents = (str) => {
            const components = [];
            const regex = /<span class="(\w+)">(.*?)<\/span>/g;
            let match;
            while ((match = regex.exec(str)) !== null) {
                components.push({
                    type: match[1],
                    content: match[2].replace(/<.*?>/g, '').trim()
                });
            }
            return components;
        };
        
        const comp1 = extractComponents(str1);
        const comp2 = extractComponents(str2);
        
        let matches = 0;
        const total = Math.max(comp1.length, comp2.length);
        
        comp1.forEach(c1 => {
            if (comp2.some(c2 => c2.type === c1.type && c2.content === c1.content)) {
                matches++;
            }
        });
        
        return total > 0 ? (matches / total) * 100 : 0;
    },

    // 生成提示词示例
    generateExamples(method) {
        const examples = [];
        
        switch(method) {
            case 'direct':
                // 直接给出输入输出示例
                examples.push('输入: The boy eats apples.');
                examples.push('输出: <span class="subject">The boy</span> <span class="verb">eats</span> <span class="object">apples</span>.');
                examples.push('');
                examples.push('输入: Students who work hard succeed.');
                examples.push('输出: <span class="subject">Students <span class="clause">who work hard</span></span> <span class="verb">succeed</span>.');
                break;
                
            case 'template':
                // 模板方法
                examples.push('步骤1: 识别成分 [The boy] [eats] [apples]');
                examples.push('步骤2: 替换为标记 <span class="subject">The boy</span> <span class="verb">eats</span> <span class="object">apples</span>');
                break;
                
            case 'rules':
                // 规则说明
                examples.push('规则:');
                examples.push('1. 主语(包含所有修饰语)用 <span class="subject">');
                examples.push('2. 定语从句嵌套在被修饰的名词内');
                examples.push('3. 状语独立标记为 <span class="modifier">');
                break;
        }
        
        return examples.join('\n');
    },

    // 测试提示词效果（模拟）
    simulatePromptEffect(promptMethod) {
        const results = [];
        
        for (const testCase of this.testCases) {
            // 模拟AI可能的输出
            let simulatedOutput = '';
            
            if (promptMethod === 'direct') {
                // 直接示例法：假设AI会模仿示例
                simulatedOutput = this.mockDirectMethodOutput(testCase.plain);
            } else if (promptMethod === 'template') {
                // 模板法：假设AI会按步骤处理
                simulatedOutput = this.mockTemplateMethodOutput(testCase.plain);
            } else if (promptMethod === 'rules') {
                // 规则法：假设AI会应用规则
                simulatedOutput = this.mockRulesMethodOutput(testCase.plain);
            }
            
            const validation = this.validateMarking(simulatedOutput, testCase.correct);
            results.push({
                testCase: testCase.id,
                pattern: testCase.pattern,
                valid: validation.valid,
                score: validation.score,
                errors: validation.errors
            });
        }
        
        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        return {
            method: promptMethod,
            avgScore: avgScore,
            results: results
        };
    },

    // 模拟直接示例法的输出
    mockDirectMethodOutput(sentence) {
        // 简单模拟：假设AI会识别基本模式
        if (sentence.includes('who') || sentence.includes('which')) {
            // 有定语从句
            const beforeClause = sentence.substring(0, sentence.indexOf('who') || sentence.indexOf('which'));
            const clauseStart = sentence.indexOf('who') || sentence.indexOf('which');
            const verbMatch = sentence.match(/\b(is|are|was|were|passed|needs|gave|elected)\b/);
            
            if (verbMatch) {
                const verbIndex = sentence.indexOf(verbMatch[0]);
                const subject = sentence.substring(0, verbIndex).trim();
                const afterVerb = sentence.substring(verbIndex + verbMatch[0].length).trim();
                
                return `<span class="subject">${subject}</span> <span class="verb">${verbMatch[0]}</span> <span class="object">${afterVerb}</span>`;
            }
        }
        
        // 简单句
        const parts = sentence.split(/\s+/);
        if (parts.length >= 3) {
            return `<span class="subject">${parts[0]} ${parts[1]}</span> <span class="verb">${parts[2]}</span> <span class="object">${parts.slice(3).join(' ')}</span>`;
        }
        
        return sentence;
    },

    // 模拟模板法的输出
    mockTemplateMethodOutput(sentence) {
        // 模拟按模板处理
        const words = sentence.split(/\s+/);
        // 简化处理...
        return `<span class="subject">${words[0]} ${words[1]}</span> <span class="verb">${words[2]}</span>...`;
    },

    // 模拟规则法的输出
    mockRulesMethodOutput(sentence) {
        // 模拟应用规则
        // 简化处理...
        return sentence;
    },

    // 运行完整测试
    runFullTest() {
        console.log('🧪 开始本地验证测试\n');
        
        const methods = ['direct', 'template', 'rules'];
        const results = [];
        
        for (const method of methods) {
            console.log(`\n测试方法: ${method}`);
            console.log('示例提示词:');
            console.log(this.generateExamples(method));
            console.log('\n模拟测试结果:');
            
            const testResult = this.simulatePromptEffect(method);
            results.push(testResult);
            
            console.log(`平均得分: ${testResult.avgScore.toFixed(1)}%`);
            testResult.results.forEach(r => {
                console.log(`  测试${r.testCase} (${r.pattern}): ${r.valid ? '✅' : '❌'} ${r.score}%`);
                if (r.errors.length > 0) {
                    console.log(`    错误: ${r.errors.join(', ')}`);
                }
            });
        }
        
        // 找出最佳方法
        const best = results.reduce((a, b) => a.avgScore > b.avgScore ? a : b);
        console.log(`\n🏆 最佳方法: ${best.method} (${best.avgScore.toFixed(1)}%)`);
        
        return results;
    }
};

// 如果在浏览器环境
if (typeof window !== 'undefined') {
    window.MarkingValidator = MarkingValidator;
}

// 如果在Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkingValidator;
}

// 运行测试
console.log('可以运行 MarkingValidator.runFullTest() 来测试各种方法');
// 高难度句子分析和优化提示词
const ComplexSentenceAnalysis = {
    // 这些句子的共同特点
    patterns: {
        // 1. 让步状语从句开头（Although, While, Even after, Despite）
        concessive: ["Although", "While", "Even after", "Despite", "Even as"],
        
        // 2. 插入语结构（用破折号或逗号隔开）
        parenthetical: ["—", ",", "pressed by", "emboldened by", "alarmed by", "exhausted by"],
        
        // 3. 复杂的定语从句和分词短语
        modifiers: ["who", "which", "whose", "that", "featuring", "citing", "claiming"],
        
        // 4. 结果状语（thereby, thus, prompting）
        resultative: ["thereby", "thus", "prompting", "forcing", "obliging"],
        
        // 5. 多层嵌套的宾语从句
        nested: ["that", "alleging that", "warned that", "claiming that"]
    },
    
    // 针对复杂句子的优化提示词
    optimizedPrompt: `分析复杂英语句子并标记成分。

核心原则：
1. 先找主句的核心结构（跳过让步状语从句）
2. 让步状语从句（Although/While/Despite等开头）整体作为状语
3. 插入语（破折号或逗号间的补充说明）保留在其所在成分内
4. 定语从句必须嵌套在被修饰词内

标记方法：
- [[主语]] - 主句主语及其所有修饰成分
- {{谓语}} - 主句谓语动词
- ((宾语)) - 宾语及其修饰成分
- <<从句>> - 定语从句、宾语从句等
- **状语** - 让步状语从句、时间状语等
- ##插入语## - 破折号间的补充说明

示例分析：
句子：Although experts warned about risks, the company—known for innovation—proceeded with the plan.
标记：**Although experts warned about risks**, [[the company##—known for innovation—##]] {{proceeded}} ((with the plan)).

现在分析：`,

    // 更精确的分步提示词
    stepByStepPrompt: `分析这个复杂句子的结构：

第1步：识别句子开头
- 如果以Although/While/Despite等开头，这整个部分是让步状语
- 找到第一个逗号后的主句

第2步：找主句谓语
- 跳过所有修饰成分，找到主句的核心动词

第3步：确定主语
- 主句谓语前的所有内容（除了让步状语）
- 包含所有定语从句、分词短语、插入语

第4步：标记
- 让步状语用**包裹
- 主语用[[包裹，内部的从句用<<嵌套
- 谓语用{{
- 宾语用((
- 破折号内容保留但可用##标记

句子：`,

    // 测试函数
    testComplexSentence: async function(sentence) {
        // 这里可以调用API测试
        console.log("Testing complex sentence:", sentence.substring(0, 50) + "...");
    }
};

// 导出
if (typeof window !== 'undefined') {
    window.ComplexSentenceAnalysis = ComplexSentenceAnalysis;
}
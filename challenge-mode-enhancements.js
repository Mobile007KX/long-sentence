                </div>
            </div>
            
            <div class="result-breakdown">
                <div class="breakdown-item">
                    <span class="breakdown-label">基础分</span>
                    <span class="breakdown-value">${Math.round(result.accuracy)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">精确率奖励</span>
                    <span class="breakdown-value">+${Math.round(result.precision * 0.2)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">时间奖励</span>
                    <span class="breakdown-value">+${result.timeBonus}</span>
                </div>
            </div>
            
            <div class="performance-tips">
                ${this.generatePerformanceTips(result)}
            </div>
        </div>
    `;
    
    // 插入到操作区域
    const actionsDiv = document.querySelector('.challenge-actions');
    actionsDiv.innerHTML = '';
    actionsDiv.appendChild(resultContainer);
    
    // 显示正确答案
    this.showCorrectAnswerOnSentence();
    
    // 添加继续按钮
    setTimeout(() => {
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn-next-challenge btn-primary pulse-animation';
        continueBtn.textContent = '下一题 →';
        continueBtn.onclick = () => this.nextChallenge();
        resultContainer.appendChild(continueBtn);
    }, 2000);
    
    // 记录本题分数
    this.sessionScores.push(result.score);
    
    // 更新总分
    const totalScore = this.sessionScores.reduce((sum, s) => sum + s, 0);
    document.querySelector('.score-value').textContent = totalScore;
    
    // 禁用句子交互
    document.getElementById('challenge-sentence').style.pointerEvents = 'none';
};

/**
 * 生成表现提示
 */
ChallengeMode.prototype.generatePerformanceTips = function(result) {
    let tips = '<h4>💡 小贴士</h4>';
    
    if (result.accuracy >= 90) {
        tips += '<p class="tip-excellent">🎉 太棒了！你对句子结构的理解非常准确！</p>';
    } else if (result.accuracy >= 70) {
        tips += '<p class="tip-good">👍 做得不错！继续加油，注意区分修饰语和核心成分。</p>';
    } else {
        tips += '<p class="tip-improve">💪 继续努力！记住：主干 = 主语核心词 + 谓语 + 宾语核心词</p>';
    }
    
    if (result.incorrect > 2) {
        tips += '<p class="tip-warning">⚠️ 注意：形容词、副词、介词短语通常是修饰语，不是主干。</p>';
    }
    
    if (result.missing > 0) {
        tips += '<p class="tip-hint">💭 提示：动词短语要完整标记（如 have been doing）</p>';
    }
    
    return tips;
};

/**
 * 显示挑战会话总结
 */
ChallengeMode.prototype.showSessionSummary = function() {
    const totalScore = this.sessionScores.reduce((sum, s) => sum + s, 0);
    const avgScore = Math.round(totalScore / this.sessionScores.length);
    const maxScore = Math.max(...this.sessionScores);
    const minScore = Math.min(...this.sessionScores);
    
    // 计算等级
    let sessionGrade = 'C';
    if (avgScore >= 90) sessionGrade = 'S';
    else if (avgScore >= 80) sessionGrade = 'A';
    else if (avgScore >= 70) sessionGrade = 'B';
    
    const summaryHtml = `
        <div class="session-summary">
            <h2>🏆 挑战完成！</h2>
            
            <div class="summary-stats">
                <div class="stat-card primary">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                        <div class="stat-value">${totalScore}</div>
                        <div class="stat-label">总分</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">${avgScore}</div>
                        <div class="stat-label">平均分</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🌟</div>
                    <div class="stat-content">
                        <div class="stat-value">${maxScore}</div>
                        <div class="stat-label">最高分</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <div class="stat-value grade-${sessionGrade}">${sessionGrade}</div>
                        <div class="stat-label">综合评级</div>
                    </div>
                </div>
            </div>
            
            <div class="score-chart">
                <h3>得分趋势</h3>
                <div class="chart-container">
                    ${this.renderScoreChart()}
                </div>
            </div>
            
            <div class="summary-feedback">
                ${this.generateSessionFeedback(avgScore, sessionGrade)}
            </div>
            
            <div class="summary-actions">
                <button class="btn-restart" onclick="window.challengeMode.startNewSession()">
                    再来一组
                </button>
                <button class="btn-back" onclick="window.challengeMode.exitChallenge()">
                    返回主页
                </button>
            </div>
        </div>
    `;
    
    // 替换整个挑战区域
    const challengeContainer = document.getElementById('challenge-container');
    challengeContainer.innerHTML = summaryHtml;
    
    // 添加动画效果
    setTimeout(() => {
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            card.style.animation = `slideInUp 0.5s ease ${index * 0.1}s forwards`;
        });
    }, 100);
};

/**
 * 渲染得分图表
 */
ChallengeMode.prototype.renderScoreChart = function() {
    const maxChartScore = Math.max(...this.sessionScores, 100);
    const chartHeight = 200;
    
    let chartHtml = '<svg class="score-chart-svg" viewBox="0 0 600 220">';
    
    // 绘制背景网格
    for (let i = 0; i <= 4; i++) {
        const y = 10 + (i * chartHeight / 4);
        chartHtml += `<line x1="50" y1="${y}" x2="550" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
        chartHtml += `<text x="30" y="${y + 5}" fill="#9ca3af" font-size="12">${100 - i * 25}</text>`;
    }
    
    // 绘制得分折线
    const points = this.sessionScores.map((score, index) => {
        const x = 50 + (index * 500 / (this.sessionScores.length - 1 || 1));
        const y = 10 + ((maxChartScore - score) / maxChartScore * chartHeight);
        return `${x},${y}`;
    }).join(' ');
    
    chartHtml += `<polyline points="${points}" fill="none" stroke="#5B21B6" stroke-width="3"/>`;
    
    // 绘制数据点
    this.sessionScores.forEach((score, index) => {
        const x = 50 + (index * 500 / (this.sessionScores.length - 1 || 1));
        const y = 10 + ((maxChartScore - score) / maxChartScore * chartHeight);
        chartHtml += `
            <circle cx="${x}" cy="${y}" r="5" fill="#5B21B6"/>
            <text x="${x}" y="${y - 10}" fill="#5B21B6" font-size="12" text-anchor="middle">${score}</text>
        `;
    });
    
    chartHtml += '</svg>';
    return chartHtml;
};

/**
 * 生成会话反馈
 */
ChallengeMode.prototype.generateSessionFeedback = function(avgScore, grade) {
    const feedbacks = {
        'S': {
            title: '🌟 卓越表现！',
            message: '你对英语句子结构的掌握已经达到了专家水平！继续保持这种优秀的状态。',
            tips: '建议尝试更高难度的挑战，进一步提升你的能力。'
        },
        'A': {
            title: '🎯 表现优秀！',
            message: '你对句子主干的识别能力很强，大部分情况下都能准确找出核心成分。',
            tips: '注意区分复杂句中的从句和修饰语，这将帮助你达到更高水平。'
        },
        'B': {
            title: '👍 继续加油！',
            message: '你已经掌握了基本的句子结构分析方法，但还有提升空间。',
            tips: '多练习识别动词短语和介词短语，注意主语和宾语的核心词。'
        },
        'C': {
            title: '💪 潜力无限！',
            message: '句子结构分析需要多加练习，你已经迈出了第一步。',
            tips: '建议先从简单句开始，熟悉基本句型后再挑战复杂句。记住：主干 = 主语 + 谓语 + 宾语/补语。'
        }
    };
    
    const feedback = feedbacks[grade];
    return `
        <h3>${feedback.title}</h3>
        <p>${feedback.message}</p>
        <p class="feedback-tips">${feedback.tips}</p>
    `;
};

/**
 * 开始新会话
 */
ChallengeMode.prototype.startNewSession = function() {
    // 重置会话数据
    this.sessionScores = [];
    this.currentChallengeIndex = 0;
    
    // 重新开始
    const difficulty = document.querySelector('.difficulty-selector .active')?.dataset.difficulty || 'medium';
    this.initChallenge(difficulty);
};
/**
 * 自动练习模式最终修复版
 * 统一处理所有功能，避免冲突
 */

(function() {
    'use strict';
    
    console.log('🚀 Loading FINAL auto-practice fix...');
    
    // 等待基础依赖
    const checkReady = setInterval(() => {
        if (typeof AutoPracticeMode !== 'undefined' && 
            window.autoPracticeMode &&
            typeof calculateReadingTime !== 'undefined') {
            clearInterval(checkReady);
            applyFinalFix();
        }
    }, 100);
    
    function applyFinalFix() {
        // 清理所有之前的修改，使用最终版本
        AutoPracticeMode.prototype.displaySentenceProgressive = function() {
            console.log('📍 FINAL displaySentenceProgressive called');
            
            // 停止之前的音频
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }
            
            const container = document.getElementById('auto-sentence-display');
            if (!container || !this.currentSentence) return;
            
            // 1. 计算阅读时间
            const timings = calculateReadingTime(this.currentSentence);
            const speedConfig = timings[this.config.speed];
            const readTime = speedConfig.original;
            
            console.log(`⏱️ Calculated reading time: ${readTime/1000}s for ${this.currentSentence.sentence.split(' ').length} words`);
            
            // 2. 创建带标注的HTML
            const annotatedHTML = this.createFullyAnnotatedHTML();
            
            // 3. 显示句子
            container.innerHTML = `
                <div class="final-practice-container">
                    <div class="stage-label">Original Sentence</div>
                    <div id="practice-sentence" class="sentence-display progressive-display stage-0">
                        ${annotatedHTML}
                    </div>
                    <div class="sentence-stats">
                        <span>📝 ${this.currentSentence.sentence.split(' ').length} words</span>
                        <span>📊 Complexity: ${this.currentSentence.complexity_score || 'N/A'}</span>
                        <span>⏱️ ${Math.round(readTime/1000)}s</span>
                    </div>
                    <div id="tts-status" class="tts-status">🎵 Playing...</div>
                </div>
            `;
            
            // 4. 播放TTS并等待
            this.playTTSWithFullDuration();
        };
        
        // 创建完整标注的HTML
        AutoPracticeMode.prototype.createFullyAnnotatedHTML = function() {
            const sentence = this.currentSentence.sentence;
            const words = sentence.split(' ');
            const components = this.currentSentence.components || {};
            const skeleton = (this.currentSentence.skeleton || '').toLowerCase().split(' ');
            
            return words.map((word, idx) => {
                const clean = word.replace(/[.,!?;:'"]/g, '');
                const punct = word.match(/[.,!?;:'"]/g) || [];
                const lower = clean.toLowerCase();
                
                let classes = ['word-token'];
                
                // 检查句子成分
                Object.entries(components).forEach(([type, text]) => {
                    if (text && text.toLowerCase().includes(lower)) {
                        classes.push(type);
                        if (skeleton.includes(lower)) {
                            classes.push('is-core');
                        }
                    }
                });
                
                // 检查从句（简单判断）
                const beforeIdx = sentence.toLowerCase().indexOf(lower);
                const beforeText = sentence.substring(0, beforeIdx);
                if (/\b(who|which|that|where|when)\b/.test(beforeText)) {
                    classes.push('in-clause');
                }
                
                // 检查状语
                if (lower.endsWith('ly') || ['ultimately', 'finally', 'deeply'].includes(lower)) {
                    classes.push('adverb');
                }
                
                return `<span class="${classes.join(' ')}">${clean}${punct.map(p => 
                    `<span class="punctuation">${p}</span>`).join('')}</span>`;
            }).join(' ');
        };
        
        // 播放TTS并确保完整时长
        AutoPracticeMode.prototype.playTTSWithFullDuration = function() {
            const statusEl = document.getElementById('tts-status');
            let audioHandled = false; // 防止重复处理
            
            // 尝试播放音频
            if (this.ttsEnabled && this.selectedVoice) {
                fetch('http://localhost:5050/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: this.currentSentence.sentence,
                        voice: this.selectedVoice || 'af_maple',
                        language: 'en'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.audio_data && !audioHandled) {
                        audioHandled = true;
                        const audio = new Audio(data.audio_data);
                        
                        // 保存音频引用，防止被垃圾回收
                        this.currentAudio = audio;
                        
                        // 重要：设置所有事件监听器
                        audio.onended = () => {
                            console.log('✅ Audio finished naturally');
                            if (statusEl) statusEl.textContent = '✅ Completed';
                            
                            // 音频播放完毕后，等待3秒
                            setTimeout(() => {
                                this.startStageTransitions();
                            }, 3000);
                        };
                        
                        audio.onerror = (e) => {
                            console.error('❌ Audio playback error:', e);
                            if (!audioHandled) {
                                audioHandled = true;
                                this.fallbackTiming();
                            }
                        };
                        
                        audio.onloadeddata = () => {
                            console.log('✅ Audio loaded, duration:', audio.duration);
                        };
                        
                        // 播放
                        audio.play().then(() => {
                            console.log('🔊 Audio playing...');
                        }).catch(err => {
                            console.error('❌ Play failed:', err);
                            if (!audioHandled) {
                                audioHandled = true;
                                this.fallbackTiming();
                            }
                        });
                    } else if (!audioHandled) {
                        audioHandled = true;
                        this.fallbackTiming();
                    }
                })
                .catch(error => {
                    console.error('❌ TTS request failed:', error);
                    if (!audioHandled) {
                        audioHandled = true;
                        this.fallbackTiming();
                    }
                });
            } else {
                this.fallbackTiming();
            }
        };
        
        // 备用时间方案
        AutoPracticeMode.prototype.fallbackTiming = function() {
            const timings = calculateReadingTime(this.currentSentence);
            const waitTime = timings[this.config.speed].original;
            
            console.log(`⏳ Using fallback timing: ${waitTime/1000}s`);
            
            setTimeout(() => {
                this.startStageTransitions();
            }, waitTime);
        };
        
        // 开始阶段过渡
        AutoPracticeMode.prototype.startStageTransitions = function() {
            console.log('🎬 Starting stage transitions');
            const sentenceEl = document.getElementById('practice-sentence');
            if (!sentenceEl) return;
            
            let stage = 1;
            const transition = () => {
                if (stage <= 4) {
                    sentenceEl.className = `sentence-display progressive-display stage-${stage}`;
                    console.log(`📍 Stage ${stage}`);
                    stage++;
                    
                    if (stage <= 4) {
                        setTimeout(transition, 2000);
                    } else {
                        setTimeout(() => {
                            this.playNextSentence();
                        }, 3000);
                    }
                }
            };
            
            transition();
        };
        
        // 添加最终样式
        if (!document.getElementById('final-practice-styles')) {
            const style = document.createElement('style');
            style.id = 'final-practice-styles';
            style.textContent = `
                .final-practice-container {
                    padding: 40px 20px;
                    text-align: center;
                }
                
                .stage-label {
                    font-size: 14px;
                    color: #6B7280;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 20px;
                }
                
                #practice-sentence {
                    font-size: 32px !important;
                    line-height: 2.4 !important;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 30px;
                }
                
                #practice-sentence .word-token {
                    display: inline-block;
                    margin: 0 3px;
                    padding: 2px 4px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                /* Stage 0 - Original */
                .stage-0 .word-token {
                    color: #1F2937;
                }
                
                /* Stage 1 - Core */
                .stage-1 .word-token {
                    color: #9CA3AF;
                }
                .stage-1 .word-token.is-core {
                    color: #1F2937;
                    font-weight: 700;
                    border-bottom: 3px solid;
                }
                .stage-1 .subject.is-core { border-color: #3B82F6; }
                .stage-1 .verb { border-color: #EF4444; color: #EF4444; font-weight: 700; }
                .stage-1 .object.is-core { border-color: #10B981; }
                
                /* Stage 2 - Clauses */
                .stage-2 .word-token.in-clause {
                    background: rgba(139, 92, 246, 0.1);
                    color: #1F2937;
                }
                
                /* Stage 3 - Adverbs */
                .stage-3 .word-token.adverb {
                    background: rgba(251, 146, 60, 0.15);
                    color: #1F2937;
                }
                
                /* Stage 4 - Complete */
                .stage-4 .word-token {
                    color: #1F2937;
                }
                .stage-4 .subject { background: rgba(59, 130, 246, 0.15); }
                .stage-4 .verb { background: rgba(239, 68, 68, 0.15); }
                .stage-4 .object { background: rgba(16, 185, 129, 0.15); }
                
                .sentence-stats {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    margin-top: 20px;
                    font-size: 14px;
                    color: #6B7280;
                }
                
                .tts-status {
                    margin-top: 15px;
                    font-size: 14px;
                    color: #6B7280;
                }
                
                .punctuation {
                    margin-left: -3px;
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('✅ FINAL fix applied successfully');
    }
})();
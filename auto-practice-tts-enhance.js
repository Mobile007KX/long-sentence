/**
 * 自动练习模式 - TTS增强 - 使用标准英语声音
 * 集成TTS语音朗读功能
 */

(function() {
    'use strict';
    
    // 确保AutoPracticeMode已经加载
    if (typeof AutoPracticeMode === 'undefined') {
        console.error('AutoPracticeMode not found. Please load auto-practice-mode.js first.');
        return;
    }
    
    // 保存原始方法
    const originalInit = AutoPracticeMode.prototype.initializeUI;
    const originalStart = AutoPracticeMode.prototype.start;
    const originalStop = AutoPracticeMode.prototype.stop;
    const originalDisplayProgressive = AutoPracticeMode.prototype.displaySentenceProgressive;
    const originalDisplayInstant = AutoPracticeMode.prototype.displaySentenceInstant;
    const originalDisplaySimple = AutoPracticeMode.prototype.displaySentenceSimple;
    
    // 添加TTS相关属性
    Object.assign(AutoPracticeMode.prototype, {
        ttsEnabled: true,
        ttsEndpoint: 'http://localhost:5050/api/generate',  // 注意端口是5050
        ttsAudio: null,
        selectedVoice: 'af_maple', // 默认使用美式女声Maple
        
        // 增强的时间设置 - 原句停留时间更长
        stageTimings: {
            slow: {
                original: 10000,    // 原句10秒（让用户有时间分析）
                skeleton: 5000,     // 主干5秒
                clauses: 5000,      // 从句5秒
                adverbs: 5000,      // 状语5秒
                complete: 8000      // 完整8秒
            },
            normal: {
                original: 7000,     // 原句7秒
                skeleton: 3000,     // 主干3秒
                clauses: 3000,      // 从句3秒
                adverbs: 3000,      // 状语3秒
                complete: 5000      // 完整5秒
            },
            fast: {
                original: 5000,     // 原句5秒
                skeleton: 1500,     // 主干1.5秒
                clauses: 1500,      // 从句1.5秒
                adverbs: 1500,      // 状语1.5秒
                complete: 2500      // 完整2.5秒
            }
        }
    });
    
    // 增强初始化UI方法
    AutoPracticeMode.prototype.initializeUI = function(container) {
        // 调用原始方法
        originalInit.call(this, container);
        
        // 添加TTS控制区域
        const controlPanel = container.querySelector('.control-panel');
        if (controlPanel) {
            const ttsControlHtml = `
                <!-- TTS控制 -->
                <div class="tts-controls" style="margin-top: 20px; padding: 15px; background: #f8f8f8; border-radius: 8px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 30px;">
                        <div class="tts-toggle" style="display: flex; align-items: center; gap: 12px;">
                            <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 26px;">
                                <input type="checkbox" id="tts-enable" checked style="opacity: 0; width: 0; height: 0;">
                                <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 26px;">
                                    <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                                </span>
                            </label>
                            <span>Enable Voice</span>
                        </div>
                        
                        <div class="voice-selector" id="voice-selector" style="display: flex; align-items: center; gap: 12px;">
                            <label>Voice:</label>
                            <select id="voice-select" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #ddd;">
                                <optgroup label="English Voices">
                                    <option value="af_maple" selected>Maple (American Female)</option>
                                    <option value="af_sol">Sol (American Female)</option>
                                    <option value="bf_vale">Vale (British Female)</option>
                                </optgroup>
                                <optgroup label="Chinese Female">
                                    <option value="zf_001">Female 001</option>
                                    <option value="zf_002">Female 002</option>
                                    <option value="zf_003">Female 003</option>
                                </optgroup>
                                <optgroup label="Chinese Male">
                                    <option value="zm_009">Male 009</option>
                                    <option value="zm_010">Male 010</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                    
                    <!-- TTS服务状态 -->
                    <div class="tts-status" id="tts-status" style="display: none; margin-top: 10px; text-align: center; color: #d97706;">
                        <span class="status-icon">⚠️</span>
                        <span class="status-text">TTS service is not running. Voice reading will be disabled.</span>
                    </div>
                </div>
            `;
            
            // 在主控制按钮前插入
            const mainControls = controlPanel.querySelector('.main-controls');
            if (mainControls) {
                mainControls.insertAdjacentHTML('beforebegin', ttsControlHtml);
            }
            
            // 添加音频元素
            if (!document.getElementById('tts-audio')) {
                const audioEl = document.createElement('audio');
                audioEl.id = 'tts-audio';
                audioEl.style.display = 'none';
                document.body.appendChild(audioEl);
            }
            
            // 绑定事件
            this.bindTTSEvents();
            
            // 检查TTS服务
            this.checkTTSService();
        }
        
        // 添加倒计时显示
        const displayArea = container.querySelector('.sentence-display-area');
        if (displayArea) {
            const hintHtml = `
                <div class="stage-hint" id="stage-hint" style="display: none;">
                    <span class="countdown-text"></span>
                </div>
            `;
            displayArea.insertAdjacentHTML('beforeend', hintHtml);
        }
    };
    
    // 绑定TTS事件
    AutoPracticeMode.prototype.bindTTSEvents = function() {
        const ttsToggle = document.getElementById('tts-enable');
        if (ttsToggle) {
            ttsToggle.addEventListener('change', (e) => {
                this.ttsEnabled = e.target.checked;
                document.getElementById('voice-selector').style.opacity = e.target.checked ? '1' : '0.5';
            });
            
            // 初始化开关样式
            if (ttsToggle.checked) {
                const slider = ttsToggle.nextElementSibling;
                if (slider) {
                    slider.style.backgroundColor = '#5B21B6';
                    const handle = slider.firstElementChild;
                    if (handle) {
                        handle.style.transform = 'translateX(24px)';
                    }
                }
            }
        }
        
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.selectedVoice = e.target.value;
            });
        }
    };
    
    // 检查TTS服务
    AutoPracticeMode.prototype.checkTTSService = async function() {
        try {
            const response = await fetch('http://localhost:5050/api/status', {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            
            if (response.ok) {
                console.log('✅ TTS service is running');
                const statusEl = document.getElementById('tts-status');
                if (statusEl) {
                    statusEl.style.display = 'none';
                }
                return true;
            }
        } catch (error) {
            console.warn('TTS service not available:', error.message);
            const statusEl = document.getElementById('tts-status');
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.innerHTML = '<span class="status-icon">⚠️</span><span class="status-text">TTS service is not running. Voice reading will be disabled.</span>';
            }
        }
        return false;
    };
    
    // 生成TTS语音
    AutoPracticeMode.prototype.generateTTS = async function(text) {
        if (!this.ttsEnabled || !text) return;
        
        try {
            const response = await fetch(this.ttsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voice: this.selectedVoice,
                    language: 'en'  // 明确指定英语
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'TTS generation failed');
            }
            
            const data = await response.json();
            
            // 播放音频
            if (data.audio) {
                this.playAudio(data.audio);
            }
        } catch (error) {
            console.error('TTS error:', error);
            // 静默失败，不影响文本展示
        }
    };
    
    // 播放音频（从data URL）
    AutoPracticeMode.prototype.playAudio = function(audioDataUrl) {
        if (!audioDataUrl || !this.ttsEnabled) return;
        
        // 停止当前播放
        this.stopAudio();
        
        // 直接设置data URL
        this.ttsAudio = new Audio(audioDataUrl);
        
        // 播放
        this.ttsAudio.play().catch(err => {
            console.error('Audio playback failed:', err);
        });
        
        this.ttsAudio.addEventListener('ended', () => {
            this.ttsAudio = null;
        });
    };
    
    // 停止音频
    AutoPracticeMode.prototype.stopAudio = function() {
        if (this.ttsAudio) {
            this.ttsAudio.pause();
            this.ttsAudio = null;
        }
    };
    
    // 开始倒计时
    AutoPracticeMode.prototype.startCountdown = function(seconds) {
        const hintEl = document.getElementById('stage-hint');
        if (!hintEl) return;
        
        const countdownEl = hintEl.querySelector('.countdown-text');
        if (!countdownEl) return;
        
        let remaining = seconds;
        
        // 清除之前的倒计时
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // 更新显示
        const updateDisplay = () => {
            countdownEl.textContent = `Reading time: ${remaining}s`;
        };
        
        updateDisplay();
        
        // 开始倒计时
        this.countdownInterval = setInterval(() => {
            remaining--;
            if (remaining >= 0) {
                updateDisplay();
            } else {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    };
    
    // 增强渐进式显示
    AutoPracticeMode.prototype.displaySentenceProgressive = function() {
        const container = document.getElementById('auto-sentence-display');
        this.currentStage = 0;
        
        // 先显示原句并播放TTS
        container.innerHTML = `
            <div class="original-sentence-display">
                <div class="stage-label">Original Sentence</div>
                <div class="sentence-text">${this.currentSentence.sentence}</div>
            </div>
        `;
        
        // 播放TTS
        this.generateTTS(this.currentSentence.sentence);
        
        // 开始倒计时
        this.startCountdown(this.stageTimings[this.config.speed].original / 1000);
        
        // 等待后继续原来的逻辑
        setTimeout(() => {
            this.stopAudio();
            if (originalDisplayProgressive) {
                originalDisplayProgressive.call(this);
            }
        }, this.stageTimings[this.config.speed].original);
    };
    
    // 增强直接显示
    AutoPracticeMode.prototype.displaySentenceInstant = function() {
        const container = document.getElementById('auto-sentence-display');
        const timing = this.stageTimings[this.config.speed];
        
        // 先显示原句
        container.innerHTML = `
            <div class="original-sentence-display">
                <div class="stage-label">Original Sentence</div>
                <div class="sentence-text">${this.currentSentence.sentence}</div>
            </div>
        `;
        
        // 播放TTS
        this.generateTTS(this.currentSentence.sentence);
        
        // 开始倒计时
        this.startCountdown(timing.original / 1000);
        
        // 等待后显示分析
        setTimeout(() => {
            this.stopAudio();
            if (originalDisplayInstant) {
                originalDisplayInstant.call(this);
            }
        }, timing.original);
    };
    
    // 增强停止方法
    AutoPracticeMode.prototype.stop = function() {
        // 停止音频
        this.stopAudio();
        
        // 清理倒计时
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // 调用原始停止方法
        if (originalStop) {
            originalStop.call(this);
        }
    };
    
    console.log('✅ TTS Enhancement (English Voices) loaded successfully');
})();
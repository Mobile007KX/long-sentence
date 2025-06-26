/**
 * 自动练习模式TTS增强补丁
 * 为原始的auto-practice-mode.js添加TTS支持
 */

(function() {
    // 确保AutoPracticeMode存在
    if (typeof AutoPracticeMode === 'undefined') {
        console.error('AutoPracticeMode not found!');
        return;
    }

    // 保存原始方法
    const originalInit = AutoPracticeMode.prototype.initializeUI;
    const originalStart = AutoPracticeMode.prototype.start;
    const originalStop = AutoPracticeMode.prototype.stop;
    const originalDisplayProgressive = AutoPracticeMode.prototype.displaySentenceProgressive;
    const originalDisplayInstant = AutoPracticeMode.prototype.displaySentenceInstant;
    const originalDisplaySimple = AutoPracticeMode.prototype.displaySentenceSimple;

    // 添加TTS相关属性到原型
    Object.assign(AutoPracticeMode.prototype, {
        ttsEnabled: true,
        ttsEndpoint: 'http://localhost:5050/api/generate', // Kokoro TTS API endpoint - 正确的路径
        currentAudio: null,
        selectedVoice: 'zf_001', // 默认使用女声001
        
        // 增强的时间设置 - 原句停留时间更长
        enhancedTimings: {
            slow: {
                original: 10000,    // 原句10秒
                other: 5000        // 其他阶段5秒
            },
            normal: {
                original: 7000,     // 原句7秒
                other: 3000        // 其他阶段3秒
            },
            fast: {
                original: 5000,     // 原句5秒
                other: 2000        // 其他阶段2秒
            }
        }
    });

    // 增强初始化UI方法，添加TTS控制
    AutoPracticeMode.prototype.initializeUI = function(container) {
        // 调用原始方法
        originalInit.call(this, container);
        
        // 在控制面板后添加TTS设置
        const controlPanel = container.querySelector('.control-panel');
        if (controlPanel) {
            const ttsSettingsHtml = `
                <div class="tts-settings" style="margin: 20px 0; padding: 20px; background: #f3f0ff; border-radius: 12px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 30px;">
                        <div class="tts-toggle" style="display: flex; align-items: center; gap: 12px;">
                            <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 26px;">
                                <input type="checkbox" id="tts-enable" checked style="opacity: 0; width: 0; height: 0;">
                                <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 26px;">
                                    <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                                </span>
                            </label>
                            <span>启用语音朗读</span>
                        </div>
                        
                        <div class="voice-selector" id="voice-selector">
                            <label>选择音色：</label>
                            <select id="voice-select" style="padding: 8px 16px; border: 2px solid #e5e7eb; border-radius: 8px;">
                                <optgroup label="女声">
                                    <option value="zf_001" selected>女声001（温柔）</option>
                                    <option value="zf_002">女声002（清新）</option>
                                    <option value="zf_003">女声003（活泼）</option>
                                    <option value="zf_004">女声004（知性）</option>
                                    <option value="zf_005">女声005（甜美）</option>
                                </optgroup>
                                <optgroup label="男声">
                                    <option value="zm_009">男声009（成熟）</option>
                                    <option value="zm_010">男声010（阳光）</option>
                                    <option value="zm_011">男声011（稳重）</option>
                                    <option value="zm_012">男声012（磁性）</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                    
                    <div class="tts-status" id="tts-status" style="display: none; margin-top: 15px; padding: 10px; background: #fef3c7; border-radius: 8px; text-align: center;">
                        <span style="color: #92400e;">🔊 TTS服务未连接</span>
                    </div>
                </div>
            `;
            
            // 在主控制按钮前插入
            const mainControls = controlPanel.querySelector('.main-controls');
            if (mainControls) {
                mainControls.insertAdjacentHTML('beforebegin', ttsSettingsHtml);
            }
            
            // 添加音频元素
            if (!document.getElementById('tts-audio')) {
                container.insertAdjacentHTML('beforeend', '<audio id="tts-audio" style="display: none;"></audio>');
            }
            
            // 绑定TTS事件
            this.bindTTSEvents();
            
            // 检查TTS服务
            this.checkTTSService();
        }
        
        // 添加倒计时显示
        const displayArea = container.querySelector('.sentence-display-area');
        if (displayArea && !document.getElementById('stage-hint')) {
            displayArea.insertAdjacentHTML('beforeend', `
                <div class="stage-hint" id="stage-hint" style="display: none; position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 12px 24px; border-radius: 24px;">
                    <span class="hint-text">原句展示中，请仔细分析句子结构...</span>
                    <span class="countdown" id="countdown" style="margin-left: 16px; font-weight: bold; color: #fbbf24;"></span>
                </div>
            `);
        }
    };

    // 绑定TTS事件
    AutoPracticeMode.prototype.bindTTSEvents = function() {
        const ttsToggle = document.getElementById('tts-enable');
        if (ttsToggle) {
            ttsToggle.addEventListener('change', (e) => {
                this.ttsEnabled = e.target.checked;
                document.getElementById('voice-selector').style.opacity = this.ttsEnabled ? '1' : '0.5';
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
                mode: 'cors'
            });
            
            if (response.ok) {
                console.log('✅ Kokoro TTS服务已连接');
                const statusEl = document.getElementById('tts-status');
                if (statusEl) {
                    statusEl.style.display = 'none';
                }
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Kokoro TTS服务未启动');
            const statusEl = document.getElementById('tts-status');
            if (statusEl) {
                statusEl.style.display = 'block';
                statusEl.innerHTML = '<span style="color: #92400e;">🔊 TTS服务未启动（请运行 start-tts.sh）</span>';
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
                    language: 'zh'  // 添加语言参数
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'TTS生成失败');
            }
            
            const data = await response.json();
            
            if (data.success && data.audio_data) {
                // 播放音频 - 注意是audio_data不是audio_base64
                this.playAudioFromDataURL(data.audio_data);
            }
        } catch (error) {
            console.error('TTS错误:', error);
            // 静默失败，不影响文本展示
        }
    };

    // 播放音频（从data URL）
    AutoPracticeMode.prototype.playAudioFromDataURL = function(audioDataURL) {
        const audio = document.getElementById('tts-audio');
        if (audio) {
            // 停止当前播放
            audio.pause();
            
            // 直接设置data URL
            audio.src = audioDataURL;
            
            // 播放
            audio.play().catch(err => {
                console.error('音频播放失败:', err);
            });
            
            this.currentAudio = audio;
        }
    };

    // 停止音频
    AutoPracticeMode.prototype.stopAudio = function() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
    };

    // 倒计时
    AutoPracticeMode.prototype.startCountdown = function(seconds) {
        const countdownEl = document.getElementById('countdown');
        const hintEl = document.getElementById('stage-hint');
        
        if (!countdownEl || !hintEl) return;
        
        hintEl.style.display = 'block';
        let remaining = seconds;
        countdownEl.textContent = `${remaining}秒`;
        
        const countdownInterval = setInterval(() => {
            remaining--;
            if (remaining >= 0) {
                countdownEl.textContent = `${remaining}秒`;
            } else {
                clearInterval(countdownInterval);
                hintEl.style.display = 'none';
            }
        }, 1000);
        
        // 保存interval以便清理
        this.countdownInterval = countdownInterval;
    };

    // 增强的渐进显示
    AutoPracticeMode.prototype.displaySentenceProgressive = function() {
        const container = document.getElementById('auto-sentence-display');
        const timing = this.enhancedTimings[this.config.speed] || this.enhancedTimings.normal;
        
        // 先显示原句
        container.innerHTML = `
            <div class="original-sentence-display" style="text-align: center; padding: 40px;">
                <div class="stage-label" style="font-size: 16px; color: #6b7280; margin-bottom: 30px;">原始句子</div>
                <div class="sentence-text" style="font-size: 32px; line-height: 1.8; color: #1a1a1a;">${this.currentSentence.sentence}</div>
            </div>
        `;
        
        // 播放TTS
        this.generateTTS(this.currentSentence.sentence);
        
        // 开始倒计时
        this.startCountdown(timing.original / 1000);
        
        // 等待后继续原来的逻辑
        setTimeout(() => {
            this.stopAudio();
            if (originalDisplayProgressive) {
                originalDisplayProgressive.call(this);
            }
        }, timing.original);
    };

    // 增强的即时显示
    AutoPracticeMode.prototype.displaySentenceInstant = function() {
        const container = document.getElementById('auto-sentence-display');
        const timing = this.enhancedTimings[this.config.speed] || this.enhancedTimings.normal;
        
        // 先显示原句
        container.innerHTML = `
            <div class="original-sentence-display" style="text-align: center; padding: 40px;">
                <div class="stage-label" style="font-size: 16px; color: #6b7280; margin-bottom: 30px;">原始句子</div>
                <div class="sentence-text" style="font-size: 32px; line-height: 1.8; color: #1a1a1a;">${this.currentSentence.sentence}</div>
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

    console.log('✅ AutoPracticeMode TTS增强加载完成');
})();
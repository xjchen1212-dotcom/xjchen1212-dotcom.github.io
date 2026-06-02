class AtmospherePlayer {
    constructor() {
        this.init();
    }

    init() {
        // 番茄钟状态
        this.isRunning = false;
        this.isPaused = false;
        this.mode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
        this.focusTime = 25 * 60; // 25分钟
        this.shortBreakTime = 5 * 60; // 5分钟
        this.longBreakTime = 15 * 60; // 15分钟
        this.timeLeft = this.focusTime;
        this.sessions = 0;
        this.timer = null;
        this.audioCache = {};
        this.currentAudio = null;
        this.currentSound = 'rain';
        this.volume = 0.5;

        // 音频文件映射
        this.audioFiles = {
            'rain': 'audio/rain.mp3',
            'stream': 'audio/stream.mp3',
            'fire': 'audio/fire.mp3',
            'bell': 'audio/bell.mp3',
            'white': 'audio/white.mp3'
        };

        this.setupElements();
        this.setupEventListeners();
        this.updateTime();
        this.loadSettings();
        this.startClock();
    }

    setupElements() {
        // 获取DOM元素
        this.elements = {
            currentTime: document.getElementById('current-time'),
            currentDate: document.getElementById('current-date'),
            timer: document.getElementById('timer'),
            timerLabel: document.getElementById('timer-label'),
            modeIndicator: document.getElementById('mode-indicator'),
            sessionCount: document.getElementById('session-count'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            volumeSlider: document.getElementById('volume-slider'),
            volumeValue: document.getElementById('volume-value'),
            statusMessage: document.getElementById('status-message'),
            soundButtons: document.querySelectorAll('.sound-btn')
        };

        // 音频元素
        this.audioElements = {
            'rain': document.getElementById('rain-audio'),
            'stream': document.getElementById('stream-audio'),
            'fire': document.getElementById('fire-audio'),
            'bell': document.getElementById('bell-audio'),
            'white': document.getElementById('white-audio')
        };

        // 设置初始音量
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = this.volume;
        });
    }

    setupEventListeners() {
        // 番茄钟控制
        this.elements.startBtn.addEventListener('click', () => this.startTimer());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.elements.resetBtn.addEventListener('click', () => this.resetTimer());

        // 白噪音选择
        this.elements.soundButtons.forEach(button => {
            button.addEventListener('click', () => this.selectSound(button));
        });

        // 音量控制
        this.elements.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning && !this.isPaused) {
                    this.pauseTimer();
                } else {
                    this.startTimer();
                }
            } else if (e.code === 'Escape') {
                this.resetTimer();
            } else if (e.code === 'KeyM') {
                this.toggleMute();
            }
        });

        // 预加载音频
        this.preloadAudio();
    }

    preloadAudio() {
        // 预加载所有音频
        Object.entries(this.audioFiles).forEach(([key, src]) => {
            this.audioCache[key] = new Audio();
            this.audioCache[key].src = src;
            this.audioCache[key].preload = 'auto';
            this.audioCache[key].loop = true;
            this.audioCache[key].volume = this.volume;
        });
    }

    loadSettings() {
        // 加载保存的设置
        const savedSettings = localStorage.getItem('atmosphereSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.volume = settings.volume || 0.5;
            this.currentSound = settings.currentSound || 'rain';
            
            // 应用设置
            this.setVolume(this.volume);
            this.selectSoundByName(this.currentSound);
            
            // 恢复番茄钟状态
            if (settings.timeLeft && settings.mode) {
                this.timeLeft = settings.timeLeft;
                this.mode = settings.mode;
                this.sessions = settings.sessions || 0;
                this.updateDisplay();
            }
        }
    }

    saveSettings() {
        const settings = {
            volume: this.volume,
            currentSound: this.currentSound,
            timeLeft: this.timeLeft,
            mode: this.mode,
            sessions: this.sessions
        };
        localStorage.setItem('atmosphereSettings', JSON.stringify(settings));
    }

    startClock() {
        // 更新当前时间
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
        const dateString = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        this.elements.currentTime.textContent = timeString;
        this.elements.currentDate.textContent = dateString;
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.updateButtonStates();
            this.startAudio();
            
            // 显示开始消息
            this.showMessage('专注开始，祝您文思泉涌...');
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.completeSession();
                }
            }, 1000);
            
            // 添加呼吸效果
            document.querySelector('.pomodoro-display').classList.add('active', 'breathe');
        } else if (this.isPaused) {
            this.isPaused = false;
            this.updateButtonStates();
            this.showMessage('继续专注...');
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.completeSession();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.timer);
            this.updateButtonStates();
            this.pauseAudio();
            this.showMessage('已暂停，随时可以继续...');
            
            // 移除呼吸效果
            document.querySelector('.pomodoro-display').classList.remove('breathe');
        }
    }

    resetTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.isPaused = false;
        
        // 重置为当前模式的默认时间
        switch(this.mode) {
            case 'focus':
                this.timeLeft = this.focusTime;
                break;
            case 'shortBreak':
                this.timeLeft = this.shortBreakTime;
                break;
            case 'longBreak':
                this.timeLeft = this.longBreakTime;
                break;
        }
        
        this.updateDisplay();
        this.updateButtonStates();
        this.pauseAudio();
        this.showMessage('已重置，准备开始新的专注...');
        
        // 移除动画效果
        const display = document.querySelector('.pomodoro-display');
        display.classList.remove('active', 'breathe');
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.elements.timer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新标签
        let label = '';
        let modeText = '';
        
        switch(this.mode) {
            case 'focus':
                label = '专注时间';
                modeText = '专注中';
                break;
            case 'shortBreak':
                label = '短休息';
                modeText = '短休息';
                break;
            case 'longBreak':
                label = '长休息';
                modeText = '长休息';
                break;
        }
        
        this.elements.timerLabel.textContent = label;
        this.elements.modeIndicator.textContent = modeText;
        this.elements.sessionCount.textContent = this.sessions;
        
        // 自动保存
        this.saveSettings();
    }

    updateButtonStates() {
        this.elements.startBtn.disabled = this.isRunning && !this.isPaused;
        this.elements.pauseBtn.disabled = !this.isRunning || this.isPaused;
        this.elements.resetBtn.disabled = !this.isRunning && !this.isPaused;
        
        // 更新按钮文本
        if (!this.isRunning) {
            this.elements.startBtn.querySelector('.btn-text').textContent = '开始';
            this.elements.startBtn.querySelector('.btn-icon').textContent = '▶';
        } else if (this.isPaused) {
            this.elements.startBtn.querySelector('.btn-text').textContent = '继续';
            this.elements.startBtn.querySelector('.btn-icon').textContent = '▶';
        } else {
            this.elements.startBtn.querySelector('.btn-text').textContent = '运行中';
            this.elements.startBtn.querySelector('.btn-icon').textContent = '⏵';
        }
    }

    completeSession() {
        clearInterval(this.timer);
        this.isRunning = false;
        
        // 播放完成音效
        this.playEndSound();
        
        // 根据当前模式切换
        if (this.mode === 'focus') {
            this.sessions++;
            
            if (this.sessions % 4 === 0) {
                this.mode = 'longBreak';
                this.timeLeft = this.longBreakTime;
                this.showMessage('完成一轮专注！开始长休息，好好放松一下吧...');
            } else {
                this.mode = 'shortBreak';
                this.timeLeft = this.shortBreakTime;
                this.showMessage('专注完成！开始短休息，活动一下身体...');
            }
        } else {
            this.mode = 'focus';
            this.timeLeft = this.focusTime;
            this.showMessage('休息结束，准备开始新的专注...');
        }
        
        this.updateDisplay();
        this.updateButtonStates();
        this.pauseAudio();
        
        // 移除动画效果
        const display = document.querySelector('.pomodoro-display');
        display.classList.remove('active', 'breathe');
        
        // 添加落叶动画（休息时）
        if (this.mode !== 'focus') {
            this.createLeaves();
        }
        
        // 发送浏览器通知
        this.sendNotification();
    }

    selectSound(button) {
        const sound = button.dataset.sound;
        
        // 更新按钮状态
        this.elements.soundButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        this.playSound(sound);
    }

    selectSoundByName(soundName) {
        const button = document.querySelector(`[data-sound="${soundName}"]`);
        if (button) {
            this.selectSound(button);
        }
    }

    playSound(sound) {
        this.currentSound = sound;
        
        // 停止当前音频
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        
        if (sound !== 'none') {
            // 播放新音频
            this.currentAudio = this.audioCache[sound] || this.audioElements[sound];
            if (this.currentAudio) {
                this.currentAudio.volume = this.volume;
                this.currentAudio.currentTime = 0;
                this.currentAudio.play().catch(e => {
                    console.log('音频播放失败:', e);
                });
            }
        }
        
        this.saveSettings();
    }

    startAudio() {
        if (this.currentSound && this.currentSound !== 'none') {
            this.playSound(this.currentSound);
        }
    }

    pauseAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
    }

    setVolume(value) {
        this.volume = value;
        
        // 更新所有音频元素的音量
        Object.values(this.audioElements).forEach(audio => {
            audio.volume = value;
        });
        
        Object.values(this.audioCache).forEach(audio => {
            audio.volume = value;
        });
        
        // 更新UI
        this.elements.volumeSlider.value = value * 100;
        this.elements.volumeValue.textContent = `${Math.round(value * 100)}%`;
        
        this.saveSettings();
    }

    toggleMute() {
        if (this.volume > 0) {
            this.setVolume(0);
            this.showMessage('已静音');
        } else {
            this.setVolume(0.5);
            this.showMessage('音量已恢复');
        }
    }

    playEndSound() {
        const endSound = document.getElementById('end-sound');
        if (endSound) {
            endSound.volume = this.volume;
            endSound.currentTime = 0;
            endSound.play().catch(e => {
                console.log('完成音效播放失败:', e);
            });
        }
    }

    showMessage(message) {
        this.elements.statusMessage.textContent = message;
        
        // 添加淡入效果
        this.elements.statusMessage.style.opacity = '0';
        setTimeout(() => {
            this.elements.statusMessage.style.transition = 'opacity 0.3s ease';
            this.elements.statusMessage.style.opacity = '1';
        }, 10);
    }

    createLeaves() {
        const container = document.querySelector('.container');
        const leafCount = 15;
        
        for (let i = 0; i < leafCount; i++) {
            setTimeout(() => {
                const leaf = document.createElement('div');
                leaf.className = 'leaf';
                leaf.textContent = '🍂';
                leaf.style.left = `${Math.random() * 100}%`;
                leaf.style.animationDelay = `${Math.random() * 2}s`;
                container.appendChild(leaf);
                
                // 移除叶子
                setTimeout(() => {
                    leaf.remove();
                }, 5000);
            }, i * 200);
        }
    }

    sendNotification() {
        if (!("Notification" in window)) {
            return;
        }
        
        if (Notification.permission === "granted") {
            let title, body;
            
            if (this.mode === 'focus') {
                title = "休息结束";
                body = "准备开始新的专注时间";
            } else {
                title = "专注完成";
                body = this.mode === 'longBreak' ? 
                    "开始长休息（15分钟）" : 
                    "开始短休息（5分钟）";
            }
            
            new Notification(title, { body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.sendNotification();
                }
            });
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new AtmospherePlayer();
    
    // 请求通知权限
    if ("Notification" in window && Notification.permission === "default") {
        setTimeout(() => {
            Notification.requestPermission();
        }, 1000);
    }
});
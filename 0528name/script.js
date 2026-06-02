/**
 * 小说人物名生成器 - 主逻辑和交互
 * 负责UI交互、事件处理、页面更新
 */

// 应用状态
let appState = {
    currentMode: 'single', // single, batch, custom
    currentGender: 'male',
    currentStyle: 'all',
    wordCount: 2,
    surnameType: 'random',
    fixedSurname: '',
    generateCount: 1,
    avoidSameSound: true,
    balanceTone: true,
    nameStructure: 'random',
    showAdvanced: false
};

// DOM元素
let domElements = {};

// 初始化应用
function initApp() {
    console.log('初始化小说人物名生成器...');
    
    // 缓存DOM元素
    cacheDOMElements();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 恢复用户设置
    restoreUserSettings();
    
    // 加载收藏和历史
    loadCollection();
    loadHistory();
    updateStats();
    
    // 生成今日灵感
    generateDailyInsight();
    
    // 显示欢迎消息
    setTimeout(() => {
        showToast('欢迎使用创名阁！点击"生成名字"开始创作。', 'success');
    }, 1000);
    
    console.log('应用初始化完成');
}

// 缓存DOM元素
function cacheDOMElements() {
    domElements = {
        // 控制面板
        modeButtons: document.querySelectorAll('[data-mode]'),
        genderButtons: document.querySelectorAll('[data-gender]'),
        styleTags: document.querySelectorAll('[data-style]'),
        wordCountSlider: document.getElementById('wordCountSlider'),
        wordCountValue: document.getElementById('wordCountValue'),
        randomSurname: document.getElementById('randomSurname'),
        fixedSurname: document.getElementById('fixedSurname'),
        surnameInput: document.getElementById('surnameInput'),
        generateCount: document.getElementById('generateCount'),
        generateBtn: document.getElementById('generateBtn'),
        advancedToggle: document.getElementById('advancedToggle'),
        advancedOptions: document.getElementById('advancedOptions'),
        avoidSameSound: document.getElementById('avoidSameSound'),
        balanceTone: document.getElementById('balanceTone'),
        nameStructure: document.getElementById('nameStructure'),
        
        // 显示面板
        mainName: document.getElementById('mainName'),
        nameTags: document.getElementById('nameTags'),
        nameMeaning: document.getElementById('nameMeaning'),
        batchResults: document.getElementById('batchResults'),
        collectionSection: document.getElementById('collectionSection'),
        collectionList: document.getElementById('collectionList'),
        
        // 操作按钮
        likeBtn: document.getElementById('likeBtn'),
        copyBtn: document.getElementById('copyBtn'),
        regenerateOneBtn: document.getElementById('regenerateOneBtn'),
        detailsBtn: document.getElementById('detailsBtn'),
        copyAllBtn: document.getElementById('copyAllBtn'),
        exportBtn: document.getElementById('exportBtn'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        randomAllBtn: document.getElementById('randomAllBtn'),
        
        // 信息面板
        insightName: document.getElementById('insightName'),
        insightDesc: document.getElementById('insightDesc'),
        historyList: document.getElementById('historyList'),
        totalGenerated: document.getElementById('totalGenerated'),
        totalLiked: document.getElementById('totalLiked'),
        favStyle: document.getElementById('favStyle'),
        
        // 模态框
        nameModal: document.getElementById('nameModal'),
        modalClose: document.getElementById('modalClose'),
        modalContent: document.getElementById('modalContent'),
        
        // 导航
        navHome: document.getElementById('nav-home'),
        navCollection: document.getElementById('nav-collection'),
        navAbout: document.getElementById('nav-about')
    };
}

// 初始化事件监听器
function initEventListeners() {
    // 模式切换
    domElements.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
    
    // 性别选择
    domElements.genderButtons.forEach(btn => {
        btn.addEventListener('click', () => selectGender(btn.dataset.gender));
    });
    
    // 风格选择
    domElements.styleTags.forEach(tag => {
        tag.addEventListener('click', () => selectStyle(tag.dataset.style));
    });
    
    // 字数滑块
    domElements.wordCountSlider.addEventListener('input', updateWordCount);
    
    // 姓氏控制
    domElements.randomSurname.addEventListener('change', updateSurnameControl);
    domElements.fixedSurname.addEventListener('change', updateSurnameControl);
    domElements.surnameInput.addEventListener('input', updateFixedSurname);
    
    // 生成数量
    domElements.generateCount.addEventListener('change', updateGenerateCount);
    
    // 生成按钮
    domElements.generateBtn.addEventListener('click', generateNames);
    
    // 高级选项
    domElements.advancedToggle.addEventListener('change', toggleAdvancedOptions);
    domElements.avoidSameSound.addEventListener('change', updateAdvancedOptions);
    domElements.balanceTone.addEventListener('change', updateAdvancedOptions);
    domElements.nameStructure.addEventListener('change', updateAdvancedOptions);
    
    // 操作按钮
    domElements.likeBtn.addEventListener('click', toggleLike);
    domElements.copyBtn.addEventListener('click', copyCurrentName);
    domElements.regenerateOneBtn.addEventListener('click', regenerateOne);
    domElements.detailsBtn.addEventListener('click', showNameDetails);
    domElements.copyAllBtn.addEventListener('click', copyAllNames);
    domElements.exportBtn.addEventListener('click', exportCollection);
    domElements.clearHistoryBtn.addEventListener('click', clearHistory);
    domElements.randomAllBtn.addEventListener('click', randomizeAll);
    
    // 模态框
    domElements.modalClose.addEventListener('click', hideNameModal);
    domElements.nameModal.addEventListener('click', (e) => {
        if (e.target === domElements.nameModal) {
            hideNameModal();
        }
    });
    
    // 导航
    domElements.navHome.addEventListener('click', (e) => {
        e.preventDefault();
        switchToHome();
    });
    
    domElements.navCollection.addEventListener('click', (e) => {
        e.preventDefault();
        switchToCollection();
    });
    
    domElements.navAbout.addEventListener('click', (e) => {
        e.preventDefault();
        showAbout();
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 切换模式
function switchMode(mode) {
    appState.currentMode = mode;
    
    // 更新UI
    domElements.modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // 显示/隐藏批量结果区域
    if (mode === 'batch') {
        domElements.batchResults.style.display = 'grid';
    } else {
        domElements.batchResults.style.display = 'none';
    }
    
    saveUserSettings();
}

// 选择性别
function selectGender(gender) {
    appState.currentGender = gender;
    
    domElements.genderButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gender === gender);
    });
    
    saveUserSettings();
}

// 选择风格
function selectStyle(style) {
    appState.currentStyle = style;
    
    domElements.styleTags.forEach(tag => {
        tag.classList.toggle('active', tag.dataset.style === style);
    });
    
    saveUserSettings();
}

// 更新字数
function updateWordCount() {
    appState.wordCount = parseInt(domElements.wordCountSlider.value);
    domElements.wordCountValue.textContent = appState.wordCount;
    saveUserSettings();
}

// 更新姓氏控制
function updateSurnameControl() {
    appState.surnameType = domElements.fixedSurname.checked ? 'fixed' : 'random';
    domElements.surnameInput.disabled = !domElements.fixedSurname.checked;
    
    if (domElements.fixedSurname.checked) {
        domElements.surnameInput.focus();
    }
    
    saveUserSettings();
}

// 更新固定姓氏
function updateFixedSurname() {
    appState.fixedSurname = domElements.surnameInput.value.trim();
    saveUserSettings();
}

// 更新生成数量
function updateGenerateCount() {
    appState.generateCount = parseInt(domElements.generateCount.value);
    saveUserSettings();
}

// 切换高级选项
function toggleAdvancedOptions() {
    appState.showAdvanced = domElements.advancedToggle.checked;
    domElements.advancedOptions.style.display = appState.showAdvanced ? 'block' : 'none';
    saveUserSettings();
}

// 更新高级选项
function updateAdvancedOptions() {
    appState.avoidSameSound = domElements.avoidSameSound.checked;
    appState.balanceTone = domElements.balanceTone.checked;
    appState.nameStructure = domElements.nameStructure.value;
    saveUserSettings();
}

// 生成名字
function generateNames() {
    const config = {
        gender: appState.currentGender,
        style: appState.currentStyle,
        wordCount: appState.wordCount,
        surnameType: appState.surnameType,
        fixedSurname: appState.fixedSurname,
        avoidSameSound: appState.avoidSameSound,
        balanceTone: appState.balanceTone
    };
    
    if (appState.currentMode === 'single') {
        // 生成单个名字
        const nameInfo = window.nameGenerator.generateName(config);
        updateNameDisplay(nameInfo);
        window.nameGenerator.addToHistory(nameInfo);
        updateHistory();
    } else {
        // 批量生成
        const count = appState.generateCount;
        const names = window.nameGenerator.generateBatch(config, count);
        updateBatchResults(names);
        
        // 显示第一个名字为主名字
        if (names.length > 0) {
            updateNameDisplay(names[0]);
            window.nameGenerator.addToHistory(names[0]);
        }
        
        updateHistory();
    }
    
    updateStats();
    
    // 动画效果
    animateGeneration();
}

// 更新名字显示
function updateNameDisplay(nameInfo) {
    if (!nameInfo) return;
    
    // 更新主名字
    domElements.mainName.textContent = nameInfo.name;
    
    // 更新标签
    const genderDesc = genderDescriptions[nameInfo.gender] || '未知';
    const styleDesc = styleDescriptions[nameInfo.style] || '通用';
    const keywords = window.nameGenerator.getCharacterKeywords(nameInfo.style);
    const randomKeywords = [...keywords].sort(() => Math.random() - 0.5).slice(0, 3);
    
    domElements.nameTags.innerHTML = `
        <div class="name-tag">${styleDesc}</div>
        <div class="name-tag">${genderDesc}</div>
        ${randomKeywords.map(keyword => `<div class="name-tag">${keyword}</div>`).join('')}
    `;
    
    // 更新含义
    const meaning = window.nameGenerator.generateNameAnalysis(nameInfo);
    domElements.nameMeaning.innerHTML = `<p>${meaning}</p>`;
    
    // 更新收藏按钮状态
    updateLikeButton(nameInfo.name);
    
    // 保存当前名字信息
    window.currentNameInfo = nameInfo;
}

// 更新批量结果
function updateBatchResults(names) {
    if (!names || names.length === 0) return;
    
    domElements.batchResults.innerHTML = names.map((nameInfo, index) => `
        <div class="batch-name" onclick="selectBatchName(${index})" title="点击查看详情">
            ${nameInfo.name}
        </div>
    `).join('');
}

// 选择批量结果中的名字
window.selectBatchName = function(index) {
    if (window.batchNames && window.batchNames[index]) {
        updateNameDisplay(window.batchNames[index]);
    }
};

// 动画效果
function animateGeneration() {
    const nameElement = domElements.mainName;
    nameElement.style.animation = 'none';
    void nameElement.offsetWidth; // 触发重排
    nameElement.style.animation = 'glow 3s ease-in-out infinite alternate';
}

// 收藏/取消收藏
function toggleLike() {
    if (!window.currentNameInfo) return;
    
    const isCollected = window.nameGenerator.addToCollection(window.currentNameInfo);
    
    if (isCollected) {
        showToast('已添加到收藏', 'success');
        updateLikeButton(window.currentNameInfo.name, true);
        updateStats();
        if (domElements.collectionSection.style.display !== 'none') {
            loadCollection();
        }
    } else {
        const removed = window.nameGenerator.removeFromCollection(window.currentNameInfo.name);
        if (removed) {
            showToast('已从收藏移除', 'warning');
            updateLikeButton(window.currentNameInfo.name, false);
            updateStats();
            if (domElements.collectionSection.style.display !== 'none') {
                loadCollection();
            }
        }
    }
}

// 更新收藏按钮状态
function updateLikeButton(name, isLiked) {
    if (isLiked === undefined) {
        isLiked = window.nameGenerator.getCollection().some(item => item.name === name);
    }
    
    const icon = isLiked ? 'fas fa-heart' : 'far fa-heart';
    const text = isLiked ? '已收藏' : '收藏';
    
    domElements.likeBtn.innerHTML = `<i class="${icon}"></i> ${text}`;
    domElements.likeBtn.classList.toggle('primary', !isLiked);
}

// 复制当前名字
function copyCurrentName() {
    if (!window.currentNameInfo) return;
    
    navigator.clipboard.writeText(window.currentNameInfo.name)
        .then(() => showToast('已复制到剪贴板', 'success'))
        .catch(err => {
            console.error('复制失败:', err);
            showToast('复制失败，请手动复制', 'error');
        });
}

// 重新生成当前名字
function regenerateOne() {
    generateNames();
}

// 显示名字详情
function showNameDetails() {
    if (!window.currentNameInfo) return;
    
    const nameInfo = window.currentNameInfo;
    const meaning = window.nameGenerator.getNameMeaning(nameInfo);
    const analysis = window.nameGenerator.generateNameAnalysis(nameInfo);
    
    domElements.modalContent.innerHTML = `
        <div class="modal-name">${nameInfo.name}</div>
        <div class="modal-info">
            <div class="modal-info-item">
                <span class="modal-label">姓氏：</span>
                <span class="modal-value">${nameInfo.surname}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-label">名字：</span>
                <span class="modal-value">${nameInfo.givenName}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-label">性别：</span>
                <span class="modal-value">${genderDescriptions[nameInfo.gender]}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-label">风格：</span>
                <span class="modal-value">${styleDescriptions[nameInfo.style]}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-label">字数：</span>
                <span class="modal-value">${nameInfo.wordCount}字</span>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>名字含义</h3>
            <p>${meaning}</p>
        </div>
        
        <div class="modal-section">
            <h3>角色解析</h3>
            <p>${analysis}</p>
        </div>
        
        <div class="modal-section">
            <h3>适合角色类型</h3>
            <div class="modal-tags">
                ${window.nameGenerator.getCharacterKeywords(nameInfo.style)
                    .map(keyword => `<span class="modal-tag">${keyword}</span>`)
                    .join('')}
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="modal-action-btn" onclick="copyCurrentName()">
                <i class="far fa-copy"></i> 复制名字
            </button>
            <button class="modal-action-btn primary" onclick="toggleLike()">
                <i class="far fa-heart"></i> 收藏
            </button>
        </div>
    `;
    
    domElements.nameModal.style.display = 'flex';
}

// 隐藏模态框
function hideNameModal() {
    domElements.nameModal.style.display = 'none';
}

// 复制所有名字
function copyAllNames() {
    const names = Array.from(domElements.batchResults.querySelectorAll('.batch-name'))
        .map(el => el.textContent.trim());
    
    if (names.length === 0) {
        if (window.currentNameInfo) {
            names.push(window.currentNameInfo.name);
        } else {
            showToast('没有可复制的名字', 'warning');
            return;
        }
    }
    
    const text = names.join('\n');
    navigator.clipboard.writeText(text)
        .then(() => showToast(`已复制 ${names.length} 个名字`, 'success'))
        .catch(err => {
            console.error('复制失败:', err);
            showToast('复制失败，请手动复制', 'error');
        });
}

// 导出收藏
function exportCollection() {
    const collection = window.nameGenerator.getCollection();
    if (collection.length === 0) {
        showToast('收藏夹为空', 'warning');
        return;
    }
    
    const format = confirm('导出为JSON格式？点击"确定"导出JSON，点击"取消"导出TXT。')
        ? 'json' : 'txt';
    
    let content, mimeType, filename;
    
    if (format === 'json') {
        content = window.nameGenerator.exportCollection();
        mimeType = 'application/json';
        filename = `name-collection-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
        content = window.nameGenerator.exportCollectionAsTxt();
        mimeType = 'text/plain';
        filename = `name-collection-${new Date().toISOString().slice(0, 10)}.txt`;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`已导出 ${collection.length} 个收藏`, 'success');
}

// 清空历史
function clearHistory() {
    if (confirm('确定要清空历史记录吗？')) {
        window.nameGenerator.clearHistory();
        updateHistory();
        showToast('已清空历史记录', 'success');
    }
}

// 随机全部设置
function randomizeAll() {
    // 随机性别
    const genders = ['male', 'female', 'neutral', 'random'];
    selectGender(genders[Math.floor(Math.random() * genders.length)]);
    
    // 随机风格
    const styles = ['all', 'ancient', 'xianxia', 'modern', 'fantasy', 'scifi', 'wuxia', 'mystery'];
    selectStyle(styles[Math.floor(Math.random() * styles.length)]);
    
    // 随机字数
    const randomWordCount = Math.floor(Math.random() * 3) + 1; // 1-3
    domElements.wordCountSlider.value = randomWordCount;
    updateWordCount();
    
    // 随机姓氏
    if (Math.random() > 0.7) { // 30%概率使用固定姓氏
        domElements.fixedSurname.checked = true;
        const surnames = [...nameDatabase.surnames.common, ...nameDatabase.surnames.literary];
        domElements.surnameInput.value = surnames[Math.floor(Math.random() * surnames.length)];
        updateSurnameControl();
    } else {
        domElements.randomSurname.checked = true;
        updateSurnameControl();
    }
    
    // 随机数量
    const counts = [1, 3, 5, 10, 20];
    domElements.generateCount.value = counts[Math.floor(Math.random() * counts.length)];
    updateGenerateCount();
    
    showToast('已随机设置所有选项', 'success');
}

// 加载收藏
function loadCollection() {
    const collection = window.nameGenerator.getCollection();
    
    if (collection.length === 0) {
        domElements.collectionList.innerHTML = `
            <div class="empty-collection">
                <i class="far fa-heart"></i>
                <p>收藏夹为空</p>
                <p class="empty-hint">点击名字下方的"收藏"按钮添加收藏</p>
            </div>
        `;
        return;
    }
    
    domElements.collectionList.innerHTML = collection.map(item => `
        <div class="collection-item">
            <div class="collection-name">${item.name}</div>
            <div class="collection-info">
                <span class="collection-style">${styleDescriptions[item.style] || '通用'}</span>
                <span class="collection-gender">${genderDescriptions[item.gender] || '未知'}</span>
                <span class="collection-date">${new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="collection-actions">
                <button class="collection-btn" onclick="selectCollectionName('${item.name}')" title="查看">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="collection-btn" onclick="copyCollectionName('${item.name}')" title="复制">
                    <i class="far fa-copy"></i>
                </button>
                <button class="collection-btn" onclick="removeFromCollection('${item.name}')" title="删除">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 选择收藏的名字
window.selectCollectionName = function(name) {
    const collection = window.nameGenerator.getCollection();
    const nameInfo = collection.find(item => item.name === name);
    if (nameInfo) {
        updateNameDisplay(nameInfo);
        showNameDetails();
    }
};

// 复制收藏的名字
window.copyCollectionName = function(name) {
    navigator.clipboard.writeText(name)
        .then(() => showToast('已复制到剪贴板', 'success'))
        .catch(err => {
            console.error('复制失败:', err);
            showToast('复制失败，请手动复制', 'error');
        });
};

// 从收藏移除
window.removeFromCollection = function(name) {
    if (window.nameGenerator.removeFromCollection(name)) {
        showToast('已从收藏移除', 'success');
        loadCollection();
        updateStats();
        if (window.currentNameInfo && window.currentNameInfo.name === name) {
            updateLikeButton(name, false);
        }
    }
};

// 加载历史记录
function loadHistory() {
    const history = window.nameGenerator.getHistory();
    
    if (history.length === 0) {
        domElements.historyList.innerHTML = `
            <div class="empty-history">
                <i class="far fa-clock"></i>
                <p>暂无历史记录</p>
            </div>
        `;
        return;
    }
    
    domElements.historyList.innerHTML = history.slice(0, 10).map(item => `
        <div class="history-item" onclick="selectHistoryName('${item.id}')">
            <div class="history-name">${item.name}</div>
            <div class="history-tags">
                <i class="fas fa-${item.gender === 'male' ? 'mars' : item.gender === 'female' ? 'venus' : 'genderless'}"></i>
                ${styleDescriptions[item.style] || '通用'}
                <span class="history-time">${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `).join('');
}

// 更新历史记录
function updateHistory() {
    loadHistory();
}

// 选择历史记录中的名字
window.selectHistoryName = function(id) {
    const history = window.nameGenerator.getHistory();
    const nameInfo = history.find(item => item.id === id);
    if (nameInfo) {
        updateNameDisplay(nameInfo);
    }
};

// 更新统计
function updateStats() {
    const stats = window.nameGenerator.getStats();
    
    domElements.totalGenerated.textContent = stats.totalGenerated || 0;
    domElements.totalLiked.textContent = stats.totalLiked || 0;
    domElements.favStyle.textContent = window.nameGenerator.getFavoriteStyle();
}

// 生成今日灵感
function generateDailyInsight() {
    const today = new Date().toDateString();
    const lastInsight = localStorage.getItem('lastInsightDate');
    const lastInsightData = JSON.parse(localStorage.getItem('lastInsightData') || 'null');
    
    // 如果今天已经生成过灵感，并且有缓存，使用缓存
    if (lastInsight === today && lastInsightData) {
        updateInsightDisplay(lastInsightData);
        return;
    }
    
    // 生成新的灵感
    const config = {
        gender: Math.random() > 0.5 ? 'male' : 'female',
        style: ['ancient', 'xianxia', 'fantasy'][Math.floor(Math.random() * 3)],
        wordCount: Math.floor(Math.random() * 2) + 2, // 2-3
        surnameType: 'random',
        avoidSameSound: true,
        balanceTone: true
    };
    
    const nameInfo = window.nameGenerator.generateName(config);
    const insightData = {
        name: nameInfo.name,
        meaning: window.nameGenerator.generateNameAnalysis(nameInfo),
        gender: nameInfo.gender,
        style: nameInfo.style
    };
    
    // 保存到本地存储
    localStorage.setItem('lastInsightDate', today);
    localStorage.setItem('lastInsightData', JSON.stringify(insightData));
    
    updateInsightDisplay(insightData);
}

// 更新灵感显示
function updateInsightDisplay(data) {
    domElements.insightName.textContent = data.name;
    domElements.insightDesc.textContent = data.meaning;
    
    // 更新标签
    const insightTags = document.querySelector('.insight-tags');
    if (insightTags) {
        insightTags.innerHTML = `
            <span class="insight-tag">${styleDescriptions[data.style]}</span>
            <span class="insight-tag">${genderDescriptions[data.gender]}</span>
        `;
    }
}

// 切换到首页
function switchToHome() {
    domElements.collectionSection.style.display = 'none';
    domElements.batchResults.style.display = appState.currentMode === 'batch' ? 'grid' : 'none';
    
    // 更新导航
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    domElements.navHome.classList.add('active');
}

// 切换到收藏
function switchToCollection() {
    domElements.collectionSection.style.display = 'block';
    domElements.batchResults.style.display = 'none';
    
    // 更新导航
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    domElements.navCollection.classList.add('active');
    
    loadCollection();
}

// 显示关于
function showAbout() {
    domElements.modalContent.innerHTML = `
        <div class="modal-section">
            <h2>关于创名阁</h2>
            <p>创名阁是一个专为小说创作者设计的人物名生成工具，旨在为你的创作提供灵感和便利。</p>
        </div>
        
        <div class="modal-section">
            <h3>主要功能</h3>
            <ul>
                <li>多种风格：古风、仙侠、现代、奇幻、科幻、武侠、悬疑</li>
                <li>灵活配置：性别、字数、姓氏、风格自由组合</li>
                <li>批量生成：一次生成多个名字，提高效率</li>
                <li>收藏功能：保存喜欢的名字，随时查阅</li>
                <li>名字解析：自动解析名字含义，提供创作灵感</li>
                <li>历史记录：记录生成历史，方便回溯</li>
            </ul>
        </div>
        
        <div class="modal-section">
            <h3>使用技巧</h3>
            <ul>
                <li>使用高级选项调整音韵规则，让名字更悦耳</li>
                <li>尝试不同风格的组合，发现意想不到的好名字</li>
                <li>收藏喜欢的名字，建立自己的角色名库</li>
                <li>利用批量生成功能，快速获取大量灵感</li>
            </ul>
        </div>
        
        <div class="modal-section">
            <h3>数据说明</h3>
            <p>名字数据库包含：</p>
            <ul>
                <li>120+ 常见和文艺姓氏</li>
                <li>20+ 复姓</li>
                <li>600+ 名字用字，按性别和风格分类</li>
                <li>丰富的名字含义和角色关键词</li>
            </ul>
        </div>
        
        <div class="modal-actions">
            <button class="modal-action-btn" onclick="hideNameModal()">
                开始使用
            </button>
        </div>
    `;
    
    domElements.nameModal.style.display = 'flex';
}

// 键盘快捷键
function handleKeyboardShortcuts(e) {
    // 忽略输入框中的按键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Ctrl + Enter 或 Cmd + Enter: 生成名字
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateNames();
    }
    
    // Space: 生成名字
    if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        generateNames();
    }
    
    // C: 复制当前名字
    if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        copyCurrentName();
    }
    
    // L: 收藏/取消收藏
    if (e.key === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleLike();
    }
    
    // R: 重新生成
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        regenerateOne();
    }
    
    // I: 显示详情
    if (e.key === 'i' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        showNameDetails();
    }
}

// 保存用户设置
function saveUserSettings() {
    try {
        localStorage.setItem('nameGeneratorSettings', JSON.stringify(appState));
    } catch (e) {
        console.warn('无法保存设置：', e);
    }
}

// 恢复用户设置
function restoreUserSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('nameGeneratorSettings'));
        if (saved) {
            Object.assign(appState, saved);
            applyUserSettings();
        }
    } catch (e) {
        console.warn('无法恢复设置：', e);
    }
}

// 应用用户设置
function applyUserSettings() {
    // 模式
    switchMode(appState.currentMode);
    
    // 性别
    selectGender(appState.currentGender);
    
    // 风格
    selectStyle(appState.currentStyle);
    
    // 字数
    domElements.wordCountSlider.value = appState.wordCount;
    updateWordCount();
    
    // 姓氏
    if (appState.surnameType === 'fixed') {
        domElements.fixedSurname.checked = true;
        domElements.surnameInput.value = appState.fixedSurname;
    } else {
        domElements.randomSurname.checked = true;
    }
    updateSurnameControl();
    
    // 生成数量
    domElements.generateCount.value = appState.generateCount;
    updateGenerateCount();
    
    // 高级选项
    domElements.advancedToggle.checked = appState.showAdvanced;
    domElements.avoidSameSound.checked = appState.avoidSameSound;
    domElements.balanceTone.checked = appState.balanceTone;
    domElements.nameStructure.value = appState.nameStructure;
    toggleAdvancedOptions();
}

// 显示消息提示
function showToast(message, type = 'success') {
    // 移除现有的提示
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);
}

// CSS for modal (添加到style.css的补充)
const additionalCSS = `
/* 模态框内部样式 */
.modal-name {
    font-size: 2.5rem;
    font-family: "Ma Shan Zheng", cursive;
    color: var(--accent-gold);
    text-align: center;
    margin-bottom: 20px;
    text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
}

.modal-info {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: var(--border-radius-sm);
    padding: 20px;
    margin-bottom: 20px;
}

.modal-info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

.modal-info-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.modal-label {
    color: var(--text-muted);
    font-weight: 500;
}

.modal-value {
    color: var(--accent-gold);
    font-weight: 600;
}

.modal-section {
    margin-bottom: 25px;
}

.modal-section h3 {
    color: var(--accent-gold);
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 600;
}

.modal-section p {
    color: var(--text-light);
    line-height: 1.6;
    font-size: 15px;
}

.modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.modal-tag {
    padding: 6px 12px;
    background-color: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 20px;
    color: var(--accent-gold);
    font-size: 12px;
}

.modal-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.modal-action-btn {
    flex: 1;
    padding: 12px 20px;
    background-color
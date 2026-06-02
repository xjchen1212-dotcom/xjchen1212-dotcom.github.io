/**
 * 小说人物名生成器 - 核心生成算法
 * 负责名字的生成、筛选、解析等功能
 */

class NameGenerator {
    constructor(database) {
        this.db = database;
        this.generatedHistory = [];
        this.collectedNames = JSON.parse(localStorage.getItem('nameCollection') || '[]');
        this.stats = JSON.parse(localStorage.getItem('nameStats') || JSON.stringify({
            totalGenerated: 0,
            totalLiked: 0,
            byStyle: {},
            byGender: {}
        }));
    }
    
    // 从数组中随机选择一个元素
    getRandomElement(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // 从多个数组中按权重随机选择
    getRandomByWeight(arrays, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < arrays.length; i++) {
            if (random < weights[i]) {
                return this.getRandomElement(arrays[i]);
            }
            random -= weights[i];
        }
        
        return this.getRandomElement(arrays[0]);
    }
    
    // 选择姓氏
    selectSurname(config) {
        const { surnameType, fixedSurname } = config;
        
        if (surnameType === 'fixed' && fixedSurname && fixedSurname.trim() !== '') {
            return fixedSurname.trim();
        }
        
        // 随机选择姓氏类型
        const surnameTypes = ['common', 'literary', 'compound', 'rare', 'poetic'];
        const weights = [40, 30, 15, 10, 5]; // 权重分配
        
        const type = this.getRandomByWeight(surnameTypes, weights);
        return this.getRandomElement(this.db.surnames[type]);
    }
    
    // 选择名字用字
    selectGivenName(config) {
        const { gender, style, wordCount, avoidSameSound, balanceTone } = config;
        
        let actualGender = gender;
        if (gender === 'random') {
            const genders = ['male', 'female', 'neutral'];
            actualGender = this.getRandomElement(genders);
        }
        
        // 获取对应性别的字库
        const genderPool = this.db.givenNames[actualGender];
        if (!genderPool) return '';
        
        let selectedChars = [];
        let lastChar = '';
        let lastTone = null;
        
        for (let i = 0; i < wordCount; i++) {
            let charPool = [];
            
            if (style === 'all') {
                // 合并所有风格
                Object.values(genderPool).forEach(pool => {
                    charPool = charPool.concat(pool);
                });
            } else {
                // 优先使用指定风格
                charPool = genderPool[style] || [];
                if (charPool.length === 0) {
                    // 如果指定风格没有字，从所有风格中随机选
                    const styles = Object.keys(genderPool);
                    const randomStyle = this.getRandomElement(styles);
                    charPool = genderPool[randomStyle];
                }
            }
            
            if (charPool.length === 0) continue;
            
            // 筛选字符
            let filteredPool = [...charPool];
            
            if (avoidSameSound && lastChar) {
                // 简单的同音过滤（这里可以扩展为真正的拼音比较）
                filteredPool = filteredPool.filter(char => char !== lastChar);
            }
            
            if (balanceTone && lastTone !== null) {
                // 简单的平仄判断（这里可以扩展为真正的平仄分析）
                filteredPool = filteredPool.filter(char => {
                    const charTone = this.getCharacterTone(char);
                    return charTone !== lastTone;
                });
            }
            
            if (filteredPool.length === 0) {
                filteredPool = charPool; // 如果过滤后没有字符，使用原始池
            }
            
            const selectedChar = this.getRandomElement(filteredPool);
            selectedChars.push(selectedChar);
            lastChar = selectedChar;
            lastTone = this.getCharacterTone(selectedChar);
        }
        
        return selectedChars.join('');
    }
    
    // 简单的字符声调判断（示例实现）
    getCharacterTone(char) {
        // 这里应该实现真正的拼音和声调判断
        // 暂时返回随机值作为示例
        return Math.random() > 0.5 ? '平' : '仄';
    }
    
    // 生成完整名字
    generateName(config) {
        const {
            gender = 'male',
            style = 'all',
            wordCount = 2,
            surnameType = 'random',
            fixedSurname = '',
            avoidSameSound = true,
            balanceTone = true
        } = config;
        
        const surname = this.selectSurname({ surnameType, fixedSurname });
        const givenName = this.selectGivenName({
            gender,
            style,
            wordCount,
            avoidSameSound,
            balanceTone
        });
        
        if (!surname || !givenName) {
            return this.generateName(config); // 递归重试
        }
        
        const fullName = surname + givenName;
        
        // 更新统计
        this.stats.totalGenerated++;
        this.stats.byStyle[style] = (this.stats.byStyle[style] || 0) + 1;
        this.stats.byGender[gender] = (this.stats.byGender[gender] || 0) + 1;
        this.saveStats();
        
        return {
            name: fullName,
            surname,
            givenName,
            gender: gender === 'random' ? this.detectGender(givenName) : gender,
            style,
            wordCount,
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random().toString(36).substr(2, 9)
        };
    }
    
    // 批量生成名字
    generateBatch(config, count) {
        const names = [];
        for (let i = 0; i < count; i++) {
            names.push(this.generateName(config));
        }
        return names;
    }
    
    // 检测名字性别倾向
    detectGender(givenName) {
        // 简单的性别检测逻辑
        const maleChars = new Set(this.db.givenNames.male.ancient);
        const femaleChars = new Set(this.db.givenNames.female.ancient);
        
        let maleScore = 0;
        let femaleScore = 0;
        
        for (const char of givenName) {
            if (maleChars.has(char)) maleScore++;
            if (femaleChars.has(char)) femaleScore++;
        }
        
        if (maleScore > femaleScore) return 'male';
        if (femaleScore > maleScore) return 'female';
        return 'neutral';
    }
    
    // 获取名字含义
    getNameMeaning(nameInfo) {
        const { surname, givenName, gender } = nameInfo;
        
        let meaning = '';
        const surnameMeaning = this.db.compoundMeanings[surname] || '';
        const givenNameMeanings = [];
        
        for (const char of givenName) {
            const charMeaning = this.db.meanings[gender]?.[char] || '';
            if (charMeaning) {
                givenNameMeanings.push(charMeaning);
            }
        }
        
        if (surnameMeaning) {
            meaning += `姓氏"${surname}"：${surnameMeaning}。`;
        }
        
        if (givenNameMeanings.length > 0) {
            meaning += `名字"${givenName}"：${givenNameMeanings.join('，')}。`;
        }
        
        return meaning || '这个名字寓意深远，富有诗意。';
    }
    
    // 生成名字解析
    generateNameAnalysis(nameInfo) {
        const meaning = this.getNameMeaning(nameInfo);
        const keywords = this.getCharacterKeywords(nameInfo.style);
        const template = this.getRandomElement(this.nameAnalysisTemplates);
        
        return template
            .replace('{name}', nameInfo.name)
            .replace('{meaning}', meaning)
            .replace('{character}', this.getRandomElement(keywords));
    }
    
    // 获取角色关键词
    getCharacterKeywords(style) {
        return this.db.characterKeywords[style] || this.db.characterKeywords.all;
    }
    
    // 添加收藏
    addToCollection(nameInfo) {
        if (!this.collectedNames.find(item => item.name === nameInfo.name)) {
            this.collectedNames.push({
                ...nameInfo,
                collectedAt: new Date().toISOString()
            });
            this.stats.totalLiked++;
            this.saveCollection();
            this.saveStats();
            return true;
        }
        return false;
    }
    
    // 移除收藏
    removeFromCollection(name) {
        const index = this.collectedNames.findIndex(item => item.name === name);
        if (index !== -1) {
            this.collectedNames.splice(index, 1);
            this.stats.totalLiked = Math.max(0, this.stats.totalLiked - 1);
            this.saveCollection();
            this.saveStats();
            return true;
        }
        return false;
    }
    
    // 获取收藏列表
    getCollection() {
        return [...this.collectedNames].reverse(); // 最新的在前面
    }
    
    // 清空收藏
    clearCollection() {
        this.collectedNames = [];
        this.stats.totalLiked = 0;
        this.saveCollection();
        this.saveStats();
    }
    
    // 获取统计数据
    getStats() {
        return { ...this.stats };
    }
    
    // 获取最常用风格
    getFavoriteStyle() {
        const styles = this.stats.byStyle;
        let favorite = '';
        let maxCount = 0;
        
        for (const [style, count] of Object.entries(styles)) {
            if (count > maxCount) {
                maxCount = count;
                favorite = style;
            }
        }
        
        return favorite ? this.db.styleDescriptions[favorite] : '-';
    }
    
    // 保存收藏到本地存储
    saveCollection() {
        try {
            localStorage.setItem('nameCollection', JSON.stringify(this.collectedNames));
        } catch (e) {
            console.warn('无法保存收藏：', e);
        }
    }
    
    // 保存统计到本地存储
    saveStats() {
        try {
            localStorage.setItem('nameStats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('无法保存统计：', e);
        }
    }
    
    // 清空历史记录
    clearHistory() {
        this.generatedHistory = [];
    }
    
    // 添加历史记录
    addToHistory(nameInfo) {
        this.generatedHistory.unshift(nameInfo);
        if (this.generatedHistory.length > 50) {
            this.generatedHistory = this.generatedHistory.slice(0, 50);
        }
    }
    
    // 获取历史记录
    getHistory() {
        return [...this.generatedHistory];
    }
    
    // 导出收藏为JSON
    exportCollection() {
        return JSON.stringify(this.collectedNames, null, 2);
    }
    
    // 导出收藏为TXT
    exportCollectionAsTxt() {
        return this.collectedNames.map(item => 
            `${item.name} | ${this.db.genderDescriptions[item.gender]} | ${this.db.styleDescriptions[item.style]} | ${new Date(item.timestamp).toLocaleDateString()}`
        ).join('\n');
    }
}

// 创建全局实例
window.nameGenerator = new NameGenerator(nameDatabase);
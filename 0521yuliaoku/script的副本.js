// 小说描写语料库应用 - 修复版
class WritingHelper {
    constructor() {
        this.currentView = 'grid';
        this.favorites = new Set();
        this.initialize();
    }

    // 初始化应用
    initialize() {
        console.log('初始化应用，语料库条数:', corpus.length);
        document.getElementById('totalCount').textContent = corpus.length;
        this.loadFavorites();
        this.bindEvents();
        this.updateGroupCounts();
        this.filterAndRender();
        this.updateFavoriteCount();
    }

    // 更新标签组计数
    updateGroupCounts() {
        console.log('更新标签组计数');
        ['emotion', 'scene', 'trait'].forEach(groupId => {
            const container = document.querySelector(`.filter-group[data-group="${groupId}"]`);
            if (container) {
                const checkedCount = container.querySelectorAll('input:checked').length;
                const totalCount = container.querySelectorAll('input').length;
                const countElement = document.getElementById(`${groupId}Count`);
                if (countElement) {
                    countElement.textContent = `${checkedCount}/${totalCount}`;
                    // 根据选中数量改变颜色
                    if (checkedCount === 0) {
                        countElement.style.background = 'rgba(127,140,141,0.1)';
                        countElement.style.color = '#7f8c8d';
                    } else if (checkedCount === totalCount) {
                        countElement.style.background = 'rgba(46,204,113,0.2)';
                        countElement.style.color = '#27ae60';
                    } else {
                        countElement.style.background = 'rgba(52,152,219,0.2)';
                        countElement.style.color = '#2980b9';
                    }
                }
            }
        });
    }

    // 获取选中的分类
    getSelectedCategories() {
        const checkboxes = document.querySelectorAll('#categoryFilter input:checked');
        const categories = Array.from(checkboxes).map(cb => cb.value);
        console.log('选中的分类:', categories);
        return categories;
    }

    // 获取选中的标签
    getSelectedTags() {
        const checkboxes = document.querySelectorAll('.tag-group input:checked');
        const tags = Array.from(checkboxes).map(cb => cb.value);
        console.log('选中的标签:', tags);
        return tags;
    }

    // 获取搜索关键词
    getSearchKeyword() {
        const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
        console.log('搜索关键词:', keyword);
        return keyword;
    }

    // 筛选数据
    filterData() {
        const categories = this.getSelectedCategories();
        const tags = this.getSelectedTags();
        const keyword = this.getSearchKeyword();
        
        console.log('筛选条件:', { categories, tags, keyword });
        
        // 如果没有选择任何筛选条件，显示全部
        if (categories.length === 0 && tags.length === 0 && !keyword) {
            console.log('无筛选条件，显示全部');
            return corpus;
        }
        
        const filtered = corpus.filter(item => {
            // 分类筛选
            if (categories.length > 0) {
                if (!categories.includes(item.category)) {
                    return false;
                }
            }
            
            // 标签筛选
            if (tags.length > 0) {
                const hasTag = tags.some(tag => item.tags && item.tags.includes(tag));
                if (!hasTag) {
                    return false;
                }
            }
            
            // 关键词搜索
            if (keyword) {
                const textMatch = item.text.toLowerCase().includes(keyword);
                const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(keyword));
                if (!textMatch && !tagsMatch) {
                    return false;
                }
            }
            
            return true;
        });
        
        console.log('筛选结果:', filtered.length, '条');
        return filtered;
    }

    // 渲染结果
    renderResults(results) {
        const container = document.getElementById('resultsContainer');
        const resultCount = document.getElementById('resultCount');
        
        // 更新结果计数
        resultCount.textContent = results.length === corpus.length ? 
            `共 ${results.length} 条` : 
            `找到 ${results.length} 条结果`;
        resultCount.style.color = results.length > 0 ? '#2ecc71' : '#e74c3c';
        
        // 清空容器
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>未找到匹配的描写</h3>
                    <p>尝试调整筛选条件或搜索关键词</p>
                </div>
            `;
            return;
        }
        
        const categories = this.getSelectedCategories();
        const tags = this.getSelectedTags();
        const keyword = this.getSearchKeyword();
        
        // 如果是初始状态（无筛选），显示引导提示
        if (categories.length === 0 && tags.length === 0 && !keyword && results.length === corpus.length) {
            container.innerHTML = `
                <div class="initial-state">
                    <i class="fas fa-magic"></i>
                    <h3>欢迎使用小说描写语料库！</h3>
                    <p>这里收录了 ${corpus.length} 条高质量的描写片段，点击左侧的分类或标签开始筛选，或直接在搜索框输入关键词。</p>
                    
                    <div class="quick-tips">
                        <div class="tip-card">
                            <div class="tip-icon"><i class="fas fa-filter"></i></div>
                            <h4>快速筛选</h4>
                            <p>点击「环境」、「动作」等分类，或选择「悲伤」、「浪漫」等标签，快速找到需要的描写。</p>
                        </div>
                        <div class="tip-card">
                            <div class="tip-icon"><i class="fas fa-search"></i></div>
                            <h4>精准搜索</h4>
                            <p>在搜索框输入具体词汇，如"雨夜"、"打斗"、"眼神"，可以精确匹配相关描写。</p>
                        </div>
                        <div class="tip-card">
                            <div class="tip-icon"><i class="fas fa-star"></i></div>
                            <h4>收藏与导出</h4>
                            <p>遇到喜欢的描写可以点击收藏，之后可以一键导出所有收藏内容，方便写作时参考。</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // 渲染卡片
        results.forEach(item => {
            const card = this.createCard(item);
            container.appendChild(card);
        });
        
        // 更新已选标签显示
        this.updateSelectedFiltersDisplay();
    }

    // 创建卡片
    createCard(item) {
        const isFavorited = this.favorites.has(item.id);
        const tags = item.tags ? item.tags : [];
        
        const card = document.createElement('div');
        card.className = 'result-card';
        card.dataset.id = item.id;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="category-icon ${item.category}">
                    ${this.getCategoryIcon(item.category)}
                </div>
                <div class="category">${item.category}</div>
                <div class="tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="card-content">${item.text}</div>
            <div class="card-footer">
                <div class="buttons">
                    <button class="card-btn copy-btn" data-action="copy" data-id="${item.id}">
                        <i class="far fa-copy"></i> 复制
                    </button>
                    <button class="card-btn export-btn" data-action="export" data-id="${item.id}">
                        <i class="fas fa-download"></i> 导出
                    </button>
                    <button class="card-btn favorite-btn ${isFavorited ? 'favorited' : ''}" 
                            data-action="favorite" data-id="${item.id}">
                        <i class="fas fa-heart"></i> ${isFavorited ? '已收藏' : '收藏'}
                    </button>
                </div>
                <span class="length-badge">${item.length || '短句'}</span>
            </div>
        `;
        
        return card;
    }

    // 获取分类图标
    getCategoryIcon(category) {
        const icons = {
            '环境': 'fas fa-mountain',
            '动作': 'fas fa-running',
            '外貌': 'fas fa-user',
            '心理': 'fas fa-brain',
            '对话': 'fas fa-comments',
            '其他': 'fas fa-star'
        };
        return `<i class="${icons[category] || 'fas fa-star'}"></i>`;
    }

    // 复制文本
    copyText(itemId) {
        const item = corpus.find(i => i.id === itemId);
        if (!item) return;
        
        navigator.clipboard.writeText(item.text)
            .then(() => this.showToast('✅ 已复制到剪贴板'))
            .catch(err => {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = item.text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    this.showToast('✅ 已复制到剪贴板');
                } catch (err) {
                    this.showToast('❌ 复制失败，请手动选择文本复制');
                }
                document.body.removeChild(textArea);
            });
    }

    // 导出单条
    exportSingle(itemId) {
        const item = corpus.find(i => i.id === itemId);
        if (!item) return;
        
        const content = `【${item.category}】\n${item.text}\n\n标签：${item.tags ? item.tags.join('、') : '无'}\n字数：${item.length || '短句'}`;
        this.downloadFile(`${item.category}-描写.txt`, content);
        this.showToast('📥 导出成功');
    }

    // 导出全部收藏
    exportAllFavorites() {
        if (this.favorites.size === 0) {
            this.showToast('⭐ 暂无收藏内容');
            return;
        }
        
        let content = '=== 小说描写收藏集 ===\n\n';
        const favoriteItems = corpus.filter(item => this.favorites.has(item.id));
        
        // 按分类分组
        const grouped = {};
        favoriteItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        
        // 生成内容
        Object.keys(grouped).forEach(category => {
            content += `【${category}】\n`;
            grouped[category].forEach((item, index) => {
                content += `${index + 1}. ${item.text}\n   标签：${item.tags ? item.tags.join('、') : '无'}\n\n`;
            });
            content += '\n';
        });
        
        const filename = `小说描写收藏-${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
        this.downloadFile(filename, content);
        this.showToast(`📦 已导出 ${this.favorites.size} 条收藏`);
    }

    // 下载文件
    downloadFile(filename, content) {
        const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // 切换收藏
    toggleFavorite(itemId) {
        if (this.favorites.has(itemId)) {
            this.favorites.delete(itemId);
        } else {
            this.favorites.add(itemId);
        }
        
        // 更新UI
        const btn = document.querySelector(`.card-btn[data-action="favorite"][data-id="${itemId}"]`);
        if (btn) {
            btn.classList.toggle('favorited');
            if (this.favorites.has(itemId)) {
                btn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
            } else {
                btn.innerHTML = '<i class="fas fa-heart"></i> 收藏';
            }
        }
        
        // 保存到本地存储
        this.saveFavorites();
        this.updateFavoriteCount();
        
        // 显示提示
        this.showToast(this.favorites.has(itemId) ? '⭐ 已添加到收藏' : '💔 已从收藏移除');
    }

    // 保存收藏
    saveFavorites() {
        localStorage.setItem('writingHelperFavorites', JSON.stringify(Array.from(this.favorites)));
    }

    // 加载收藏
    loadFavorites() {
        const saved = localStorage.getItem('writingHelperFavorites');
        if (saved) {
            try {
                this.favorites = new Set(JSON.parse(saved));
            } catch (e) {
                this.favorites = new Set();
            }
        }
    }

    // 更新收藏计数
    updateFavoriteCount() {
        document.getElementById('favoriteCount').textContent = `收藏：${this.favorites.size}`;
    }

    // 随机一条
    randomOne() {
        const results = this.filterData();
        if (results.length === 0) {
            this.showToast('🎲 无匹配结果，请调整筛选条件');
            return;
        }
        
        const randomItem = results[Math.floor(Math.random() * results.length)];
        this.showRandomResult(randomItem);
    }

    // 显示随机结果
    showRandomResult(item) {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = '';
        container.appendChild(this.createCard(item));
        
        // 滚动到结果区域
        container.scrollIntoView({ behavior: 'smooth' });
        
        this.showToast('🎲 已显示随机结果');
    }

    // 更新已选筛选器显示
    updateSelectedFiltersDisplay() {
        const categories = this.getSelectedCategories();
        const tags = this.getSelectedTags();
        const keyword = this.getSearchKeyword();
        
        const display = document.getElementById('selectedTagsText');
        
        // 如果没有选择任何条件
        if (categories.length === 0 && tags.length === 0 && !keyword) {
            display.textContent = '无筛选条件，显示全部';
            return;
        }
        
        const parts = [];
        
        if (categories.length > 0) {
            if (categories.length === 1) {
                parts.push(`分类：${categories[0]}`);
            } else {
                parts.push(`分类：${categories.length}个`);
            }
        }
        
        if (tags.length > 0) {
            if (tags.length <= 3) {
                parts.push(`标签：${tags.join('、')}`);
            } else {
                parts.push(`标签：${tags.slice(0, 3).join('、')} 等 ${tags.length} 个`);
            }
        }
        
        if (keyword) {
            parts.push(`搜索："${keyword}"`);
        }
        
        display.textContent = parts.join(' | ');
    }

    // 清空筛选
    clearFilters() {
        // 重置所有复选框为未选中
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // 清空搜索框
        document.getElementById('searchInput').value = '';
        
        // 更新所有组的计数
        this.updateGroupCounts();
        
        // 重新筛选
        this.filterAndRender();
        this.showToast('🔄 已清空所有筛选条件');
    }

    // 切换视图
    toggleView(viewType) {
        this.currentView = viewType;
        const container = document.getElementById('resultsContainer');
        const viewBtns = document.querySelectorAll('.view-btn');
        
        // 更新按钮状态
        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });
        
        // 更新容器类
        container.className = `results-container ${viewType}-view`;
    }

    // 筛选并渲染
    filterAndRender() {
        console.log('开始筛选和渲染');
        const results = this.filterData();
        this.renderResults(results);
    }

    // 显示提示
    showToast(message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
        
        container.appendChild(toast);
        
        // 3秒后移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 绑定事件
    bindEvents() {
        console.log('绑定事件');
        
        // 搜索框事件
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        // 搜索按钮点击
        searchBtn.addEventListener('click', () => {
            console.log('搜索按钮点击');
            this.filterAndRender();
        });
        
        // 搜索框回车
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('搜索框回车');
                this.filterAndRender();
            }
        });
        
        // 清空筛选按钮
        document.getElementById('clearFilters').addEventListener('click', () => {
            console.log('清空筛选');
            this.clearFilters();
        });
        
        // 随机按钮
        document.getElementById('randomBtn').addEventListener('click', () => {
            console.log('随机按钮');
            this.randomOne();
        });
        
        // 导出收藏按钮
        document.getElementById('exportFavoritesBtn').addEventListener('click', () => {
            console.log('导出收藏');
            this.exportAllFavorites();
        });
        
        // 视图切换
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewType = e.target.closest('button').dataset.view;
                console.log('切换视图:', viewType);
                this.toggleView(viewType);
            });
        });
        
        // 实时搜索
        let searchTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                console.log('实时搜索触发');
                this.filterAndRender();
            }, 500);
        });
        
        // 分类和标签复选框变化事件
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                console.log('复选框变化:', e.target.value, e.target.checked);
                this.updateGroupCounts();
                
                // 延迟一小会儿执行筛选，避免频繁触发
                clearTimeout(this.filterTimer);
                this.filterTimer = setTimeout(() => {
                    this.filterAndRender();
                }, 100);
            }
        });
        
        // 卡片按钮事件委托
        document.getElementById('resultsContainer').addEventListener('click', (e) => {
            const button = e.target.closest('.card-btn');
            if (!button) return;
            
            const action = button.dataset.action;
            const id = button.dataset.id;
            
            console.log('卡片按钮点击:', action, id);
            
            if (action === 'copy') {
                this.copyText(id);
            } else if (action === 'export') {
                this.exportSingle(id);
            } else if (action === 'favorite') {
                this.toggleFavorite(id);
            }
        });
    }
}

// 全局变量
let app = null;

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化应用');
    
    // 检查语料库是否加载
    if (typeof corpus === 'undefined') {
        console.error('错误：语料库未加载！请确保 corpus.js 已正确引入');
        document.getElementById('resultsContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>语料库加载失败</h3>
                <p>请检查 corpus.js 文件是否正确引入</p>
            </div>
        `;
        return;
    }
    
    // 初始化应用
    app = new WritingHelper();
    
    // 添加全局错误处理
    window.addEventListener('error', function(e) {
        console.error('发生错误:', e.error);
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.background = '#e74c3c';
        toast.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>发生错误，请刷新页面重试</span>';
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    });
});
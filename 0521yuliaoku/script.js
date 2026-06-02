// script.js - 简化测试版
console.log('script.js 开始执行');

// 检查 corpus 是否存在
if (typeof corpus === 'undefined') {
    console.error('❌ corpus 变量未定义！');
} else {
    console.log('✅ corpus 已定义，长度:', corpus.length);
    console.log('corpus 内容示例:', corpus[0]);
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM 加载完成 ===');
    
    // 显示基本信息
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        resultCount.textContent = corpus ? `共 ${corpus.length} 条` : '语料库加载失败';
    }
    
    // 简单渲染
    if (corpus && corpus.length > 0) {
        renderData(corpus);
    }
    
    // 绑定简单事件
    bindSimpleEvents();
    
    console.log('应用初始化完成');
});

// 简单渲染函数
function renderData(data) {
    const container = document.getElementById('resultsContainer');
    if (!container) {
        console.error('找不到 resultsContainer 元素');
        return;
    }
    
    console.log('开始渲染，数据条数:', data.length);
    
    container.innerHTML = '';
    
    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="category">${item.category}</div>
                <div class="tags">${item.tags.join(', ')}</div>
            </div>
            <div class="card-content">${item.text}</div>
            <div class="card-footer">
                <button class="copy-btn" onclick="copyText('${item.id}')">复制</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    console.log('渲染完成，生成卡片数:', container.children.length);
}

// 简单事件绑定
function bindSimpleEvents() {
    // 搜索按钮
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            console.log('搜索按钮被点击');
            const keyword = document.getElementById('searchInput').value.toLowerCase();
            console.log('搜索关键词:', keyword);
            
            if (!keyword) {
                renderData(corpus);
                return;
            }
            
            const filtered = corpus.filter(item => 
                item.text.toLowerCase().includes(keyword) ||
                item.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
                item.category.toLowerCase().includes(keyword)
            );
            
            console.log('搜索结果:', filtered.length, '条');
            renderData(filtered);
        });
    }
    
    // 分类筛选
    document.querySelectorAll('#categoryFilter input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('分类筛选变化:', this.value, this.checked);
            filterData();
        });
    });
    
    // 标签筛选
    document.querySelectorAll('.tag-group input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('标签筛选变化:', this.value, this.checked);
            filterData();
        });
    });
}

// 筛选数据
function filterData() {
    // 获取选中的分类
    const selectedCategories = Array.from(
        document.querySelectorAll('#categoryFilter input:checked')
    ).map(cb => cb.value);
    
    // 获取选中的标签
    const selectedTags = Array.from(
        document.querySelectorAll('.tag-group input:checked')
    ).map(cb => cb.value);
    
    // 获取搜索词
    const searchKeyword = document.getElementById('searchInput').value.toLowerCase();
    
    console.log('筛选条件:', {
        categories: selectedCategories,
        tags: selectedTags,
        keyword: searchKeyword
    });
    
    // 筛选
    let filtered = corpus;
    
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }
    
    if (selectedTags.length > 0) {
        filtered = filtered.filter(item => 
            item.tags.some(tag => selectedTags.includes(tag))
        );
    }
    
    if (searchKeyword) {
        filtered = filtered.filter(item => 
            item.text.toLowerCase().includes(searchKeyword) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchKeyword)) ||
            item.category.toLowerCase().includes(searchKeyword)
        );
    }
    
    console.log('筛选结果:', filtered.length, '条');
    renderData(filtered);
}

// 复制文本
function copyText(itemId) {
    const item = corpus.find(i => i.id === itemId);
    if (!item) return;
    
    navigator.clipboard.writeText(item.text)
        .then(() => {
            alert('✅ 已复制: ' + item.text.substring(0, 20) + '...');
        })
        .catch(err => {
            console.error('复制失败:', err);
            alert('❌ 复制失败');
        });
}
// corpus.js - 简化测试版（语法正确）
const corpus = [
    // 测试数据 - 确保语法正确
    { id: 'test1', text: '雨丝如织，密密地斜织着。', category: '环境', tags: ['悲伤', '唯美'], length: '短句' },
    { id: 'test2', text: '他侧身避开致命的一剑。', category: '动作', tags: ['霸气', '刺激'], length: '短句' },
    { id: 'test3', text: '剑眉星目，鼻梁高挺。', category: '外貌', tags: ['高冷', '霸气'], length: '短句' }
];

// 添加调试日志
console.log('✅ corpus.js 加载成功');
console.log('corpus 变量类型:', typeof corpus);
console.log('corpus 数组长度:', corpus.length);
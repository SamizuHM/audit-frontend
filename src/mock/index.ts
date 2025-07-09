import Mock from 'mockjs'

// 导入各模块的 mock 数据
export * from './data/dashboard'
export * from './data/users'
export * from './data/knowledge'
export * from './data/projects'

// 配置 Mock
Mock.setup({
  timeout: '200-600', // 响应时间
})

// 设置拦截规则（可选，用于 API 模拟）
// Mock.mock('/api/dashboard/stats', 'get', () => {
//   return {
//     code: 200,
//     message: 'success',
//     data: overallStats
//   }
// })

// 导出 Mock 实例
export default Mock

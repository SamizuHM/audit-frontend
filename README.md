# 自然资源智能审计系统

基于Vue3 + Element Plus构建的现代化审计管理系统，专门针对自然资源审计业务场景设计。

## 🚀 功能特性

### 核心功能
- **用户认证**：安全的登录/登出系统
- **审计项目管理**：创建、编辑、查看和管理审计项目
- **智能文本分析**：基于AI的审计文本自动分析和风险评估
- **数据可视化**：直观的图表展示审计数据统计和趋势
- **知识库管理**：维护审计相关的法规、案例、模板和指南
- **智能问答**：基于知识库的AI问答助手
- **证据管理**：组织和分析审计证据材料

### 技术特性
- **现代化框架**：Vue 3 + TypeScript + Vite
- **优雅UI**：Element Plus组件库，响应式设计
- **状态管理**：Pinia状态管理
- **路由管理**：Vue Router 4
- **HTTP客户端**：Axios with 拦截器
- **模拟数据**：完整的前端模拟数据系统
- **接口预留**：为后端对接预留完整的API接口

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16
- pnpm >= 8

### 安装依赖
```sh
pnpm install
```

### 启动开发服务器
```sh
pnpm dev
```

### 构建生产版本
```sh
pnpm build
```

### 类型检查
```sh
pnpm type-check
```

### 代码检查
```sh
pnpm lint
```

## 📱 页面功能

### 1. 登录页面 (`/login`)
- 用户名/密码登录
- 表单验证
- 演示账号：admin / admin123

### 2. 审计项目管理 (`/dashboard/audit-projects`)
- 项目列表展示（卡片式布局）
- 搜索和筛选功能
- 项目状态管理
- 分页显示
- 项目操作（编辑、查看、归档、删除）

### 3. 项目编辑 (`/dashboard/project-edit/:id?`)
- 项目基本信息编辑
- 审计要点配置
- 证据材料管理
- 表单验证和保存

### 4. 审计文本处理 (`/dashboard/audit-text`)
- 文本输入和分析
- 智能摘要提取
- 关键词识别
- 风险等级评估
- 审计建议生成

### 5. 数据分析 (`/dashboard/data-analysis`)
- 统计卡片展示
- 项目状态分布图
- 月度趋势图表
- 审计类型分布
- 风险等级分析

### 6. 知识库管理 (`/dashboard/knowledge-management`)
- 知识条目列表
- 类型和标签筛选
- 知识编辑和维护
- 内容搜索功能

### 7. 知识编辑 (`/dashboard/knowledge-edit/:id?`)
- 富文本编辑器
- Markdown支持
- 实时预览
- 标签管理

### 8. 知识问答 (`/dashboard/knowledge-qa`)
- AI聊天界面
- 快速问题模板
- 相关知识推荐
- 对话历史管理

### 9. 证据组编辑 (`/dashboard/evidence-group-edit/:id?`)
- 证据文件管理
- 文件上传和预览
- 证据分析记录
- 分析结论评估

## 🔌 接口对接指南

### API配置
在`src/services/api.ts`中找到所有标注`TODO`的位置，替换模拟实现为真实API调用：

```typescript
// 示例：登录接口
login: async (data: LoginRequest): Promise<LoginResponse> => {
  // TODO: 替换为真实接口调用
  return api.post('/auth/login', data)
  
  // 删除下面的模拟代码
  // await new Promise(resolve => setTimeout(resolve, 1000))
  // if (data.username === 'admin' && data.password === 'admin123') {
  //   return { token: 'mock-jwt-token', user: { ... } }
  // }
  // throw new Error('用户名或密码错误')
}
```

## 🎨 技术架构

- **Vue 3 Composition API**：现代化的组件开发模式
- **TypeScript**：类型安全和更好的开发体验
- **Element Plus**：企业级UI组件库
- **Pinia**：Vue 3推荐的状态管理方案
- **Vue Router 4**：官方路由解决方案
- **Axios**：HTTP客户端，支持拦截器和错误处理
- **Vite**：快速的构建工具

## 📞 技术支持

项目包含完整的模拟数据系统，可以独立运行和演示。所有后端接口都已预留好对接位置，只需要替换相应的TODO注释即可。

---

© 2024 自然资源智能审计系统 - 基于Vue3构建的现代化审计管理平台

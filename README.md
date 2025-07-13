# 自然资源智能审计系统

基于Vue3 + Element Plus构建的现代化审计管理系统，专门针对自然资源审计业务场景设计。

## 🚀 功能特性

### 核心功能
- **用户认证**：安全的登录/登出系统，支持权限管理
- **审计项目管理**：创建、编辑、查看和管理审计项目
- **智能文本分析**：基于AI的审计文本自动分析和风险评估
- **数据可视化**：直观的图表展示审计数据统计和趋势（基于ECharts）
- **知识库管理**：维护审计相关的法规、案例、模板和指南
- **智能问答**：基于知识库的AI问答助手
- **证据管理**：组织和分析审计证据材料
- **权限管理**：基于角色的菜单和按钮权限控制
- **数据大屏**：湖北审计数据大屏展示

### 技术特性
- **现代化框架**：Vue 3 Composition API + TypeScript + Vite 7.0
- **优雅UI**：Element Plus 2.10 + TailwindCSS 4.1 + Lucide图标
- **状态管理**：Pinia 3.0 + pinia-plugin-persistedstate (支持状态持久化)
- **路由管理**：Vue Router 4 (哈希模式) + 动态菜单生成
- **图表可视化**：ECharts 5.6 + Vue-ECharts
- **HTTP客户端**：Axios 1.10 with 拦截器
- **模拟数据**：MockJS完整的前端模拟数据系统
- **开发工具**：ESLint 9 + Prettier + Vue DevTools
- **接口预留**：为后端对接预留完整的API接口

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16
- pnpm >= 8 (推荐使用pnpm作为包管理器)

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

### 代码检查和格式化
```sh
# 代码检查和自动修复
pnpm lint

# 代码格式化
pnpm format
```

## 📱 应用架构

### 路由结构
系统采用Vue Router 4哈希模式，主要路由结构如下：

```
/                          # 重定向到登录页
/login                     # 登录页面
/app                       # 主应用容器 (LayoutNew.vue)
├── /app/home             # 首页仪表板
├── /app/projects         # 我的项目
├── /app/audit-text       # 审计文书生成
├── /app/data-analysis    # 数据分析
├── /app/audit-assistant  # 法律法规查询
├── /app/knowledge-management # 知识库
├── /app/user-management      # 用户管理 (管理员)
├── /app/admin-knowledge-management # 知识库管理 (管理员)
├── /app/database-management     # 数据库管理 (管理员)
└── /app/*-edit/:id?             # 各类编辑页面 (隐藏菜单)
/data-screen              # 独立数据大屏
```

### 权限管理架构
- **基于角色的权限控制**：支持`admin`和`user`两种角色
- **动态菜单生成**：根据用户权限动态生成侧边栏菜单
- **三级权限控制**：菜单权限、按钮权限、API权限
- **权限持久化**：使用`pinia-plugin-persistedstate`持久化权限状态

### 状态管理架构
使用Pinia进行状态管理，主要Store包括：
- `auth.ts` - 用户认证状态管理
- `permission.ts` - 权限管理和菜单生成
- `project.ts` - 项目数据管理
- `knowledge.ts` - 知识库数据管理

### 组件架构
- **布局组件**：`LayoutNew.vue` - 统一的应用布局容器
- **页面组件**：按功能模块组织在`views/`目录下
- **通用组件**：可复用组件位于`views/components/`
- **工具函数**：`utils/menuGenerator.ts` - 动态菜单生成工具

## 🚩 页面功能概览

### 用户功能模块
1. **首页** (`/app/home`) - 湖北审计数据大屏展示
2. **我的项目** (`/app/projects`) - 项目列表、搜索、筛选、状态管理
3. **审计文书生成** (`/app/audit-text`) - AI文本分析、摘要提取、风险评估
4. **数据分析** (`/app/data-analysis`) - 统计图表、趋势分析、可视化展示
5. **法律法规查询** (`/app/audit-assistant`) - AI问答、知识检索
6. **知识库** (`/app/knowledge-management`) - 知识条目管理、内容搜索

### 管理员功能模块
7. **用户管理** (`/app/user-management`) - 用户账户管理
8. **知识库管理** (`/app/admin-knowledge-management`) - 知识内容维护
9. **数据库管理** (`/app/database-management`) - 系统数据管理

### 编辑页面 (动态路由)
- **项目编辑** (`/app/project-edit/:id?`) - 项目信息、审计要点、证据管理
- **知识编辑** (`/app/knowledge-edit/:id?`) - 富文本编辑、Markdown支持
- **证据组编辑** (`/app/evidence-group-edit/:id?`) - 证据文件管理、分析记录

### 特殊页面
- **数据大屏** (`/data-screen`) - 独立的数据可视化大屏
- **登录页** (`/login`) - 用户认证入口 (演示账号：admin / admin123)

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

## 📦 项目结构

```
src/
├── assets/              # 静态资源
├── components/          # 公共组件
├── mock/               # 模拟数据
│   ├── data/           # 各模块模拟数据
│   └── index.ts        # Mock配置入口
├── router/             # 路由配置
│   └── index.ts        # 主路由文件
├── services/           # API服务层
│   └── api.ts          # API接口定义
├── stores/             # Pinia状态管理
│   ├── auth.ts         # 认证状态
│   ├── permission.ts   # 权限管理
│   ├── project.ts      # 项目数据
│   └── knowledge.ts    # 知识库数据
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
│   └── menuGenerator.ts # 菜单生成工具
├── views/              # 页面组件
│   ├── admin/          # 管理员页面
│   ├── components/     # 页面级组件
│   ├── ErrorPage/      # 错误页面
│   └── *.vue           # 各功能页面
├── App.vue             # 根组件
└── main.ts             # 应用入口
```

## 🎨 技术栈详情

### 核心框架
- **Vue 3.5.17**：采用Composition API，提供现代化的组件开发体验
- **TypeScript 5.8**：提供类型安全和更好的开发体验
- **Vite 7.0**：快速的构建工具，支持热重载和优化构建

### UI框架
- **Element Plus 2.10**：企业级Vue组件库
- **TailwindCSS 4.1**：原子化CSS框架，提供灵活的样式解决方案
- **Lucide Vue Next**：现代化的图标库

### 状态管理与路由
- **Pinia 3.0**：Vue 3推荐的状态管理方案
- **Vue Router 4.5**：官方路由解决方案，支持哈希模式
- **pinia-plugin-persistedstate**：状态持久化插件

### 数据可视化
- **ECharts 5.6**：功能强大的图表库
- **Vue-ECharts 7.0**：ECharts的Vue 3封装

### 开发工具
- **ESLint 9**：代码检查工具，集成Prettier配置
- **Vue DevTools**：Vue开发调试工具
- **MockJS**：前端数据模拟

## 📞 技术支持

项目包含完整的模拟数据系统，可以独立运行和演示。所有后端接口都已预留好对接位置，只需要替换相应的TODO注释即可。

---

© 2024 自然资源智能审计系统 - 基于Vue3构建的现代化审计管理平台

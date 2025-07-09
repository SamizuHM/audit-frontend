# Mock 数据使用说明

本项目使用 MockJS 来管理前端的模拟数据，为了便于维护和扩展，采用了模块化的组织方式。

## 文件结构

```
src/mock/
├── index.ts              # Mock 主入口文件
└── data/
    ├── dashboard.ts      # 仪表盘相关数据
    ├── users.ts          # 用户管理相关数据
    ├── knowledge.ts      # 知识库相关数据
    └── projects.ts       # 审计项目相关数据
```

## 模块说明

### 1. dashboard.ts - 仪表盘数据

包含湖北审计仪表盘页面所需的所有数据：

- `overallStats` - 总体统计数据
- `projectStats` - 项目统计数据
- `knowledgeBases` - 知识库数据
- `promptModels` - 提示词模型数据
- `yearlyTrendData` - 年度趋势数据
- `hubeiCitiesData` - 湖北省各地市数据
- `pieData` - 饼图数据
- `projectsData` - 项目列表数据

### 2. users.ts - 用户管理数据

包含用户管理相关的数据：

- `usersData` - 用户基础数据
- `rolesData` - 角色权限数据
- `generateMockUsers()` - 动态生成用户数据的函数

### 3. knowledge.ts - 知识库数据

包含知识库管理相关的数据：

- `knowledgeData` - 知识库文档数据
- `knowledgeCategories` - 知识库分类
- `promptTemplates` - 提示词模板数据
- `generateMockKnowledge()` - 动态生成知识库数据的函数
- `generateMockPrompts()` - 动态生成提示词模板的函数

### 4. projects.ts - 审计项目数据

包含审计项目管理相关的数据：

- `auditProjects` - 审计项目数据
- `auditFindings` - 审计发现数据
- `generateMockProjects()` - 动态生成项目数据的函数
- `generateMockFindings()` - 动态生成审计发现数据的函数

## 使用方式

### 1. 导入静态数据

```typescript
import { overallStats, projectsData } from '@/mock/data/dashboard'

// 在组件中使用
const stats = ref(overallStats)
const projects = ref(projectsData)
```

### 2. 导入动态生成的数据

```typescript
import { generateMockUsers } from '@/mock/data/users'

// 生成20个用户数据
const mockUsers = generateMockUsers(20)
```

### 3. 导入类型定义

```typescript
import { type Project, type User } from '@/mock/data/dashboard'
```

## 扩展指南

### 添加新的数据模块

1. 在 `src/mock/data/` 目录下创建新的 `.ts` 文件
2. 定义相关的 TypeScript 接口
3. 导出静态数据和动态生成函数
4. 在 `src/mock/index.ts` 中导出新模块

示例：

```typescript
// src/mock/data/reports.ts
import Mock from 'mockjs'

export interface Report {
  id: number
  title: string
  content: string
  createdAt: string
}

export const reportsData: Report[] = [
  // 静态数据
]

export const generateMockReports = (count: number = 10) => {
  return Mock.mock({
    [`reports|${count}`]: [
      {
        'id|+1': 1,
        title: '@ctitle(10, 20)',
        content: '@cparagraph(5, 10)',
        createdAt: '@date("yyyy-MM-dd")',
      },
    ],
  })
}
```

### 修改现有数据

直接编辑对应模块文件中的数据即可，修改会立即生效。

### 添加 API 模拟

如果需要模拟后端 API，可以在 `src/mock/index.ts` 中添加拦截规则：

```typescript
// 模拟 API 响应
Mock.mock('/api/projects', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: projectsData,
  }
})

Mock.mock('/api/users', 'post', (options) => {
  const { body } = options
  // 处理请求数据
  return {
    code: 200,
    message: 'success',
    data: { id: 1, ...JSON.parse(body) },
  }
})
```

## 注意事项

1. **类型安全**：所有数据都提供了 TypeScript 类型定义，确保类型安全
2. **模块化**：按功能模块组织数据，便于维护和查找
3. **扩展性**：预留了扩展空间，可以轻松添加新的数据模块
4. **动态生成**：使用 MockJS 可以生成大量随机数据，便于测试
5. **性能考虑**：避免在组件中直接定义大量数据，影响性能

## MockJS 语法参考

- `@ctitle(min, max)` - 生成中文标题
- `@cname` - 生成中文姓名
- `@date("yyyy-MM-dd")` - 生成日期
- `@pick([...])` - 从数组中随机选择
- `'property|min-max': value` - 生成指定范围的数据
- `'array|count': [template]` - 生成指定数量的数组

更多语法请参考 [MockJS 官方文档](http://mockjs.com/examples.html)。

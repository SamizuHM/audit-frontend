import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // TODO: 在这里添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // TODO: 处理错误响应
    if (error.response?.status === 401) {
      // 未授权，跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api

// 接口类型定义
export interface LoginRequest {
  username: string
  password: string
  role: 'user' | 'admin'
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    name: string
    role: string
  }
}

export interface AuditProject {
  id: number
  name: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  createTime: string
  updateTime: string
  creator: string
  auditType: string
  progress: number
}

export interface KnowledgeItem {
  id: number
  title: string
  content: string
  type: 'regulation' | 'case' | 'template' | 'guide'
  tags: string[]
  createTime: string
  updateTime: string
  creator: string
}

export interface EvidenceGroup {
  id: number
  name: string
  description: string
  projectId: number
  evidenceCount: number
  createTime: string
  updateTime: string
}

// API函数
export const authApi = {
  // 登录
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // TODO: 替换为真实接口调用
    // return api.post('/auth/login', data)

    // 模拟登录响应
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (data.username === 'admin' && data.password === 'admin123') {
      return {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: data.username,
          name: data.role === 'admin' ? '管理员' : '普通用户',
          role: data.role,
        },
      }
    }
    throw new Error('用户名或密码错误')
  },

  // 退出登录
  logout: async (): Promise<void> => {
    // TODO: 替换为真实接口调用
    // return api.post('/auth/logout')

    // 模拟退出
    await new Promise((resolve) => setTimeout(resolve, 500))
    localStorage.removeItem('token')
  },
}

export const projectApi = {
  // 获取项目列表
  getProjects: async (): Promise<AuditProject[]> => {
    // TODO: 替换为真实接口调用
    // return api.get('/projects')

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      {
        id: 1,
        name: '2024年度土地利用审计',
        description: '对全市土地利用情况进行全面审计',
        status: 'active',
        createTime: '2024-01-15',
        updateTime: '2024-01-20',
        creator: '张三',
        auditType: '土地利用审计',
        progress: 65,
      },
      {
        id: 2,
        name: '矿产资源开发专项审计',
        description: '针对矿产资源开发利用情况的专项审计',
        status: 'draft',
        createTime: '2024-01-10',
        updateTime: '2024-01-18',
        creator: '李四',
        auditType: '矿产资源审计',
        progress: 30,
      },
    ]
  },

  // 创建项目
  createProject: async (
    data: Omit<AuditProject, 'id' | 'createTime' | 'updateTime'>,
  ): Promise<AuditProject> => {
    // TODO: 替换为真实接口调用
    // return api.post('/projects', data)

    // 模拟创建
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      ...data,
      id: Date.now(),
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0],
    }
  },

  // 更新项目
  updateProject: async (id: number, data: Partial<AuditProject>): Promise<AuditProject> => {
    // TODO: 替换为真实接口调用
    // return api.put(`/projects/${id}`, data)

    // 模拟更新
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      ...data,
      id,
      updateTime: new Date().toISOString().split('T')[0],
    } as AuditProject
  },

  // 删除项目
  deleteProject: async (id: number): Promise<void> => {
    // TODO: 替换为真实接口调用
    // return api.delete(`/projects/${id}`)

    // 模拟删除
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}

export const knowledgeApi = {
  // 获取知识库列表
  getKnowledgeList: async (): Promise<KnowledgeItem[]> => {
    // TODO: 替换为真实接口调用
    // return api.get('/knowledge')

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      {
        id: 1,
        title: '土地管理法实施条例',
        content: '土地管理法实施条例的具体内容...',
        type: 'regulation',
        tags: ['土地管理', '法规'],
        createTime: '2024-01-01',
        updateTime: '2024-01-01',
        creator: '系统管理员',
      },
      {
        id: 2,
        title: '矿产资源审计案例',
        content: '某市矿产资源审计的典型案例...',
        type: 'case',
        tags: ['矿产资源', '审计案例'],
        createTime: '2024-01-02',
        updateTime: '2024-01-02',
        creator: '审计专家',
      },
    ]
  },

  // 创建知识条目
  createKnowledge: async (
    data: Omit<KnowledgeItem, 'id' | 'createTime' | 'updateTime'>,
  ): Promise<KnowledgeItem> => {
    // TODO: 替换为真实接口调用
    // return api.post('/knowledge', data)

    // 模拟创建
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      ...data,
      id: Date.now(),
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0],
    }
  },

  // 更新知识条目
  updateKnowledge: async (id: number, data: Partial<KnowledgeItem>): Promise<KnowledgeItem> => {
    // TODO: 替换为真实接口调用
    // return api.put(`/knowledge/${id}`, data)

    // 模拟更新
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      ...data,
      id,
      updateTime: new Date().toISOString().split('T')[0],
    } as KnowledgeItem
  },

  // 删除知识条目
  deleteKnowledge: async (id: number): Promise<void> => {
    // TODO: 替换为真实接口调用
    // return api.delete(`/knowledge/${id}`)

    // 模拟删除
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}

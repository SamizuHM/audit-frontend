import Mock from 'mockjs'

// 用户相关的 mock 数据
export interface User {
  id: number
  username: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
}

// 用户数据
export const usersData: User[] = [
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    email: 'admin@audit.gov.cn',
    role: '超级管理员',
    department: '审计厅',
    status: 'active',
    createdAt: '2023-01-01',
    lastLogin: '2024-07-09 09:30:00',
  },
  {
    id: 2,
    username: 'auditor01',
    name: '张明',
    email: 'zhangming@audit.gov.cn',
    role: '主审人',
    department: '第一审计处',
    status: 'active',
    createdAt: '2023-02-15',
    lastLogin: '2024-07-08 16:45:00',
  },
  {
    id: 3,
    username: 'auditor02',
    name: '李华',
    email: 'lihua@audit.gov.cn',
    role: '审计员',
    department: '第二审计处',
    status: 'active',
    createdAt: '2023-03-10',
    lastLogin: '2024-07-07 14:20:00',
  },
]

// 生成更多用户数据
export const generateMockUsers = (count: number = 20) => {
  return Mock.mock({
    [`users|${count}`]: [
      {
        'id|+1': 100,
        username: '@word(6, 12)',
        name: '@cname',
        email: '@email',
        role: '@pick(["主审人", "审计员", "复核员", "管理员"])',
        department: '@pick(["第一审计处", "第二审计处", "第三审计处", "综合处", "法规处"])',
        status: '@pick(["active", "inactive"])',
        createdAt: '@date("yyyy-MM-dd")',
        lastLogin: '@datetime("yyyy-MM-dd HH:mm:ss")',
      },
    ],
  })
}

// 角色权限数据
export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  createdAt: string
}

export const rolesData: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限',
    permissions: ['*'],
    createdAt: '2023-01-01',
  },
  {
    id: 2,
    name: '主审人',
    description: '项目主审人，可管理审计项目',
    permissions: [
      'project:read',
      'project:write',
      'project:manage',
      'document:read',
      'document:write',
    ],
    createdAt: '2023-01-01',
  },
  {
    id: 3,
    name: '审计员',
    description: '普通审计员，可参与审计项目',
    permissions: ['project:read', 'document:read', 'document:write'],
    createdAt: '2023-01-01',
  },
  {
    id: 4,
    name: '复核员',
    description: '审计复核员，可复核审计文书',
    permissions: ['project:read', 'document:read', 'document:review'],
    createdAt: '2023-01-01',
  },
]

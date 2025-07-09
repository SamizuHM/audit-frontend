import Mock from 'mockjs'

// 知识库相关数据
export interface KnowledgeItem {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  createdAt: string
  updatedAt: string
  viewCount: number
  downloadCount: number
  fileUrl?: string
  fileSize?: string
  fileType?: string
}

// 知识库分类
export const knowledgeCategories = [
  '土地资源审计',
  '水资源审计',
  '矿产资源审计',
  '林业资源审计',
  '生态资源审计',
  '城市建设审计',
  '农业生产审计',
  '财政资金审计',
  '经济责任审计',
  '政策跟踪审计',
]

// 知识库数据
export const knowledgeData: KnowledgeItem[] = [
  {
    id: 1,
    title: '土地使用权审计操作指南',
    content: '详细介绍了土地使用权审计的程序、方法和注意事项...',
    category: '土地资源审计',
    tags: ['土地使用权', '审计程序', '操作指南'],
    author: '张明',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
    viewCount: 156,
    downloadCount: 43,
    fileUrl: '/knowledge/land-audit-guide.pdf',
    fileSize: '2.3MB',
    fileType: 'PDF',
  },
  {
    id: 2,
    title: '水资源保护项目审计案例分析',
    content: '通过典型案例分析水资源保护项目审计的关键点...',
    category: '水资源审计',
    tags: ['水资源保护', '案例分析', '审计要点'],
    author: '李华',
    createdAt: '2024-02-10',
    updatedAt: '2024-04-15',
    viewCount: 98,
    downloadCount: 32,
    fileUrl: '/knowledge/water-audit-cases.pdf',
    fileSize: '1.8MB',
    fileType: 'PDF',
  },
  {
    id: 3,
    title: '矿产资源开发审计技术规范',
    content: '矿产资源开发项目审计的技术规范和标准...',
    category: '矿产资源审计',
    tags: ['矿产开发', '技术规范', '审计标准'],
    author: '王强',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-10',
    viewCount: 134,
    downloadCount: 56,
    fileUrl: '/knowledge/mineral-audit-standard.pdf',
    fileSize: '3.1MB',
    fileType: 'PDF',
  },
]

// 生成更多知识库数据
export const generateMockKnowledge = (count: number = 50) => {
  return Mock.mock({
    [`knowledge|${count}`]: [
      {
        'id|+1': 100,
        title: '@ctitle(8, 20)',
        content: '@cparagraph(3, 6)',
        category: `@pick(${JSON.stringify(knowledgeCategories)})`,
        'tags|2-5': ['@cword(2, 6)'],
        author: '@cname',
        createdAt: '@date("yyyy-MM-dd")',
        updatedAt: '@date("yyyy-MM-dd")',
        'viewCount|10-500': 1,
        'downloadCount|0-100': 1,
        fileUrl: '/knowledge/@guid.pdf',
        fileSize: '@float(0.5, 10, 1, 1)MB',
        fileType: '@pick(["PDF", "Word", "Excel", "PPT"])',
      },
    ],
  })
}

// 提示词模板数据
export interface PromptTemplate {
  id: number
  name: string
  category: string
  description: string
  template: string
  variables: string[]
  author: string
  createdAt: string
  updatedAt: string
  useCount: number
  isPublic: boolean
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 1,
    name: '土地利用审计报告模板',
    category: '土地资源',
    description: '用于生成土地利用审计报告的标准模板',
    template: '根据审计发现，{{地区}}的土地利用情况如下：...',
    variables: ['地区', '审计期间', '主要发现', '建议措施'],
    author: '张明',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-15',
    useCount: 45,
    isPublic: true,
  },
  {
    id: 2,
    name: '水资源管理审计询问提纲',
    category: '水资源',
    description: '水资源管理项目审计的标准询问提纲',
    template: '请就以下问题进行回答：1. {{项目名称}}的水资源配置是否合理？...',
    variables: ['项目名称', '管理部门', '实施期间', '预算金额'],
    author: '李华',
    createdAt: '2024-02-05',
    updatedAt: '2024-04-10',
    useCount: 32,
    isPublic: true,
  },
]

// 生成更多提示词模板
export const generateMockPrompts = (count: number = 30) => {
  return Mock.mock({
    [`prompts|${count}`]: [
      {
        'id|+1': 100,
        name: '@ctitle(6, 15)',
        category: `@pick(${JSON.stringify(knowledgeCategories)})`,
        description: '@cparagraph(1, 2)',
        template: '@cparagraph(2, 4)',
        'variables|2-6': ['@cword(2, 4)'],
        author: '@cname',
        createdAt: '@date("yyyy-MM-dd")',
        updatedAt: '@date("yyyy-MM-dd")',
        'useCount|0-100': 1,
        isPublic: '@boolean',
      },
    ],
  })
}

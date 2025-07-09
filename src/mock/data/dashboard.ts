import Mock from 'mockjs'

// 定义类型
export interface AuditType {
  name: string
  count: number
}

export interface RecentProject {
  id: number
  name: string
  date: string
}

export interface Document {
  id: number
  name: string
  type: string
  size: string
  uploadDate: string
  url: string
}

export interface Project {
  id: number
  name: string
  region: string
  startDate: string
  endDate: string
  auditor: string
  status: '进行中' | '已完成' | '待开始'
  documents: Document[]
}

export interface City {
  id: string
  name: string
  projects: number
  ongoing: number
  completed: number
  pending: number
  labelX: number
  labelY: number
  path: string
  auditTypes: AuditType[]
  recentProjects: RecentProject[]
}

// 总体统计数据
export const overallStats = {
  totalProjects: 1248,
  totalFiles: 8956,
}

// 项目统计数据
export const projectStats = {
  ongoing: 234,
  completed: 947,
}

// 知识库数据
export const knowledgeBases = [
  { name: '土地资源审计知识库', docCount: 156 },
  { name: '水资源审计知识库', docCount: 98 },
  { name: '矿产资源审计知识库', docCount: 134 },
  { name: '林业资源审计知识库', docCount: 87 },
  { name: '生态资源审计知识库', docCount: 76 },
  { name: '城市建设审计知识库', docCount: 112 },
  { name: '农业生产审计知识库', docCount: 89 },
]

// 提示词模型数据
export const promptModels = [
  { category: '土地资源', count: 25 },
  { category: '水资源', count: 18 },
  { category: '矿产资源', count: 22 },
  { category: '林业资源', count: 15 },
  { category: '生态资源', count: 19 },
  { category: '城市建设', count: 28 },
  { category: '农业生产', count: 16 },
]

// 年度趋势数据
export const yearlyTrendData = [
  { year: '2019', projects: 680 },
  { year: '2020', projects: 720 },
  { year: '2021', projects: 850 },
  { year: '2022', projects: 920 },
  { year: '2023', projects: 1050 },
  { year: '2024', projects: 1248 },
]

// 湖北省各地市数据
export const hubeiCitiesData = [
  { name: '武汉市', value: 156, ongoing: 45, completed: 89, pending: 22 },
  { name: '黄石市', value: 98, ongoing: 28, completed: 56, pending: 14 },
  { name: '十堰市', value: 87, ongoing: 25, completed: 48, pending: 14 },
  { name: '宜昌市', value: 76, ongoing: 22, completed: 42, pending: 12 },
  { name: '襄阳市', value: 65, ongoing: 18, completed: 35, pending: 12 },
  { name: '鄂州市', value: 54, ongoing: 16, completed: 28, pending: 10 },
  { name: '荆门市', value: 43, ongoing: 12, completed: 23, pending: 8 },
  { name: '孝感市', value: 38, ongoing: 11, completed: 20, pending: 7 },
  { name: '荆州市', value: 42, ongoing: 13, completed: 21, pending: 8 },
  { name: '黄冈市', value: 51, ongoing: 15, completed: 26, pending: 10 },
  { name: '咸宁市', value: 35, ongoing: 10, completed: 18, pending: 7 },
  { name: '随州市', value: 28, ongoing: 8, completed: 15, pending: 5 },
  { name: '恩施土家族苗族自治州', value: 33, ongoing: 9, completed: 17, pending: 7 },
  { name: '仙桃市', value: 25, ongoing: 7, completed: 12, pending: 6 },
  { name: '潜江市', value: 22, ongoing: 6, completed: 11, pending: 5 },
  { name: '天门市', value: 19, ongoing: 5, completed: 10, pending: 4 },
  { name: '神农架林区', value: 12, ongoing: 3, completed: 6, pending: 3 },
]

// 饼图数据
export const pieData = [
  { name: '土地利用审计', value: 35, color: '#2563eb' },
  { name: '矿产资源审计', value: 28, color: '#7c3aed' },
  { name: '森林资源审计', value: 22, color: '#059669' },
  { name: '水资源审计', value: 15, color: '#dc2626' },
]

// 项目数据 - 使用 MockJS 生成更多样化的数据
export const projectsData: Project[] = [
  // 武汉市项目
  {
    id: 1,
    name: '武汉市土地利用综合审计项目',
    region: '武汉市',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    auditor: '张明',
    status: '已完成',
    documents: [
      {
        id: 1,
        name: '审计报告.pdf',
        type: 'PDF',
        size: '2.3MB',
        uploadDate: '2024-06-28',
        url: '/documents/audit-report-1.pdf',
      },
      {
        id: 2,
        name: '审计工作底稿.xlsx',
        type: 'Excel',
        size: '1.8MB',
        uploadDate: '2024-06-25',
        url: '/documents/working-papers-1.xlsx',
      },
      {
        id: 3,
        name: '审计意见书.pdf',
        type: 'PDF',
        size: '856KB',
        uploadDate: '2024-06-30',
        url: '/documents/audit-opinion-1.pdf',
      },
    ],
  },
  {
    id: 2,
    name: '武汉市矿产资源开发审计',
    region: '武汉市',
    startDate: '2024-03-01',
    endDate: '2024-08-15',
    auditor: '李华',
    status: '进行中',
    documents: [
      {
        id: 4,
        name: '审计计划书.pdf',
        type: 'PDF',
        size: '1.2MB',
        uploadDate: '2024-02-28',
        url: '/documents/audit-plan-2.pdf',
      },
      {
        id: 5,
        name: '现场勘查记录.docx',
        type: 'Word',
        size: '3.5MB',
        uploadDate: '2024-04-10',
        url: '/documents/field-survey-2.docx',
      },
    ],
  },
  // 黄石市项目
  {
    id: 3,
    name: '黄石市森林资源保护审计',
    region: '黄石市',
    startDate: '2024-02-10',
    endDate: '2024-07-20',
    auditor: '王强',
    status: '进行中',
    documents: [
      {
        id: 6,
        name: '审计实施方案.pdf',
        type: 'PDF',
        size: '1.5MB',
        uploadDate: '2024-02-08',
        url: '/documents/implementation-plan-3.pdf',
      },
      {
        id: 7,
        name: '森林覆盖率数据分析.xlsx',
        type: 'Excel',
        size: '2.1MB',
        uploadDate: '2024-03-15',
        url: '/documents/forest-coverage-3.xlsx',
      },
    ],
  },
  {
    id: 4,
    name: '黄石市水资源管理审计项目',
    region: '黄石市',
    startDate: '2023-11-01',
    endDate: '2024-04-30',
    auditor: '陈丽',
    status: '已完成',
    documents: [
      {
        id: 8,
        name: '水资源审计报告.pdf',
        type: 'PDF',
        size: '3.2MB',
        uploadDate: '2024-04-28',
        url: '/documents/water-audit-report-4.pdf',
      },
      {
        id: 9,
        name: '水质检测数据.xlsx',
        type: 'Excel',
        size: '4.1MB',
        uploadDate: '2024-04-20',
        url: '/documents/water-quality-4.xlsx',
      },
      {
        id: 10,
        name: '整改建议书.pdf',
        type: 'PDF',
        size: '1.1MB',
        uploadDate: '2024-04-30',
        url: '/documents/recommendations-4.pdf',
      },
    ],
  },
  // 十堰市项目
  {
    id: 5,
    name: '十堰市生态环境综合审计',
    region: '十堰市',
    startDate: '2024-05-01',
    endDate: '2024-10-31',
    auditor: '刘斌',
    status: '进行中',
    documents: [
      {
        id: 11,
        name: '生态环境现状调研报告.pdf',
        type: 'PDF',
        size: '5.2MB',
        uploadDate: '2024-06-10',
        url: '/documents/eco-survey-5.pdf',
      },
    ],
  },
  {
    id: 6,
    name: '十堰市汽车产业发展审计',
    region: '十堰市',
    startDate: '2024-01-10',
    endDate: '2024-05-30',
    auditor: '赵军',
    status: '已完成',
    documents: [
      {
        id: 12,
        name: '产业发展审计报告.pdf',
        type: 'PDF',
        size: '4.1MB',
        uploadDate: '2024-05-28',
        url: '/documents/industry-audit-6.pdf',
      },
      {
        id: 13,
        name: '财务数据分析.xlsx',
        type: 'Excel',
        size: '2.8MB',
        uploadDate: '2024-05-25',
        url: '/documents/financial-analysis-6.xlsx',
      },
    ],
  },
  // 宜昌市项目
  {
    id: 7,
    name: '宜昌市长江生态保护审计',
    region: '宜昌市',
    startDate: '2024-03-15',
    endDate: '2024-09-30',
    auditor: '孙薇',
    status: '进行中',
    documents: [
      {
        id: 14,
        name: '生态保护审计方案.pdf',
        type: 'PDF',
        size: '2.5MB',
        uploadDate: '2024-03-10',
        url: '/documents/eco-protection-7.pdf',
      },
      {
        id: 15,
        name: '水质监测数据.xlsx',
        type: 'Excel',
        size: '3.2MB',
        uploadDate: '2024-04-20',
        url: '/documents/water-monitoring-7.xlsx',
      },
    ],
  },
  {
    id: 8,
    name: '宜昌市旅游产业发展审计',
    region: '宜昌市',
    startDate: '2023-10-01',
    endDate: '2024-03-31',
    auditor: '周琳',
    status: '已完成',
    documents: [
      {
        id: 16,
        name: '旅游产业审计报告.pdf',
        type: 'PDF',
        size: '3.8MB',
        uploadDate: '2024-03-29',
        url: '/documents/tourism-audit-8.pdf',
      },
    ],
  },
  // 襄阳市项目
  {
    id: 9,
    name: '襄阳市农业现代化审计',
    region: '襄阳市',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    auditor: '马超',
    status: '进行中',
    documents: [
      {
        id: 17,
        name: '农业现代化审计计划.pdf',
        type: 'PDF',
        size: '1.9MB',
        uploadDate: '2024-01-28',
        url: '/documents/agriculture-plan-9.pdf',
      },
      {
        id: 18,
        name: '农业补贴资金审查.xlsx',
        type: 'Excel',
        size: '2.6MB',
        uploadDate: '2024-03-15',
        url: '/documents/agriculture-subsidy-9.xlsx',
      },
    ],
  },
  {
    id: 10,
    name: '襄阳市城市建设项目审计',
    region: '襄阳市',
    startDate: '2023-12-01',
    endDate: '2024-06-30',
    auditor: '李雪',
    status: '已完成',
    documents: [
      {
        id: 19,
        name: '城建项目审计报告.pdf',
        type: 'PDF',
        size: '4.5MB',
        uploadDate: '2024-06-28',
        url: '/documents/urban-construction-10.pdf',
      },
      {
        id: 20,
        name: '工程造价审核.xlsx',
        type: 'Excel',
        size: '3.1MB',
        uploadDate: '2024-06-25',
        url: '/documents/cost-audit-10.xlsx',
      },
    ],
  },
  // 其他城市项目（简化版本，避免文件过长）
  {
    id: 11,
    name: '鄂州市航空港建设审计',
    region: '鄂州市',
    startDate: '2024-04-01',
    endDate: '2024-10-31',
    auditor: '田浩',
    status: '进行中',
    documents: [
      {
        id: 21,
        name: '航空港建设审计方案.pdf',
        type: 'PDF',
        size: '2.8MB',
        uploadDate: '2024-03-28',
        url: '/documents/airport-plan-11.pdf',
      },
    ],
  },
  {
    id: 12,
    name: '荆门市化工园区安全审计',
    region: '荆门市',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    auditor: '吴凯',
    status: '进行中',
    documents: [
      {
        id: 22,
        name: '安全审计实施方案.pdf',
        type: 'PDF',
        size: '2.1MB',
        uploadDate: '2024-02-28',
        url: '/documents/safety-plan-12.pdf',
      },
    ],
  },
  {
    id: 13,
    name: '孝感市教育资源配置审计',
    region: '孝感市',
    startDate: '2024-02-15',
    endDate: '2024-08-15',
    auditor: '宋娜',
    status: '进行中',
    documents: [
      {
        id: 23,
        name: '教育资源审计报告.pdf',
        type: 'PDF',
        size: '2.9MB',
        uploadDate: '2024-05-20',
        url: '/documents/education-audit-13.pdf',
      },
    ],
  },
  {
    id: 14,
    name: '荆州市古城保护利用审计',
    region: '荆州市',
    startDate: '2024-01-20',
    endDate: '2024-07-20',
    auditor: '梁伟',
    status: '已完成',
    documents: [
      {
        id: 24,
        name: '古城保护审计报告.pdf',
        type: 'PDF',
        size: '4.2MB',
        uploadDate: '2024-07-18',
        url: '/documents/heritage-audit-14.pdf',
      },
    ],
  },
  {
    id: 15,
    name: '神农架林区生物多样性保护审计',
    region: '神农架林区',
    startDate: '2024-05-10',
    endDate: '2024-11-10',
    auditor: '谭敏',
    status: '进行中',
    documents: [
      {
        id: 25,
        name: '生物多样性保护方案.pdf',
        type: 'PDF',
        size: '4.1MB',
        uploadDate: '2024-05-08',
        url: '/documents/biodiversity-15.pdf',
      },
    ],
  },
]

// 使用 MockJS 生成动态数据的示例函数
export const generateMockProjectData = () => {
  return Mock.mock({
    'projects|10-20': [
      {
        'id|+1': 1000,
        name: '@ctitle(10, 20)',
        region: '@pick(["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市"])',
        startDate: '@date("yyyy-MM-dd")',
        endDate: '@date("yyyy-MM-dd")',
        auditor: '@cname',
        status: '@pick(["进行中", "已完成", "待开始"])',
        'documents|1-5': [
          {
            'id|+1': 1,
            name: '@ctitle(5, 10).pdf',
            type: '@pick(["PDF", "Excel", "Word"])',
            size: '@float(0.5, 5, 1, 1)MB',
            uploadDate: '@date("yyyy-MM-dd")',
            url: '/documents/@guid.pdf',
          },
        ],
      },
    ],
  })
}

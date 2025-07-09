import Mock from 'mockjs'

// 审计项目相关数据
export interface AuditProject {
  id: number
  name: string
  code: string
  type: string
  region: string
  department: string
  startDate: string
  endDate: string
  plannedEndDate: string
  status: '待开始' | '进行中' | '已完成' | '已归档' | '暂停'
  priority: 'high' | 'medium' | 'low'
  budget: number
  actualCost: number
  progress: number
  leader: string
  members: string[]
  description: string
  objectives: string[]
  scope: string
  methodology: string[]
  riskLevel: 'high' | 'medium' | 'low'
  createdAt: string
  updatedAt: string
}

// 审计发现
export interface AuditFinding {
  id: number
  projectId: number
  title: string
  description: string
  severity: 'critical' | 'major' | 'minor'
  category: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  foundDate: string
  dueDate: string
  assignee: string
  evidence: string[]
  recommendation: string
  response?: string
  createdAt: string
  updatedAt: string
}

// 审计项目数据
export const auditProjects: AuditProject[] = [
  {
    id: 1,
    name: '武汉市2024年土地利用专项审计',
    code: 'WH-2024-001',
    type: '专项审计',
    region: '武汉市',
    department: '武汉市自然资源和规划局',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    plannedEndDate: '2024-06-30',
    status: '已完成',
    priority: 'high',
    budget: 500000,
    actualCost: 485000,
    progress: 100,
    leader: '张明',
    members: ['李华', '王强', '陈丽'],
    description: '对武汉市2023年土地利用情况进行全面审计，重点关注土地出让、征收补偿等环节',
    objectives: ['核查土地出让收入', '评估征收补偿政策执行', '检查土地利用规划落实'],
    scope: '武汉市全市范围内的土地利用相关活动',
    methodology: ['实地勘查', '账务检查', '访谈调研', '数据分析'],
    riskLevel: 'medium',
    createdAt: '2023-12-01',
    updatedAt: '2024-06-30',
  },
  {
    id: 2,
    name: '黄石市矿产资源开发审计',
    code: 'HS-2024-002',
    type: '资源环境审计',
    region: '黄石市',
    department: '黄石市自然资源局',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    plannedEndDate: '2024-08-31',
    status: '进行中',
    priority: 'high',
    budget: 800000,
    actualCost: 450000,
    progress: 65,
    leader: '王强',
    members: ['李华', '张明', '刘斌', '孙薇'],
    description: '对黄石市矿产资源开发利用情况进行审计，关注环保合规性和资源保护',
    objectives: ['评估资源开发合规性', '检查环保措施落实', '核查资源税费缴纳'],
    scope: '黄石市主要矿产开发企业和项目',
    methodology: ['现场检查', '环境监测', '财务审计', '合规性审查'],
    riskLevel: 'high',
    createdAt: '2024-01-15',
    updatedAt: '2024-07-01',
  },
]

// 审计发现数据
export const auditFindings: AuditFinding[] = [
  {
    id: 1,
    projectId: 1,
    title: '部分土地出让程序不规范',
    description: '发现3宗土地出让未按规定进行公开招拍挂，涉及金额约2.5亿元',
    severity: 'major',
    category: '程序合规',
    status: 'resolved',
    foundDate: '2024-03-15',
    dueDate: '2024-05-15',
    assignee: '李华',
    evidence: ['出让合同', '招标公告', '评标记录'],
    recommendation: '严格执行土地出让相关法规，完善内部控制制度',
    response: '已整改，建立了土地出让审批流程',
    createdAt: '2024-03-15',
    updatedAt: '2024-05-20',
  },
  {
    id: 2,
    projectId: 2,
    title: '矿山生态恢复资金使用不当',
    description: '某矿业公司生态恢复资金1200万元未按计划使用，存在挪用情况',
    severity: 'critical',
    category: '资金管理',
    status: 'in-progress',
    foundDate: '2024-05-20',
    dueDate: '2024-07-20',
    assignee: '王强',
    evidence: ['财务账册', '银行流水', '项目合同'],
    recommendation: '追回挪用资金，建立专项资金监管机制',
    createdAt: '2024-05-20',
    updatedAt: '2024-06-15',
  },
]

// 生成更多审计项目数据
export const generateMockProjects = (count: number = 20) => {
  return Mock.mock({
    [`projects|${count}`]: [
      {
        'id|+1': 100,
        name: '@ctitle(10, 25)',
        code: '@word(2, 4).upper()-2024-@natural(001, 999)',
        type: '@pick(["专项审计", "资源环境审计", "经济责任审计", "政策跟踪审计", "财政资金审计"])',
        region:
          '@pick(["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市", "孝感市"])',
        department: '@ctitle(8, 15)',
        startDate: '@date("yyyy-MM-dd")',
        endDate: '@date("yyyy-MM-dd")',
        plannedEndDate: '@date("yyyy-MM-dd")',
        status: '@pick(["待开始", "进行中", "已完成", "已归档", "暂停"])',
        priority: '@pick(["high", "medium", "low"])',
        'budget|100000-2000000': 1,
        'actualCost|50000-1800000': 1,
        'progress|0-100': 1,
        leader: '@cname',
        'members|2-6': ['@cname'],
        description: '@cparagraph(2, 4)',
        'objectives|2-5': ['@ctitle(5, 15)'],
        scope: '@cparagraph(1, 2)',
        'methodology|2-4': [
          '@pick(["实地勘查", "账务检查", "访谈调研", "数据分析", "现场检查", "环境监测"])',
        ],
        riskLevel: '@pick(["high", "medium", "low"])',
        createdAt: '@date("yyyy-MM-dd")',
        updatedAt: '@date("yyyy-MM-dd")',
      },
    ],
  })
}

// 生成更多审计发现数据
export const generateMockFindings = (count: number = 50) => {
  return Mock.mock({
    [`findings|${count}`]: [
      {
        'id|+1': 100,
        'projectId|1-50': 1,
        title: '@ctitle(8, 20)',
        description: '@cparagraph(2, 4)',
        severity: '@pick(["critical", "major", "minor"])',
        category: '@pick(["程序合规", "资金管理", "环境保护", "政策执行", "内部控制"])',
        status: '@pick(["open", "in-progress", "resolved", "closed"])',
        foundDate: '@date("yyyy-MM-dd")',
        dueDate: '@date("yyyy-MM-dd")',
        assignee: '@cname',
        'evidence|1-4': ['@ctitle(3, 8)'],
        recommendation: '@cparagraph(1, 2)',
        response: '@cparagraph(1, 2)',
        createdAt: '@date("yyyy-MM-dd")',
        updatedAt: '@date("yyyy-MM-dd")',
      },
    ],
  })
}

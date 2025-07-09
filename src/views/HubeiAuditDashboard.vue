<template>
  <div class="text-gray-800 p-4">
    <!-- 顶部标题栏 -->
    <div class="mb-6">
      <!-- 总体统计卡片 -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div
          class="bg-white shadow-lg border border-blue-200 rounded-lg p-4 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">总项目数</p>
              <p class="text-2xl font-bold text-blue-500">{{ overallStats.totalProjects }}</p>
            </div>
            <BarChart3Icon class="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div
          class="bg-white shadow-lg border border-purple-200 rounded-lg p-4 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">成果文件</p>
              <p class="text-2xl font-bold text-purple-600">{{ overallStats.totalFiles }}</p>
            </div>
            <FileTextIcon class="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div
          class="bg-white shadow-lg border border-amber-200 rounded-lg p-4 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">进行中</p>
              <p class="text-2xl font-bold text-amber-600">{{ projectStats.ongoing }}</p>
            </div>
            <ActivityIcon class="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div
          class="bg-white shadow-lg border border-green-200 rounded-lg p-4 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">已完成</p>
              <p class="text-2xl font-bold text-green-600">{{ projectStats.completed }}</p>
            </div>
            <DatabaseIcon class="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-12 gap-4 min-h-[600px]">
      <!-- 左侧 - 年度趋势和审计类型分布 -->
      <div class="col-span-3 grid grid-rows-2 gap-4">
        <!-- 年度趋势 -->
        <div class="bg-white shadow-lg border border-gray-200 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <ActivityIcon class="h-5 w-5 text-blue-500" />
            <h3 class="text-blue-500 font-semibold">年度趋势</h3>
          </div>

          <div class="relative h-full">
            <svg viewBox="0 0 400 120" class="w-full h-full max-h-24">
              <defs>
                <pattern id="grid" width="50" height="12" patternUnits="userSpaceOnUse">
                  <path
                    d="M 50 0 L 0 0 0 12"
                    fill="none"
                    stroke="#e5e7eb"
                    stroke-width="0.5"
                    opacity="0.5"
                  />
                </pattern>
              </defs>
              <rect width="400" height="120" fill="url(#grid)" />

              <polyline
                :points="yearlyTrendPoints"
                fill="none"
                stroke="#2563eb"
                stroke-width="2"
                class="drop-shadow-sm"
              />

              <circle
                v-for="(point, index) in yearlyTrendData"
                :key="index"
                :cx="40 + index * 50"
                :cy="120 - point.projects * 0.08"
                r="3"
                fill="#2563eb"
                class="cursor-pointer transition-all duration-300 hover:r-5"
              />

              <text
                v-for="(point, index) in yearlyTrendData"
                :key="'label-' + index"
                :x="40 + index * 50"
                y="115"
                fill="#6b7280"
                text-anchor="middle"
                class="text-xs"
              >
                {{ point.year }}
              </text>
            </svg>
          </div>
        </div>

        <!-- 审计类型分布 -->
        <div class="bg-white shadow-lg border border-gray-200 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <PieChartIcon class="h-5 w-5 text-blue-500" />
            <h3 class="text-blue-500 font-semibold">审计类型分布</h3>
          </div>

          <div class="relative h-full">
            <svg viewBox="0 0 200 200" class="w-full h-full max-h-32">
              <g transform="translate(100,100)">
                <path
                  v-for="(segment, index) in pieSegments"
                  :key="index"
                  :d="segment.path"
                  :fill="segment.color"
                  class="cursor-pointer transition-all duration-300 hover:brightness-110"
                  :transform="hoveredSegment === index ? 'scale(1.05)' : 'scale(1)'"
                  @mouseenter="hoveredSegment = index"
                  @mouseleave="hoveredSegment = null"
                />
              </g>
            </svg>

            <!-- 图例 -->
            <div class="mt-2 space-y-1">
              <div
                v-for="(item, index) in pieData"
                :key="index"
                class="flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded" :style="{ backgroundColor: item.color }"></div>
                  <span class="text-gray-600">{{ item.name }}</span>
                </div>
                <span class="text-gray-800 font-bold">{{ item.value }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间 - 湖北省地图 -->
      <div class="col-span-6">
        <div class="bg-white shadow-lg border border-gray-200 rounded-lg p-4 flex flex-col">
          <div class="flex items-center gap-2 mb-4">
            <MapPinIcon class="h-5 w-5 text-blue-500" />
            <h3 class="text-blue-500 font-semibold">湖北省项目分布</h3>
            <span v-if="selectedCity" class="ml-auto text-sm text-gray-600">
              当前选中: {{ selectedCity.name }}
            </span>
          </div>

          <div class="flex-1 min-h-[500px]">
            <!-- Echarts 湖北省地图 -->
            <div ref="mapChart" class="w-full h-full min-h-[500px]"></div>
          </div>
        </div>
      </div>

      <!-- 右侧 - 知识库和提示词模型 -->
      <div class="col-span-3 grid grid-rows-2 gap-4">
        <!-- 知识库 -->
        <div class="bg-white shadow-lg border border-gray-200 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <DatabaseIcon class="h-5 w-5 text-green-500" />
            <h3 class="text-green-500 font-semibold">知识库</h3>
          </div>

          <div class="space-y-2 max-h-32 overflow-y-auto">
            <div
              v-for="kb in knowledgeBases"
              :key="kb.name"
              class="flex justify-between items-center p-2 bg-gray-50 rounded border"
            >
              <span class="text-sm text-gray-700">{{ kb.name }}</span>
              <span class="text-sm font-bold text-green-600">{{ kb.docCount }}篇</span>
            </div>
          </div>
        </div>

        <!-- 提示词模型 -->
        <div class="bg-white shadow-lg border border-gray-200 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <ZapIcon class="h-5 w-5 text-orange-500" />
            <h3 class="text-orange-500 font-semibold">提示词模型</h3>
          </div>

          <div class="space-y-2 max-h-32 overflow-y-auto">
            <div
              v-for="model in promptModels"
              :key="model.category"
              class="flex justify-between items-center p-2 bg-gray-50 rounded border"
            >
              <span class="text-sm text-gray-700">{{ model.category }}</span>
              <span class="text-sm font-bold text-orange-600">{{ model.count }}个</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div v-if="selectedCityProjects.length > 0" class="mt-6">
      <div class="bg-white shadow-lg border border-gray-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-4">
          <MapPinIcon class="h-5 w-5 text-blue-500" />
          <h3 class="text-blue-500 font-semibold">
            {{ selectedCity ? `${selectedCity.name} - 项目列表` : '全省项目列表' }}
          </h3>
          <span class="ml-auto text-sm text-gray-600"
            >共 {{ selectedCityProjects.length }} 个项目</span
          >
        </div>

        <div class="overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">序号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">项目名称</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">地区</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">开始时间</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">结束时间</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">主审人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">详情</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(project, index) in selectedCityProjects"
                :key="project.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-800">{{ index + 1 }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-medium">{{ project.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ project.region }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ project.startDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ project.endDate }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ project.auditor }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusClass(project.status)"
                  >
                    {{ project.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button
                    @click="showProjectDetails(project)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 项目详情Modal -->
    <div
      v-if="selectedProject"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeProjectDetails"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">{{ selectedProject.name }} - 审计文书</h3>
          <button
            @click="closeProjectDetails"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="mb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-600">地区：</span>{{ selectedProject.region }}
              </div>
              <div>
                <span class="font-medium text-gray-600">主审人：</span>{{ selectedProject.auditor }}
              </div>
              <div>
                <span class="font-medium text-gray-600">开始时间：</span
                >{{ selectedProject.startDate }}
              </div>
              <div>
                <span class="font-medium text-gray-600">结束时间：</span
                >{{ selectedProject.endDate }}
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="text-md font-semibold text-gray-800 mb-3">审计文书列表</h4>
            <div class="space-y-2">
              <div
                v-for="document in selectedProject.documents"
                :key="document.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0">
                    <FileTextIcon class="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ document.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ document.type }} • {{ document.size }} • {{ document.uploadDate }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="previewDocument(document)"
                    class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    预览
                  </button>
                  <button
                    @click="downloadDocument(document)"
                    class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    下载
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { BarChart3, FileText, Database, Zap, MapPin, PieChart, Activity } from 'lucide-vue-next'
import * as echarts from 'echarts'
import type { ECElementEvent } from 'echarts'
import { generateMockProjects, generateMockStats } from '@/mock/index'
import type { Project, Document } from '@/mock/index'

// 定义类型
interface AuditType {
  name: string
  count: number
}

interface RecentProject {
  id: number
  name: string
  date: string
}

interface City {
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

// 重命名图标以避免冲突
const BarChart3Icon = BarChart3
const FileTextIcon = FileText
const DatabaseIcon = Database
const ZapIcon = Zap
const MapPinIcon = MapPin
const PieChartIcon = PieChart
const ActivityIcon = Activity

// 响应式数据
const selectedCity = ref<City | null>(null)
const selectedProject = ref<Project | null>(null)
const hoveredSegment = ref<number | null>(null)
const mapChart = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 生成mock数据
const mockStats = generateMockStats()
const projectsData = ref<Project[]>(generateMockProjects())

// 总体统计数据
const overallStats = ref(mockStats.overallStats)

// 项目统计数据
const projectStats = ref(mockStats.projectStats)

// 知识库数据
const knowledgeBases = ref(mockStats.knowledgeBases)

// 提示词模型数据
const promptModels = ref(mockStats.promptModels)

// 年度趋势数据
const yearlyTrendData = ref(mockStats.yearlyTrendData)

// 湖北省各地市数据（更新为市级数据，用于ECharts地图）
const hubeiCitiesData = ref(mockStats.hubeiCitiesData)

// 饼图数据
const pieData = ref(mockStats.pieData)
  { name: '水资源审计知识库', docCount: 98 },
  { name: '矿产资源审计知识库', docCount: 134 },
  { name: '林业资源审计知识库', docCount: 87 },
  { name: '生态资源审计知识库', docCount: 76 },
  { name: '城市建设审计知识库', docCount: 112 },
  { name: '农业生产审计知识库', docCount: 89 },
])

// 提示词模型数据
const promptModels = ref([
  { category: '土地资源', count: 25 },
  { category: '水资源', count: 18 },
  { category: '矿产资源', count: 22 },
  { category: '林业资源', count: 15 },
  { category: '生态资源', count: 19 },
  { category: '城市建设', count: 28 },
  { category: '农业生产', count: 16 },
])

// 年度趋势数据
const yearlyTrendData = ref([
  { year: '2019', projects: 680 },
  { year: '2020', projects: 720 },
  { year: '2021', projects: 850 },
  { year: '2022', projects: 920 },
  { year: '2023', projects: 1050 },
  { year: '2024', projects: 1248 },
])

// 湖北省各地市数据（更新为市级数据，用于ECharts地图）
const hubeiCitiesData = ref([
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
])

// 饼图数据
const pieData = ref([
  { name: '土地利用审计', value: 35, color: '#2563eb' }, // 蓝色
  { name: '矿产资源审计', value: 28, color: '#7c3aed' }, // 紫色
  { name: '森林资源审计', value: 22, color: '#059669' }, // 绿色
  { name: '水资源审计', value: 15, color: '#dc2626' }, // 红色
])

// 模拟项目数据
const projectsData = ref<Project[]>([
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
  // 鄂州市项目
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
    name: '鄂州市钢铁产业环保审计',
    region: '鄂州市',
    startDate: '2024-01-01',
    endDate: '2024-07-31',
    auditor: '黄敏',
    status: '已完成',
    documents: [
      {
        id: 22,
        name: '环保审计报告.pdf',
        type: 'PDF',
        size: '3.6MB',
        uploadDate: '2024-07-29',
        url: '/documents/env-audit-12.pdf',
      },
      {
        id: 23,
        name: '排放数据监测.xlsx',
        type: 'Excel',
        size: '2.2MB',
        uploadDate: '2024-07-26',
        url: '/documents/emission-data-12.xlsx',
      },
    ],
  },
  // 荆门市项目
  {
    id: 13,
    name: '荆门市化工园区安全审计',
    region: '荆门市',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    auditor: '吴凯',
    status: '进行中',
    documents: [
      {
        id: 24,
        name: '安全审计实施方案.pdf',
        type: 'PDF',
        size: '2.1MB',
        uploadDate: '2024-02-28',
        url: '/documents/safety-plan-13.pdf',
      },
      {
        id: 25,
        name: '安全隐患排查表.xlsx',
        type: 'Excel',
        size: '1.8MB',
        uploadDate: '2024-04-15',
        url: '/documents/safety-check-13.xlsx',
      },
    ],
  },
  // 孝感市项目
  {
    id: 14,
    name: '孝感市教育资源配置审计',
    region: '孝感市',
    startDate: '2024-02-15',
    endDate: '2024-08-15',
    auditor: '宋娜',
    status: '进行中',
    documents: [
      {
        id: 26,
        name: '教育资源审计报告.pdf',
        type: 'PDF',
        size: '2.9MB',
        uploadDate: '2024-05-20',
        url: '/documents/education-audit-14.pdf',
      },
    ],
  },
  // 荆州市项目
  {
    id: 15,
    name: '荆州市古城保护利用审计',
    region: '荆州市',
    startDate: '2024-01-20',
    endDate: '2024-07-20',
    auditor: '梁伟',
    status: '已完成',
    documents: [
      {
        id: 27,
        name: '古城保护审计报告.pdf',
        type: 'PDF',
        size: '4.2MB',
        uploadDate: '2024-07-18',
        url: '/documents/heritage-audit-15.pdf',
      },
      {
        id: 28,
        name: '保护资金使用情况.xlsx',
        type: 'Excel',
        size: '1.6MB',
        uploadDate: '2024-07-15',
        url: '/documents/heritage-fund-15.xlsx',
      },
    ],
  },
  // 黄冈市项目
  {
    id: 16,
    name: '黄冈市扶贫资金使用审计',
    region: '黄冈市',
    startDate: '2024-03-10',
    endDate: '2024-09-10',
    auditor: '徐静',
    status: '进行中',
    documents: [
      {
        id: 29,
        name: '扶贫资金审计计划.pdf',
        type: 'PDF',
        size: '1.7MB',
        uploadDate: '2024-03-08',
        url: '/documents/poverty-plan-16.pdf',
      },
      {
        id: 30,
        name: '资金流向分析.xlsx',
        type: 'Excel',
        size: '2.4MB',
        uploadDate: '2024-05-12',
        url: '/documents/fund-flow-16.xlsx',
      },
    ],
  },
  // 咸宁市项目
  {
    id: 17,
    name: '咸宁市温泉旅游开发审计',
    region: '咸宁市',
    startDate: '2024-04-10',
    endDate: '2024-10-10',
    auditor: '郭亮',
    status: '进行中',
    documents: [
      {
        id: 31,
        name: '旅游开发审计方案.pdf',
        type: 'PDF',
        size: '2.3MB',
        uploadDate: '2024-04-08',
        url: '/documents/tourism-dev-17.pdf',
      },
    ],
  },
  // 随州市项目
  {
    id: 18,
    name: '随州市专用汽车产业审计',
    region: '随州市',
    startDate: '2024-01-25',
    endDate: '2024-07-25',
    auditor: '邓芳',
    status: '已完成',
    documents: [
      {
        id: 32,
        name: '汽车产业审计报告.pdf',
        type: 'PDF',
        size: '3.3MB',
        uploadDate: '2024-07-23',
        url: '/documents/auto-audit-18.pdf',
      },
      {
        id: 33,
        name: '产业链分析.xlsx',
        type: 'Excel',
        size: '2.1MB',
        uploadDate: '2024-07-20',
        url: '/documents/industry-chain-18.xlsx',
      },
    ],
  },
  // 恩施土家族苗族自治州项目
  {
    id: 19,
    name: '恩施州生态扶贫项目审计',
    region: '恩施土家族苗族自治州',
    startDate: '2024-02-20',
    endDate: '2024-08-20',
    auditor: '覃军',
    status: '进行中',
    documents: [
      {
        id: 34,
        name: '生态扶贫审计方案.pdf',
        type: 'PDF',
        size: '2.7MB',
        uploadDate: '2024-02-18',
        url: '/documents/eco-poverty-19.pdf',
      },
      {
        id: 35,
        name: '扶贫成效评估.xlsx',
        type: 'Excel',
        size: '1.9MB',
        uploadDate: '2024-04-25',
        url: '/documents/poverty-effect-19.xlsx',
      },
    ],
  },
  // 仙桃市项目
  {
    id: 20,
    name: '仙桃市纺织产业转型审计',
    region: '仙桃市',
    startDate: '2024-03-05',
    endDate: '2024-09-05',
    auditor: '冯丽',
    status: '进行中',
    documents: [
      {
        id: 36,
        name: '产业转型审计计划.pdf',
        type: 'PDF',
        size: '2.0MB',
        uploadDate: '2024-03-03',
        url: '/documents/textile-transform-20.pdf',
      },
    ],
  },
  // 潜江市项目
  {
    id: 21,
    name: '潜江市小龙虾产业发展审计',
    region: '潜江市',
    startDate: '2024-04-15',
    endDate: '2024-10-15',
    auditor: '胡斌',
    status: '进行中',
    documents: [
      {
        id: 37,
        name: '小龙虾产业审计方案.pdf',
        type: 'PDF',
        size: '1.8MB',
        uploadDate: '2024-04-13',
        url: '/documents/crayfish-audit-21.pdf',
      },
    ],
  },
  // 天门市项目
  {
    id: 22,
    name: '天门市现代农业园区审计',
    region: '天门市',
    startDate: '2024-01-30',
    endDate: '2024-07-30',
    auditor: '蒋华',
    status: '已完成',
    documents: [
      {
        id: 38,
        name: '农业园区审计报告.pdf',
        type: 'PDF',
        size: '3.5MB',
        uploadDate: '2024-07-28',
        url: '/documents/agri-park-22.pdf',
      },
      {
        id: 39,
        name: '园区效益分析.xlsx',
        type: 'Excel',
        size: '2.3MB',
        uploadDate: '2024-07-25',
        url: '/documents/park-benefit-22.xlsx',
      },
    ],
  },
  // 神农架林区项目
  {
    id: 23,
    name: '神农架林区生物多样性保护审计',
    region: '神农架林区',
    startDate: '2024-05-10',
    endDate: '2024-11-10',
    auditor: '谭敏',
    status: '进行中',
    documents: [
      {
        id: 40,
        name: '生物多样性保护方案.pdf',
        type: 'PDF',
        size: '4.1MB',
        uploadDate: '2024-05-08',
        url: '/documents/biodiversity-23.pdf',
      },
      {
        id: 41,
        name: '物种调查数据.xlsx',
        type: 'Excel',
        size: '3.8MB',
        uploadDate: '2024-06-15',
        url: '/documents/species-survey-23.xlsx',
      },
    ],
  },
])

// 计算属性
const selectedCityProjects = computed(() => {
  if (!selectedCity.value) {
    // 没有选择城市时，显示所有项目
    return projectsData.value
  }
  // 选择了城市时，只显示该城市的项目
  return projectsData.value.filter((project) => project.region === selectedCity.value?.name)
})

const pieSegments = computed(() => {
  let currentAngle = 0
  return pieData.value.map((item) => {
    const startAngle = currentAngle
    const endAngle = currentAngle + (item.value / 100) * 2 * Math.PI
    currentAngle = endAngle

    const x1 = Math.cos(startAngle) * 60
    const y1 = Math.sin(startAngle) * 60
    const x2 = Math.cos(endAngle) * 60
    const y2 = Math.sin(endAngle) * 60

    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'

    const path = ['M', 0, 0, 'L', x1, y1, 'A', 60, 60, 0, largeArcFlag, 1, x2, y2, 'Z'].join(' ')

    return {
      path,
      color: item.color,
    }
  })
})

const yearlyTrendPoints = computed(() => {
  return yearlyTrendData.value
    .map((point, index) => `${40 + index * 50},${120 - point.projects * 0.08}`)
    .join(' ')
})

// 方法
const getStatusClass = (status: string) => {
  switch (status) {
    case '进行中':
      return 'bg-amber-100 text-amber-800'
    case '已完成':
      return 'bg-green-100 text-green-800'
    case '待开始':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const showProjectDetails = (project: Project) => {
  selectedProject.value = project
}

const closeProjectDetails = () => {
  selectedProject.value = null
}

const previewDocument = (document: Document) => {
  // 实现文档预览功能
  console.log('预览文档:', document)
  // 这里可以打开文档预览窗口或跳转到预览页面
  window.open(document.url, '_blank')
}

const downloadDocument = (doc: Document) => {
  // 实现文档下载功能
  console.log('下载文档:', doc)
  // 创建下载链接
  const link = document.createElement('a')
  link.href = doc.url
  link.download = doc.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ECharts地图初始化
const initMap = async () => {
  if (!mapChart.value) return

  try {
    // 加载湖北省地图数据，使用URL编码处理中文文件名
    const response = await fetch(`${import.meta.env.BASE_URL}map/Hubei_DataV.json`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const hubeiGeoJson = await response.json()

    // 注册地图
    echarts.registerMap('hubei', hubeiGeoJson)

    // 创建图表实例
    chartInstance = echarts.init(mapChart.value)

    // 配置选项
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: ECElementEvent) => {
          if (params.data) {
            const data = hubeiCitiesData.value.find((item) => item.name === params.name)
            if (data) {
              return `
                <div class="bg-white p-2 rounded shadow-lg border">
                  <div class="font-bold text-gray-800 mb-1">${params.name}</div>
                  <div class="text-sm text-gray-600">
                    <div>总项目数: <span class="font-semibold text-blue-600">${data.value}</span></div>
                    <div>进行中: <span class="font-semibold text-amber-600">${data.ongoing}</span></div>
                    <div>已完成: <span class="font-semibold text-green-600">${data.completed}</span></div>
                  </div>
                </div>
              `
            }
          }
          return params.name || ''
        },
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      visualMap: {
        min: 0,
        max: Math.max(...hubeiCitiesData.value.map((item) => item.value)),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        textStyle: {
          color: '#374151',
        },
        inRange: {
          color: ['#dbeafe', '#3b82f6', '#1e40af'],
        },
        calculable: true,
      },
      geo: {
        map: 'hubei',
        roam: true,
        scaleLimit: {
          min: 0.8,
          max: 3,
        },
        zoom: 1.1,
        center: [112, 31.2],
        itemStyle: {
          areaColor: '#f3f4f6',
          borderColor: '#e5e7eb',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#3b82f6',
            borderColor: '#1e40af',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: '#ffffff',
            fontSize: 12,
          },
        },
        select: {
          itemStyle: {
            areaColor: '#1e40af',
            borderColor: '#1e3a8a',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: '#ffffff',
            fontSize: 12,
          },
        },
      },
      series: [
        {
          name: '项目分布',
          type: 'map',
          geoIndex: 0,
          data: hubeiCitiesData.value.map((item) => ({
            name: item.name,
            value: item.value,
            ongoing: item.ongoing,
            completed: item.completed,
            pending: item.pending,
          })),
          animationDuration: 1000,
          animationEasing: 'cubicOut',
        },
      ],
    }

    // 设置配置
    chartInstance.setOption(option)

    // 添加点击事件
    chartInstance.on('click', (params: ECElementEvent) => {
      if (params.data) {
        const cityData = hubeiCitiesData.value.find((item) => item.name === params.name)
        if (cityData) {
          selectedCity.value = {
            id: params.name || '',
            name: params.name || '',
            projects: cityData.value,
            ongoing: cityData.ongoing,
            completed: cityData.completed,
            pending: cityData.pending,
            labelX: 0,
            labelY: 0,
            path: '',
            auditTypes: [],
            recentProjects: [],
          }

          // 触发选中动画
          chartInstance?.dispatchAction({
            type: 'mapSelect',
            name: params.name,
          })

          console.log('Selected city:', selectedCity.value)
        }
      }
    })

    // 添加悬停事件
    chartInstance.on('mouseover', (params: ECElementEvent) => {
      if (params.componentType === 'series') {
        chartInstance?.dispatchAction({
          type: 'highlight',
          name: params.name,
        })
      }
    })

    chartInstance.on('mouseout', (params: ECElementEvent) => {
      if (params.componentType === 'series') {
        chartInstance?.dispatchAction({
          type: 'downplay',
          name: params.name,
        })
      }
    })

    // 响应式处理
    const resizeHandler = () => {
      chartInstance?.resize()
    }

    window.addEventListener('resize', resizeHandler)

    // 组件销毁时清理
    const cleanup = () => {
      window.removeEventListener('resize', resizeHandler)
      chartInstance?.dispose()
      chartInstance = null
    }

    // 返回清理函数
    return cleanup
  } catch (error) {
    console.error('Failed to load map data:', error)
  }
}

// 组件挂载后初始化地图
onMounted(async () => {
  await nextTick()
  await initMap()
})
</script>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.6);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8);
}

/* 动画效果 */
.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.transition-shadow {
  transition: box-shadow 0.2s ease;
}

/* 地图悬停效果 */
svg path:hover {
  filter: brightness(1.1);
}

/* 表格行悬停效果 */
tbody tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

/* 阴影效果 */
.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:shadow-xl:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4"
  >
    <!-- 顶部标题栏 -->
    <div class="mb-6">
      <div class="text-center mb-4">
        <h1
          class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
        >
          湖北省自然资源审计数据监控大屏
        </h1>
      </div>

      <!-- 总体统计卡片 -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div
          class="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-300 text-sm">总项目数</p>
              <p class="text-2xl font-bold text-cyan-400">{{ overallStats.totalProjects }}</p>
            </div>
            <BarChart3Icon class="h-8 w-8 text-cyan-400" />
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-300 text-sm">成果文件</p>
              <p class="text-2xl font-bold text-purple-400">{{ overallStats.totalFiles }}</p>
            </div>
            <FileTextIcon class="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-300 text-sm">知识库</p>
              <p class="text-2xl font-bold text-green-400">{{ overallStats.knowledgeBase }}</p>
            </div>
            <DatabaseIcon class="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-blue-500/30 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-300 text-sm">提示词模型</p>
              <p class="text-2xl font-bold text-orange-400">{{ overallStats.promptModels }}</p>
            </div>
            <ZapIcon class="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
      <!-- 左侧 - 项目统计和审计类型分布 -->
      <div class="col-span-3 grid grid-rows-2 gap-4">
        <!-- 项目统计 -->
        <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <TrendingUpIcon class="h-5 w-5 text-cyan-400" />
            <h3 class="text-cyan-400 font-semibold">项目统计</h3>
          </div>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-blue-300">本月新增</span>
              <span class="text-2xl font-bold text-cyan-400">67</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-300">进行中</span>
              <span class="text-2xl font-bold text-yellow-400">234</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-300">已完成</span>
              <span class="text-2xl font-bold text-green-400">947</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-blue-300">待审核</span>
              <span class="text-2xl font-bold text-orange-400">67</span>
            </div>
          </div>
        </div>

        <!-- 审计类型分布 -->
        <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <PieChartIcon class="h-5 w-5 text-cyan-400" />
            <h3 class="text-cyan-400 font-semibold">审计类型分布</h3>
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
                  <span class="text-blue-300">{{ item.name }}</span>
                </div>
                <span class="text-cyan-400 font-bold">{{ item.value }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间 - 湖北省地图 -->
      <div class="col-span-6">
        <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg h-full p-4">
          <div class="flex items-center gap-2 mb-4">
            <MapPinIcon class="h-5 w-5 text-cyan-400" />
            <h3 class="text-cyan-400 font-semibold">湖北省项目分布</h3>
            <span v-if="selectedCity" class="ml-auto text-sm text-blue-300">
              当前选中: {{ selectedCity.name }}
            </span>
          </div>

          <div class="relative h-full">
            <!-- 湖北省SVG地图 -->
            <svg viewBox="0 0 800 600" class="w-full h-5/6">
              <!-- 地图背景 -->
              <rect width="800" height="600" fill="transparent" />

              <!-- 各个地市 -->
              <g v-for="city in hubeiCities" :key="city.id">
                <path
                  :d="city.path"
                  :fill="getCityColor(city)"
                  :stroke="selectedCity?.id === city.id ? '#00d4ff' : '#3b82f6'"
                  :stroke-width="selectedCity?.id === city.id ? '3' : '1'"
                  class="cursor-pointer transition-all duration-300 hover:brightness-110"
                  @click="selectCity(city)"
                  @mouseenter="hoveredCity = city"
                  @mouseleave="hoveredCity = null"
                />

                <!-- 城市名称标签 -->
                <text
                  :x="city.labelX"
                  :y="city.labelY"
                  fill="#e2e8f0"
                  text-anchor="middle"
                  class="text-xs font-medium pointer-events-none"
                >
                  {{ city.name }}
                </text>

                <!-- 项目数量标签 -->
                <text
                  :x="city.labelX"
                  :y="city.labelY + 12"
                  fill="#00d4ff"
                  text-anchor="middle"
                  class="text-xs font-bold pointer-events-none"
                >
                  {{ city.projects }}个
                </text>
              </g>

              <!-- 悬停提示 -->
              <g v-if="hoveredCity" class="pointer-events-none">
                <rect
                  :x="hoveredCity.labelX - 40"
                  :y="hoveredCity.labelY - 35"
                  width="80"
                  height="25"
                  fill="#1e3a8a"
                  stroke="#3b82f6"
                  rx="4"
                />
                <text
                  :x="hoveredCity.labelX"
                  :y="hoveredCity.labelY - 20"
                  fill="#00d4ff"
                  text-anchor="middle"
                  class="text-xs font-bold"
                >
                  {{ hoveredCity.projects }}个项目
                </text>
              </g>
            </svg>

            <!-- 图例 -->
            <div class="absolute bottom-10 bg-blue-900/50 p-3 rounded-lg border border-blue-500/30">
              <div class="text-xs text-blue-300 mb-2">项目数量</div>
              <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-blue-600 rounded"></div>
                  <span class="text-blue-300">0-50</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-cyan-500 rounded"></div>
                  <span class="text-blue-300">51-100</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-cyan-300 rounded"></div>
                  <span class="text-blue-300">100+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 - 城市详情和月度趋势 -->
      <div class="col-span-3 grid grid-rows-3 gap-4">
        <!-- 选中城市详情 -->
        <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 row-span-2">
          <div class="flex items-center gap-2 mb-4">
            <DatabaseIcon class="h-5 w-5 text-cyan-400" />
            <h3 class="text-cyan-400 font-semibold">
              {{ selectedCity ? selectedCity.name + '详情' : '城市详情' }}
            </h3>
          </div>

          <div v-if="selectedCity" class="space-y-4">
            <div class="bg-blue-800/20 p-3 rounded">
              <div class="text-sm text-blue-300 mb-2">项目概况</div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-blue-300">总项目:</span>
                  <span class="text-cyan-400 font-bold ml-1">{{ selectedCity.projects }}</span>
                </div>
                <div>
                  <span class="text-blue-300">进行中:</span>
                  <span class="text-yellow-400 font-bold ml-1">{{ selectedCity.ongoing }}</span>
                </div>
                <div>
                  <span class="text-blue-300">已完成:</span>
                  <span class="text-green-400 font-bold ml-1">{{ selectedCity.completed }}</span>
                </div>
                <div>
                  <span class="text-blue-300">待审核:</span>
                  <span class="text-orange-400 font-bold ml-1">{{ selectedCity.pending }}</span>
                </div>
              </div>
            </div>

            <div class="bg-blue-800/20 p-3 rounded">
              <div class="text-sm text-blue-300 mb-2">审计类型分布</div>
              <div class="space-y-2">
                <div
                  v-for="type in selectedCity.auditTypes"
                  :key="type.name"
                  class="flex justify-between text-xs"
                >
                  <span class="text-blue-300">{{ type.name }}</span>
                  <span class="text-cyan-400 font-bold">{{ type.count }}</span>
                </div>
              </div>
            </div>

            <div class="bg-blue-800/20 p-3 rounded">
              <div class="text-sm text-blue-300 mb-2">最新项目</div>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div
                  v-for="project in selectedCity.recentProjects"
                  :key="project.id"
                  class="text-xs p-2 bg-blue-700/20 rounded"
                >
                  <div class="text-cyan-400 font-medium">{{ project.name }}</div>
                  <div class="text-blue-300 mt-1">{{ project.date }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-blue-300 mt-8">
            <MapPinIcon class="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>点击地图上的城市查看详情</p>
          </div>
        </div>

        <!-- 月度趋势 -->
        <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-4">
            <ActivityIcon class="h-5 w-5 text-cyan-400" />
            <h3 class="text-cyan-400 font-semibold">月度趋势</h3>
          </div>

          <div class="relative h-full">
            <svg viewBox="0 0 300 150" class="w-full h-full max-h-32">
              <defs>
                <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                  <path
                    d="M 30 0 L 0 0 0 15"
                    fill="none"
                    stroke="#1e40af"
                    stroke-width="0.5"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <rect width="300" height="150" fill="url(#grid)" />

              <polyline
                :points="trendPoints"
                fill="none"
                stroke="#00d4ff"
                stroke-width="2"
                class="drop-shadow-sm"
              />

              <circle
                v-for="(point, index) in trendData"
                :key="index"
                :cx="30 + index * 40"
                :cy="150 - point.projects * 2"
                r="3"
                fill="#00d4ff"
                class="cursor-pointer transition-all duration-300 hover:r-5"
              />

              <text
                v-for="(point, index) in trendData"
                :key="'label-' + index"
                :x="30 + index * 40"
                y="145"
                fill="#60a5fa"
                text-anchor="middle"
                class="text-xs"
              >
                {{ point.month }}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部项目列表 -->
    <div class="mt-6">
      <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-cyan-400 font-semibold">地区项目列表</h3>
          <div class="flex gap-2">
            <select
              v-model="selectedYear"
              class="bg-blue-800/30 border border-blue-500/30 rounded px-3 py-1 text-white text-sm"
            >
              <option value="2024">2024年</option>
              <option value="2023">2023年</option>
              <option value="2022">2022年</option>
            </select>
            <select
              v-model="selectedRegion"
              class="bg-blue-800/30 border border-blue-500/30 rounded px-3 py-1 text-white text-sm"
            >
              <option value="all">全部地区</option>
              <option value="wuhan">武汉市</option>
              <option value="yichang">宜昌市</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-blue-500/30">
                <th class="text-left p-2 text-blue-300">地区</th>
                <th class="text-left p-2 text-blue-300">总项目数</th>
                <th class="text-left p-2 text-blue-300">进行中</th>
                <th class="text-left p-2 text-blue-300">已完成</th>
                <th class="text-left p-2 text-blue-300">土地利用</th>
                <th class="text-left p-2 text-blue-300">矿产资源</th>
                <th class="text-left p-2 text-blue-300">森林资源</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="city in hubeiCities.slice(0, 8)"
                :key="city.id"
                class="border-b border-blue-500/20 hover:bg-blue-800/20 cursor-pointer"
                @click="selectCity(city)"
              >
                <td class="p-2 text-cyan-400 font-medium">{{ city.name }}</td>
                <td class="p-2">{{ city.projects }}</td>
                <td class="p-2">{{ city.ongoing }}</td>
                <td class="p-2">{{ city.completed }}</td>
                <td class="p-2">{{ city.auditTypes[0]?.count || 0 }}</td>
                <td class="p-2">{{ city.auditTypes[1]?.count || 0 }}</td>
                <td class="p-2">{{ city.auditTypes[2]?.count || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BarChart3,
  FileText,
  Database,
  Zap,
  TrendingUp,
  MapPin,
  PieChart,
  Activity,
} from 'lucide-vue-next'

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
const TrendingUpIcon = TrendingUp
const MapPinIcon = MapPin
const PieChartIcon = PieChart
const ActivityIcon = Activity

// 响应式数据
const selectedYear = ref('2024')
const selectedRegion = ref('all')
const selectedCity = ref<City | null>(null)
const hoveredCity = ref<City | null>(null)
const hoveredSegment = ref<number | null>(null)

// 总体统计数据
const overallStats = ref({
  totalProjects: 1248,
  totalFiles: 8956,
  knowledgeBase: 342,
  promptModels: 156,
})

// 湖北省各地市数据（简化的SVG路径）
const hubeiCities = ref([
  {
    id: 'wuhan',
    name: '武汉市',
    projects: 156,
    ongoing: 45,
    completed: 89,
    pending: 22,
    labelX: 400,
    labelY: 300,
    path: 'M380,280 L420,280 L420,320 L380,320 Z',
    auditTypes: [
      { name: '土地利用审计', count: 45 },
      { name: '矿产资源审计', count: 34 },
      { name: '森林资源审计', count: 42 },
      { name: '水资源审计', count: 35 },
    ],
    recentProjects: [
      { id: 1, name: '武汉市土地利用专项审计', date: '2024-01-15' },
      { id: 2, name: '长江流域生态保护审计', date: '2024-01-10' },
      { id: 3, name: '城市绿地资源审计', date: '2024-01-08' },
    ],
  },
  {
    id: 'yichang',
    name: '宜昌市',
    projects: 98,
    ongoing: 28,
    completed: 56,
    pending: 14,
    labelX: 320,
    labelY: 350,
    path: 'M300,330 L340,330 L340,370 L300,370 Z',
    auditTypes: [
      { name: '土地利用审计', count: 28 },
      { name: '矿产资源审计', count: 25 },
      { name: '森林资源审计', count: 30 },
      { name: '水资源审计', count: 15 },
    ],
    recentProjects: [
      { id: 1, name: '三峡库区生态审计', date: '2024-01-12' },
      { id: 2, name: '矿产资源开发审计', date: '2024-01-09' },
    ],
  },
  {
    id: 'xiangyang',
    name: '襄阳市',
    projects: 87,
    ongoing: 25,
    completed: 48,
    pending: 14,
    labelX: 350,
    labelY: 220,
    path: 'M330,200 L370,200 L370,240 L330,240 Z',
    auditTypes: [
      { name: '土地利用审计', count: 25 },
      { name: '矿产资源审计', count: 22 },
      { name: '森林资源审计', count: 25 },
      { name: '水资源审计', count: 15 },
    ],
    recentProjects: [
      { id: 1, name: '汉江流域保护审计', date: '2024-01-14' },
      { id: 2, name: '农田保护专项审计', date: '2024-01-11' },
    ],
  },
  {
    id: 'jingzhou',
    name: '荆州市',
    projects: 76,
    ongoing: 22,
    completed: 42,
    pending: 12,
    labelX: 360,
    labelY: 380,
    path: 'M340,360 L380,360 L380,400 L340,400 Z',
    auditTypes: [
      { name: '土地利用审计', count: 22 },
      { name: '矿产资源审计', count: 18 },
      { name: '森林资源审计', count: 21 },
      { name: '水资源审计', count: 15 },
    ],
    recentProjects: [
      { id: 1, name: '湿地保护审计', date: '2024-01-13' },
      { id: 2, name: '农业用地审计', date: '2024-01-07' },
    ],
  },
  {
    id: 'huanggang',
    name: '黄冈市',
    projects: 65,
    ongoing: 18,
    completed: 35,
    pending: 12,
    labelX: 450,
    labelY: 280,
    path: 'M430,260 L470,260 L470,300 L430,300 Z',
    auditTypes: [
      { name: '土地利用审计', count: 18 },
      { name: '矿产资源审计', count: 15 },
      { name: '森林资源审计', count: 20 },
      { name: '水资源审计', count: 12 },
    ],
    recentProjects: [
      { id: 1, name: '大别山生态审计', date: '2024-01-16' },
      { id: 2, name: '红色旅游资源审计', date: '2024-01-05' },
    ],
  },
  {
    id: 'xiaogan',
    name: '孝感市',
    projects: 54,
    ongoing: 16,
    completed: 28,
    pending: 10,
    labelX: 380,
    labelY: 250,
    path: 'M360,230 L400,230 L400,270 L360,270 Z',
    auditTypes: [
      { name: '土地利用审计', count: 16 },
      { name: '矿产资源审计', count: 12 },
      { name: '森林资源审计', count: 15 },
      { name: '水资源审计', count: 11 },
    ],
    recentProjects: [
      { id: 1, name: '城乡建设用地审计', date: '2024-01-18' },
      { id: 2, name: '水库资源审计', date: '2024-01-06' },
    ],
  },
  {
    id: 'shiyan',
    name: '十堰市',
    projects: 43,
    ongoing: 12,
    completed: 23,
    pending: 8,
    labelX: 280,
    labelY: 200,
    path: 'M260,180 L300,180 L300,220 L260,220 Z',
    auditTypes: [
      { name: '土地利用审计', count: 12 },
      { name: '矿产资源审计', count: 10 },
      { name: '森林资源审计', count: 13 },
      { name: '水资源审计', count: 8 },
    ],
    recentProjects: [
      { id: 1, name: '南水北调水源地审计', date: '2024-01-17' },
      { id: 2, name: '山区生态保护审计', date: '2024-01-04' },
    ],
  },
  {
    id: 'enshi',
    name: '恩施州',
    projects: 38,
    ongoing: 11,
    completed: 20,
    pending: 7,
    labelX: 250,
    labelY: 400,
    path: 'M230,380 L270,380 L270,420 L230,420 Z',
    auditTypes: [
      { name: '土地利用审计', count: 11 },
      { name: '矿产资源审计', count: 8 },
      { name: '森林资源审计', count: 12 },
      { name: '水资源审计', count: 7 },
    ],
    recentProjects: [
      { id: 1, name: '民族地区生态审计', date: '2024-01-19' },
      { id: 2, name: '旅游资源开发审计', date: '2024-01-03' },
    ],
  },
])

// 饼图数据
const pieData = ref([
  { name: '土地利用审计', value: 35, color: '#00D4FF' },
  { name: '矿产资源审计', value: 28, color: '#0099FF' },
  { name: '森林资源审计', value: 22, color: '#3366FF' },
  { name: '水资源审计', value: 15, color: '#6633FF' },
])

// 趋势数据
const trendData = ref([
  { month: '1月', projects: 45 },
  { month: '2月', projects: 52 },
  { month: '3月', projects: 48 },
  { month: '4月', projects: 61 },
  { month: '5月', projects: 55 },
  { month: '6月', projects: 67 },
])

// 计算属性
const getCityColor = (city: City) => {
  if (city.projects > 100) return '#00d4ff'
  if (city.projects > 50) return '#0099ff'
  return '#3366ff'
}

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

const trendPoints = computed(() => {
  return trendData.value
    .map((point, index) => `${30 + index * 40},${150 - point.projects * 2}`)
    .join(' ')
})

// 方法
const selectCity = (city: City) => {
  selectedCity.value = city
}
</script>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 58, 138, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.6);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}

/* 动画效果 */
.transition-all {
  transition: all 0.3s ease;
}

/* 地图悬停效果 */
svg path:hover {
  filter: brightness(1.2);
}

/* 表格行悬停效果 */
tbody tr:hover {
  background-color: rgba(30, 58, 138, 0.2);
}
</style>

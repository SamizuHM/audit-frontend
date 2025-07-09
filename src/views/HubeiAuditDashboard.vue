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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { BarChart3, FileText, Database, Zap, MapPin, PieChart, Activity } from 'lucide-vue-next'
import * as echarts from 'echarts'
import type { ECElementEvent } from 'echarts'

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
const hoveredSegment = ref<number | null>(null)
const mapChart = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 总体统计数据
const overallStats = ref({
  totalProjects: 1248,
  totalFiles: 8956,
})

// 项目统计数据
const projectStats = ref({
  ongoing: 234,
  completed: 947,
})

// 知识库数据
const knowledgeBases = ref([
  { name: '土地资源审计知识库', docCount: 156 },
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

// 计算属性
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

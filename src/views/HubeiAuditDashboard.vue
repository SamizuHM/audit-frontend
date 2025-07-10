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
              <p class="text-gray-600 text-sm">AI生成工作方案</p>
              <p class="text-2xl font-bold text-purple-600">{{ overallStats.totalFiles }}</p>
            </div>
            <ClipboardListIcon class="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div
          class="bg-white shadow-lg border border-amber-200 rounded-lg p-4 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">AI生成实施方案</p>
              <p class="text-2xl font-bold text-amber-600">{{ projectStats.ongoing }}</p>
            </div>
            <HammerIcon class="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div
          class="bg-white shadow-lg border border-green-200 rounded-lg p-4 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">AI生成审计报告</p>
              <p class="text-2xl font-bold text-green-600">{{ projectStats.completed }}</p>
            </div>
            <FileBarChartIcon class="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-12 gap-4">
      <!-- 左侧 - 年度趋势和审计类型分布 -->
      <div class="col-span-3 grid grid-rows-[260px_260px] gap-4">
        <!-- 年度趋势 -->
        <div
          class="bg-white shadow-lg border border-gray-200 rounded-lg p-4 h-[260px] grid grid-rows-[auto_1fr]"
        >
          <div class="flex items-center gap-2 mb-4">
            <ActivityIcon class="h-5 w-5 text-blue-500" />
            <h3 class="text-blue-500 font-semibold">年度项目数量</h3>
          </div>

          <div class="min-h-0">
            <div ref="barChart" class="w-full h-full"></div>
          </div>
        </div>
        <!-- 审计类型分布 -->
        <div
          class="bg-white shadow-lg border border-gray-200 rounded-lg p-4 h-[260px] grid grid-rows-[auto_1fr]"
        >
          <div class="flex items-center gap-2 mb-4">
            <PieChartIcon class="h-5 w-5 text-blue-500" />
            <h3 class="text-blue-500 font-semibold">审计类型分布</h3>
          </div>

          <div class="min-h-0">
            <div ref="pieChart" class="w-full h-full"></div>
          </div>
        </div>
      </div>

      <!-- 中间 - 湖北省地图 -->
      <div class="col-span-6">
        <div
          class="bg-white shadow-lg border border-gray-200 rounded-lg p-4 h-full grid grid-rows-[auto_1fr]"
        >
          <div class="flex items-center gap-2 mb-4">
            <MapPinIcon class="h-5 w-5 text-blue-500" />
            <h3 class="text-blue-500 font-semibold">湖北省项目分布</h3>
            <span v-if="selectedCity" class="ml-auto text-sm text-gray-600">
              当前选中: {{ selectedCity.name }}
            </span>
          </div>

          <div class="min-h-0">
            <!-- Echarts 湖北省地图 -->
            <div ref="mapChart" class="w-full h-full"></div>
          </div>
        </div>
      </div>

      <!-- 右侧 - 知识库和提示词模型 -->
      <div class="col-span-3 grid grid-rows-[260px_260px] gap-4">
        <!-- 知识库 -->
        <div
          class="bg-white shadow-lg border border-gray-200 rounded-lg p-4 h-[260px] grid grid-rows-[auto_1fr]"
        >
          <div class="flex items-center gap-2 mb-4">
            <DatabaseIcon class="h-5 w-5 text-green-500" />
            <h3 class="text-green-500 font-semibold">知识库</h3>
          </div>

          <div class="space-y-2 overflow-y-auto min-h-0">
            <div
              v-for="kb in knowledgeBases"
              :key="kb.name"
              class="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-300"
            >
              <span class="text-sm text-gray-700">{{ kb.name }}</span>
              <span class="text-sm font-bold text-green-600">{{ kb.docCount }}篇</span>
            </div>
          </div>
        </div>

        <!-- 提示词模型 -->
        <div
          class="bg-white shadow-lg border border-gray-200 rounded-lg p-4 h-[260px] grid grid-rows-[auto_1fr]"
        >
          <div class="flex items-center gap-2 mb-4">
            <ZapIcon class="h-5 w-5 text-orange-500" />
            <h3 class="text-orange-500 font-semibold">提示词模型</h3>
          </div>

          <div class="space-y-2 overflow-y-auto min-h-0">
            <div
              v-for="model in promptModels"
              :key="model.category"
              class="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-300"
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
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">项目类型</th>
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
                <td class="px-4 py-3 text-sm text-gray-600">{{ project.type }}</td>
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
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
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
import {
  BarChart3,
  FileText,
  Database,
  Zap,
  MapPin,
  PieChart,
  Activity,
  ClipboardList,
  Hammer,
  FileBarChart,
} from 'lucide-vue-next'
import * as echarts from 'echarts'
import type { ECElementEvent } from 'echarts'
// 导入 mock 数据和类型
import {
  overallStats as mockOverallStats,
  projectStats as mockProjectStats,
  knowledgeBases as mockKnowledgeBases,
  promptModels as mockPromptModels,
  yearlyTrendData as mockYearlyTrendData,
  hubeiCitiesData as mockHubeiCitiesData,
  pieData as mockPieData,
  projectsData as mockProjectsData,
  type Project,
  type City,
  type Document,
} from '@/mock/data/dashboard'

// 重命名图标以避免冲突
const BarChart3Icon = BarChart3
const ClipboardListIcon = ClipboardList
const HammerIcon = Hammer
const FileBarChartIcon = FileBarChart
const FileTextIcon = FileText
const DatabaseIcon = Database
const ZapIcon = Zap
const MapPinIcon = MapPin
const PieChartIcon = PieChart
const ActivityIcon = Activity

// 响应式数据
const selectedCity = ref<City | null>(null)
const selectedProject = ref<Project | null>(null)
const mapChart = ref<HTMLElement>()
const barChart = ref<HTMLElement>()
const pieChart = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
let barChartInstance: echarts.ECharts | null = null
let pieChartInstance: echarts.ECharts | null = null

// 使用 mock 数据初始化响应式数据
const overallStats = ref(mockOverallStats)
const projectStats = ref(mockProjectStats)
const knowledgeBases = ref(mockKnowledgeBases)
const promptModels = ref(mockPromptModels)
const yearlyTrendData = ref(mockYearlyTrendData)
const hubeiCitiesData = ref(mockHubeiCitiesData)
const pieData = ref(mockPieData)
const projectsData = ref(mockProjectsData)

// 计算属性
const selectedCityProjects = computed(() => {
  if (!selectedCity.value) {
    // 没有选择城市时，显示所有项目
    return projectsData.value
  }
  // 选择了城市时，只显示该城市的项目
  return projectsData.value.filter((project) => project.region === selectedCity.value?.name)
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

// ECharts柱状图初始化
const initBarChart = async () => {
  if (!barChart.value) return

  try {
    barChartInstance = echarts.init(barChart.value)

    const totalYears = yearlyTrendData.value.length
    const displayYears = 6 // 默认显示最近6年
    const startPercent = Math.max(0, ((totalYears - displayYears) / totalYears) * 100)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '25%',
        top: '10%',
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: startPercent,
          end: 100,
          height: 20,
          bottom: '5%',
          handleIcon:
            'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23.1h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#3b82f6',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
          textStyle: {
            color: '#6b7280',
          },
          borderColor: '#e5e7eb',
          backgroundColor: '#f9fafb',
          dataBackground: {
            lineStyle: {
              color: '#3b82f6',
            },
            areaStyle: {
              color: '#dbeafe',
            },
          },
        },
      ],
      xAxis: {
        type: 'category',
        data: yearlyTrendData.value.map((item) => item.year),
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
          },
        },
      },
      series: [
        {
          data: yearlyTrendData.value.map((item) => item.projects),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' },
            ]),
          },
          barWidth: '60%',
        },
      ],
    }

    barChartInstance.setOption(option)

    const resizeHandler = () => {
      barChartInstance?.resize()
    }
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
      barChartInstance?.dispose()
      barChartInstance = null
    }
  } catch (error) {
    console.error('Failed to init bar chart:', error)
  }
}

// ECharts饼状图初始化
const initPieChart = async () => {
  if (!pieChart.value) return

  try {
    pieChartInstance = echarts.init(pieChart.value)

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      series: [
        {
          name: '审计类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: pieData.value,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%',
            fontSize: 10,
            color: '#374151',
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 8,
            lineStyle: {
              color: '#9ca3af',
              width: 1,
            },
          },
        },
      ],
    }

    pieChartInstance.setOption(option)

    const resizeHandler = () => {
      pieChartInstance?.resize()
    }
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
      pieChartInstance?.dispose()
      pieChartInstance = null
    }
  } catch (error) {
    console.error('Failed to init pie chart:', error)
  }
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
        roam: false,
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

// 组件挂载后初始化图表
onMounted(async () => {
  await nextTick()
  await initMap()
  await initBarChart()
  await initPieChart()
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

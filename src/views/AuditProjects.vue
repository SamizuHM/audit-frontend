<template>
  <div class="audit-projects-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-row">
        <span class="search-label">项目名称：</span>
        <el-input
          v-model="searchForm.keyword"
          placeholder="请输入项目名称"
          style="width: 200px"
          clearable
          @input="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 我主审的项目 -->
    <div class="project-category">
      <div class="category-header">
        <el-icon><UserFilled /></el-icon>
        我主审的项目
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="leaderProjects"
          style="width: 100%"
          row-key="id"
        >
          <el-table-column type="index" label="序号" width="80" />

          <el-table-column prop="name" label="审计项目" min-width="200">
            <template #default="{ row }">
              <span class="project-name">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="content" label="审计内容" min-width="300">
            <template #default="{ row }">
              <div class="project-content">{{ row.content }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="auditDate" label="审计日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.auditDate) }}
            </template>
          </el-table-column>

          <el-table-column prop="participants" label="参与人" width="120">
            <template #default="{ row }">
              {{ row.participants.join(', ') }}
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <span
                class="status-badge"
                :class="getStatusClass(row.status)"
              >
                {{ getStatusText(row.status) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEditProject(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="handleViewProject(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteProject(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 我参与的项目 -->
    <div class="project-category">
      <div class="category-header participant">
        <el-icon><User /></el-icon>
        我参与的项目
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="participantProjects"
          style="width: 100%"
          row-key="id"
        >
          <el-table-column type="index" label="序号" width="80" />

          <el-table-column prop="name" label="审计项目" min-width="200">
            <template #default="{ row }">
              <span class="project-name">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="content" label="审计内容" min-width="300">
            <template #default="{ row }">
              <div class="project-content">{{ row.content }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="auditDate" label="审计日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.auditDate) }}
            </template>
          </el-table-column>

          <el-table-column prop="manager" label="负责人" width="120">
            <template #default="{ row }">
              {{ row.manager }}
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <span
                class="status-badge"
                :class="getStatusClass(row.status)"
              >
                {{ getStatusText(row.status) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button
                  type="success"
                  size="small"
                  @click="handleViewProject(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleParticipateProject(row)"
                >
                  参与
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  UserFilled,
  User
} from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'

const router = useRouter()
const projectStore = useProjectStore()

interface ProjectData {
  id: string
  name: string
  content: string
  auditDate: string
  manager: string
  participants: string[]
  status: 'ongoing' | 'completed'
  role: 'leader' | 'participant'
}

// 响应式数据
const loading = ref(false)
const projects = ref<ProjectData[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 过滤后的主审项目
const leaderProjects = computed(() => {
  let result = projects.value.filter(p => p.role === 'leader')

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.content.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 过滤后的参与项目
const participantProjects = computed(() => {
  let result = projects.value.filter(p => p.role === 'participant')

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.content.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 获取状态样式类
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    ongoing: 'status-ongoing',
    completed: 'status-completed'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ongoing: '进行中',
    completed: '已完成'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

// 编辑项目
const handleEditProject = (project: ProjectData) => {
  router.push(`/dashboard/project-edit/${project.id}`)
}

// 查看项目
const handleViewProject = (project: ProjectData) => {
  // TODO: 实现查看项目详情
  ElMessage.info('查看项目详情功能正在开发中')
}

// 删除项目
const handleDeleteProject = async (project: ProjectData) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${project.name}"吗？删除后无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用删除接口
    await deleteProject(project.id)
    ElMessage.success('项目已删除')
    await fetchProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 参与项目
const handleParticipateProject = (project: ProjectData) => {
  // TODO: 实现参与项目功能
  ElMessage.info('参与项目功能正在开发中')
}

// API 方法（模拟）
const fetchProjects = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的项目列表接口
    // const response = await api.getProjects()

    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    projects.value = [
      {
        id: '1',
        name: '2024年度森林资源审计项目',
        content: '针对全市森林资源保护和利用情况进行专项审计，重点关注森林覆盖率变化、林地使用合规性、森林防火措施执行情况等关键指标。',
        auditDate: '2024-05-16',
        manager: '张三',
        participants: ['李四'],
        status: 'ongoing',
        role: 'leader'
      },
      {
        id: '2',
        name: '矿产资源开发利用审计',
        content: '对全市矿产资源开发许可、环境保护措施执行情况进行审计，确保资源合理开发利用，检查开采许可证办理流程。',
        auditDate: '2024-05-21',
        manager: '张三',
        participants: ['孙七'],
        status: 'ongoing',
        role: 'leader'
      },
      {
        id: '3',
        name: '水资源保护专项审计',
        content: '审查水资源保护政策执行情况，水质监测数据真实性，以及水污染治理项目实施效果，重点关注饮用水源地保护。',
        auditDate: '2024-06-01',
        manager: '李四',
        participants: [],
        status: 'ongoing',
        role: 'participant'
      },
      {
        id: '4',
        name: '土地利用变更审计',
        content: '对农用地转为建设用地的审批程序、用地指标使用情况、土地收益分配等进行审计，确保土地利用的合法性和合理性。',
        auditDate: '2024-04-12',
        manager: '王五',
        participants: [],
        status: 'completed',
        role: 'participant'
      }
    ]
  } catch (error) {
    ElMessage.error('获取项目数据失败')
  } finally {
    loading.value = false
  }
}

const deleteProject = async (projectId: string) => {
  // TODO: 调用实际的删除接口
  console.log('删除项目:', projectId)
  await new Promise(resolve => setTimeout(resolve, 500))
}

// 组件挂载时获取项目数据
onMounted(async () => {
  await fetchProjects()
})
</script>

<style scoped>
.audit-projects-container {
  padding: 0;
}

/* 搜索区域 */
.search-section {
  background: #fff;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
}

/* 项目分类 */
.project-category {
  background: #fff;
  border-radius: 6px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.category-header {
  background: linear-gradient(135deg, #40a9ff);
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-header.participant {
  background: linear-gradient(135deg, #73d13d);
}

/* 表格容器 */
.table-container {
  background: #fff;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.project-name {
  font-weight: 500;
  color: #1890ff;
}

.project-content {
  max-width: 300px;
  line-height: 1.5;
  color: #333;
}

.operation-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 状态标签 */
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-ongoing {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-completed {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .operation-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>


<style scoped>
.audit-projects-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-description {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
}

.search-section {
  margin-bottom: 24px;
}

.projects-section {
  margin-bottom: 24px;
}

.loading-container {
  padding: 24px;
}

.empty-container {
  padding: 60px 0;
}

.projects-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}

.project-card {
  flex: 1 1 350px;
  max-width: 480px;
  min-width: 300px;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
}

.project-item {
  height: 100%;
  border-radius: 8px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.project-content {
  padding: 0;
}

.project-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.project-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-item .el-icon {
  color: #999;
}

.project-progress {
  margin-top: 16px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .projects-grid {
    flex-direction: column;
    gap: 16px;
  }

  .project-card {
    flex: 1 1 auto;
    max-width: none;
    min-width: auto;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .project-card {
    flex: 1 1 calc(50% - 10px);
    max-width: calc(50% - 10px);
  }
}

@media (min-width: 1201px) {
  .project-card {
    flex: 1 1 350px;
    max-width: 420px;
  }
}
</style>

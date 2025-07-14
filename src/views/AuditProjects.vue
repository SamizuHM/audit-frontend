<template>
  <div class="audit-projects-container">
    <!-- 搜索区域 -->
    <el-card class="search-section" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入项目名称或被审单位"
            style="width: 200px"
            clearable
            @input="handleSearch"
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            clearable
          >
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch"> 搜索 </el-button>
          <el-button @click="resetSearch"> 重置 </el-button>
          <el-button type="success" :icon="Plus" @click="handleAddProject"> 新建项目 </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 项目列表 -->
    <el-card class="project-list" shadow="never">
      <template #header>
        <div class="list-header">
          <el-icon><Document /></el-icon>
          <span>项目列表</span>
          <el-badge :value="filteredProjects.length" class="badge-count" />
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="filteredProjects"
        style="width: 100%"
        row-key="id"
        stripe
        :header-cell-style="{ background: '#fafafa' }"
      >
        <el-table-column type="index" label="序号" width="80" />

        <el-table-column prop="name" label="项目名称" min-width="180">
          <template #default="{ row }">
            <span class="project-name">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="auditedUnit" label="被审单位" min-width="150">
          <template #default="{ row }">
            <span>{{ row.auditedUnit }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="startDate" label="起始日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="endDate" label="截止日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="manager" label="主审" width="100">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.manager }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="participants" label="参与人" min-width="120">
          <template #default="{ row }">
            <el-tag
              v-for="participant in row.participants"
              :key="participant"
              size="small"
              type="info"
              style="margin-right: 4px; margin-bottom: 2px"
            >
              {{ participant }}
            </el-tag>
            <span v-if="row.participants.length === 0" class="text-muted">无</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ongoing' ? 'success' : 'info'" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" size="small" :icon="Edit" @click="handleEditProject(row)">
                编辑
              </el-button>
              <el-popconfirm
                title="确定要删除这个项目吗？"
                @confirm="handleDeleteProject(row)"
                confirm-button-text="确定"
                cancel-button-text="取消"
              >
                <template #reference>
                  <el-button type="danger" size="small" :icon="Delete"> 删除 </el-button>
                </template>
              </el-popconfirm>
              <el-button
                v-if="row.status === 'completed'"
                type="warning"
                size="small"
                :icon="FolderOpened"
                @click="handleArchiveProject(row)"
              >
                归档
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Document, Edit, Delete, Plus, FolderOpened } from '@element-plus/icons-vue'

const router = useRouter()

interface ProjectData {
  id: string
  name: string
  auditedUnit: string
  startDate: string
  endDate: string
  manager: string
  participants: string[]
  status: 'ongoing' | 'completed'
}

// 响应式数据
const loading = ref(false)
const projects = ref<ProjectData[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
})

// 过滤后的项目列表
const filteredProjects = computed(() => {
  let result = projects.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.auditedUnit.toLowerCase().includes(keyword) ||
        p.manager.toLowerCase().includes(keyword),
    )
  }

  if (searchForm.status) {
    result = result.filter((p) => p.status === searchForm.status)
  }

  return result
})

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ongoing: '进行中',
    completed: '已结束',
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
}

// 新建项目
const handleAddProject = () => {
  router.push('/app/project-edit/new')
}

// 编辑项目
const handleEditProject = (project: ProjectData) => {
  console.log(project.id)
  router.push(`/app/project-edit/${project.id}`)
}

// 删除项目
const handleDeleteProject = async (project: ProjectData) => {
  try {
    await ElMessageBox.confirm(`确定要删除项目"${project.name}"吗？删除后无法恢复。`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

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

// 归档项目
const handleArchiveProject = async (project: ProjectData) => {
  try {
    await ElMessageBox.confirm(`确定要归档项目"${project.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    // TODO: 调用归档接口
    await archiveProject(project.id)
    ElMessage.success('项目已归档')
    await fetchProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('归档失败')
    }
  }
}

// API 方法（模拟）
const fetchProjects = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的项目列表接口
    // const response = await api.getProjects()

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500))
    projects.value = [
      {
        id: '1',
        name: '2024年度森林资源审计项目',
        auditedUnit: '市林业局',
        startDate: '2024-05-01',
        endDate: '2024-08-31',
        manager: '张三',
        participants: ['李四', '王五'],
        status: 'ongoing',
      },
      {
        id: '2',
        name: '矿产资源开发利用审计',
        auditedUnit: '市自然资源局',
        startDate: '2024-05-15',
        endDate: '2024-07-30',
        manager: '张三',
        participants: ['孙七'],
        status: 'ongoing',
      },
      {
        id: '3',
        name: '水资源保护专项审计',
        auditedUnit: '市水务局',
        startDate: '2024-06-01',
        endDate: '2024-09-30',
        manager: '李四',
        participants: ['张三', '赵六'],
        status: 'ongoing',
      },
      {
        id: '4',
        name: '土地利用变更审计',
        auditedUnit: '市国土资源局',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        manager: '王五',
        participants: ['张三'],
        status: 'completed',
      },
      {
        id: '5',
        name: '环保资金使用审计',
        auditedUnit: '市环保局',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        manager: '赵六',
        participants: ['李四', '孙七'],
        status: 'completed',
      },
    ]
  } catch {
    ElMessage.error('获取项目数据失败')
  } finally {
    loading.value = false
  }
}

const deleteProject = async (projectId: string) => {
  // TODO: 调用实际的删除接口
  console.log('删除项目:', projectId)
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const archiveProject = async (projectId: string) => {
  // TODO: 调用实际的归档接口
  console.log('归档项目:', projectId)
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// 组件挂载时获取项目数据
onMounted(async () => {
  await fetchProjects()
})
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 0px;
}

.audit-projects-container {
  padding: 0;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 20px;
}

/* 项目列表样式 */
.project-list {
  margin-bottom: 24px;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.badge-count {
  margin-left: auto;
}

/* 表格样式优化 */
.project-name {
  font-weight: 500;
  color: #333;
}

.operation-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.text-muted {
  color: #999;
  font-size: 12px;
}

/* 状态标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .operation-buttons {
    flex-direction: column;
    gap: 2px;
  }

  .operation-buttons .el-button {
    min-width: 60px;
  }
}

@media (max-width: 768px) {
  :deep(.el-form--inline .el-form-item) {
    display: block;
    margin-bottom: 10px;
  }

  .search-section :deep(.el-form--inline) {
    display: block;
  }

  .operation-buttons {
    flex-direction: column;
    gap: 2px;
  }
}

/* 表格行样式 */
:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 按钮组样式 */
.operation-buttons .el-button + .el-button {
  margin-left: 4px;
}

/* 表格内标签换行样式 */
:deep(.el-table-column) .el-tag {
  margin-bottom: 2px;
  display: inline-block;
}
</style>

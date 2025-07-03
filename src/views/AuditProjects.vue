<template>
  <div class="audit-projects-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">审计项目管理</h2>
        <p class="page-description">管理和监控所有审计项目的进度和状态</p>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          @click="handleCreateProject"
        >
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <el-card shadow="never">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索项目名称或描述"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.status"
              placeholder="项目状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="进行中" value="active" />
              <el-option label="已完成" value="completed" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.auditType"
              placeholder="审计类型"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="土地利用审计" value="土地利用审计" />
              <el-option label="矿产资源审计" value="矿产资源审计" />
              <el-option label="环境保护审计" value="环境保护审计" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 项目列表 -->
    <div class="projects-section">
      <el-card shadow="never">
        <div v-if="projectStore.loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="filteredProjects.length === 0" class="empty-container">
          <el-empty description="暂无项目数据" />
        </div>

        <div v-else class="projects-grid">
          <div
            v-for="project in paginatedProjects"
            :key="project.id"
            class="project-card"
          >
            <el-card shadow="hover" class="project-item">
              <div class="project-header">
                <div class="project-title">
                  <h3>{{ project.name }}</h3>
                  <el-tag
                    :type="getStatusTagType(project.status)"
                    size="small"
                  >
                    {{ getStatusText(project.status) }}
                  </el-tag>
                </div>
                <div class="project-actions">
                  <el-dropdown @command="(command) => handleProjectAction(command, project)">
                    <el-button
                      type="text"
                      size="small"
                      @click.stop
                    >
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item command="view">
                          <el-icon><View /></el-icon>
                          查看详情
                        </el-dropdown-item>
                        <el-dropdown-item command="archive" divided>
                          <el-icon><Box /></el-icon>
                          归档
                        </el-dropdown-item>
                        <el-dropdown-item command="delete">
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="project-content">
                <p class="project-description">{{ project.description }}</p>

                <div class="project-meta">
                  <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>创建时间：{{ formatDate(project.createTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>负责人：{{ project.creator }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Document /></el-icon>
                    <span>类型：{{ project.auditType }}</span>
                  </div>
                </div>

                <div class="project-progress">
                  <div class="progress-label">
                    <span>进度</span>
                    <span>{{ project.progress }}%</span>
                  </div>
                  <el-progress
                    :percentage="project.progress"
                    :color="getProgressColor(project.progress)"
                    :stroke-width="6"
                  />
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredProjects.length > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[6, 12, 18, 24]"
            :total="filteredProjects.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  View,
  More,
  Delete,
  Box,
  Calendar,
  User,
  Document
} from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'
import type { AuditProject } from '@/services/api'

const router = useRouter()
const projectStore = useProjectStore()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  auditType: ''
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(6)

// 过滤后的项目列表
const filteredProjects = computed(() => {
  let projects = projectStore.projects

  // 关键字搜索
  if (searchForm.keyword) {
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      p.description.toLowerCase().includes(searchForm.keyword.toLowerCase())
    )
  }

  // 状态筛选
  if (searchForm.status) {
    projects = projects.filter(p => p.status === searchForm.status)
  }

  // 审计类型筛选
  if (searchForm.auditType) {
    projects = projects.filter(p => p.auditType === searchForm.auditType)
  }

  return projects
})

// 分页后的项目列表
const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProjects.value.slice(start, end)
})

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '',
    active: 'success',
    completed: 'info',
    archived: 'warning'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    active: '进行中',
    completed: '已完成',
    archived: '已归档'
  }
  return statusMap[status] || status
}

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.auditType = ''
  currentPage.value = 1
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 创建新项目
const handleCreateProject = () => {
  router.push('/dashboard/project-edit')
}

// 处理项目操作
const handleProjectAction = async (command: string, project: AuditProject) => {
  switch (command) {
    case 'edit':
      router.push(`/dashboard/project-edit/${project.id}`)
      break

    case 'view':
      // TODO: 实现查看项目详情
      ElMessage.info('查看项目详情功能正在开发中')
      break

    case 'archive':
      try {
        await ElMessageBox.confirm('确定要归档这个项目吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await projectStore.updateProject(project.id, { status: 'archived' })
        ElMessage.success('项目已归档')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('归档失败')
        }
      }
      break

    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个项目吗？删除后无法恢复。', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await projectStore.deleteProject(project.id)
        ElMessage.success('项目已删除')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
      break
  }
}

// 组件挂载时获取项目数据
onMounted(async () => {
  try {
    await projectStore.fetchProjects()
  } catch (error) {
    ElMessage.error('获取项目数据失败')
  }
})
</script>

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

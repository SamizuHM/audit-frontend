<template>
  <div class="knowledge-management-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">知识库管理</h2>
        <p class="page-description">管理审计相关的法规、案例、模板和指南</p>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          @click="handleCreateKnowledge"
        >
          <el-icon><Plus /></el-icon>
          新建知识
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
              placeholder="搜索知识标题或内容"
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
              v-model="searchForm.type"
              placeholder="知识类型"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="法规" value="regulation" />
              <el-option label="案例" value="case" />
              <el-option label="模板" value="template" />
              <el-option label="指南" value="guide" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.tag"
              placeholder="标签"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="土地管理" value="土地管理" />
              <el-option label="矿产资源" value="矿产资源" />
              <el-option label="环境保护" value="环境保护" />
              <el-option label="审计案例" value="审计案例" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 知识列表 -->
    <div class="knowledge-section">
      <el-card shadow="never">
        <div v-if="knowledgeStore.loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="filteredKnowledge.length === 0" class="empty-container">
          <el-empty description="暂无知识数据" />
        </div>

        <div v-else class="knowledge-list">
          <div
            v-for="knowledge in paginatedKnowledge"
            :key="knowledge.id"
            class="knowledge-item"
          >
            <el-card shadow="hover" class="knowledge-card">
              <div class="knowledge-header">
                <div class="knowledge-title">
                  <h3>{{ knowledge.title }}</h3>
                  <div class="knowledge-tags">
                    <el-tag
                      :type="getTypeTagType(knowledge.type)"
                      size="small"
                    >
                      {{ getTypeText(knowledge.type) }}
                    </el-tag>
                    <el-tag
                      v-for="tag in knowledge.tags"
                      :key="tag"
                      size="small"
                      effect="plain"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
                <div class="knowledge-actions">
                  <el-dropdown @command="(command) => handleKnowledgeAction(command, knowledge)">
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
                        <el-dropdown-item command="copy">
                          <el-icon><DocumentCopy /></el-icon>
                          复制内容
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="knowledge-content">
                <p class="knowledge-excerpt">{{ getExcerpt(knowledge.content) }}</p>

                <div class="knowledge-meta">
                  <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>创建时间：{{ formatDate(knowledge.createTime) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>创建者：{{ knowledge.creator }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><EditPen /></el-icon>
                    <span>最后更新：{{ formatDate(knowledge.updateTime) }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredKnowledge.length > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="filteredKnowledge.length"
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
  Calendar,
  User,
  EditPen,
  DocumentCopy
} from '@element-plus/icons-vue'
import { useKnowledgeStore } from '@/stores/knowledge'
import type { KnowledgeItem } from '@/services/api'

const router = useRouter()
const knowledgeStore = useKnowledgeStore()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  tag: ''
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤后的知识列表
const filteredKnowledge = computed(() => {
  let knowledge = knowledgeStore.knowledgeList

  // 关键字搜索
  if (searchForm.keyword) {
    knowledge = knowledge.filter(k =>
      k.title.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      k.content.toLowerCase().includes(searchForm.keyword.toLowerCase())
    )
  }

  // 类型筛选
  if (searchForm.type) {
    knowledge = knowledge.filter(k => k.type === searchForm.type)
  }

  // 标签筛选
  if (searchForm.tag) {
    knowledge = knowledge.filter(k => k.tags.includes(searchForm.tag))
  }

  return knowledge
})

// 分页后的知识列表
const paginatedKnowledge = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredKnowledge.value.slice(start, end)
})

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    regulation: 'danger',
    case: 'success',
    template: 'warning',
    guide: 'info'
  }
  return typeMap[type] || ''
}

// 获取类型文本
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    regulation: '法规',
    case: '案例',
    template: '模板',
    guide: '指南'
  }
  return typeMap[type] || type
}

// 获取内容摘要
const getExcerpt = (content: string) => {
  return content.length > 150 ? content.substring(0, 150) + '...' : content
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
  searchForm.type = ''
  searchForm.tag = ''
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

// 创建新知识
const handleCreateKnowledge = () => {
  router.push('/dashboard/knowledge-edit')
}

// 处理知识操作
const handleKnowledgeAction = async (command: string, knowledge: KnowledgeItem) => {
  switch (command) {
    case 'edit':
      router.push(`/dashboard/knowledge-edit/${knowledge.id}`)
      break

    case 'view':
      // TODO: 实现查看知识详情
      ElMessage.info('查看知识详情功能正在开发中')
      break

    case 'copy':
      try {
        await navigator.clipboard.writeText(knowledge.content)
        ElMessage.success('内容已复制到剪贴板')
      } catch (error) {
        ElMessage.error('复制失败')
      }
      break

    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这条知识吗？删除后无法恢复。', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await knowledgeStore.deleteKnowledge(knowledge.id)
        ElMessage.success('知识已删除')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
      break
  }
}

// 组件挂载时获取知识数据
onMounted(async () => {
  try {
    await knowledgeStore.fetchKnowledgeList()
  } catch (error) {
    ElMessage.error('获取知识数据失败')
  }
})
</script>

<style scoped>
.knowledge-management-container {
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

.knowledge-section {
  margin-bottom: 24px;
}

.loading-container {
  padding: 24px;
}

.empty-container {
  padding: 60px 0;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.knowledge-item {
  transition: transform 0.2s;
}

.knowledge-item:hover {
  transform: translateY(-1px);
}

.knowledge-card {
  border-radius: 8px;
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.knowledge-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.knowledge-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.knowledge-actions {
  display: flex;
  gap: 8px;
}

.knowledge-content {
  padding: 0;
}

.knowledge-excerpt {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.knowledge-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 12px;
}

.meta-item .el-icon {
  color: #999;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .knowledge-meta {
    flex-direction: column;
    gap: 8px;
  }

  .knowledge-tags {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

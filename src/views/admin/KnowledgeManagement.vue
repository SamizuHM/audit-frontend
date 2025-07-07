<template>
  <div class="knowledge-management-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-section">
        <span class="search-label">知识搜索：</span>
        <el-input
          v-model="searchForm.keyword"
          placeholder="请输入知识标题或内容"
          style="width: 200px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.category"
          placeholder="知识分类"
          style="width: 150px"
          clearable
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="法律法规" value="法律法规" />
          <el-option label="审计准则" value="审计准则" />
          <el-option label="操作指南" value="操作指南" />
          <el-option label="案例分析" value="案例分析" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
      <div>
        <el-button
          v-if="permissionStore.hasButtonPermission('admin:knowledge:add')"
          type="success"
          @click="handleAddKnowledge"
        >
          <el-icon><Plus /></el-icon>
          新增知识
        </el-button>
      </div>
    </div>

    <!-- 知识列表 -->
    <div class="table-container">
      <div class="table-header">
        <el-icon><Reading /></el-icon>
        知识库列表
      </div>

      <el-table v-loading="loading" :data="paginatedKnowledge" style="width: 100%" row-key="id">
        <el-table-column type="index" label="序号" width="80" />

        <el-table-column prop="title" label="知识标题" min-width="200">
          <template #default="{ row }">
            <span class="knowledge-title">{{ row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="内容摘要" min-width="300">
          <template #default="{ row }">
            <div class="content-summary">
              {{ getContentSummary(row.content) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="handleViewKnowledge(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button
                v-if="permissionStore.hasButtonPermission('admin:knowledge:edit')"
                type="warning"
                size="small"
                @click="handleEditKnowledge(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                v-if="permissionStore.hasButtonPermission('admin:knowledge:delete')"
                type="danger"
                size="small"
                @click="handleDeleteKnowledge(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredKnowledge.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 查看知识详情弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="知识详情" width="70%">
      <div v-if="currentKnowledge" class="knowledge-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题">
            {{ currentKnowledge.title }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            <el-tag :type="getCategoryTagType(currentKnowledge.category)">
              {{ currentKnowledge.category }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentKnowledge.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(currentKnowledge.updateTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="content-section">
          <h4>内容：</h4>
          <div class="content-text" v-html="currentKnowledge.content"></div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑知识弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑知识' : '新增知识'"
      width="80%"
      :before-close="handleCloseEditDialog"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="知识标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入知识标题" />
        </el-form-item>

        <el-form-item label="知识分类" prop="category">
          <el-select v-model="editForm.category" placeholder="请选择分类" style="width: 200px">
            <el-option label="法律法规" value="法律法规" />
            <el-option label="审计准则" value="审计准则" />
            <el-option label="操作指南" value="操作指南" />
            <el-option label="案例分析" value="案例分析" />
          </el-select>
        </el-form-item>

        <el-form-item label="知识内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入知识内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveKnowledge">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Search, Plus, Reading, View, Edit, Delete } from '@element-plus/icons-vue'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()

interface KnowledgeData {
  id: string
  title: string
  category: string
  content: string
  createTime: string
  updateTime: string
}

// 响应式数据
const loading = ref(false)
const knowledge = ref<KnowledgeData[]>([])
const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const currentKnowledge = ref<KnowledgeData | null>(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

// 编辑表单
const editForm = reactive({
  id: '',
  title: '',
  category: '',
  content: '',
})

// 表单验证规则
const editRules = {
  title: [{ required: true, message: '请输入知识标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择知识分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入知识内容', trigger: 'blur' }],
}

// 过滤后的知识列表
const filteredKnowledge = computed(() => {
  let result = knowledge.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) || item.content.toLowerCase().includes(keyword),
    )
  }

  if (searchForm.category) {
    result = result.filter((item) => item.category === searchForm.category)
  }

  return result
})

// 分页后的知识列表
const paginatedKnowledge = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredKnowledge.value.slice(start, end)
})

// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  const categoryMap: Record<string, string> = {
    法律法规: 'danger',
    审计准则: 'warning',
    操作指南: 'success',
    案例分析: 'info',
  }
  return categoryMap[category] || ''
}

// 获取内容摘要
const getContentSummary = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 处理搜索
const handleSearch = () => {
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

// 查看知识详情
const handleViewKnowledge = (item: KnowledgeData) => {
  currentKnowledge.value = item
  viewDialogVisible.value = true
}

// 新增知识
const handleAddKnowledge = () => {
  resetEditForm()
  editDialogVisible.value = true
}

// 编辑知识
const handleEditKnowledge = (item: KnowledgeData) => {
  Object.assign(editForm, {
    id: item.id,
    title: item.title,
    category: item.category,
    content: item.content,
  })
  editDialogVisible.value = true
}

// 删除知识
const handleDeleteKnowledge = async (item: KnowledgeData) => {
  try {
    await ElMessageBox.confirm(`确定要删除知识"${item.title}"吗？删除后无法恢复。`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // TODO: 调用删除接口
    await deleteKnowledge(item.id)

    ElMessage.success('删除成功')
    await fetchKnowledge()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 保存知识
const handleSaveKnowledge = async () => {
  if (!editFormRef.value) return

  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return

    // TODO: 调用保存接口
    if (editForm.id) {
      await updateKnowledge(editForm)
    } else {
      await createKnowledge(editForm)
    }

    ElMessage.success(editForm.id ? '更新成功' : '创建成功')
    editDialogVisible.value = false
    await fetchKnowledge()
  } catch (error) {
    ElMessage.error(editForm.id ? '更新失败' : '创建失败')
  }
}

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  resetEditForm()
  editDialogVisible.value = false
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: '',
    title: '',
    category: '',
    content: '',
  })
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}

// API 方法（模拟）
const fetchKnowledge = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的知识列表接口
    // const response = await api.getKnowledgeList()

    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 500))
    knowledge.value = [
      {
        id: '1',
        title: '自然资源审计法律法规汇编',
        category: '法律法规',
        content:
          '包含《中华人民共和国土地管理法》、《中华人民共和国矿产资源法》等相关法律法规的详细条文解读...',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-07-01 14:20:00',
      },
      {
        id: '2',
        title: '环境保护审计操作指南',
        category: '操作指南',
        content: '详细介绍环境保护审计的操作流程、注意事项、常见问题及处理方法...',
        createTime: '2024-02-01 16:45:00',
        updateTime: '2024-06-15 09:30:00',
      },
    ]
  } catch (error) {
    ElMessage.error('获取知识列表失败')
  } finally {
    loading.value = false
  }
}

const createKnowledge = async (data: any) => {
  // TODO: 调用实际的创建知识接口
  console.log('创建知识:', data)
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const updateKnowledge = async (data: any) => {
  // TODO: 调用实际的更新知识接口
  console.log('更新知识:', data)
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const deleteKnowledge = async (id: string) => {
  // TODO: 调用实际的删除知识接口
  console.log('删除知识:', id)
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchKnowledge()
})
</script>

<style scoped>
.knowledge-management-container {
  padding: 0;
}

/* 工具栏 */
.toolbar {
  background: #fff;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
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

/* 表格容器 */
.table-container {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  background: linear-gradient(135deg, #1890ff);
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.knowledge-title {
  font-weight: 500;
  color: #1890ff;
}

.content-summary {
  line-height: 1.5;
  color: #666;
}

.operation-buttons {
  display: flex;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #fff;
}

/* 知识详情样式 */
.knowledge-detail {
  padding: 0;
}

.content-section {
  margin-top: 24px;
}

.content-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.content-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-section {
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

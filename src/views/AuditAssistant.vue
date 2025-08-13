<template>
  <div class="audit-assistant-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card shadow="never">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-input
              v-model="searchForm.query"
              placeholder="请输入您要查询的法律法规关键词..."
              size="large"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.category"
              placeholder="法规分类"
              size="large"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="土地管理" value="土地管理" />
              <el-option label="矿产资源" value="矿产资源" />
              <el-option label="环境保护" value="环境保护" />
              <el-option label="审计法规" value="审计法规" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              @click="handleSearch"
              :loading="searching"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 快捷查询 -->
    <div class="quick-query-section">
      <el-card shadow="never">
        <div class="section-title">
          <el-icon><Lightning /></el-icon>
          常用法规快捷查询
        </div>
        <div class="quick-buttons">
          <el-button
            v-for="item in quickQueries"
            :key="item.id"
            type="primary"
            plain
            @click="handleQuickQuery(item.query)"
          >
            {{ item.title }}
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="results-section">
      <el-card shadow="never">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          搜索结果 ({{ searchResults.length }} 条)
        </div>

        <div class="results-list">
          <div v-for="result in paginatedResults" :key="result.id" class="result-item">
            <el-card shadow="hover" class="result-card">
              <div class="result-header">
                <h3 class="result-title">{{ result.title }}</h3>
                <el-tag :type="getCategoryTagType(result.category)" size="small">
                  {{ result.category }}
                </el-tag>
              </div>

              <div class="result-content">
                <p class="result-summary">{{ result.summary }}</p>

                <div class="result-meta">
                  <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>发布时间：{{ formatDate(result.publishDate) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Folder /></el-icon>
                    <span>文号：{{ result.documentNumber }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>发布机关：{{ result.publisher }}</span>
                  </div>
                </div>

                <div class="result-actions">
                  <el-button type="primary" size="small" @click="handleViewDetail(result)">
                    <el-icon><View /></el-icon>
                    查看详情
                  </el-button>
                  <el-button type="success" size="small" @click="handleDownload(result)">
                    <el-icon><Download /></el-icon>
                    下载文档
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            :total="searchResults.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 法规详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentRegulation?.title"
      width="80%"
      top="5vh"
    >
      <div v-if="currentRegulation" class="regulation-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文号">
            {{ currentRegulation.documentNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            <el-tag :type="getCategoryTagType(currentRegulation.category)">
              {{ currentRegulation.category }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布机关">
            {{ currentRegulation.publisher }}
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{ formatDate(currentRegulation.publishDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="生效时间">
            {{ formatDate(currentRegulation.effectiveDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentRegulation.status === '有效' ? 'success' : 'warning'">
              {{ currentRegulation.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="content-section">
          <h4>法规内容：</h4>
          <div class="content-text" v-html="currentRegulation.content"></div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleDownload(currentRegulation!)">
            <el-icon><Download /></el-icon>
            下载文档
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Lightning,
  Document,
  Calendar,
  Folder,
  User,
  View,
  Download,
} from '@element-plus/icons-vue'

interface Regulation {
  id: string
  title: string
  category: string
  summary: string
  content: string
  documentNumber: string
  publisher: string
  publishDate: string
  effectiveDate: string
  status: string
}

interface QuickQuery {
  id: string
  title: string
  query: string
}

// 响应式数据
const searching = ref(false)
const searchResults = ref<Regulation[]>([])
const detailDialogVisible = ref(false)
const currentRegulation = ref<Regulation | null>(null)

// 搜索表单
const searchForm = reactive({
  query: '',
  category: '',
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(5)

// 快捷查询
const quickQueries: QuickQuery[] = [
  { id: '1', title: '土地使用权管理', query: '土地使用权' },
  { id: '2', title: '矿产资源开发', query: '矿产资源开发' },
  { id: '3', title: '环境影响评价', query: '环境影响评价' },
  { id: '4', title: '审计监督法规', query: '审计监督' },
  { id: '5', title: '国有资产管理', query: '国有资产管理' },
  { id: '6', title: '生态保护红线', query: '生态保护红线' },
]

// 分页后的搜索结果
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return searchResults.value.slice(start, end)
})

// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  const categoryMap: Record<string, string> = {
    土地管理: 'success',
    矿产资源: 'warning',
    环境保护: 'info',
    审计法规: 'danger',
  }
  return categoryMap[category] || ''
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 处理搜索
const handleSearch = async () => {
  if (!searchForm.query.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  try {
    // TODO: 调用实际的搜索接口
    await searchRegulations(searchForm.query, searchForm.category)
    currentPage.value = 1
  } catch (error) {
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

// 快捷查询
const handleQuickQuery = async (query: string) => {
  searchForm.query = query
  searchForm.category = ''
  await handleSearch()
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

// 查看详情
const handleViewDetail = (regulation: Regulation) => {
  currentRegulation.value = regulation
  detailDialogVisible.value = true
}

// 下载文档
const handleDownload = async (regulation: Regulation) => {
  try {
    // TODO: 调用实际的下载接口
    await downloadRegulation(regulation.id)
    ElMessage.success('开始下载文档')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// API 方法（模拟）
const searchRegulations = async (query: string, category: string) => {
  // TODO: 调用实际的搜索接口
  // const response = await api.searchRegulations({ query, category })

  // 模拟数据
  await new Promise((resolve) => setTimeout(resolve, 1000))

  searchResults.value = [
    {
      id: '1',
      title: '中华人民共和国土地管理法',
      category: '土地管理',
      summary:
        '为了加强土地管理，维护土地的社会主义公有制，保护、开发土地资源，合理利用土地，切实保护耕地，促进社会经济的可持续发展，制定本法。',
      content:
        '第一条 为了加强土地管理，维护土地的社会主义公有制，保护、开发土地资源，合理利用土地，切实保护耕地，促进社会经济的可持续发展，制定本法。<br><br>第二条 中华人民共和国实行土地的社会主义公有制，即全民所有制和劳动群众集体所有制。<br><br>禁止任何单位和个人侵占、买卖或者以其他形式非法转让土地。土地使用权可以依法转让。',
      documentNumber: '主席令第二十八号',
      publisher: '全国人民代表大会常务委员会',
      publishDate: '2019-08-26',
      effectiveDate: '2020-01-01',
      status: '有效',
    },
    {
      id: '2',
      title: '中华人民共和国环境保护法',
      category: '环境保护',
      summary:
        '为保护和改善环境，防治污染和其他公害，保障公众健康，推进生态文明建设，促进经济社会可持续发展，制定本法。',
      content:
        '第一条 为保护和改善环境，防治污染和其他公害，保障公众健康，推进生态文明建设，促进经济社会可持续发展，制定本法。<br><br>第二条 本法所称环境，是指影响人类生存和发展的各种天然的和经过人工改造的自然因素的总体，包括大气、水、海洋、土地、矿藏、森林、草原、湿地、野生生物、自然遗迹、人文遗迹、自然保护区、风景名胜区、城市和乡村等。',
      documentNumber: '主席令第九号',
      publisher: '全国人民代表大会常务委员会',
      publishDate: '2014-04-24',
      effectiveDate: '2015-01-01',
      status: '有效',
    },
  ]
}

const downloadRegulation = async (regulationId: string) => {
  // TODO: 调用实际的下载接口
  console.log('下载法规:', regulationId)
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// 组件挂载时的操作
onMounted(() => {
  // 可以在这里加载一些初始数据或推荐内容
})
</script>

<style scoped>
.audit-assistant-container {
  padding: 0;
}

.search-section {
  margin-bottom: 24px;
}

.quick-query-section {
  margin-bottom: 24px;
}

.results-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.result-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.result-content {
  padding: 0;
}

.result-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
}

.meta-item .el-icon {
  color: #999;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 法规详情样式 */
.regulation-detail {
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
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  line-height: 1.8;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-buttons {
    justify-content: center;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .result-meta {
    flex-direction: column;
    gap: 8px;
  }

  .result-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
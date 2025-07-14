<template>
  <!-- 知识库分类 -->
  <div class="knowledge-section">
    <div class="section-header">
      <h3 class="section-title">
        <el-icon class="section-icon"><Coin /></el-icon>
        知识库
      </h3>
    </div>

    <div class="knowledge-grid">
      <div
        v-for="category in knowledgeCategories"
        :key="category.id"
        class="knowledge-card"
        @click="handleCategoryClick(category)"
      >
        <div class="card-header">
          <div class="card-icon" :style="{ background: category.color }">
            <el-icon :size="20">
              <component :is="category.icon" />
            </el-icon>
          </div>
          <div class="card-title">{{ category.title }}</div>
        </div>
        <div class="card-description">
          {{ category.description }}
        </div>
        <div class="card-stats">
          <span>文件数量: {{ category.fileCount }}</span>
          <span>最后更新: {{ category.lastUpdate }}</span>
        </div>
        <div class="card-actions">
          <el-button size="small" @click.stop="handleViewDetails(category)">
            <el-icon><View /></el-icon>
            查看详情
          </el-button>
          <el-button size="small" type="primary" @click.stop="handleEditCategory(category)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
      </div>
    </div>
  </div>

  <!-- 知识库详情模态框 -->
  <el-dialog
    v-model="detailDialogVisible"
    :title="selectedCategory?.title"
    width="800px"
    class="knowledge-detail-dialog"
  >
    <div v-if="selectedCategory" class="category-detail">
      <div class="detail-header">
        <div class="detail-icon" :style="{ background: selectedCategory.color }">
          <el-icon :size="24">
            <component :is="selectedCategory.icon" />
          </el-icon>
        </div>
        <div class="detail-info">
          <h3>{{ selectedCategory.title }}</h3>
          <p>{{ selectedCategory.description }}</p>
        </div>
      </div>

      <div class="detail-stats">
        <div class="stat-item">
          <el-icon><Document /></el-icon>
          <span>文件数量：{{ selectedCategory.fileCount }}</span>
        </div>
        <div class="stat-item">
          <el-icon><Calendar /></el-icon>
          <span>最后更新：{{ selectedCategory.lastUpdate }}</span>
        </div>
        <div class="stat-item">
          <el-icon><User /></el-icon>
          <span>维护人员：{{ selectedCategory.maintainer }}</span>
        </div>
      </div>

      <div class="file-list">
        <h4>最近文件</h4>
        <div class="file-items">
          <div v-for="file in selectedCategory.recentFiles" :key="file.id" class="file-item">
            <div class="file-info">
              <el-icon size="20" :color="getFileTypeColor(file.type)">
                <component :is="getFileTypeIcon(file.type)" />
              </el-icon>
              <div class="file-details">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-meta">
                  <el-tag size="small" :type="getFileTypeTagType(file.type)">
                    {{ file.type }}
                  </el-tag>
                  <span class="file-date">{{ file.updateTime }}</span>
                </div>
              </div>
            </div>
            <div class="file-actions">
              <el-button size="small" text @click="handleViewFile(file)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" text @click="handleDownloadFile(file)">
                <el-icon><Download /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleManageCategory(selectedCategory)">
          管理此类别
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Coin,
  Operation,
  DocumentChecked,
  List,
  CircleCheck,
  EditPen,
  TrendCharts,
  View,
  Edit,
  Document,
  Calendar,
  User,
  Download,
  Files,
  Memo,
  Tickets,
} from '@element-plus/icons-vue'

const router = useRouter()

// 知识库分类数据
const knowledgeCategories = ref([
  {
    id: 'law-regulations',
    title: '法律法规库',
    description: '收录自然资源相关的法律法规、政策文件、规范标准等，为审计工作提供法律依据。',
    icon: Operation,
    color: '#1890ff',
    fileCount: 156,
    lastUpdate: '2024-06-15',
    maintainer: '法规部门',
    recentFiles: [
      {
        id: '1',
        name: '自然资源资产审计实施办法',
        type: '法规文件',
        updateTime: '2024-06-15',
      },
      {
        id: '2',
        name: '土地资源管理条例',
        type: '法规文件',
        updateTime: '2024-06-14',
      },
      {
        id: '3',
        name: '矿产资源开发利用规范',
        type: '技术标准',
        updateTime: '2024-06-13',
      },
    ],
  },
  {
    id: 'work-plans',
    title: '工作方案库',
    description: '存储各类审计工作方案模板、实施计划、工作流程等，提高审计工作规范性。',
    icon: DocumentChecked,
    color: '#52c41a',
    fileCount: 89,
    lastUpdate: '2024-06-14',
    maintainer: '审计部门',
    recentFiles: [
      {
        id: '4',
        name: '森林资源审计工作方案模板',
        type: '工作方案',
        updateTime: '2024-06-14',
      },
      {
        id: '5',
        name: '水资源审计工作方案模板',
        type: '工作方案',
        updateTime: '2024-06-13',
      },
      {
        id: '6',
        name: '矿产资源审计工作方案模板',
        type: '工作方案',
        updateTime: '2024-06-12',
      },
    ],
  },
  {
    id: 'implementation-plans',
    title: '实施方案库',
    description: '汇集审计实施方案、执行程序、操作指南等，确保审计工作有序开展。',
    icon: List,
    color: '#722ed1',
    fileCount: 67,
    lastUpdate: '2024-06-13',
    maintainer: '实施部门',
    recentFiles: [
      {
        id: '7',
        name: '自然资源审计实施方案',
        type: '实施方案',
        updateTime: '2024-06-13',
      },
      {
        id: '8',
        name: '生态环境保护审计程序',
        type: '操作指南',
        updateTime: '2024-06-12',
      },
      {
        id: '9',
        name: '土地利用审计实施细则',
        type: '实施方案',
        updateTime: '2024-06-11',
      },
    ],
  },
  {
    id: 'evidence-collection',
    title: '取证单库',
    description: '收录各类取证单模板、填写规范、取证要求等，规范审计取证工作。',
    icon: CircleCheck,
    color: '#fa8c16',
    fileCount: 45,
    lastUpdate: '2024-06-12',
    maintainer: '取证组',
    recentFiles: [
      {
        id: '10',
        name: '森林资源审计取证单模板',
        type: '取证单',
        updateTime: '2024-06-12',
      },
      {
        id: '11',
        name: '水资源审计取证规范',
        type: '规范文件',
        updateTime: '2024-06-11',
      },
      {
        id: '12',
        name: '矿产资源取证要求说明',
        type: '指导文件',
        updateTime: '2024-06-10',
      },
    ],
  },
  {
    id: 'working-papers',
    title: '底稿库',
    description: '存储审计底稿模板、编写规范、质量标准等，提升审计底稿质量。',
    icon: EditPen,
    color: '#eb2f96',
    fileCount: 78,
    lastUpdate: '2024-06-11',
    maintainer: '质控部门',
    recentFiles: [
      {
        id: '13',
        name: '审计底稿编写规范',
        type: '规范文件',
        updateTime: '2024-06-11',
      },
      {
        id: '14',
        name: '森林资源审计底稿模板',
        type: '底稿模板',
        updateTime: '2024-06-10',
      },
      {
        id: '15',
        name: '审计底稿质量标准',
        type: '质量标准',
        updateTime: '2024-06-09',
      },
    ],
  },
  {
    id: 'audit-reports',
    title: '审计报告库',
    description: '收录各类审计报告模板、撰写规范、质量标准等，提升审计报告质量和规范性。',
    icon: TrendCharts,
    color: '#13c2c2',
    fileCount: 52,
    lastUpdate: '2024-06-10',
    maintainer: '报告组',
    recentFiles: [
      {
        id: '16',
        name: '综合审计报告模板',
        type: '报告模板',
        updateTime: '2024-06-10',
      },
      {
        id: '17',
        name: '专项审计报告格式',
        type: '格式规范',
        updateTime: '2024-06-09',
      },
      {
        id: '18',
        name: '审计报告质量评估标准',
        type: '质量标准',
        updateTime: '2024-06-08',
      },
    ],
  },
])

// 模态框状态
const detailDialogVisible = ref(false)
const selectedCategory = ref<any>(null)

// 处理分类点击
const handleCategoryClick = (category: any) => {
  selectedCategory.value = category
  detailDialogVisible.value = true
}

// 查看详情
const handleViewDetails = (category: any) => {
  selectedCategory.value = category
  detailDialogVisible.value = true
}

// 编辑分类
const handleEditCategory = (category: any) => {
  router.push(`/app/knowledge-edit?category=${category.id}`)
}

// 管理分类
const handleManageCategory = (category: any) => {
  router.push(`/app/knowledge-edit?category=${category.id}`)
}

// 查看文件
const handleViewFile = (file: any) => {
  ElMessage.info(`查看文件：${file.name}`)
}

// 下载文件
const handleDownloadFile = (file: any) => {
  ElMessage.success(`开始下载：${file.name}`)
}

// 获取文件类型图标
const getFileTypeIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    法规文件: Operation,
    工作方案: Files,
    实施方案: List,
    取证单: Tickets,
    底稿模板: Memo,
    报告模板: TrendCharts,
    技术标准: Document,
    规范文件: Document,
    操作指南: Document,
    指导文件: Document,
    质量标准: Document,
    格式规范: Document,
  }
  return iconMap[type] || Document
}

// 获取文件类型颜色
const getFileTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    法规文件: '#1890ff',
    工作方案: '#52c41a',
    实施方案: '#722ed1',
    取证单: '#fa8c16',
    底稿模板: '#eb2f96',
    报告模板: '#13c2c2',
    技术标准: '#666666',
    规范文件: '#666666',
    操作指南: '#666666',
    指导文件: '#666666',
    质量标准: '#666666',
    格式规范: '#666666',
  }
  return colorMap[type] || '#666666'
}

// 获取文件类型标签类型
const getFileTypeTagType = (type: string) => {
  const tagMap: Record<string, string> = {
    法规文件: 'primary',
    工作方案: 'success',
    实施方案: 'warning',
    取证单: 'danger',
    底稿模板: 'info',
    报告模板: 'default',
  }
  return tagMap[type] || 'default'
}
</script>

<style scoped>
/* 知识库分类 */
.knowledge-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #1890ff;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-icon {
  color: #1890ff;
}

/* 知识库卡片网格 */
.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.knowledge-card {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.knowledge-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.knowledge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #1890ff;
  background: #fff;
}

.knowledge-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.card-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  min-height: 48px;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 12px;
  color: #999;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 知识库详情模态框 */
.knowledge-detail-dialog .el-dialog__body {
  padding: 24px;
}

.category-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.detail-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.detail-info p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.detail-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.stat-item .el-icon {
  color: #1890ff;
}

.file-list h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #1890ff;
  background: #f0f9ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.file-date {
  color: #999;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .knowledge-management-container {
    padding: 16px;
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
  }

  .card-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .detail-stats {
    flex-direction: column;
    gap: 16px;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .detail-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>

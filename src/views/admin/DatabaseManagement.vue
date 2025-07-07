<template>
  <div class="database-management-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="info-section">
        <span class="info-label">数据库状态：</span>
        <el-tag :type="getDatabaseStatusType()" size="small">
          {{ getDatabaseStatusText() }}
        </el-tag>
        <span class="info-separator">|</span>
        <span class="info-label">存储空间：</span>
        <span class="info-value">{{ formatFileSize(databaseInfo.totalSize) }}</span>
        <span class="info-separator">|</span>
        <span class="info-label">已用空间：</span>
        <span class="info-value">{{ formatFileSize(databaseInfo.usedSize) }}</span>
      </div>
      <div class="action-section">
        <el-button
          v-if="permissionStore.hasButtonPermission('admin:database:backup')"
          type="primary"
          @click="handleBackupDatabase"
          :loading="backupLoading"
        >
          <el-icon><Download /></el-icon>
          数据备份
        </el-button>
        <el-button
          v-if="permissionStore.hasButtonPermission('admin:database:restore')"
          type="warning"
          @click="handleShowRestoreDialog"
        >
          <el-icon><Upload /></el-icon>
          数据恢复
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon users">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon projects">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.projectCount }}</div>
            <div class="stat-label">审计项目</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon knowledge">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.knowledgeCount }}</div>
            <div class="stat-label">知识条目</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon backups">
            <el-icon><FolderOpened /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.backupCount }}</div>
            <div class="stat-label">备份文件</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 备份历史 -->
    <div class="backup-history">
      <div class="section-header">
        <h3>备份历史</h3>
        <el-button size="small" @click="fetchBackupHistory">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <el-table
        v-loading="historyLoading"
        :data="paginatedBackups"
        style="width: 100%"
        row-key="id"
      >
        <el-table-column type="index" label="序号" width="80" />

        <el-table-column prop="fileName" label="备份文件名" min-width="250">
          <template #default="{ row }">
            <span class="file-name">{{ row.fileName }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="备份时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="type" label="备份类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getBackupTypeTag(row.type)" size="small">
              {{ getBackupTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <span class="description">{{ row.description || '无' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="handleDownloadBackup(row)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button
                v-if="permissionStore.hasButtonPermission('admin:database:restore')"
                type="warning"
                size="small"
                @click="handleRestoreFromBackup(row)"
              >
                <el-icon><Upload /></el-icon>
                恢复
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteBackup(row)">
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
          :page-sizes="[10, 20, 50]"
          :total="backupHistory.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 数据恢复弹窗 -->
    <el-dialog
      v-model="restoreDialogVisible"
      title="数据恢复"
      width="500px"
      :before-close="handleCloseRestoreDialog"
    >
      <el-form ref="restoreFormRef" :model="restoreForm" :rules="restoreRules" label-width="100px">
        <el-form-item label="恢复方式" prop="type">
          <el-radio-group v-model="restoreForm.type">
            <el-radio label="file">上传备份文件</el-radio>
            <el-radio label="backup">选择历史备份</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="restoreForm.type === 'file'" label="备份文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".sql,.backup"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">仅支持 .sql 或 .backup 格式的备份文件</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="restoreForm.type === 'backup'" label="选择备份" prop="backupId">
          <el-select
            v-model="restoreForm.backupId"
            placeholder="请选择备份文件"
            style="width: 100%"
          >
            <el-option
              v-for="backup in backupHistory"
              :key="backup.id"
              :label="`${backup.fileName} - ${formatDate(backup.createTime)}`"
              :value="backup.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="恢复描述">
          <el-input
            v-model="restoreForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入恢复操作的描述（可选）"
          />
        </el-form-item>

        <el-alert
          title="警告：数据恢复操作将覆盖当前数据库中的所有数据，请谨慎操作！"
          type="warning"
          :closable="false"
          show-icon
        />
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="restoreDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleConfirmRestore" :loading="restoreLoading">
            确认恢复
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadFile } from 'element-plus'
import {
  Download,
  Upload,
  User,
  Document,
  Reading,
  FolderOpened,
  Refresh,
  Delete,
} from '@element-plus/icons-vue'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()

interface DatabaseInfo {
  status: 'online' | 'offline' | 'maintenance'
  totalSize: number
  usedSize: number
}

interface Statistics {
  userCount: number
  projectCount: number
  knowledgeCount: number
  backupCount: number
}

interface BackupRecord {
  id: string
  fileName: string
  size: number
  createTime: string
  type: 'auto' | 'manual'
  description?: string
}

// 响应式数据
const backupLoading = ref(false)
const historyLoading = ref(false)
const restoreLoading = ref(false)
const restoreDialogVisible = ref(false)
const restoreFormRef = ref<FormInstance>()
const uploadRef = ref()

// 数据库信息
const databaseInfo = ref<DatabaseInfo>({
  status: 'online',
  totalSize: 1024 * 1024 * 1024 * 100, // 100GB
  usedSize: 1024 * 1024 * 1024 * 45, // 45GB
})

// 统计数据
const statistics = ref<Statistics>({
  userCount: 156,
  projectCount: 89,
  knowledgeCount: 1247,
  backupCount: 12,
})

// 备份历史
const backupHistory = ref<BackupRecord[]>([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)

// 恢复表单
const restoreForm = reactive({
  type: 'file',
  file: null as File | null,
  backupId: '',
  description: '',
})

const fileList = ref<UploadFile[]>([])

// 表单验证规则
const restoreRules = {
  type: [{ required: true, message: '请选择恢复方式', trigger: 'change' }],
  file: [{ required: true, message: '请选择备份文件', trigger: 'change' }],
  backupId: [{ required: true, message: '请选择备份', trigger: 'change' }],
}

// 分页后的备份列表
const paginatedBackups = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return backupHistory.value.slice(start, end)
})

// 获取数据库状态类型
const getDatabaseStatusType = () => {
  const statusMap: Record<string, string> = {
    online: 'success',
    offline: 'danger',
    maintenance: 'warning',
  }
  return statusMap[databaseInfo.value.status] || ''
}

// 获取数据库状态文本
const getDatabaseStatusText = () => {
  const statusMap: Record<string, string> = {
    online: '运行中',
    offline: '离线',
    maintenance: '维护中',
  }
  return statusMap[databaseInfo.value.status] || '未知'
}

// 获取备份类型标签
const getBackupTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    auto: 'info',
    manual: 'success',
  }
  return typeMap[type] || ''
}

// 获取备份类型文本
const getBackupTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    auto: '自动备份',
    manual: '手动备份',
  }
  return typeMap[type] || type
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
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

// 处理文件变化
const handleFileChange = (file: UploadFile) => {
  restoreForm.file = file.raw || null
  fileList.value = [file]
}

// 数据备份
const handleBackupDatabase = async () => {
  try {
    await ElMessageBox.confirm('确定要创建数据库备份吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    backupLoading.value = true

    // TODO: 调用实际的备份接口
    await createBackup()

    ElMessage.success('备份创建成功')
    await fetchBackupHistory()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('备份创建失败')
    }
  } finally {
    backupLoading.value = false
  }
}

// 显示恢复对话框
const handleShowRestoreDialog = () => {
  resetRestoreForm()
  restoreDialogVisible.value = true
}

// 从备份恢复
const handleRestoreFromBackup = (backup: BackupRecord) => {
  restoreForm.type = 'backup'
  restoreForm.backupId = backup.id
  restoreDialogVisible.value = true
}

// 确认恢复
const handleConfirmRestore = async () => {
  if (!restoreFormRef.value) return

  try {
    const valid = await restoreFormRef.value.validate()
    if (!valid) return

    await ElMessageBox.confirm(
      '警告：此操作将覆盖当前数据库中的所有数据，请确认是否继续？',
      '危险操作',
      {
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消',
        type: 'error',
      },
    )

    restoreLoading.value = true

    // TODO: 调用实际的恢复接口
    await restoreDatabase(restoreForm)

    ElMessage.success('数据恢复成功')
    restoreDialogVisible.value = false
    await fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('数据恢复失败')
    }
  } finally {
    restoreLoading.value = false
  }
}

// 下载备份
const handleDownloadBackup = async (backup: BackupRecord) => {
  try {
    // TODO: 调用实际的下载接口
    await downloadBackup(backup.id)
    ElMessage.success('开始下载备份文件')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 删除备份
const handleDeleteBackup = async (backup: BackupRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份文件"${backup.fileName}"吗？删除后无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // TODO: 调用删除接口
    await deleteBackup(backup.id)

    ElMessage.success('删除成功')
    await fetchBackupHistory()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 关闭恢复对话框
const handleCloseRestoreDialog = () => {
  resetRestoreForm()
  restoreDialogVisible.value = false
}

// 重置恢复表单
const resetRestoreForm = () => {
  Object.assign(restoreForm, {
    type: 'file',
    file: null,
    backupId: '',
    description: '',
  })
  fileList.value = []
  if (restoreFormRef.value) {
    restoreFormRef.value.clearValidate()
  }
}

// API 方法（模拟）
const fetchStatistics = async () => {
  // TODO: 调用实际的统计接口
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const fetchBackupHistory = async () => {
  historyLoading.value = true
  try {
    // TODO: 调用实际的备份历史接口
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模拟数据
    backupHistory.value = [
      {
        id: '1',
        fileName: 'backup_2024_07_04_09_30_00.sql',
        size: 1024 * 1024 * 256,
        createTime: '2024-07-04 09:30:00',
        type: 'manual',
        description: '系统更新前备份',
      },
      {
        id: '2',
        fileName: 'backup_2024_07_03_00_00_00.sql',
        size: 1024 * 1024 * 248,
        createTime: '2024-07-03 00:00:00',
        type: 'auto',
      },
    ]
  } catch (error) {
    ElMessage.error('获取备份历史失败')
  } finally {
    historyLoading.value = false
  }
}

const createBackup = async () => {
  // TODO: 调用实际的备份接口
  await new Promise((resolve) => setTimeout(resolve, 2000))
}

const restoreDatabase = async (data: any) => {
  // TODO: 调用实际的恢复接口
  console.log('恢复数据库:', data)
  await new Promise((resolve) => setTimeout(resolve, 3000))
}

const downloadBackup = async (backupId: string) => {
  // TODO: 调用实际的下载接口
  console.log('下载备份:', backupId)
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

const deleteBackup = async (backupId: string) => {
  // TODO: 调用实际的删除接口
  console.log('删除备份:', backupId)
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// 组件挂载时获取数据
onMounted(async () => {
  await Promise.all([fetchStatistics(), fetchBackupHistory()])
})
</script>

<style scoped>
.database-management-container {
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

.info-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-weight: 600;
}

.info-separator {
  color: #ddd;
  margin: 0 8px;
}

.action-section {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.projects {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.knowledge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.backups {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

/* 备份历史 */
.backup-history {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, #1890ff);
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #1890ff;
}

.description {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .info-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .operation-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>

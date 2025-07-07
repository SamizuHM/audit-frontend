<template>
  <div class="ocr-recognition-container">
    <!-- 页面标题和说明 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">OCR文字识别</h2>
        <p class="page-description">上传图片或PDF文档，自动识别其中的文字内容</p>
      </div>
    </div>

    <!-- 上传区域 -->
    <div class="upload-section">
      <el-card shadow="never">
        <div class="section-title">
          <el-icon><Upload /></el-icon>
          文件上传
        </div>

        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :multiple="true"
          :limit="5"
          accept=".jpg,.jpeg,.png,.bmp,.pdf"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
        >
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            <div class="upload-title">点击或拖拽文件到此区域上传</div>
            <div class="upload-hint">
              支持 JPG、PNG、BMP、PDF 格式，单个文件不超过 10MB，最多可上传 5 个文件
            </div>
          </div>
        </el-upload>

        <div v-if="fileList.length > 0" class="upload-actions">
          <el-button
            type="primary"
            size="large"
            @click="handleStartRecognition"
            :loading="recognizing"
            :disabled="fileList.length === 0"
          >
            <el-icon><MagicStick /></el-icon>
            开始识别
          </el-button>
          <el-button size="large" @click="handleClearFiles" :disabled="recognizing">
            <el-icon><Delete /></el-icon>
            清空文件
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 识别结果 -->
    <div v-if="recognitionResults.length > 0" class="results-section">
      <el-card shadow="never">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          识别结果 ({{ recognitionResults.length }} 个文件)
        </div>

        <div class="results-list">
          <div v-for="(result, index) in recognitionResults" :key="result.id" class="result-item">
            <el-card shadow="hover" class="result-card">
              <div class="result-header">
                <div class="file-info">
                  <h4 class="file-name">{{ result.fileName }}</h4>
                  <div class="file-meta">
                    <el-tag :type="getStatusTagType(result.status)" size="small">
                      {{ getStatusText(result.status) }}
                    </el-tag>
                    <span class="file-size">{{ formatFileSize(result.fileSize) }}</span>
                    <span v-if="result.confidence" class="confidence">
                      置信度: {{ (result.confidence * 100).toFixed(1) }}%
                    </span>
                  </div>
                </div>
                <div class="result-actions">
                  <el-button
                    v-if="result.status === 'success'"
                    type="primary"
                    size="small"
                    @click="handleCopyText(result.text)"
                  >
                    <el-icon><CopyDocument /></el-icon>
                    复制文本
                  </el-button>
                  <el-button
                    v-if="result.status === 'success'"
                    type="success"
                    size="small"
                    @click="handleDownloadText(result)"
                  >
                    <el-icon><Download /></el-icon>
                    下载文本
                  </el-button>
                  <el-button
                    v-if="result.status === 'failed'"
                    type="warning"
                    size="small"
                    @click="handleRetryRecognition(result)"
                  >
                    <el-icon><Refresh /></el-icon>
                    重新识别
                  </el-button>
                </div>
              </div>

              <div v-if="result.status === 'processing'" class="processing-content">
                <el-progress
                  :percentage="result.progress || 0"
                  :status="result.progress === 100 ? 'success' : undefined"
                />
                <p class="processing-text">正在识别中，请稍候...</p>
              </div>

              <div v-else-if="result.status === 'success'" class="success-content">
                <div class="preview-section">
                  <div class="preview-image">
                    <img
                      v-if="result.previewUrl"
                      :src="result.previewUrl"
                      :alt="result.fileName"
                      @click="handlePreviewImage(result)"
                    />
                    <div v-else class="no-preview">
                      <el-icon><Picture /></el-icon>
                      <span>无预览</span>
                    </div>
                  </div>
                  <div class="text-content">
                    <div class="text-header">
                      <span>识别文本:</span>
                      <el-button
                        text
                        type="primary"
                        size="small"
                        @click="handleToggleExpand(index)"
                      >
                        {{ result.expanded ? '收起' : '展开' }}
                      </el-button>
                    </div>
                    <div class="text-area" :class="{ expanded: result.expanded }">
                      <pre>{{ result.text }}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="result.status === 'failed'" class="error-content">
                <el-alert
                  :title="`识别失败: ${result.error || '未知错误'}`"
                  type="error"
                  :closable="false"
                  show-icon
                />
              </div>
            </el-card>
          </div>
        </div>

        <div v-if="recognitionResults.some((r) => r.status === 'success')" class="batch-actions">
          <el-button type="primary" @click="handleBatchDownload">
            <el-icon><Download /></el-icon>
            批量下载所有文本
          </el-button>
          <el-button type="success" @click="handleCopyAllText">
            <el-icon><CopyDocument /></el-icon>
            复制所有文本
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" title="图片预览" width="70%" top="5vh">
      <div v-if="currentPreview" class="image-preview">
        <img
          :src="currentPreview.previewUrl"
          :alt="currentPreview.fileName"
          style="width: 100%; max-height: 70vh; object-fit: contain"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  UploadFilled,
  MagicStick,
  Delete,
  Document,
  CopyDocument,
  Download,
  Refresh,
  Picture,
} from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

interface RecognitionResult {
  id: string
  fileName: string
  fileSize: number
  status: 'processing' | 'success' | 'failed'
  progress?: number
  text?: string
  confidence?: number
  error?: string
  previewUrl?: string
  expanded?: boolean
}

// 响应式数据
const uploadRef = ref()
const fileList = ref<UploadFile[]>([])
const recognizing = ref(false)
const recognitionResults = ref<RecognitionResult[]>([])
const previewDialogVisible = ref(false)
const currentPreview = ref<RecognitionResult | null>(null)

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    processing: 'warning',
    success: 'success',
    failed: 'danger',
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    processing: '识别中',
    success: '识别完成',
    failed: '识别失败',
  }
  return statusMap[status] || status
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理文件变化
const handleFileChange = (file: UploadFile) => {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'application/pdf']
  if (!allowedTypes.includes(file.raw?.type || '')) {
    ElMessage.error('只支持 JPG、PNG、BMP、PDF 格式的文件')
    return false
  }

  // 验证文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024
  if ((file.raw?.size || 0) > maxSize) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }

  return true
}

// 处理文件移除
const handleFileRemove = (file: UploadFile) => {
  // 如果正在识别，阻止移除
  if (recognizing.value) {
    ElMessage.warning('正在识别中，无法移除文件')
    return false
  }

  // 从结果中移除对应的记录
  const index = recognitionResults.value.findIndex((r) => r.fileName === file.name)
  if (index > -1) {
    recognitionResults.value.splice(index, 1)
  }

  return true
}

// 清空文件
const handleClearFiles = () => {
  fileList.value = []
  recognitionResults.value = []
  uploadRef.value?.clearFiles()
}

// 开始识别
const handleStartRecognition = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传文件')
    return
  }

  recognizing.value = true

  try {
    // 初始化识别结果
    recognitionResults.value = fileList.value.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name!,
      fileSize: file.size!,
      status: 'processing' as const,
      progress: 0,
      previewUrl: file.raw?.type?.startsWith('image/') ? URL.createObjectURL(file.raw) : undefined,
    }))

    // 逐个识别文件
    for (let i = 0; i < recognitionResults.value.length; i++) {
      const result = recognitionResults.value[i]
      const file = fileList.value[i]

      try {
        await recognizeFile(result, file.raw!)
      } catch (error) {
        result.status = 'failed'
        result.error = error instanceof Error ? error.message : '识别失败'
      }
    }
  } catch (error) {
    ElMessage.error('识别过程中发生错误')
  } finally {
    recognizing.value = false
  }
}

// 识别单个文件
const recognizeFile = async (result: RecognitionResult, file: File) => {
  // 模拟识别过程
  for (let progress = 0; progress <= 100; progress += 10) {
    result.progress = progress
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // TODO: 调用实际的OCR识别接口
  // const response = await api.recognizeFile(file)

  // 模拟识别结果
  result.status = 'success'
  result.text = `这是从文件 "${result.fileName}" 中识别出的文本内容。\n\n在实际应用中，这里会显示OCR识别的真实结果。\n\n识别的文本内容会包含原始文档中的所有文字信息，包括标题、正文、表格数据等。\n\n系统会自动检测文本的语言类型，并提供相应的识别精度。`
  result.confidence = 0.95 + Math.random() * 0.05 // 模拟置信度
  result.expanded = false
}

// 重新识别
const handleRetryRecognition = async (result: RecognitionResult) => {
  const file = fileList.value.find((f) => f.name === result.fileName)
  if (!file?.raw) {
    ElMessage.error('找不到原始文件')
    return
  }

  result.status = 'processing'
  result.progress = 0
  result.error = undefined

  try {
    await recognizeFile(result, file.raw)
    ElMessage.success('重新识别完成')
  } catch (error) {
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : '识别失败'
    ElMessage.error('重新识别失败')
  }
}

// 切换展开/收起
const handleToggleExpand = (index: number) => {
  recognitionResults.value[index].expanded = !recognitionResults.value[index].expanded
}

// 复制文本
const handleCopyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('文本已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 下载文本
const handleDownloadText = (result: RecognitionResult) => {
  const blob = new Blob([result.text || ''], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${result.fileName}_识别文本.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('文本文件下载完成')
}

// 批量下载
const handleBatchDownload = () => {
  const successResults = recognitionResults.value.filter((r) => r.status === 'success')
  if (successResults.length === 0) {
    ElMessage.warning('没有可下载的文本')
    return
  }

  const allText = successResults.map((r) => `=== ${r.fileName} ===\n\n${r.text}\n\n`).join('')

  const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OCR识别结果_${new Date().toLocaleDateString()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('批量下载完成')
}

// 复制所有文本
const handleCopyAllText = async () => {
  const successResults = recognitionResults.value.filter((r) => r.status === 'success')
  if (successResults.length === 0) {
    ElMessage.warning('没有可复制的文本')
    return
  }

  const allText = successResults.map((r) => `=== ${r.fileName} ===\n\n${r.text}`).join('\n\n')

  try {
    await navigator.clipboard.writeText(allText)
    ElMessage.success('所有文本已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 预览图片
const handlePreviewImage = (result: RecognitionResult) => {
  currentPreview.value = result
  previewDialogVisible.value = true
}
</script>

<style scoped>
.ocr-recognition-container {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
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

.upload-section {
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

/* 上传区域样式 */
.upload-area {
  margin-bottom: 16px;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #8c939d;
  line-height: 1.4;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

/* 识别结果样式 */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.result-card {
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.confidence {
  color: #52c41a;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.processing-content {
  padding: 16px 0;
}

.processing-text {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 8px 0 0 0;
}

.success-content {
  padding: 0;
}

.preview-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  align-items: flex-start;
}

.preview-image {
  width: 200px;
  height: 150px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.preview-image:hover {
  border-color: #1890ff;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: 12px;
}

.text-content {
  flex: 1;
}

.text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.text-area {
  max-height: 120px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  transition: max-height 0.3s ease;
}

.text-area.expanded {
  max-height: none;
}

.text-area pre {
  margin: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-content {
  padding: 16px 0;
}

.batch-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .preview-image {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .result-actions {
    align-self: stretch;
  }

  .file-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .batch-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>

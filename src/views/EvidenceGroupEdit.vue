<template>
  <div class="evidence-group-edit-container">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">{{ isEdit ? '编辑证据组' : '新建证据组' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">
          {{ loading ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </div>

    <div class="form-section">
      <el-card shadow="never">
        <el-form
          ref="evidenceFormRef"
          :model="evidenceForm"
          :rules="evidenceRules"
          label-width="120px"
          label-position="left"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="证据组名称" prop="name">
                <el-input
                  v-model="evidenceForm.name"
                  placeholder="请输入证据组名称"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="关联项目" prop="projectId">
                <el-select
                  v-model="evidenceForm.projectId"
                  placeholder="请选择关联项目"
                  style="width: 100%"
                  filterable
                >
                  <el-option
                    v-for="project in projectList"
                    :key="project.id"
                    :label="project.name"
                    :value="project.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="证据组描述" prop="description">
            <el-input
              v-model="evidenceForm.description"
              type="textarea"
              placeholder="请输入证据组描述"
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <!-- 证据文件管理 -->
          <el-form-item label="证据文件">
            <div class="evidence-files-section">
              <div class="section-header">
                <span>证据文件管理</span>
                <el-button type="primary" size="small" @click="handleAddFile">
                  <el-icon><Plus /></el-icon>
                  添加文件
                </el-button>
              </div>

              <div v-if="evidenceFiles.length === 0" class="empty-state">
                <el-empty description="暂无证据文件" />
              </div>

              <div v-else class="evidence-files-list">
                <div v-for="(file, index) in evidenceFiles" :key="index" class="evidence-file-item">
                  <el-card shadow="never" class="file-card">
                    <div class="file-header">
                      <div class="file-info">
                        <el-icon class="file-icon">
                          <Document />
                        </el-icon>
                        <div class="file-details">
                          <el-input
                            v-model="file.name"
                            placeholder="请输入文件名"
                            size="small"
                            class="file-name-input"
                          />
                          <div class="file-meta">
                            <el-select
                              v-model="file.type"
                              placeholder="文件类型"
                              size="small"
                              style="width: 100px"
                            >
                              <el-option label="文档" value="document" />
                              <el-option label="图片" value="image" />
                              <el-option label="视频" value="video" />
                              <el-option label="音频" value="audio" />
                              <el-option label="其他" value="other" />
                            </el-select>
                            <el-input
                              v-model="file.size"
                              placeholder="文件大小"
                              size="small"
                              style="width: 100px"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="file-actions">
                        <el-button type="text" size="small" @click="handlePreviewFile(file)">
                          <el-icon><View /></el-icon>
                        </el-button>
                        <el-button type="text" size="small" @click="handleDownloadFile(file)">
                          <el-icon><Download /></el-icon>
                        </el-button>
                        <el-button type="text" size="small" @click="handleRemoveFile(index)">
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>

                    <div class="file-content">
                      <el-input
                        v-model="file.description"
                        type="textarea"
                        placeholder="请输入文件描述"
                        :rows="2"
                        size="small"
                      />
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 证据分析 -->
          <el-form-item label="证据分析">
            <div class="evidence-analysis-section">
              <div class="section-header">
                <span>证据分析记录</span>
                <el-button type="primary" size="small" @click="handleAddAnalysis">
                  <el-icon><Plus /></el-icon>
                  添加分析
                </el-button>
              </div>

              <div v-if="evidenceAnalysis.length === 0" class="empty-state">
                <el-empty description="暂无分析记录" />
              </div>

              <div v-else class="analysis-list">
                <div
                  v-for="(analysis, index) in evidenceAnalysis"
                  :key="index"
                  class="analysis-item"
                >
                  <el-card shadow="never" class="analysis-card">
                    <div class="analysis-header">
                      <el-input
                        v-model="analysis.title"
                        placeholder="请输入分析标题"
                        class="analysis-title-input"
                      />
                      <el-select
                        v-model="analysis.type"
                        placeholder="分析类型"
                        style="width: 120px"
                      >
                        <el-option label="真实性分析" value="authenticity" />
                        <el-option label="完整性分析" value="completeness" />
                        <el-option label="关联性分析" value="relevance" />
                        <el-option label="合规性分析" value="compliance" />
                      </el-select>
                      <el-button type="text" size="small" @click="handleRemoveAnalysis(index)">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>

                    <div class="analysis-content">
                      <el-input
                        v-model="analysis.content"
                        type="textarea"
                        placeholder="请输入分析内容"
                        :rows="3"
                      />
                    </div>

                    <div class="analysis-result">
                      <div class="result-header">
                        <span>分析结论</span>
                        <el-tag :type="getResultTagType(analysis.result)" size="small">
                          {{ analysis.result }}
                        </el-tag>
                      </div>
                      <el-select
                        v-model="analysis.result"
                        placeholder="请选择分析结论"
                        style="width: 100%"
                      >
                        <el-option label="符合要求" value="符合要求" />
                        <el-option label="存在问题" value="存在问题" />
                        <el-option label="需要补充" value="需要补充" />
                        <el-option label="无法判断" value="无法判断" />
                      </el-select>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { ArrowLeft, Plus, Close, Document, View, Download, Delete } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'
import type { EvidenceGroup, AuditProject } from '@/services/api'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()

// 表单引用
const evidenceFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 项目列表
const projectList = computed(() => projectStore.projects)

// 证据组表单数据
const evidenceForm = reactive<Partial<EvidenceGroup>>({
  name: '',
  description: '',
  projectId: undefined,
})

// 证据文件数据
const evidenceFiles = ref<
  Array<{
    name: string
    type: string
    size: string
    description: string
    url?: string
  }>
>([])

// 证据分析数据
const evidenceAnalysis = ref<
  Array<{
    title: string
    type: string
    content: string
    result: string
  }>
>([])

// 表单验证规则
const evidenceRules = {
  name: [
    { required: true, message: '请输入证据组名称', trigger: 'blur' },
    { min: 2, max: 100, message: '证据组名称长度应在2-100字符之间', trigger: 'blur' },
  ],
  projectId: [{ required: true, message: '请选择关联项目', trigger: 'change' }],
  description: [
    { required: true, message: '请输入证据组描述', trigger: 'blur' },
    { min: 10, max: 500, message: '证据组描述长度应在10-500字符之间', trigger: 'blur' },
  ],
}

// 获取结果标签类型
const getResultTagType = (result: string) => {
  const resultMap: Record<string, string> = {
    符合要求: 'success',
    存在问题: 'danger',
    需要补充: 'warning',
    无法判断: 'info',
  }
  return resultMap[result] || ''
}

// 返回上一页
const goBack = () => {
  router.push('/dashboard/audit-projects')
}

// 添加证据文件
const handleAddFile = () => {
  // TODO: 实现文件上传功能
  // 这里模拟添加文件
  evidenceFiles.value.push({
    name: '新文件.pdf',
    type: 'document',
    size: '1.2MB',
    description: '',
  })
}

// 预览文件
const handlePreviewFile = (file: any) => {
  // TODO: 实现文件预览功能
  ElMessage.info('文件预览功能正在开发中')
}

// 下载文件
const handleDownloadFile = (file: any) => {
  // TODO: 实现文件下载功能
  ElMessage.info('文件下载功能正在开发中')
}

// 删除文件
const handleRemoveFile = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    evidenceFiles.value.splice(index, 1)
    ElMessage.success('文件已删除')
  } catch (error) {
    // 用户取消操作
  }
}

// 添加分析记录
const handleAddAnalysis = () => {
  evidenceAnalysis.value.push({
    title: '',
    type: 'authenticity',
    content: '',
    result: '',
  })
}

// 删除分析记录
const handleRemoveAnalysis = (index: number) => {
  evidenceAnalysis.value.splice(index, 1)
}

// 保存证据组
const handleSave = async () => {
  if (!evidenceFormRef.value) return

  try {
    const valid = await evidenceFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 构建保存数据
    const saveData = {
      ...evidenceForm,
      evidenceFiles: evidenceFiles.value,
      evidenceAnalysis: evidenceAnalysis.value,
    }

    // TODO: 调用真实的保存接口
    // if (isEdit.value) {
    //   await evidenceApi.updateEvidenceGroup(Number(route.params.id), saveData)
    // } else {
    //   await evidenceApi.createEvidenceGroup(saveData)
    // }

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success(isEdit.value ? '证据组更新成功' : '证据组创建成功')
    router.push('/dashboard/audit-projects')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    loading.value = false
  }
}

// 加载证据组数据
const loadEvidenceData = async () => {
  if (!isEdit.value) return

  // TODO: 根据ID加载证据组数据
  // const evidenceId = Number(route.params.id)
  // const evidence = await evidenceApi.getEvidenceGroup(evidenceId)

  // 模拟加载数据
  evidenceForm.name = '土地出让相关证据'
  evidenceForm.description = '包含土地出让过程中的各类证据材料'
  evidenceForm.projectId = 1

  evidenceFiles.value = [
    {
      name: '土地出让公告.pdf',
      type: 'document',
      size: '2.5MB',
      description: '土地出让公告原件',
    },
    {
      name: '竞价记录.xlsx',
      type: 'document',
      size: '1.8MB',
      description: '土地竞价过程记录',
    },
  ]

  evidenceAnalysis.value = [
    {
      title: '公告程序合规性分析',
      type: 'compliance',
      content: '分析土地出让公告程序是否符合法律法规要求',
      result: '符合要求',
    },
  ]
}

// 组件挂载时初始化
onMounted(async () => {
  // 确保项目数据已加载
  if (projectStore.projects.length === 0) {
    await projectStore.fetchProjects()
  }

  // 加载证据组数据
  await loadEvidenceData()
})
</script>

<style scoped>
.evidence-group-edit-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
}

.form-section {
  margin-bottom: 24px;
}

.evidence-files-section,
.evidence-analysis-section {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.evidence-files-list,
.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-card,
.analysis-card {
  border: 1px solid #e4e7ed;
  background: #fff;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
}

.file-details {
  flex: 1;
}

.file-name-input {
  margin-bottom: 8px;
}

.file-meta {
  display: flex;
  gap: 8px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-content {
  margin-top: 12px;
}

.analysis-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.analysis-title-input {
  flex: 1;
}

.analysis-content {
  margin-bottom: 12px;
}

.analysis-result {
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
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

  .file-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .file-info {
    flex-direction: column;
    align-items: stretch;
  }

  .file-meta {
    flex-direction: column;
  }

  .analysis-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

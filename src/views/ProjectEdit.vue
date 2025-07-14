<template>
  <div class="project-edit-container">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">{{ isEdit ? '编辑项目' : '新建项目' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="projectStore.loading" @click="handleSave">
          {{ projectStore.loading ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </div>

    <div class="form-section">
      <el-card shadow="never">
        <el-form
          ref="projectFormRef"
          :model="projectForm"
          :rules="projectRules"
          label-width="120px"
          label-position="left"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="项目名称" prop="name">
                <el-input
                  v-model="projectForm.name"
                  placeholder="请输入项目名称"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="审计类型" prop="auditType">
                <el-select
                  v-model="projectForm.auditType"
                  placeholder="请选择审计类型"
                  style="width: 100%"
                >
                  <el-option label="土地利用审计" value="土地利用审计" />
                  <el-option label="矿产资源审计" value="矿产资源审计" />
                  <el-option label="环境保护审计" value="环境保护审计" />
                  <el-option label="水资源审计" value="水资源审计" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="项目状态" prop="status">
                <el-select
                  v-model="projectForm.status"
                  placeholder="请选择项目状态"
                  style="width: 100%"
                >
                  <el-option label="草稿" value="draft" />
                  <el-option label="进行中" value="active" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="已归档" value="archived" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="负责人" prop="creator">
                <el-input
                  v-model="projectForm.creator"
                  placeholder="请输入负责人姓名"
                  maxlength="50"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="项目进度" prop="progress">
                <el-slider
                  v-model="projectForm.progress"
                  :step="5"
                  :max="100"
                  :format-tooltip="(value) => `${value}%`"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="项目描述" prop="description">
            <el-input
              v-model="projectForm.description"
              type="textarea"
              placeholder="请输入项目描述"
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <!-- 审计要点配置 -->
          <el-form-item label="审计要点">
            <div class="audit-points-section">
              <div class="section-header">
                <span>审计要点配置</span>
                <el-button type="primary" size="small" @click="handleAddAuditPoint">
                  <el-icon><Plus /></el-icon>
                  添加要点
                </el-button>
              </div>

              <div v-if="auditPoints.length === 0" class="empty-state">
                <el-empty description="暂无审计要点" />
              </div>

              <div v-else class="audit-points-list">
                <div v-for="(point, index) in auditPoints" :key="index" class="audit-point-item">
                  <el-card shadow="never" class="point-card">
                    <div class="point-header">
                      <el-input
                        v-model="point.title"
                        placeholder="请输入要点标题"
                        class="point-title-input"
                      />
                      <el-button type="text" size="small" @click="handleRemoveAuditPoint(index)">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                    <el-input
                      v-model="point.content"
                      type="textarea"
                      placeholder="请输入要点内容"
                      :rows="2"
                      class="point-content-input"
                    />
                  </el-card>
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 证据材料配置 -->
          <el-form-item label="证据材料">
            <div class="evidence-section">
              <div class="section-header">
                <span>证据材料配置</span>
                <el-button type="primary" size="small" @click="handleAddEvidence">
                  <el-icon><Plus /></el-icon>
                  添加证据
                </el-button>
              </div>

              <div v-if="evidenceList.length === 0" class="empty-state">
                <el-empty description="暂无证据材料" />
              </div>

              <div v-else class="evidence-list">
                <div v-for="(evidence, index) in evidenceList" :key="index" class="evidence-item">
                  <el-card shadow="never" class="evidence-card">
                    <div class="evidence-header">
                      <el-input
                        v-model="evidence.name"
                        placeholder="请输入证据名称"
                        class="evidence-name-input"
                      />
                      <el-select
                        v-model="evidence.type"
                        placeholder="证据类型"
                        style="width: 120px"
                      >
                        <el-option label="文档" value="document" />
                        <el-option label="图片" value="image" />
                        <el-option label="视频" value="video" />
                        <el-option label="其他" value="other" />
                      </el-select>
                      <el-button type="text" size="small" @click="handleRemoveEvidence(index)">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                    <el-input
                      v-model="evidence.description"
                      type="textarea"
                      placeholder="请输入证据描述"
                      :rows="2"
                      class="evidence-description-input"
                    />
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
import { ElMessage, type FormInstance } from 'element-plus'
import { ArrowLeft, Plus, Close } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'
import type { AuditProject } from '@/services/api'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()

// 表单引用
const projectFormRef = ref<FormInstance>()

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 项目表单数据
const projectForm = reactive<Partial<AuditProject>>({
  name: '',
  description: '',
  status: 'draft',
  creator: '',
  auditType: '',
  progress: 0,
})

// 审计要点数据
const auditPoints = ref<
  Array<{
    title: string
    content: string
  }>
>([])

// 证据材料数据
const evidenceList = ref<
  Array<{
    name: string
    type: string
    description: string
  }>
>([])

// 表单验证规则
const projectRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度应在2-100字符之间', trigger: 'blur' },
  ],
  auditType: [{ required: true, message: '请选择审计类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
  creator: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '负责人姓名长度应在2-50字符之间', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 10, max: 500, message: '项目描述长度应在10-500字符之间', trigger: 'blur' },
  ],
}

// 返回上一页
const goBack = () => {
  router.push('/app/projects')
}

// 添加审计要点
const handleAddAuditPoint = () => {
  auditPoints.value.push({
    title: '',
    content: '',
  })
}

// 删除审计要点
const handleRemoveAuditPoint = (index: number) => {
  auditPoints.value.splice(index, 1)
}

// 添加证据材料
const handleAddEvidence = () => {
  evidenceList.value.push({
    name: '',
    type: 'document',
    description: '',
  })
}

// 删除证据材料
const handleRemoveEvidence = (index: number) => {
  evidenceList.value.splice(index, 1)
}

// 保存项目
const handleSave = async () => {
  if (!projectFormRef.value) return

  try {
    const valid = await projectFormRef.value.validate()
    if (!valid) return

    // 构建保存数据
    const saveData = {
      ...projectForm,
      // TODO: 这里可以添加审计要点和证据材料的保存逻辑
      auditPoints: auditPoints.value,
      evidenceList: evidenceList.value,
    }

    if (isEdit.value) {
      // 编辑模式
      const projectId = Number(route.params.id)
      await projectStore.updateProject(projectId, saveData)
      ElMessage.success('项目更新成功')
    } else {
      // 新建模式
      await projectStore.createProject(
        saveData as Omit<AuditProject, 'id' | 'createTime' | 'updateTime'>,
      )
      ElMessage.success('项目创建成功')
    }

    router.push('/app/projects')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  }
}

// 加载项目数据
const loadProjectData = async () => {
  if (!isEdit.value) return

  const projectId = Number(route.params.id)
  const project = projectStore.getProjectById(projectId)

  if (project) {
    Object.assign(projectForm, project)

    // TODO: 这里可以加载审计要点和证据材料数据
    // 临时添加一些示例数据
    auditPoints.value = [
      { title: '土地利用规划符合性审计', content: '检查土地利用是否符合规划要求' },
      { title: '土地征收程序合规性审计', content: '审查土地征收程序是否合规' },
    ]

    evidenceList.value = [
      { name: '土地利用规划图', type: 'document', description: '最新的土地利用规划图纸' },
      { name: '征收批复文件', type: 'document', description: '相关征收批复文件' },
    ]
  } else {
    ElMessage.error('项目不存在')
    router.push('/app/projects')
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 确保项目数据已加载
  if (projectStore.projects.length === 0) {
    await projectStore.fetchProjects()
  }

  // 加载项目数据
  await loadProjectData()
})
</script>

<style scoped>
.project-edit-container {
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

.audit-points-section,
.evidence-section {
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

.audit-points-list,
.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-card,
.evidence-card {
  border: 1px solid #e4e7ed;
  background: #fff;
}

.point-header,
.evidence-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.point-title-input,
.evidence-name-input {
  flex: 1;
}

.point-content-input,
.evidence-description-input {
  width: 100%;
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

  .point-header,
  .evidence-header {
    flex-direction: column;
    align-items: stretch;
  }

  .point-title-input,
  .evidence-name-input {
    margin-bottom: 8px;
  }
}
</style>

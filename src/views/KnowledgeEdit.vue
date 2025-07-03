<template>
  <div class="knowledge-edit-container">
    <div class="page-header">
      <div class="header-left">
        <el-button
          type="text"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">{{ isEdit ? '编辑知识' : '新建知识' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="goBack">取消</el-button>
        <el-button
          type="primary"
          :loading="knowledgeStore.loading"
          @click="handleSave"
        >
          {{ knowledgeStore.loading ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </div>

    <div class="form-section">
      <el-card shadow="never">
        <el-form
          ref="knowledgeFormRef"
          :model="knowledgeForm"
          :rules="knowledgeRules"
          label-width="120px"
          label-position="left"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="知识标题" prop="title">
                <el-input
                  v-model="knowledgeForm.title"
                  placeholder="请输入知识标题"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="知识类型" prop="type">
                <el-select
                  v-model="knowledgeForm.type"
                  placeholder="请选择知识类型"
                  style="width: 100%"
                >
                  <el-option label="法规" value="regulation" />
                  <el-option label="案例" value="case" />
                  <el-option label="模板" value="template" />
                  <el-option label="指南" value="guide" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="创建者" prop="creator">
                <el-input
                  v-model="knowledgeForm.creator"
                  placeholder="请输入创建者姓名"
                  maxlength="50"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="标签" prop="tags">
                <el-select
                  v-model="knowledgeForm.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="请选择或输入标签"
                  style="width: 100%"
                >
                  <el-option label="土地管理" value="土地管理" />
                  <el-option label="矿产资源" value="矿产资源" />
                  <el-option label="环境保护" value="环境保护" />
                  <el-option label="审计案例" value="审计案例" />
                  <el-option label="法规条文" value="法规条文" />
                  <el-option label="操作指南" value="操作指南" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="知识内容" prop="content">
            <div class="content-editor">
              <div class="editor-toolbar">
                <el-button-group>
                  <el-button
                    size="small"
                    @click="insertText('**', '**')"
                  >
                    <el-icon><bold /></el-icon>
                    加粗
                  </el-button>
                  <el-button
                    size="small"
                    @click="insertText('*', '*')"
                  >
                    <el-icon><italic /></el-icon>
                    斜体
                  </el-button>
                  <el-button
                    size="small"
                    @click="insertText('## ', '')"
                  >
                    <el-icon><title /></el-icon>
                    标题
                  </el-button>
                  <el-button
                    size="small"
                    @click="insertText('- ', '')"
                  >
                    <el-icon><list /></el-icon>
                    列表
                  </el-button>
                </el-button-group>
              </div>

              <el-row :gutter="16">
                <el-col :span="12">
                  <div class="editor-panel">
                    <div class="panel-header">编辑器</div>
                    <el-input
                      ref="contentEditorRef"
                      v-model="knowledgeForm.content"
                      type="textarea"
                      placeholder="请输入知识内容，支持 Markdown 格式"
                      :rows="20"
                      resize="none"
                      @input="handleContentChange"
                    />
                  </div>
                </el-col>

                <el-col :span="12">
                  <div class="preview-panel">
                    <div class="panel-header">预览</div>
                    <div class="preview-content" v-html="previewContent"></div>
                  </div>
                </el-col>
              </el-row>
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
import { ArrowLeft } from '@element-plus/icons-vue'
import { useKnowledgeStore } from '@/stores/knowledge'
import type { KnowledgeItem } from '@/services/api'

const router = useRouter()
const route = useRoute()
const knowledgeStore = useKnowledgeStore()

// 表单引用
const knowledgeFormRef = ref<FormInstance>()
const contentEditorRef = ref<any>()

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 知识表单数据
const knowledgeForm = reactive<Partial<KnowledgeItem>>({
  title: '',
  content: '',
  type: 'regulation',
  creator: '',
  tags: []
})

// 表单验证规则
const knowledgeRules = {
  title: [
    { required: true, message: '请输入知识标题', trigger: 'blur' },
    { min: 2, max: 100, message: '知识标题长度应在2-100字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择知识类型', trigger: 'change' }
  ],
  creator: [
    { required: true, message: '请输入创建者姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '创建者姓名长度应在2-50字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入知识内容', trigger: 'blur' },
    { min: 10, message: '知识内容至少10个字符', trigger: 'blur' }
  ]
}

// 预览内容
const previewContent = computed(() => {
  if (!knowledgeForm.content) return '<p class="empty-preview">请输入内容查看预览</p>'

  // 简单的 Markdown 解析
  return knowledgeForm.content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)$/, '<p>$1</p>')
})

// 返回上一页
const goBack = () => {
  router.push('/dashboard/knowledge-management')
}

// 插入文本
const insertText = (prefix: string, suffix: string) => {
  const textarea = contentEditorRef.value?.textarea
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = knowledgeForm.content.substring(start, end)

  const newText = prefix + selectedText + suffix
  const newContent =
    knowledgeForm.content.substring(0, start) +
    newText +
    knowledgeForm.content.substring(end)

  knowledgeForm.content = newContent

  // 设置新的光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
  }, 0)
}

// 处理内容变化
const handleContentChange = () => {
  // 这里可以添加实时保存等功能
}

// 保存知识
const handleSave = async () => {
  if (!knowledgeFormRef.value) return

  try {
    const valid = await knowledgeFormRef.value.validate()
    if (!valid) return

    if (isEdit.value) {
      // 编辑模式
      const knowledgeId = Number(route.params.id)
      await knowledgeStore.updateKnowledge(knowledgeId, knowledgeForm)
      ElMessage.success('知识更新成功')
    } else {
      // 新建模式
      await knowledgeStore.createKnowledge(knowledgeForm as Omit<KnowledgeItem, 'id' | 'createTime' | 'updateTime'>)
      ElMessage.success('知识创建成功')
    }

    router.push('/dashboard/knowledge-management')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  }
}

// 加载知识数据
const loadKnowledgeData = async () => {
  if (!isEdit.value) return

  const knowledgeId = Number(route.params.id)
  const knowledge = knowledgeStore.getKnowledgeById(knowledgeId)

  if (knowledge) {
    Object.assign(knowledgeForm, knowledge)
  } else {
    ElMessage.error('知识不存在')
    router.push('/dashboard/knowledge-management')
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 确保知识库数据已加载
  if (knowledgeStore.knowledgeList.length === 0) {
    await knowledgeStore.fetchKnowledgeList()
  }

  // 加载知识数据
  await loadKnowledgeData()
})
</script>

<style scoped>
.knowledge-edit-container {
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

.content-editor {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.editor-panel,
.preview-panel {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  color: #333;
}

.editor-panel .el-textarea {
  flex: 1;
  border: none;
  border-radius: 0;
}

.editor-panel :deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
  resize: none;
  height: 100%;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.preview-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fff;
  line-height: 1.6;
}

.preview-content :deep(h1) {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.preview-content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 12px 0;
}

.preview-content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 12px 0 8px 0;
}

.preview-content :deep(p) {
  margin: 0 0 12px 0;
  color: #666;
}

.preview-content :deep(ul) {
  margin: 0 0 12px 0;
  padding-left: 20px;
}

.preview-content :deep(li) {
  margin: 4px 0;
  color: #666;
}

.preview-content :deep(strong) {
  font-weight: 600;
  color: #333;
}

.preview-content :deep(em) {
  font-style: italic;
  color: #666;
}

.empty-preview {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 60px 0;
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

  .editor-panel,
  .preview-panel {
    height: 300px;
  }

  .content-editor .el-row {
    flex-direction: column;
  }

  .content-editor .el-col {
    width: 100%;
  }
}
</style>

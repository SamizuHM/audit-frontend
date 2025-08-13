<template>
  <div class="data-analysis-container">
    <!-- 页面标题和操作按钮 -->
    <!-- <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据分析</h2>
        <p class="page-description">基于AI的智能数据分析平台</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div> -->

    <!-- 主要内容区域 -->
    <el-row :gutter="24">
      <!-- 左侧：AI数据分析助手 -->
      <el-col :span="16">
        <el-card shadow="never" class="chat-card">
          <template #header>
            <div class="chat-header">
              <span>AI 数据分析助手</span>
              <el-button type="text" size="small">
                <el-icon><More /></el-icon>
              </el-button>
            </div>
          </template>

          <!-- 聊天消息区域 -->
          <div class="chat-messages" ref="messagesContainer">
              <div
                v-for="(message, index) in messages"
                :key="index"
                class="message"
                :class="message.role"
              >
                <div class="message-content">
                  <!-- 关键：加上 style 或类名 -->
                  <div class="message-text" style="white-space: pre-line">
                    {{ message.content }}
                  </div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
              </div>

            <!-- 正在输入提示 -->
            <div v-if="isTyping" class="message assistant">
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="chat-input">
            <div class="input-container">
              <el-button circle size="small" @click="handleFileUpload">
                <el-icon><Paperclip /></el-icon>
              </el-button>
              <input
                type="file"
                ref="fileInput"
                style="display: none"
                accept=".xlsx,.xls,.csv"
                @change="handleFileSelected"
              />
              <el-input
                v-model="inputMessage"
                placeholder="描述您的数据分析需求..."
                @keydown.enter="handleSendMessage"
              />
              <el-button type="primary" @click="handleSendMessage">
                <el-icon><Position /></el-icon>
              </el-button>
              <el-button size="small" @click="handleDownload">
                <el-icon><Download /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：数据库和模型管理 -->
      <el-col :span="8">
        <div class="management-panel">
          <div class="management-header">
            <div class="header-left">
              <h3 class="panel-title">管理面板</h3>
            </div>
            <div class="header-right">
              <el-button type="primary" size="small" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </div>
          </div>
          <div class="management-content">
            <!-- 数据库管理 -->
            <div class="management-section">
              <div class="section-header" @click="toggleSection('database')">
                <span>数据库管理</span>
                <div class="header-actions">
                  <el-button
                    type="text"
                    size="small"
                    style="margin-right: 8px"
                    @click.stop="() => (showAddDatabaseModal = true)"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-icon><ArrowDown v-if="openSections.database" /><ArrowRight v-else /></el-icon>
                </div>
              </div>

              <div v-show="openSections.database" class="section-content">
                <div class="database-list">
                  <div
                    v-for="database in databases"
                    :key="database.id"
                    class="database-item"
                    :class="{ selected: database.selected }"
                    @click="toggleDatabase(database)"
                  >
                    <div class="database-info">
                      <div class="database-name">{{ database.name }}</div>
                      <div class="database-meta">{{ database.tables }}个表 · {{ database.size }}</div>
                    </div>
                    <div class="database-actions">
                      <el-dropdown @command="(command) => handleDatabaseAction(command, database)">
                        <el-button type="text" size="small">
                          <el-icon><More /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="connect">连接</el-dropdown-item>
                            <el-dropdown-item command="refresh">刷新</el-dropdown-item>
                            <el-dropdown-item command="export">导出</el-dropdown-item>
                            <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 模型管理 -->
            <div class="management-section">
              <div class="section-header" @click="toggleSection('model')">
                <span>分析模型</span>
                <div class="header-actions">
                  <el-button
                    type="text"
                    size="small"
                    style="margin-right: 8px"
                    @click.stop="() => (showAddModelModal = true)"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-icon><ArrowDown v-if="openSections.model" /><ArrowRight v-else /></el-icon>
                </div>
              </div>
              
              <div v-show="openSections.model" class="section-content">
                <div class="model-list">
                  <div
                    v-for="model in models"
                    :key="model.id"
                    class="model-item"
                    :class="{ selected: model.selected }"
                    @click="toggleModel(model)"
                  >
                    <div class="model-info">
                      <div class="model-name">{{ model.name }}</div>
                      <div class="model-meta">
                        <el-tag :type="getModelStatusType(model.status)" size="small">
                          {{ model.status }}
                        </el-tag>
                        <span class="model-accuracy">准确率: {{ model.accuracy }}%</span>
                      </div>
                    </div>
                    <div class="model-actions">
                      <el-dropdown @command="(command) => handleModelAction(command, model)">
                        <el-button type="text" size="small">
                          <el-icon><More /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="apply">应用</el-dropdown-item>
                            <el-dropdown-item command="train">训练</el-dropdown-item>
                            <el-dropdown-item command="export">导出</el-dropdown-item>
                            <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 模板管理 -->
            <div class="management-section">
              <div class="section-header" @click="toggleSection('template')">
                <span>分析模板</span>
                <div class="header-actions">
                  <el-button
                    type="text"
                    size="small"
                    style="margin-right: 8px"
                    @click.stop="() => (showTemplateModal = true)"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-icon><ArrowDown v-if="openSections.template" /><ArrowRight v-else /></el-icon>
                </div>
              </div>

              <div v-show="openSections.template" class="section-content">
                <div class="template-list">
                  <div
                    v-for="template in templates"
                    :key="template.id"
                    class="template-item"
                    @click="applyTemplate(template)"
                  >
                    <div class="template-info">
                      <div class="template-name">{{ template.name }}</div>
                      <div class="template-desc">{{ template.description }}</div>
                    </div>
                    <div class="template-actions">
                      <el-dropdown @command="(command) => handleTemplateAction(command, template)">
                        <el-button type="text" size="small">
                          <el-icon><More /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="apply">应用</el-dropdown-item>
                            <el-dropdown-item command="edit">编辑</el-dropdown-item>
                            <el-dropdown-item command="copy">复制</el-dropdown-item>
                            <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

        </div>

        
      </el-col>
    </el-row>

    <!-- 添加数据库模态框 -->
    <el-dialog v-model="showAddDatabaseModal" title="添加数据库" width="500px">
      <el-form :model="databaseForm" label-width="80px">
        <el-form-item label="数据库名称">
          <el-input v-model="databaseForm.name" placeholder="请输入数据库名称" />
        </el-form-item>
        <el-form-item label="连接类型">
          <el-select v-model="databaseForm.type" placeholder="请选择连接类型" style="width: 100%">
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgresql" />
            <el-option label="Oracle" value="oracle" />
            <el-option label="SQL Server" value="sqlserver" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接地址">
          <el-input v-model="databaseForm.host" placeholder="请输入连接地址" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="databaseForm.port" placeholder="请输入端口号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDatabaseModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddDatabase">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加模型模态框 -->
    <el-dialog v-model="showAddModelModal" title="添加分析模型" width="500px">
      <el-form :model="modelForm" label-width="80px">
        <el-form-item label="模型名称">
          <el-input v-model="modelForm.name" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型类型">
          <el-select v-model="modelForm.type" placeholder="请选择模型类型" style="width: 100%">
            <el-option label="分类模型" value="classification" />
            <el-option label="回归模型" value="regression" />
            <el-option label="聚类模型" value="clustering" />
            <el-option label="异常检测" value="anomaly" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型描述">
          <el-input
            v-model="modelForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模型描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModelModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddModel">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 新建模板模态框 -->
    <el-dialog v-model="showTemplateModal" title="新建分析模板" width="600px">
      <el-form :model="templateForm" label-width="80px">
        <el-form-item label="模板名称">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input v-model="templateForm.description" placeholder="请输入模板描述" />
        </el-form-item>
        <el-form-item label="分析步骤">
          <el-input
            v-model="templateForm.steps"
            type="textarea"
            :rows="6"
            placeholder="请输入分析步骤，每行一个步骤"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTemplateModal = false">取消</el-button>
        <el-button type="primary" @click="handleAddTemplate">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  More,
  Plus,
  Paperclip,
  Position,
  Download,
  ArrowDown,
  ArrowRight,
} from '@element-plus/icons-vue'

// 响应式数据
const messagesContainer = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const inputMessage = ref('')
const isTyping = ref(false)

// 模态框控制
const showAddDatabaseModal = ref(false)
const showAddModelModal = ref(false)
const showTemplateModal = ref(false)

// 展开状态
const openSections = reactive({
  database: true,
  model: true,
  template: true,
})

// 聊天消息
const messages = ref([
  {
    role: 'assistant',

    content: "您好！我是AI数据分析助手，有什么可以帮助您分析的吗？\n"+
                                "比如你可以问：\n" +
                                "\n1：我想要查询森林资源数据库中树木的种类\n" +
                                "2：我想要查询森林资源数据库中哪一种树木的数量最少\n" +
                                "3：我想要查询森林资源数据库中树的健康状态\n" +
                                "\n您也可以上传要文件或使用右侧的提示词模板。\n",

    time: new Date(),
  },
])

// 数据库列表
const databases = ref([
  { id: '1', name: '审计主数据库', tables: 23, size: '1.2GB', selected: true },
  { id: '2', name: '项目数据库', tables: 15, size: '800MB', selected: false },
  { id: '3', name: '知识库数据库', tables: 8, size: '500MB', selected: false },
])

// 模型列表
const models = ref([
  { id: '1', name: '风险评估模型', status: '已训练', accuracy: 92, selected: true },
  { id: '2', name: '异常检测模型', status: '训练中', accuracy: 88, selected: false },
  { id: '3', name: '合规性分析模型', status: '已训练', accuracy: 95, selected: false },
])

// 模板列表
const templates = ref([
  { id: '1', name: '财务数据分析', description: '财务指标计算和趋势分析' },
  { id: '2', name: '审计风险评估', description: '基于历史数据的风险评估模板' },
  { id: '3', name: '合规性检查', description: '法规符合性自动化检查流程' },
])

// 表单数据
const databaseForm = reactive({
  name: '',
  type: '',
  host: '',
  port: '',
})

const modelForm = reactive({
  name: '',
  type: '',
  description: '',
})

const templateForm = reactive({
  name: '',
  description: '',
  steps: '',
})

// 格式化时间
const formatTime = (time: Date) => {
  return time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 切换区域展开状态
const toggleSection = (section: keyof typeof openSections) => {
  openSections[section] = !openSections[section]
}

// 发送消息
const handleSendMessage = async () => {
  if (!inputMessage.value.trim()) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: inputMessage.value,
    time: new Date(),
  })

  const userMessage = inputMessage.value
  inputMessage.value = ''

  // 显示正在输入状态
  isTyping.value = true
  await nextTick()
  scrollToBottom()

  // 模拟AI回复
  setTimeout(() => {
    isTyping.value = false
    messages.value.push({
      role: 'assistant',
      content: generateAIResponse(userMessage),
      time: new Date(),
    })
    nextTick(() => scrollToBottom())
  }, 2000)
}

// 生成AI回复
const generateAIResponse = (userMessage: string) => {
  const responses = [
    '已分析您的数据，发现以下趋势：数据整体呈上升趋势，建议关注异常值。',
    '根据您的分析需求，我为您推荐使用回归分析模型，预计准确率可达85%以上。',
    '数据质量评估完成：数据完整性98%，建议对缺失值进行处理后再进行深度分析。',
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 文件上传
const handleFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    messages.value.push({
      role: 'user',
      content: `已上传文件：${file.name}`,
      time: new Date(),
    })

    setTimeout(() => {
      messages.value.push({
        role: 'assistant',
        content: `文件${file.name}上传成功！检测到${Math.floor(Math.random() * 1000) + 100}行数据，${Math.floor(Math.random() * 20) + 5}个字段。是否开始数据分析？`,
        time: new Date(),
      })
      nextTick(() => scrollToBottom())
    }, 1000)
  }
}

// 下载报告
const handleDownload = () => {
  ElMessage.success('分析报告下载已开始')
}

// 切换数据库
const toggleDatabase = (database: any) => {
  databases.value.forEach((db) => (db.selected = false))
  database.selected = true
}

// 切换模型
const toggleModel = (model: any) => {
  models.value.forEach((m) => (m.selected = false))
  model.selected = true
}

// 获取模型状态类型
const getModelStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    已训练: 'success',
    训练中: 'warning',
    待训练: 'info',
  }
  return statusMap[status] || 'info'
}

// 应用模板
const applyTemplate = (template: any) => {
  inputMessage.value = `请使用"${template.name}"模板进行数据分析`
  handleSendMessage()
}

// 数据库操作
const handleDatabaseAction = async (command: string, database: any) => {
  switch (command) {
    case 'connect':
      ElMessage.success(`正在连接数据库：${database.name}`)
      break
    case 'refresh':
      ElMessage.success('数据库信息已刷新')
      break
    case 'export':
      ElMessage.success('数据导出已开始')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个数据库连接吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        databases.value = databases.value.filter((db) => db.id !== database.id)
        ElMessage.success('数据库连接已删除')
      } catch {
        // 用户取消
      }
      break
  }
}

// 模型操作
const handleModelAction = async (command: string, model: any) => {
  switch (command) {
    case 'apply':
      ElMessage.success(`正在应用模型：${model.name}`)
      break
    case 'train':
      ElMessage.success('模型训练已开始')
      break
    case 'export':
      ElMessage.success('模型导出已开始')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个模型吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        models.value = models.value.filter((m) => m.id !== model.id)
        ElMessage.success('模型已删除')
      } catch {
        // 用户取消
      }
      break
  }
}

// 模板操作
const handleTemplateAction = async (command: string, template: any) => {
  switch (command) {
    case 'apply':
      applyTemplate(template)
      break
    case 'edit':
      ElMessage.info('编辑模板功能开发中')
      break
    case 'copy':
      ElMessage.success('模板已复制')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个模板吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        templates.value = templates.value.filter((t) => t.id !== template.id)
        ElMessage.success('模板已删除')
      } catch {
        // 用户取消
      }
      break
  }
}

// 添加数据库
const handleAddDatabase = () => {
  if (!databaseForm.name || !databaseForm.type) {
    ElMessage.warning('请填写完整信息')
    return
  }

  databases.value.push({
    id: Date.now().toString(),
    name: databaseForm.name,
    tables: Math.floor(Math.random() * 30) + 5,
    size: `${Math.floor(Math.random() * 2000) + 100}MB`,
    selected: false,
  })

  ElMessage.success('数据库添加成功')
  showAddDatabaseModal.value = false

  // 重置表单
  Object.assign(databaseForm, {
    name: '',
    type: '',
    host: '',
    port: '',
  })
}

// 添加模型
const handleAddModel = () => {
  if (!modelForm.name || !modelForm.type) {
    ElMessage.warning('请填写完整信息')
    return
  }

  models.value.push({
    id: Date.now().toString(),
    name: modelForm.name,
    status: '待训练',
    accuracy: 0,
    selected: false,
  })

  ElMessage.success('模型添加成功')
  showAddModelModal.value = false

  // 重置表单
  Object.assign(modelForm, {
    name: '',
    type: '',
    description: '',
  })
}

// 添加模板
const handleAddTemplate = () => {
  if (!templateForm.name || !templateForm.description) {
    ElMessage.warning('请填写完整信息')
    return
  }

  templates.value.push({
    id: Date.now().toString(),
    name: templateForm.name,
    description: templateForm.description,
  })

  ElMessage.success('模板添加成功')
  showTemplateModal.value = false

  // 重置表单
  Object.assign(templateForm, {
    name: '',
    description: '',
    steps: '',
  })
}

// 刷新数据
const handleRefresh = async () => {
  try {
    ElMessage.success('数据刷新成功')
  } catch {
    ElMessage.error('数据刷新失败')
  }
}

// 组件挂载时滚动到底部
onMounted(() => {
  nextTick(() => scrollToBottom())
})
</script>

<style scoped>
.data-analysis-container {
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

.chat-card {
  height: 700px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 字体加粗 */
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 220px 0;
  max-height: 500px;
  font-size: 14px;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  max-width: 90%;
  padding: 12px 16px;
  border-radius: 12px;
}

.message.user .message-content {
  background: #409eff;
  color: white;
}

.message-text {
  line-height: 1.6;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-input {
  /* 置于页面底端 */

  border-top: 1px solid #e4e7ed;
  padding: 16px;
}

.input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.management-title {
  margin-bottom: 16px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
  position: sticky;
  top: 0;
  z-index: 10;
}

.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.management-panel {
  height: 700px;
  display: flex;
  flex-direction: column;
}

.management-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.management-content::-webkit-scrollbar {
  width: 4px;
}

.management-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.management-section {
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  overflow: hidden;
}

.section-header {
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #333;
  background: #f8f9fa;
  transition: all 0.3s;
}

.section-header:hover {
  background: #f0f2f5;
  color: #409eff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-content {
  padding: 12px;
}

.database-list,
.model-list,
.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.database-item,
.model-item,
.template-item {
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  background: #fff;
}

.database-item:last-child,
.model-item:last-child,
.template-item:last-child {
  margin-bottom: 0;
}

.database-item:hover,
.model-item:hover,
.template-item:hover {
  border-color: #409eff;
  background: #f0f2f5;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.database-item.selected,
.model-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.database-info,
.model-info,
.template-info {
  flex: 1;
}

.database-name,
.model-name,
.template-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 1.4;
}

.database-meta,
.model-meta,
.template-desc {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 8px;
  align-items: center;
  line-height: 1.4;
}

.model-meta .el-tag {
  padding: 0 6px;
  height: 20px;
  line-height: 18px;
}

.model-accuracy {
  margin-left: auto;
}

.database-actions,
.model-actions,
.template-actions {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .chat-card {
    height: 500px;
  }

  .message-content {
    max-width: 85%;
  }
}
</style>

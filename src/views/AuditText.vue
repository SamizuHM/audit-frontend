<template>
  <div class="audit-text-container">
    <!-- 项目选择区域 -->
    <div class="project-selection">
      <div class="selection-item">
        <span class="selection-label">选择项目:</span>
        <el-select
          v-model="selectedProject"
          placeholder="请选择审计项目"
          class="selection-dropdown"
          @change="handleProjectChange"
        >
          <el-option
            v-for="project in projects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </div>
      <div class="selection-item">
        <span class="selection-label">审计阶段:</span>
        <el-select v-model="selectedPhase" placeholder="请选择审计阶段" class="selection-dropdown">
          <el-option label="准备阶段" value="preparation" />
          <el-option label="实施阶段" value="implementation" />
          <el-option label="报告阶段" value="reporting" />
        </el-select>
      </div>
      <div class="selection-item">
        <span class="selection-label">文书类型:</span>
        <el-select
          v-model="selectedDocType"
          placeholder="请选择文书类型"
          class="selection-dropdown"
        >
          <el-option label="审计通知书" value="notice" />
          <el-option label="审计方案" value="plan" />
          <el-option label="审计底稿" value="draft" />
          <el-option label="审计报告" value="report" />
        </el-select>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-container">
      <!-- 历史对话侧边栏 -->
      <div class="history-sidebar" :class="{ collapsed: !showHistory }">
        <div class="history-header">
          <span class="history-title">对话历史</span>
          <el-button text class="toggle-history" @click="showHistory = !showHistory">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>
        <el-button type="primary" class="new-chat-btn" @click="handleNewChat">
          <el-icon><Plus /></el-icon>
          新建对话
        </el-button>
        <div class="history-content">
          <div
            v-for="chat in chatHistory"
            :key="chat.id"
            class="history-item"
            :class="{ active: chat.id === currentChatId }"
            @click="handleSelectChat(chat.id)"
          >
            <div class="history-item-content">
              <div class="history-item-title">{{ chat.title }}</div>
              <div class="history-item-time">{{ formatTime(chat.updateTime) }}</div>
            </div>
            <el-button text class="delete-chat-btn" @click.stop="handleDeleteChat(chat.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="chat-main">
        <div class="chat-header">
          <div class="chat-title">
            <el-icon><Edit /></el-icon>
            智能审计文书生成
          </div>
          <div class="chat-status">
            <div class="status-dot"></div>
            AI助手在线
          </div>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="(message, index) in currentMessages"
            :key="index"
            class="message"
            :class="message.type"
          >
            <div class="message-avatar" :class="message.type">
              {{ message.type === 'ai' ? 'AI' : '我' }}
            </div>
            <div class="message-content">
              <div v-html="message.content"></div>
              <div class="message-time">{{ formatTime(message.time) }}</div>

              <!-- AI消息的操作按钮 -->
              <div v-if="message.type === 'ai'" class="message-actions">
                <el-button
                  text
                  size="small"
                  class="refine-btn ai-refine"
                  @click="handleRefineMessage(index)"
                >
                  <el-icon><Edit /></el-icon>
                  润色
                </el-button>
                <el-button
                  text
                  size="small"
                  class="submit-btn"
                  @click="handleSubmitDocument(message.content)"
                >
                  <el-icon><Check /></el-icon>
                  提交
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="message ai">
            <div class="message-avatar ai">AI</div>
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
        <div class="chat-input-area">
          <div class="input-toolbar">
            <el-button
              size="small"
              class="toolbar-btn"
              title="选择知识库"
              @click="showKnowledgeModal = true"
            >
              <el-icon><Collection /></el-icon>
              知识库
            </el-button>
            <el-button size="small" class="toolbar-btn" title="上传文件" @click="handleFileUpload">
              <el-icon><Upload /></el-icon>
              文件
            </el-button>
            <el-button
              size="small"
              class="toolbar-btn"
              title="提示词模板"
              @click="showPromptModal = true"
            >
              <el-icon><Document /></el-icon>
              模板
            </el-button>
          </div>
          <div class="input-container">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="请输入您的需求，例如：请帮我生成一份土地资源审计通知书..."
              class="chat-input"
              @keydown.enter.ctrl="handleSendMessage"
            />
            <el-button
              type="primary"
              class="send-btn"
              :disabled="!inputMessage.trim()"
              @click="handleSendMessage"
            >
              <el-icon><Position /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识库选择模态框 -->
    <el-dialog v-model="showKnowledgeModal" title="选择知识库" width="800px">
      <div class="knowledge-section">
        <h4 class="knowledge-section-title">法规条例</h4>
        <div class="knowledge-list">
          <div
            v-for="item in knowledgeBase.regulations"
            :key="item.id"
            class="knowledge-item"
            :class="{ selected: selectedKnowledge.includes(item.id) }"
            @click="toggleKnowledge(item.id)"
          >
            <el-checkbox
              :model-value="selectedKnowledge.includes(item.id)"
              class="knowledge-checkbox"
            />
            <span class="knowledge-name">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <div class="knowledge-section">
        <h4 class="knowledge-section-title">案例模板</h4>
        <div class="knowledge-list">
          <div
            v-for="item in knowledgeBase.templates"
            :key="item.id"
            class="knowledge-item"
            :class="{ selected: selectedKnowledge.includes(item.id) }"
            @click="toggleKnowledge(item.id)"
          >
            <el-checkbox
              :model-value="selectedKnowledge.includes(item.id)"
              class="knowledge-checkbox"
            />
            <span class="knowledge-name">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showKnowledgeModal = false">取消</el-button>
        <el-button type="primary" @click="confirmKnowledgeSelection">确认</el-button>
      </template>
    </el-dialog>

    <!-- 提示词模板模态框 -->
    <el-dialog v-model="showPromptModal" title="提示词模板" width="1000px">
      <div class="prompt-templates">
        <div
          v-for="template in promptTemplates"
          :key="template.id"
          class="prompt-template"
          @click="selectPromptTemplate(template)"
        >
          <div class="prompt-template-title">{{ template.title }}</div>
          <div class="prompt-template-content">{{ template.content }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 文档提交模态框 -->
    <el-dialog v-model="showSubmitModal" title="提交审计文书" width="600px">
      <div v-if="submitStatus === 'form'" class="submit-form">
        <div class="form-group">
          <label class="form-label">文书标题</label>
          <el-input v-model="submitForm.title" placeholder="请输入文书标题" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">审计阶段</label>
          <el-select v-model="submitForm.phase" placeholder="请选择审计阶段" class="form-input">
            <el-option label="准备阶段" value="preparation" />
            <el-option label="实施阶段" value="implementation" />
            <el-option label="报告阶段" value="reporting" />
          </el-select>
        </div>
        <div class="form-group">
          <label class="form-label">备注说明</label>
          <el-input
            v-model="submitForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
            class="form-textarea"
          />
        </div>
      </div>

      <div v-if="submitStatus === 'loading'" class="submission-status">
        <div class="status-icon loading-icon">
          <el-icon><Loading /></el-icon>
        </div>
        <div class="status-title">正在提交...</div>
        <div class="status-description">请稍候，正在保存文书内容</div>
      </div>

      <div v-if="submitStatus === 'success'" class="submission-status">
        <div class="status-icon success-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="status-title">提交成功</div>
        <div class="status-description">文书已成功提交，您可以在项目管理中查看</div>
      </div>

      <template #footer>
        <div v-if="submitStatus === 'form'" class="form-actions">
          <el-button @click="showSubmitModal = false">取消</el-button>
          <el-button type="primary" @click="confirmSubmitDocument">提交</el-button>
        </div>
        <div v-if="submitStatus === 'success'">
          <el-button type="primary" @click="showSubmitModal = false">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  ArrowLeft,
  Delete,
  Edit,
  Check,
  Collection,
  Upload,
  Document,
  Position,
  Loading,
  CircleCheck,
} from '@element-plus/icons-vue'

// 响应式数据
const showHistory = ref(true)
const showKnowledgeModal = ref(false)
const showPromptModal = ref(false)
const showSubmitModal = ref(false)
const isTyping = ref(false)
const inputMessage = ref('')
const selectedProject = ref('')
const selectedPhase = ref('')
const selectedDocType = ref('')
const currentChatId = ref('')
const submitStatus = ref('form') // 'form' | 'loading' | 'success'
const messagesContainer = ref<HTMLElement>()

// 项目数据
const projects = ref([
  { id: '1', name: '某市土地资源开发利用审计项目' },
  { id: '2', name: '某县森林资源保护审计项目' },
  { id: '3', name: '某区矿产资源开采审计项目' },
  { id: '4', name: '某省水资源管理审计项目' },
])

// 聊天历史
const chatHistory = ref([
  {
    id: '1',
    title: '土地资源审计通知书',
    updateTime: Date.now() - 1000 * 60 * 30,
    messages: [] as any[],
  },
  {
    id: '2',
    title: '审计实施方案',
    updateTime: Date.now() - 1000 * 60 * 60 * 2,
    messages: [] as any[],
  },
])

// 当前消息
const currentMessages = ref([
  {
    type: 'ai',
    content:
      '您好！我是智能审计文书生成助手。请先选择项目和文书类型，然后告诉我您需要生成什么样的审计文书，我会根据相关法规和模板为您生成专业的文书内容。',
    time: Date.now(),
  },
])

// 知识库数据
const knowledgeBase = ref({
  regulations: [
    { id: '1', name: '审计法' },
    { id: '2', name: '国家审计准则' },
    { id: '3', name: '土地管理法' },
    { id: '4', name: '森林法' },
    { id: '5', name: '矿产资源法' },
    { id: '6', name: '水法' },
  ],
  templates: [
    { id: '7', name: '审计通知书模板' },
    { id: '8', name: '审计实施方案模板' },
    { id: '9', name: '审计报告模板' },
    { id: '10', name: '审计整改通知书模板' },
  ],
})

const selectedKnowledge = ref<string[]>([])

// 提示词模板
const promptTemplates = ref([
  {
    id: '1',
    title: '审计通知书生成',
    content:
      '请根据以下信息生成一份审计通知书：被审计单位、审计内容、审计时间、审计组成员等基本信息，要求格式规范、内容完整。',
  },
  {
    id: '2',
    title: '审计实施方案',
    content:
      '请生成一份详细的审计实施方案，包括审计目标、审计范围、审计程序、时间安排、人员分工等内容。',
  },
  {
    id: '3',
    title: '审计报告撰写',
    content:
      '请根据审计发现的问题和证据，撰写一份完整的审计报告，包括审计概况、审计发现、审计建议等部分。',
  },
  {
    id: '4',
    title: '法规条文引用',
    content: '请在文书中恰当引用相关法规条文，确保审计依据充分、引用准确。',
  },
])

// 提交表单数据
const submitForm = reactive({
  title: '',
  phase: '',
  remark: '',
})

// 方法
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const handleProjectChange = (projectId: string) => {
  console.log('项目切换:', projectId)
  // TODO: 实际项目中这里会调用接口获取项目相关信息
}

const handleNewChat = () => {
  const newChatId = Date.now().toString()
  chatHistory.value.unshift({
    id: newChatId,
    title: '新对话',
    updateTime: Date.now(),
    messages: [] as any[],
  })
  currentChatId.value = newChatId
  currentMessages.value = [
    {
      type: 'ai',
      content: '您好！我是智能审计文书生成助手。请告诉我您需要生成什么类型的审计文书。',
      time: Date.now(),
    },
  ]
}

const handleSelectChat = (chatId: string) => {
  currentChatId.value = chatId
  const chat = chatHistory.value.find((c) => c.id === chatId)
  if (chat) {
    currentMessages.value =
      chat.messages.length > 0
        ? chat.messages
        : [
            {
              type: 'ai',
              content: '您好！我是智能审计文书生成助手。请告诉我您需要生成什么类型的审计文书。',
              time: Date.now(),
            },
          ]
  }
}

const handleDeleteChat = (chatId: string) => {
  const index = chatHistory.value.findIndex((c) => c.id === chatId)
  if (index > -1) {
    chatHistory.value.splice(index, 1)
    if (currentChatId.value === chatId && chatHistory.value.length > 0) {
      handleSelectChat(chatHistory.value[0].id)
    } else if (chatHistory.value.length === 0) {
      handleNewChat()
    }
  }
}

const handleSendMessage = () => {
  if (!inputMessage.value.trim()) return

  // 添加用户消息
  const userMessage = {
    type: 'user' as const,
    content: inputMessage.value,
    time: Date.now(),
  }
  currentMessages.value.push(userMessage)

  // 清空输入
  const messageText = inputMessage.value
  inputMessage.value = ''

  // 显示打字指示器
  isTyping.value = true

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // 模拟AI回复
  setTimeout(() => {
    isTyping.value = false
    const aiResponse = generateAIResponse(messageText)
    currentMessages.value.push({
      type: 'ai',
      content: aiResponse,
      time: Date.now(),
    })

    // 更新聊天历史
    updateChatHistory()

    nextTick(() => {
      scrollToBottom()
    })
  }, 2000)
}

const generateAIResponse = (userInput: string): string => {
  // 简单的模拟AI响应逻辑
  if (userInput.includes('通知书')) {
    return `
      <h4>审计通知书</h4>
      <p><strong>致：[被审计单位名称]</strong></p>
      <p>根据《中华人民共和国审计法》和相关法规，我们将对贵单位进行专项审计。现将有关事项通知如下：</p>
      <p><strong>一、审计事项</strong></p>
      <p>对贵单位2023年度土地资源开发利用情况进行审计监督。</p>
      <p><strong>二、审计时间</strong></p>
      <p>自${new Date().toLocaleDateString()}起至${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}止。</p>
      <p><strong>三、审计组成员</strong></p>
      <p>审计组长：[姓名]<br>审计组成员：[姓名列表]</p>
      <p><strong>四、配合要求</strong></p>
      <p>请贵单位积极配合审计工作，提供相关资料和说明。</p>
      <p style="text-align: right; margin-top: 20px;">
        [审计机关名称]<br>
        ${new Date().toLocaleDateString()}
      </p>
    `
  } else if (userInput.includes('方案') || userInput.includes('计划')) {
    return `
      <h4>审计实施方案</h4>
      <p><strong>一、审计目标</strong></p>
      <p>通过对土地资源开发利用情况的审计，检查相关政策执行情况，发现存在的问题，提出改进建议。</p>
      <p><strong>二、审计范围</strong></p>
      <p>2023年1月1日至2023年12月31日期间的土地资源开发利用活动。</p>
      <p><strong>三、审计重点</strong></p>
      <p>1. 土地使用权出让程序合规性<br>
         2. 土地开发利用效率<br>
         3. 相关收入管理情况<br>
         4. 环境保护措施落实情况</p>
      <p><strong>四、审计程序</strong></p>
      <p>1. 了解基本情况<br>
         2. 查阅相关文件资料<br>
         3. 实地查看项目现场<br>
         4. 询问相关人员<br>
         5. 分析评价形成结论</p>
      <p><strong>五、时间安排</strong></p>
      <p>总计30个工作日，分为准备、实施、报告三个阶段。</p>
    `
  } else {
    return '感谢您的提问。请您提供更具体的需求，比如需要生成什么类型的审计文书、涉及哪个领域等，我会为您生成更准确的内容。您也可以选择上方的提示词模板来快速开始。'
  }
}

const updateChatHistory = () => {
  if (currentChatId.value) {
    const chat = chatHistory.value.find((c) => c.id === currentChatId.value)
    if (chat) {
      chat.messages = [...currentMessages.value]
      chat.updateTime = Date.now()
      // 更新标题为第一条用户消息的摘要
      const firstUserMessage = currentMessages.value.find((m) => m.type === 'user')
      if (firstUserMessage) {
        chat.title =
          firstUserMessage.content.substring(0, 20) +
          (firstUserMessage.content.length > 20 ? '...' : '')
      }
    }
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleRefineMessage = (messageIndex: number) => {
  ElMessage.info('润色功能开发中...')
  // TODO: 实现消息润色功能
}

const handleSubmitDocument = (content: string) => {
  // 清理HTML标签，提取纯文本用于标题
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  const textContent = tempDiv.textContent || tempDiv.innerText || ''

  submitForm.title = textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '')
  submitForm.phase = selectedPhase.value
  submitForm.remark = ''

  showSubmitModal.value = true
  submitStatus.value = 'form'
}

const confirmSubmitDocument = () => {
  if (!submitForm.title.trim()) {
    ElMessage.warning('请输入文书标题')
    return
  }

  submitStatus.value = 'loading'

  // 模拟提交过程
  setTimeout(() => {
    submitStatus.value = 'success'
    ElMessage.success('文书提交成功')

    // TODO: 这里实际项目中会调用提交接口
    console.log('提交文书:', submitForm)
  }, 2000)
}

const toggleKnowledge = (id: string) => {
  const index = selectedKnowledge.value.indexOf(id)
  if (index > -1) {
    selectedKnowledge.value.splice(index, 1)
  } else {
    selectedKnowledge.value.push(id)
  }
}

const confirmKnowledgeSelection = () => {
  showKnowledgeModal.value = false
  if (selectedKnowledge.value.length > 0) {
    ElMessage.success(`已选择 ${selectedKnowledge.value.length} 个知识库`)
  }
}

const selectPromptTemplate = (template: any) => {
  inputMessage.value = template.content
  showPromptModal.value = false
  ElMessage.success('已应用提示词模板')
}

const handleFileUpload = () => {
  ElMessage.info('文件上传功能开发中...')
  // TODO: 实现文件上传功能
}

// 初始化
onMounted(() => {
  // 默认选择第一个聊天
  if (chatHistory.value.length > 0) {
    handleSelectChat(chatHistory.value[0].id)
  } else {
    handleNewChat()
  }
})
</script>

<style scoped>
.audit-text-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 项目选择区域 */
.project-selection {
  background: #fff;
  padding: 12px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.selection-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.selection-dropdown {
  min-width: 180px;
}

/* 聊天区域 */
.chat-container {
  flex: 1;
  display: flex;
  background: #f5f5f5;
  height: calc(100% - 60px);
}

/* 历史对话侧边栏 */
.history-sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.history-sidebar.collapsed {
  width: 0;
  overflow: hidden;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.toggle-history {
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s ease;
}

.toggle-history:hover {
  background: #f0f0f0;
  color: #1890ff;
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.new-chat-btn {
  margin: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-item {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item:hover {
  background: #f0f0f0;
  border-left-color: #1890ff;
}

.history-item.active {
  background: #e6f7ff;
  border-left-color: #1890ff;
  color: #1890ff;
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-title {
  font-weight: 500;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item-time {
  font-size: 11px;
  color: #999;
}

.delete-chat-btn {
  padding: 4px;
  border-radius: 4px;
  color: #999;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.history-item:hover .delete-chat-btn {
  opacity: 1;
}

.delete-chat-btn:hover {
  background: #ff4d4f;
  color: white;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: calc(100% - 32px);
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #52c41a;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #52c41a;
  border-radius: 50%;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
  height: calc(100% - 120px);
}

.message {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.message-avatar.ai {
  background: #f0f0f0;
  color: #666;
}

.message-avatar.user {
  background: #1890ff;
  color: white;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
}

.message.ai .message-content {
  background: #fff;
  border: 1px solid #e0e0e0;
  color: #333;
}

.message.user .message-content {
  background: #1890ff;
  color: white;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.message-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0.7;
}

.refine-btn,
.submit-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  transition: all 0.2s;
  height: 28px;
}

.refine-btn:hover,
.submit-btn:hover {
  opacity: 1;
  background: #fff;
  border-color: #1890ff;
  color: #1890ff;
}

.ai-refine {
  background: rgba(24, 144, 255, 0.1);
  border-color: rgba(24, 144, 255, 0.3);
  color: #1890ff;
}

.submit-btn {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.3);
  color: #52c41a;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
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

/* 输入区域 */
.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  resize: none;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 知识库选择 */
.knowledge-section {
  margin-bottom: 20px;
}

.knowledge-section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.knowledge-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.knowledge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-item:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.knowledge-item.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.knowledge-name {
  font-size: 13px;
  color: #333;
}

/* 提示词模板 */
.prompt-templates {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.prompt-template {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.prompt-template:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.prompt-template-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.prompt-template-content {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 提交表单 */
.submit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* 提交状态 */
.submission-status {
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.success-icon {
  background: #f6ffed;
  color: #52c41a;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.status-title {
  font-size: 18px;
  font-weight: 500;
}

.status-description {
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-sidebar {
    width: 200px;
  }

  .project-selection {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .selection-item {
    width: 100%;
  }

  .selection-dropdown {
    min-width: auto;
    width: 100%;
  }
}
</style>

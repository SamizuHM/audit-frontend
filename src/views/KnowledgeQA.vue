<template>
  <div class="knowledge-qa-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">知识问答</h2>
        <p class="page-description">基于知识库的智能问答系统</p>
      </div>
    </div>

    <div class="qa-main">
      <el-row :gutter="24">
        <!-- 问答区域 -->
        <el-col :span="16">
          <el-card shadow="never" class="chat-card">
            <template #header>
              <div class="chat-header">
                <span>智能问答助手</span>
                <el-button
                  type="text"
                  size="small"
                  @click="handleClearChat"
                >
                  <el-icon><Delete /></el-icon>
                  清空对话
                </el-button>
              </div>
            </template>

            <!-- 对话列表 -->
            <div class="chat-messages" ref="chatMessagesRef">
              <div
                v-for="(message, index) in chatMessages"
                :key="index"
                class="message-item"
                :class="message.role"
              >
                <div class="message-avatar">
                  <el-avatar
                    :size="32"
                    :src="message.role === 'user' ? userAvatar : assistantAvatar"
                  >
                    <el-icon v-if="message.role === 'user'">
                      <User />
                    </el-icon>
                    <el-icon v-else>
                      <ChatRound />
                    </el-icon>
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-bubble">
                    <p v-if="message.role === 'assistant' && message.loading" class="loading-text">
                      正在思考中...
                    </p>
                    <div v-else v-html="formatMessage(message.content)"></div>
                  </div>
                  <div class="message-time">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>
              </div>

              <div v-if="chatMessages.length === 0" class="empty-chat">
                <el-empty description="开始你的第一个问题吧！" />
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="chat-input">
              <el-input
                v-model="currentMessage"
                type="textarea"
                :rows="3"
                placeholder="请输入您的问题..."
                resize="none"
                @keydown.enter.ctrl="handleSendMessage"
                @keydown.enter.exact.prevent="handleSendMessage"
              />
              <div class="input-actions">
                <span class="input-tip">按 Enter 发送，Ctrl+Enter 换行</span>
                <el-button
                  type="primary"
                  :loading="isThinking"
                  :disabled="!currentMessage.trim()"
                  @click="handleSendMessage"
                >
                  {{ isThinking ? '思考中...' : '发送' }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 侧边栏 -->
        <el-col :span="8">
          <!-- 快速问题 -->
          <el-card shadow="never" class="quick-questions-card">
            <template #header>
              <span>快速问题</span>
            </template>
            <div class="quick-questions">
              <el-button
                v-for="question in quickQuestions"
                :key="question"
                type="text"
                size="small"
                class="quick-question-btn"
                @click="handleQuickQuestion(question)"
              >
                {{ question }}
              </el-button>
            </div>
          </el-card>

          <!-- 相关知识 -->
          <el-card shadow="never" class="related-knowledge-card" style="margin-top: 16px">
            <template #header>
              <span>相关知识</span>
            </template>
            <div class="related-knowledge">
              <div
                v-for="knowledge in relatedKnowledge"
                :key="knowledge.id"
                class="knowledge-item"
                @click="handleKnowledgeClick(knowledge)"
              >
                <div class="knowledge-title">{{ knowledge.title }}</div>
                <div class="knowledge-type">
                  <el-tag size="small" :type="getKnowledgeTagType(knowledge.type)">
                    {{ getKnowledgeTypeText(knowledge.type) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, User, ChatRound } from '@element-plus/icons-vue'
import { useKnowledgeStore } from '@/stores/knowledge'
import type { KnowledgeItem } from '@/services/api'

const knowledgeStore = useKnowledgeStore()

// 聊天消息引用
const chatMessagesRef = ref<HTMLElement>()

// 用户头像
const userAvatar = ref('')
const assistantAvatar = ref('')

// 消息类型
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  loading?: boolean
}

// 聊天消息
const chatMessages = ref<ChatMessage[]>([])

// 当前输入消息
const currentMessage = ref('')

// 是否正在思考
const isThinking = ref(false)

// 快速问题
const quickQuestions = ref([
  '土地使用权出让的法律程序是什么？',
  '矿产资源开发需要什么审批手续？',
  '环境影响评价的主要内容包括哪些？',
  '土地征收补偿标准如何确定？',
  '自然资源审计的重点领域有哪些？'
])

// 相关知识
const relatedKnowledge = ref<KnowledgeItem[]>([])

// 获取知识类型标签类型
const getKnowledgeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    regulation: 'danger',
    case: 'success',
    template: 'warning',
    guide: 'info'
  }
  return typeMap[type] || ''
}

// 获取知识类型文本
const getKnowledgeTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    regulation: '法规',
    case: '案例',
    template: '模板',
    guide: '指南'
  }
  return typeMap[type] || type
}

// 格式化消息内容
const formatMessage = (content: string) => {
  // 简单的 Markdown 格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 发送消息
const handleSendMessage = async () => {
  if (!currentMessage.value.trim() || isThinking.value) return

  const userMessage = currentMessage.value.trim()
  currentMessage.value = ''

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })

  // 添加助手思考状态
  chatMessages.value.push({
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    loading: true
  })

  scrollToBottom()
  isThinking.value = true

  try {
    // TODO: 调用真实的AI问答接口
    // const response = await qaApi.askQuestion(userMessage)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 移除思考状态消息
    chatMessages.value.pop()

    // 生成模拟回答
    const answer = generateMockAnswer(userMessage)

    // 添加助手回答
    chatMessages.value.push({
      role: 'assistant',
      content: answer,
      timestamp: new Date()
    })

    // 更新相关知识
    updateRelatedKnowledge(userMessage)

  } catch (error) {
    // 移除思考状态消息
    chatMessages.value.pop()

    // 添加错误消息
    chatMessages.value.push({
      role: 'assistant',
      content: '抱歉，我现在无法回答您的问题，请稍后再试。',
      timestamp: new Date()
    })

    ElMessage.error('问答服务暂时不可用')
  } finally {
    isThinking.value = false
    scrollToBottom()
  }
}

// 生成模拟回答
const generateMockAnswer = (question: string) => {
  const answers = [
    '根据相关法律法规，土地使用权出让需要经过以下程序：\n\n1. **土地利用总体规划** - 确认土地用途符合规划要求\n2. **土地出让方案** - 制定详细的出让方案\n3. **公告程序** - 进行公开公告\n4. **竞价程序** - 组织竞价或拍卖\n5. **签订合同** - 与中标方签订出让合同\n\n详细信息请参考《土地管理法》相关条款。',

    '矿产资源开发的审批手续主要包括：\n\n1. **勘查许可证** - 申请矿产资源勘查许可\n2. **开采许可证** - 申请矿产资源开采许可\n3. **环评批复** - 通过环境影响评价\n4. **安全评价** - 完成安全生产评价\n5. **土地使用权** - 取得矿区土地使用权\n\n建议您详细了解《矿产资源法》的相关规定。',

    '环境影响评价的主要内容包括：\n\n1. **环境现状调查** - 分析项目所在地环境质量现状\n2. **环境影响预测** - 预测项目对环境的影响程度\n3. **环境保护措施** - 提出环境保护和污染防治措施\n4. **环境风险评价** - 评估环境风险并提出防范措施\n5. **公众参与** - 征求公众意见和建议\n\n详细要求请参考《环境影响评价法》。'
  ]

  // 根据问题关键词返回相应答案
  if (question.includes('土地') || question.includes('出让')) {
    return answers[0]
  } else if (question.includes('矿产') || question.includes('开发')) {
    return answers[1]
  } else if (question.includes('环境') || question.includes('评价')) {
    return answers[2]
  } else {
    return `感谢您的问题："${question}"。\n\n我正在基于知识库为您查找相关信息。建议您查看右侧的相关知识条目，或者尝试更具体的问题。\n\n如果您需要更详细的信息，请参考我们的知识库管理系统。`
  }
}

// 更新相关知识
const updateRelatedKnowledge = (question: string) => {
  // 根据问题关键词筛选相关知识
  const keywords = ['土地', '矿产', '环境', '审计']
  const matchedKnowledge = knowledgeStore.knowledgeList.filter(knowledge => {
    return keywords.some(keyword =>
      question.includes(keyword) &&
      (knowledge.title.includes(keyword) || knowledge.tags.includes(keyword))
    )
  })

  relatedKnowledge.value = matchedKnowledge.slice(0, 5)
}

// 快速问题点击
const handleQuickQuestion = (question: string) => {
  currentMessage.value = question
  handleSendMessage()
}

// 知识点击
const handleKnowledgeClick = (knowledge: KnowledgeItem) => {
  const question = `请详细介绍一下：${knowledge.title}`
  currentMessage.value = question
  handleSendMessage()
}

// 清空对话
const handleClearChat = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有对话记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    chatMessages.value = []
    ElMessage.success('对话记录已清空')
  } catch (error) {
    // 用户取消操作
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 确保知识库数据已加载
  if (knowledgeStore.knowledgeList.length === 0) {
    await knowledgeStore.fetchKnowledgeList()
  }

  // 初始化相关知识
  relatedKnowledge.value = knowledgeStore.knowledgeList.slice(0, 5)
})
</script>

<style scoped>
.knowledge-qa-container {
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
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  max-height: 400px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-item.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 12px 16px;
  word-wrap: break-word;
  line-height: 1.6;
}

.message-item.user .message-bubble {
  background: #409eff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.message-item.user .message-time {
  text-align: right;
}

.loading-text {
  margin: 0;
  font-style: italic;
  color: #666;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.chat-input {
  margin-top: 16px;
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-tip {
  font-size: 12px;
  color: #999;
}

.quick-questions-card,
.related-knowledge-card {
  border-radius: 8px;
}

.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-question-btn {
  text-align: left;
  height: auto;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.quick-question-btn:hover {
  background: #f0f2f5;
  border-color: #409eff;
  color: #409eff;
}

.related-knowledge {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}

.knowledge-item:hover {
  background: #f0f2f5;
  border-color: #409eff;
}

.knowledge-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.knowledge-type {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qa-main .el-row {
    flex-direction: column;
  }

  .qa-main .el-col {
    width: 100%;
    margin-bottom: 16px;
  }

  .message-content {
    max-width: 85%;
  }

  .chat-card {
    height: 500px;
  }

  .chat-messages {
    max-height: 300px;
  }
}
</style>

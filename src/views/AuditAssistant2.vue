<template>
  <div class="chat-container">
    <!-- 左侧历史对话区域 -->
    <div class="history-section" :class="{ collapsed: historyCollapsed }">
        <div class="history-header">
          <div class="history-title-wrap">
            <span class="history-title">历史对话</span>
            <el-button
              type="text"
              class="collapse-btn"
              @click="toggleHistory"
              circle
              size="small"
            >
              <el-icon>
                <component :is="historyCollapsed ? 'Expand' : 'Fold'" />
              </el-icon>
            </el-button>
          </div>
          <el-button type="primary" class="new-chat-btn" @click="createNewChat">
            <el-icon><Plus /></el-icon>
            <span>新建对话</span>
          </el-button>
        
      </div>

      <div class="chat-list">
        <div v-for="chat in chatHistory" 
          :key="chat.id" 
          class="chat-item"
          :class="{ active: currentChatId === chat.id }"
          @click="switchChat(chat.id)">
          <span class="chat-title">{{ chat.title }}</span>
          <span class="chat-date" v-show="!isCollapsed">{{ chat.date }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧对话内容区域 -->
    <div class="chat-content">
      <div class="chat-header">
        <div class="assistant-status">
          <el-button
              v-if="historyCollapsed"
              type="text"
              :icon="Expand"
              @click="toggleHistory"
              circle
              size="small"
            />
          <span>AI法律法规问答助手</span>
          <el-tag size="small" type="success">在线</el-tag>
        </div>
      </div>

      <div class="message-area" ref="messageArea">
        <!-- AI 说明信息 -->
        <div class="ai-intro">
          <div class="intro-text">
            <p>我提供的是法规解释和建议，不构成正式法律意见</p>
            <p>具体法律事务请咨询专业律师</p>
            <p>法规可能会更新，请以最新版本为准</p>
          </div>

          <div class="quick-questions">
            <h4>
              <el-icon><QuestionFilled /></el-icon>
              常见问题示例（点击快速输入）
            </h4>
            <div class="question-list">
              <div v-for="question in commonQuestions" 
                :key="question"
                class="question-item"
                @click="selectQuestion(question)">
                {{ question }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-wrapper">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 3 }"
            placeholder="请输入您的问题..."
            @keyup.enter.exact="sendMessage"
            class="message-input"
          />
          <el-button type="primary" @click="sendMessage" class="send-btn">
            <el-icon><Position /></el-icon>&nbsp;
            发送
          </el-button>
          <el-button @click="downloadChat" class="download-btn">
            <el-icon><Download /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Position, Download, QuestionFilled, Expand, Fold } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 常见问题列表
const commonQuestions = [
  '土地使用权转让需要注意哪些法律问题？',
  '矿业权申请的审批程序是什么？',
  '自然资源违法行为的处罚标准如何？',
  '环境影响评价的法律要求有哪些？',
  '国有土地出让合同的主要条款包括什么？'
]

const toggleHistory = () => {
  historyCollapsed.value = !historyCollapsed.value
}

// 聊天记录
const chatHistory = reactive([
  {
    id: 'new',
    title: '新对话',
    date: '2025-08-06'
  },
  {
    id: '1',
    title: '关于土地资源管理法的咨询',
    date: '2023-10-15'
  },
  {
    id: '2',
    title: '水资源保护案例解读',
    date: '2023-10-12'
  },
  {
    id: '3', 
    title: '矿产资源法相关问题',
    date: '2023-10-10'
  }
])

// 响应式数据
const currentChatId = ref('new')
const inputMessage = ref('')
const messageArea = ref<HTMLElement | null>(null)
const historyCollapsed = ref(false)

// 创建新对话
const createNewChat = () => {
  currentChatId.value = 'new'
  // 清空当前消息等操作...
}

// 切换对话
const switchChat = (chatId: string) => {
  currentChatId.value = chatId
  // 加载对应对话记录...
}

// 选择快速问题
const selectQuestion = (question: string) => {
  inputMessage.value = question
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) {
    ElMessage.warning('请输入问题内容')
    return
  }
  // TODO: 发送消息逻辑...
}

// 下载对话记录
const downloadChat = () => {
  // TODO: 下载对话记录逻辑...
}
</script>

<style scoped>
/* 整体容器优化 */
.chat-container {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

/* 左侧历史对话区域优化 */
.history-section {
  width: 300px;
  background: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.history-section.collapsed {
  width: 0;
  overflow: hidden;
}

.history-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e6e6e6;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.history-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.new-chat-btn {
  width: 100%;
  height: 36px;
  font-weight: 500;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chat-item {
  padding: 12px 8px;
  font-size: 14px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-item:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.chat-item.active {
  background: #e6f4ff;
  border-left: 3px solid #1890ff;
}

.chat-title {
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.chat-date {
  font-size: 12px;
  color: #999;
  line-height: 1.2;
}

/* 右侧聊天区域优化 */
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.chat-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.assistant-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.message-area {
  flex: 1;
  padding: 24px;
  background: #f9fafb;
  scroll-behavior: smooth;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* AI介绍区域优化 */
.ai-intro {
  background: linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  width: 100%;
}

.intro-text {
  color: #374151;
  line-height: 1.6;
  font-size: 14px;
}

.intro-text p {
  margin: 5px 0;
  padding-left: 20px;
  position: relative;
}

.intro-text p::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #1890ff;
}

/* 快速问题区域优化 */
.quick-questions h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  font-size: 14px;
  margin: 14px 0;
}

.question-list {
  display: grid;
  gap: 8px;
}

.question-item {
  background: #fff;
  padding: 12px 14px;  /* 减小内边距 */
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  font-size: 14px;  /* 添加问题项字体大小 */
}

.question-item:hover {
  background: #f0f9ff;
  border-color: #bae6fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 输入区域优化 */
.input-area { 
  background: #fff;
  padding: 16px 24px;
  border-top: 1px solid #e6e6e6;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.02);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1200px;
  margin: auto;
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-textarea__inner) {
  resize: none;
  padding: 12px 16px;
  min-height: 44px !important;
  max-height: 120px;
  line-height: 1.6;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.message-input :deep(.el-textarea__inner:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.send-btn, .download-btn {
  height: 44px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
}

/* 自定义滚动条 */
.chat-list::-webkit-scrollbar,
.message-area::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-thumb,
.message-area::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 0px;
}

.chat-list::-webkit-scrollbar-track,
.message-area::-webkit-scrollbar-track {
  background: transparent;
}
</style>
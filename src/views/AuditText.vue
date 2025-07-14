<template>
  <div class="audit-text-container">
    <!-- 项目选择区域 -->
    <div class="project-selection">
      <el-row :gutter="20" align="middle">
        <el-col :span="4">
          <span class="selection-label">当前项目：</span>
        </el-col>
        <el-col :span="8">
          <el-select
            v-model="currentProject"
            placeholder="请选择项目"
            style="width: 100%"
            @change="handleProjectChange"
          >
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-tag :type="getPhaseTagType(currentProjectInfo?.phase)">
            {{ currentProjectInfo?.phase }}
          </el-tag>
        </el-col>
      </el-row>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-container">
      <!-- 历史对话侧边栏 -->
      <div class="history-sidebar" :class="{ collapsed: historyCollapsed }">
        <div class="history-header">
          <span class="history-title">历史对话</span>
          <el-button
            type="text"
            :icon="historyCollapsed ? 'Expand' : 'Fold'"
            @click="toggleHistory"
            circle
            size="small"
          />
        </div>

        <el-button type="primary" :icon="Plus" class="new-chat-btn" @click="newChat" plain>
          新建对话
        </el-button>

        <div class="history-content">
          <div
            v-for="chat in currentConversations"
            :key="chat.id"
            class="history-item"
            :class="{ active: chat.id === currentChatId }"
            @click="switchToChat(chat.id)"
          >
            <div class="history-item-content">
              <div class="history-item-title">{{ chat.title }}</div>
              <div class="history-item-time">{{ chat.time }}</div>
            </div>
            <el-button
              type="text"
              :icon="Delete"
              size="small"
              class="delete-chat-btn"
              @click.stop="deleteChat(chat.id)"
            />
          </div>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="chat-main">
        <div class="chat-header">
          <div class="header-left">
            <el-button
              v-if="historyCollapsed"
              type="text"
              :icon="Expand"
              @click="toggleHistory"
              circle
              size="small"
            />
            <span class="chat-title">{{ chatTitle }}</span>
          </div>
          <div class="chat-status">
            <el-tag type="success" size="small">
              <el-icon><SuccessFilled /></el-icon>
              在线
            </el-tag>
          </div>
        </div>

        <div class="chat-messages" ref="chatMessages">
          <!-- 提示模板 -->
          <div v-if="messages.length === 0" class="prompt-template">
            <div class="prompt-template-header">
              <el-icon size="24" color="#0284c7"><Document /></el-icon>
              <div class="prompt-template-title">审计文书生成助手使用指南</div>
            </div>
            <div class="prompt-template-content">
              您好！我是智能审计文书生成助手，专门帮助您高效生成各类审计文书。 **我可以帮助您：** •
              自动生成审计工作方案 • 创建审计实施方案 • 生成审计取证单 • 编制审计工作底稿 •
              撰写审计意见书 • 生成综合审计报告 **使用建议：** • 请明确说明您需要生成的文书类型 •
              提供具体要求和背景信息 • 对于复杂文书，可分段描述需求 • 上传相关文件可提高生成准确性
            </div>
            <div class="example-questions">
              <div class="example-questions-title">
                <el-icon><QuestionFilled /></el-icon>
                常见问题示例（点击快速输入）
              </div>
              <div class="example-questions-grid">
                <div
                  v-for="question in exampleQuestions"
                  :key="question.type"
                  class="example-question-card"
                  @click="handlePromptClick(question.type)"
                >
                  <div class="question-icon">
                    <el-icon size="20" :class="getQuestionIcon(question.type)">
                      <component :is="getQuestionIcon(question.type)" />
                    </el-icon>
                  </div>
                  <div class="question-text">{{ question.text }}</div>
                  <div class="question-type">{{ question.type }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-else>
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message"
              :class="message.type"
            >
              <el-avatar
                :size="32"
                :class="message.type"
                :icon="message.type === 'user' ? 'User' : 'ChatDotRound'"
              />
              <div class="message-content-wrapper">
                <div v-if="message.docType && message.type === 'ai'" class="doc-type-tag">
                  {{ message.docType }}
                </div>
                <div class="message-content">
                  <div v-html="formatMessageContent(message.content)"></div>

                  <!-- 消息操作按钮 -->
                  <div v-if="message.type === 'ai' && message.docType" class="message-actions">
                    <el-button
                      v-if="message.docType === '审计工作底稿'"
                      type="success"
                      size="small"
                      :icon="Upload"
                      @click="submitDocument(index)"
                    >
                      提交
                    </el-button>

                    <el-dropdown @command="(command) => refineDocument(index, command)">
                      <el-button type="primary" size="small" :icon="Edit"> 润色 </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="formal">正式严谨</el-dropdown-item>
                          <el-dropdown-item command="concise">简洁精炼</el-dropdown-item>
                          <el-dropdown-item command="professional">专业术语</el-dropdown-item>
                          <el-dropdown-item command="fluent">流畅自然</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="input-toolbar">
            <el-button :icon="Paperclip" size="small" @click="uploadFile"> 上传文件 </el-button>
            <el-button :icon="Download" size="small" @click="saveResult"> 保存结果 </el-button>
            <el-button :icon="FolderOpened" size="small" @click="viewSavedResults">
              历史结果
            </el-button>
          </div>

          <div class="input-container">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 4 }"
              placeholder="请输入您要生成的文书内容描述..."
              @keydown.enter.prevent="sendMessage"
            />
            <el-button
              type="primary"
              :icon="Promotion"
              :disabled="!inputMessage.trim()"
              @click="sendMessage"
            >
              生成文书
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史保存结果模态框 -->
    <el-dialog v-model="savedResultsVisible" title="历史保存结果" width="800px">
      <div class="filter-bar">
        <span class="filter-label">筛选类别：</span>
        <el-select
          v-model="categoryFilter"
          placeholder="全部类别"
          style="width: 200px"
          @change="filterSavedResults"
        >
          <el-option label="全部类别" value="all" />
          <el-option v-for="type in documentTypes" :key="type" :label="type" :value="type" />
        </el-select>
      </div>

      <div class="file-list">
        <div v-for="doc in filteredDocuments" :key="doc.id" class="file-item">
          <div class="file-info">
            <el-icon size="32" color="#1890ff"><Document /></el-icon>
            <div class="file-details">
              <div class="file-name">{{ doc.name }}</div>
              <div class="file-meta">
                <el-tag size="small">{{ doc.type }}</el-tag>
                {{ doc.size }} • {{ doc.date }} • {{ doc.project }}
              </div>
            </div>
          </div>
          <div class="file-actions">
            <el-button size="small" @click="previewFile(doc)">预览</el-button>
            <el-button size="small" type="primary" @click="downloadFile(doc)">下载</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 提交模态框 -->
    <el-dialog v-model="submitModalVisible" :title="`提交${submittingDocument}`" width="500px">
      <el-form :model="submitForm" label-width="100px">
        <el-form-item label="文档类型">
          <el-input v-model="submittingDocument" readonly />
        </el-form-item>
        <el-form-item label="提交说明">
          <el-input
            v-model="submitForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请填写提交说明（可选）"
          />
        </el-form-item>
        <el-form-item label="提交给主审人">
          <el-select v-model="submitForm.principal" style="width: 100%">
            <el-option
              v-for="principal in principals"
              :key="principal"
              :label="principal"
              :value="principal"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="submitModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubmit">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- 文档预览模态框 -->
    <el-dialog v-model="previewModalVisible" :title="previewDoc?.name" width="800px">
      <div class="draft-preview">
        <div class="draft-header">
          <div class="draft-title">{{ previewDoc?.name }}</div>
          <div class="draft-meta">类型: {{ previewDoc?.type }}</div>
          <div class="draft-meta">保存时间: {{ previewDoc?.date }}</div>
          <div class="draft-meta">所属项目: {{ previewDoc?.project }}</div>
        </div>
        <div class="draft-content">
          <pre>{{ previewDoc?.content }}</pre>
        </div>
      </div>

      <template #footer>
        <el-button @click="previewModalVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadFile(previewDoc)">下载文档</el-button>
      </template>
    </el-dialog>

    <!-- 文书选择模态框 -->
    <el-dialog
      v-model="documentSelectVisible"
      :title="`选择相关${currentDependencyType}`"
      width="700px"
      class="document-select-dialog"
    >
      <div class="document-selector">
        <div class="selector-header">
          <div class="selector-title">
            <el-icon size="18" color="#0284c7"><Files /></el-icon>
            请选择相关的{{ currentDependencyType }}{{ allowMultipleSelection ? '（可多选）' : '' }}
          </div>
          <div v-if="allowMultipleSelection" class="selector-actions">
            <el-button size="small" type="primary" plain @click="selectAllDocuments"
              >全选</el-button
            >
            <el-button size="small" @click="deselectAllDocuments">清空</el-button>
          </div>
        </div>

        <div class="document-list">
          <div v-if="availableDocuments.length === 0" class="empty-state">
            <el-icon size="48" color="#e0e7ff"><Document /></el-icon>
            <p>暂无相关{{ currentDependencyType }}文档</p>
            <p class="empty-hint">请先生成对应的{{ currentDependencyType }}文档</p>
          </div>

          <el-checkbox-group
            v-else-if="allowMultipleSelection"
            v-model="selectedDocuments"
            class="document-checkbox-group"
          >
            <el-checkbox
              v-for="doc in availableDocuments"
              :key="doc.id"
              :label="doc.id"
              class="document-checkbox"
            >
              <div class="document-item-enhanced">
                <div class="document-icon">
                  <el-icon size="24" :color="getDocumentColor(doc.type)">
                    <component :is="getDocumentIcon(doc.type)" />
                  </el-icon>
                </div>
                <div class="document-content">
                  <div class="document-title">{{ doc.name }}</div>
                  <div class="document-meta">
                    <el-tag size="small" :type="getDocumentTagType(doc.type)">{{
                      doc.type
                    }}</el-tag>
                    <span class="meta-text">{{ doc.size }} • {{ doc.date }}</span>
                  </div>
                </div>
                <div class="document-status">
                  <el-icon size="16" color="#52c41a"><CircleCheck /></el-icon>
                </div>
              </div>
            </el-checkbox>
          </el-checkbox-group>

          <el-radio-group v-else v-model="selectedDocument" class="document-radio-group">
            <el-radio
              v-for="doc in availableDocuments"
              :key="doc.id"
              :label="doc.id"
              class="document-radio"
            >
              <div class="document-item-enhanced">
                <div class="document-icon">
                  <el-icon size="24" :color="getDocumentColor(doc.type)">
                    <component :is="getDocumentIcon(doc.type)" />
                  </el-icon>
                </div>
                <div class="document-content">
                  <div class="document-title">{{ doc.name }}</div>
                  <div class="document-meta">
                    <el-tag size="small" :type="getDocumentTagType(doc.type)">{{
                      doc.type
                    }}</el-tag>
                    <span class="meta-text">{{ doc.size }} • {{ doc.date }}</span>
                  </div>
                </div>
                <div class="document-status">
                  <el-icon size="16" color="#52c41a"><CircleCheck /></el-icon>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="documentSelectVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmDocumentSelection"
            :disabled="!hasSelectedDocuments"
          >
            确认选择
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

  <!-- 隐藏的文件输入 -->
  <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileUpload" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  Plus,
  Expand,
  Fold,
  Delete,
  Paperclip,
  Download,
  FolderOpened,
  Promotion,
  Edit,
  Upload,
  Document,
  QuestionFilled,
  SuccessFilled,
  ChatDotRound,
  User,
  Files,
  DataLine,
  Tickets,
  MessageBox,
  Collection,
  Memo,
  CircleCheck,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 类型定义
interface Project {
  id: string
  name: string
  phase: string
}

interface Message {
  type: 'user' | 'ai'
  content: string
  time: string
  docType?: string
  refined?: boolean
}

interface Conversation {
  id: number
  title: string
  time: string
  messages: Message[]
}

interface Document {
  id: number
  name: string
  content: string
  type: string
  size: string
  date: string
  project: string
}

// 状态管理
const projects = ref<Project[]>([
  { id: 'forest', name: '2024年度森林资源审计项目', phase: '准备阶段' },
  { id: 'water', name: '2024年度水资源审计项目', phase: '实施阶段' },
  { id: 'mineral', name: '2024年度矿产资源审计项目', phase: '报告阶段' },
  { id: 'ecology', name: '2024年度生态环境保护审计项目', phase: '准备阶段' },
  { id: 'land', name: '2024年度土地资源审计项目', phase: '实施阶段' },
])

const currentProject = ref('forest')
const currentChatId = ref<number | null>(null)
const historyCollapsed = ref(false)
const inputMessage = ref('')
const messages = ref<Message[]>([])

// 对话历史
const conversationsByProject = ref<Record<string, Conversation[]>>({
  forest: [
    {
      id: 1,
      title: '森林资源审计工作方案',
      time: '2024-06-20 14:30',
      messages: [
        {
          type: 'user',
          content: '请帮我生成一份森林资源审计工作方案',
          time: '14:30:10',
        },
        {
          type: 'ai',
          content: '我将为您生成森林资源审计工作方案，包含审计目标、审计范围、审计内容等详细信息。',
          time: '14:30:15',
          docType: '审计工作方案',
        },
      ],
    },
    {
      id: 2,
      title: '森林资源审计实施方案',
      time: '2024-06-22 10:15',
      messages: [
        {
          type: 'user',
          content: '基于已有的工作方案，请生成详细的实施方案',
          time: '10:15:20',
        },
        {
          type: 'ai',
          content:
            '根据您的森林资源审计工作方案，我将制定详细的实施方案，包括具体的审计程序和时间安排。',
          time: '10:15:25',
          docType: '审计实施方案',
        },
      ],
    },
    {
      id: 3,
      title: '森林资源审计取证单',
      time: '2024-06-25 09:45',
      messages: [
        {
          type: 'user',
          content: '请帮我生成森林资源审计取证单',
          time: '09:45:30',
        },
        {
          type: 'ai',
          content: '我将为您生成规范的森林资源审计取证单，包括取证事项、取证方法、发现问题等内容。',
          time: '09:45:35',
          docType: '审计取证单',
        },
      ],
    },
  ],
  water: [
    {
      id: 4,
      title: '水资源审计工作方案',
      time: '2024-06-18 13:45',
      messages: [
        {
          type: 'user',
          content: '请生成水资源审计工作方案',
          time: '13:45:10',
        },
        {
          type: 'ai',
          content: '我将为您制定水资源审计工作方案，重点关注水资源配置、利用效率和保护措施。',
          time: '13:45:15',
          docType: '审计工作方案',
        },
      ],
    },
    {
      id: 5,
      title: '水资源审计实施方案',
      time: '2024-06-20 15:20',
      messages: [
        {
          type: 'user',
          content: '请生成水资源审计的详细实施方案',
          time: '15:20:05',
        },
        {
          type: 'ai',
          content: '基于水资源审计工作方案，我将制定详细的实施方案，包括审计程序和质量控制措施。',
          time: '15:20:10',
          docType: '审计实施方案',
        },
      ],
    },
  ],
  mineral: [
    {
      id: 6,
      title: '矿产资源审计底稿',
      time: '2024-06-17 10:50',
      messages: [
        {
          type: 'user',
          content: '请生成矿产资源审计工作底稿',
          time: '10:50:15',
        },
        {
          type: 'ai',
          content: '我将为您生成矿产资源审计工作底稿，汇总审计发现和问题分析。',
          time: '10:50:20',
          docType: '审计底稿',
        },
      ],
    },
    {
      id: 7,
      title: '矿产资源审计意见书',
      time: '2024-06-19 09:15',
      messages: [
        {
          type: 'user',
          content: '请帮我生成矿产资源审计意见书',
          time: '09:15:25',
        },
        {
          type: 'ai',
          content: '基于审计工作底稿，我将为您生成矿产资源审计意见书，包括审计结论和整改建议。',
          time: '09:15:30',
          docType: '审计意见',
        },
      ],
    },
  ],
  ecology: [
    {
      id: 8,
      title: '生态环境保护审计工作方案',
      time: '2024-06-15 14:30',
      messages: [
        {
          type: 'user',
          content: '请生成生态环境保护审计工作方案',
          time: '14:30:45',
        },
        {
          type: 'ai',
          content: '我将为您制定生态环境保护审计工作方案，重点关注环境保护政策执行情况。',
          time: '14:30:50',
          docType: '审计工作方案',
        },
      ],
    },
  ],
  land: [
    {
      id: 9,
      title: '土地资源审计实施方案',
      time: '2024-06-12 11:20',
      messages: [
        {
          type: 'user',
          content: '请生成土地资源审计实施方案',
          time: '11:20:10',
        },
        {
          type: 'ai',
          content: '我将为您制定土地资源审计实施方案，包括土地使用权审查和土地利用效率评估。',
          time: '11:20:15',
          docType: '审计实施方案',
        },
      ],
    },
    {
      id: 10,
      title: '土地资源审计取证单',
      time: '2024-06-14 15:35',
      messages: [
        {
          type: 'user',
          content: '请生成土地资源审计取证单',
          time: '15:35:20',
        },
        {
          type: 'ai',
          content: '我将为您生成土地资源审计取证单，记录土地使用情况的审计证据。',
          time: '15:35:25',
          docType: '审计取证单',
        },
      ],
    },
  ],
})

// 保存的文档
const savedDocuments = ref<Document[]>([
  {
    id: 1,
    name: '森林资源审计工作方案_v1.0',
    content: '森林资源审计工作方案内容详细说明...',
    type: '审计工作方案',
    size: '245KB',
    date: '2024-06-20 14:30',
    project: '森林资源审计',
  },
  {
    id: 2,
    name: '森林资源审计实施方案_v1.2',
    content: '森林资源审计实施方案详细内容...',
    type: '审计实施方案',
    size: '198KB',
    date: '2024-06-22 10:15',
    project: '森林资源审计',
  },
  {
    id: 3,
    name: '森林资源审计取证单_001',
    content: '森林资源审计取证单详细记录...',
    type: '审计取证单',
    size: '156KB',
    date: '2024-06-25 09:45',
    project: '森林资源审计',
  },
  {
    id: 4,
    name: '森林资源审计底稿_第一章',
    content: '森林资源审计底稿第一章内容...',
    type: '审计底稿',
    size: '312KB',
    date: '2024-06-28 16:20',
    project: '森林资源审计',
  },
  {
    id: 5,
    name: '森林资源审计意见书_初稿',
    content: '森林资源审计意见书初稿内容...',
    type: '审计意见',
    size: '289KB',
    date: '2024-07-01 11:30',
    project: '森林资源审计',
  },
  {
    id: 6,
    name: '水资源审计工作方案_v2.0',
    content: '水资源审计工作方案第二版内容...',
    type: '审计工作方案',
    size: '278KB',
    date: '2024-06-18 13:45',
    project: '水资源审计',
  },
  {
    id: 7,
    name: '水资源审计实施方案_v1.1',
    content: '水资源审计实施方案修订版内容...',
    type: '审计实施方案',
    size: '201KB',
    date: '2024-06-20 15:20',
    project: '水资源审计',
  },
  {
    id: 8,
    name: '水资源审计取证单_002',
    content: '水资源审计取证单第二份记录...',
    type: '审计取证单',
    size: '167KB',
    date: '2024-06-23 14:10',
    project: '水资源审计',
  },
  {
    id: 9,
    name: '矿产资源审计底稿_汇总',
    content: '矿产资源审计底稿汇总内容...',
    type: '审计底稿',
    size: '445KB',
    date: '2024-06-17 10:50',
    project: '矿产资源审计',
  },
  {
    id: 10,
    name: '矿产资源审计意见书_终稿',
    content: '矿产资源审计意见书终稿内容...',
    type: '审计意见',
    size: '356KB',
    date: '2024-06-19 09:15',
    project: '矿产资源审计',
  },
  {
    id: 11,
    name: '矿产资源综合审计报告_v1.0',
    content: '矿产资源综合审计报告第一版内容...',
    type: '综合报告',
    size: '567KB',
    date: '2024-06-21 16:45',
    project: '矿产资源审计',
  },
  {
    id: 12,
    name: '生态环境保护审计工作方案_v1.0',
    content: '生态环境保护审计工作方案内容...',
    type: '审计工作方案',
    size: '234KB',
    date: '2024-06-15 14:30',
    project: '生态环境保护审计',
  },
  {
    id: 13,
    name: '土地资源审计实施方案_v1.0',
    content: '土地资源审计实施方案内容...',
    type: '审计实施方案',
    size: '187KB',
    date: '2024-06-12 11:20',
    project: '土地资源审计',
  },
  {
    id: 14,
    name: '土地资源审计取证单_003',
    content: '土地资源审计取证单第三份记录...',
    type: '审计取证单',
    size: '143KB',
    date: '2024-06-14 15:35',
    project: '土地资源审计',
  },
])

const principals = ref([
  '李主审',
  '王主审',
  '赵主审',
  '刘主审',
  '陈主审',
  '张主审',
  '马主审',
  '周主审',
])
const documentTypes = ref([
  '审计工作方案',
  '审计实施方案',
  '审计取证单',
  '审计底稿',
  '审计意见',
  '综合报告',
])

// 模态框状态
const savedResultsVisible = ref(false)
const submitModalVisible = ref(false)
const previewModalVisible = ref(false)
const documentSelectVisible = ref(false)

const categoryFilter = ref('all')
const submittingDocument = ref('')
const submittingIndex = ref(0)

const submitForm = ref({
  notes: '',
  principal: '李主审',
})

const previewDoc = ref<Document | null>(null)

// 文书选择相关
const currentDocumentType = ref('')
const currentDependencyType = ref('')
const allowMultipleSelection = ref(false)
const selectedDocuments = ref<number[]>([])
const selectedDocument = ref<number | null>(null)

// 计算属性
const currentProjectInfo = computed(() => projects.value.find((p) => p.id === currentProject.value))

const currentConversations = computed(
  () => conversationsByProject.value[currentProject.value] || [],
)

const filteredDocuments = computed(() => {
  if (categoryFilter.value === 'all') {
    return savedDocuments.value
  }
  return savedDocuments.value.filter((doc) => doc.type === categoryFilter.value)
})

const availableDocuments = computed(() => {
  const typeMapping: Record<string, string> = {
    工作方案: '审计工作方案',
    实施方案: '审计实施方案',
    取证单: '审计取证单',
    工作底稿: '审计底稿',
    审计意见: '审计意见',
  }

  const targetDocType = typeMapping[currentDependencyType.value]
  const projectName = currentProjectInfo.value?.name.split('年度')[1].split('审计')[0] || ''

  return savedDocuments.value.filter(
    (doc) => doc.type === targetDocType && doc.project.includes(projectName),
  )
})

const hasSelectedDocuments = computed(() => {
  if (allowMultipleSelection.value) {
    return selectedDocuments.value.length > 0
  }
  return selectedDocument.value !== null
})

const chatTitle = computed(() => `${currentProjectInfo.value?.name || ''} - 智能文书生成`)

// 示例问题
const exampleQuestions = ref([
  { type: '工作方案', text: '请帮我生成一份审计工作方案' },
  { type: '实施方案', text: '请生成一份详细的审计实施方案' },
  { type: '取证单', text: '请帮我生成一份审计取证单' },
  { type: '工作底稿', text: '请生成一份审计工作底稿' },
  { type: '审计意见', text: '请帮我生成一份审计意见书' },
  { type: '综合报告', text: '请生成一份综合审计报告' },
])

// 方法
const getQuestionIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    工作方案: Files,
    实施方案: DataLine,
    取证单: Tickets,
    工作底稿: Memo,
    审计意见: MessageBox,
    综合报告: Collection,
  }
  return iconMap[type] || Document
}

const getDocumentIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    审计工作方案: Files,
    审计实施方案: DataLine,
    审计取证单: Tickets,
    审计底稿: Memo,
    审计意见: MessageBox,
    综合报告: Collection,
  }
  return iconMap[type] || Document
}

const getDocumentColor = (type: string) => {
  const colorMap: Record<string, string> = {
    审计工作方案: '#1890ff',
    审计实施方案: '#722ed1',
    审计取证单: '#fa8c16',
    审计底稿: '#52c41a',
    审计意见: '#eb2f96',
    综合报告: '#13c2c2',
  }
  return colorMap[type] || '#666666'
}

const getDocumentTagType = (type: string) => {
  const tagMap: Record<string, string> = {
    审计工作方案: 'primary',
    审计实施方案: 'success',
    审计取证单: 'warning',
    审计底稿: 'info',
    审计意见: 'danger',
    综合报告: 'default',
  }
  return tagMap[type] || 'default'
}

const getPhaseTagType = (phase?: string) => {
  if (!phase) return 'info'
  if (phase.includes('准备')) return 'primary'
  if (phase.includes('实施')) return 'warning'
  if (phase.includes('报告')) return 'success'
  return 'info'
}

const toggleHistory = () => {
  historyCollapsed.value = !historyCollapsed.value
}

const handleProjectChange = () => {
  currentChatId.value = null
  messages.value = []
  renderMessages()
}

const newChat = () => {
  const newChatId =
    Math.max(
      ...Object.values(conversationsByProject.value)
        .flat()
        .map((c) => c.id),
      0,
    ) + 1

  const newChat: Conversation = {
    id: newChatId,
    title: `${currentProjectInfo.value?.name}新对话`,
    time: new Date().toLocaleString(),
    messages: [],
  }

  if (!conversationsByProject.value[currentProject.value]) {
    conversationsByProject.value[currentProject.value] = []
  }

  conversationsByProject.value[currentProject.value].unshift(newChat)
  currentChatId.value = newChatId
  messages.value = []
  renderMessages()
}

const switchToChat = (chatId: number) => {
  const chat = currentConversations.value.find((c) => c.id === chatId)
  if (chat) {
    currentChatId.value = chatId
    messages.value = [...chat.messages]
    renderMessages()
  }
}

const deleteChat = async (chatId: number) => {
  const chat = currentConversations.value.find((c) => c.id === chatId)
  if (!chat) return

  try {
    await ElMessageBox.confirm(`确定要删除对话"${chat.title}"吗？`, '删除确认', { type: 'warning' })

    const index = currentConversations.value.findIndex((c) => c.id === chatId)
    if (index > -1) {
      currentConversations.value.splice(index, 1)
    }

    if (currentChatId.value === chatId) {
      if (currentConversations.value.length > 0) {
        switchToChat(currentConversations.value[0].id)
      } else {
        currentChatId.value = null
        messages.value = []
        renderMessages()
      }
    }

    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const sendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message) return

  if (!currentChatId.value) {
    newChat()
  }

  addMessage('user', message)
  inputMessage.value = ''

  // 模拟AI回复
  setTimeout(() => {
    const docType = determineDocType(message)
    const response = generateAIResponse(message, docType)
    addMessage('ai', response, docType)
  }, 1000)
}

const addMessage = (type: 'user' | 'ai', content: string, docType?: string) => {
  const message: Message = {
    type,
    content,
    time: new Date().toLocaleTimeString(),
    docType,
  }

  messages.value.push(message)
  updateCurrentChat()
  renderMessages()
}

const determineDocType = (userMessage: string) => {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('方案') || lowerMessage.includes('计划')) {
    return '审计工作方案'
  } else if (lowerMessage.includes('底稿') || lowerMessage.includes('记录')) {
    return '审计底稿'
  } else if (lowerMessage.includes('报告') || lowerMessage.includes('总结')) {
    return '综合报告'
  } else if (lowerMessage.includes('通知') || lowerMessage.includes('告知')) {
    return '审计通知书'
  } else if (lowerMessage.includes('意见') || lowerMessage.includes('建议')) {
    return '审计意见'
  }

  return '审计文书'
}

const generateAIResponse = (userMessage: string, docType: string) => {
  const projectName = currentProjectInfo.value?.name || ''

  const templates: Record<string, string> = {
    审计工作方案: `根据您的要求，我为您生成了${projectName}的工作方案：

一、审计目标
1. 评估${projectName}的合规性和有效性
2. 发现存在的问题和风险点
3. 提出改进建议，促进资源合理利用

二、审计范围
1. 审计期间：2024年1月1日至2024年12月31日
2. 审计对象：全市范围内相关单位
3. 审计内容：资源使用、管理流程、资金使用等

三、审计重点
1. 资源利用效率评估
2. 管理制度执行情况
3. 资金使用合规性
4. 环境保护措施落实情况

四、时间安排
1. 准备阶段：2024.07.01-2024.07.15
2. 实施阶段：2024.07.16-2024.09.15
3. 报告阶段：2024.09.16-2024.09.30

五、人员分工
1. 审计组长：张审计员
2. 财务审计组：3人
3. 业务审计组：4人
4. 技术支持组：2人

您需要我进一步调整或补充任何部分吗？`,

    审计实施方案: `根据审计要求，我为您生成了${projectName}的实施方案：

审计实施方案
编号：SZ20240703001

一、审计目标
全面评估森林资源管理情况，发现存在的问题，提出改进建议。

二、审计范围
全市范围内的森林资源管理部门及相关单位。

三、审计内容
1. 森林资源管理制度的建立与执行情况
2. 森林资源保护措施落实情况
3. 森林资源利用效率评估
4. 森林资源相关资金使用情况

四、审计方法
1. 数据分析：利用GIS系统分析森林覆盖变化
2. 实地调查：抽查3个重点林区
3. 文件审查：审查管理制度文件
4. 访谈：与管理人员和护林员进行访谈

五、时间安排
1. 准备阶段（7天）：制定详细审计计划
2. 实施阶段（45天）：开展实地审计工作
3. 报告阶段（10天）：撰写审计报告

六、人员分工
审计组长：张审计员（负责全面协调）
第一小组：李审计员、王审计员（负责制度审查）
第二小组：赵审计员、刘审计员（负责实地调查）
技术支持：陈技术员（负责数据分析）

您需要我进一步调整或补充任何部分吗？`,

    审计底稿: `根据审计结果，我为您生成了${projectName}的审计工作底稿：

审计工作底稿
编号：DG20240703001

审计事项：森林资源管理情况
审计时间：2024年7月3日
审计人员：张审计员

一、审计程序执行情况
1. 审查了森林资源管理制度文件
2. 检查了采伐许可证发放记录
3. 实地查看了3个重点林区
4. 访谈了5名管理人员和护林员

二、审计发现
1. 森林资源台账不完善
   - 缺少2024年3月份数据
   - 部分数据未及时更新
2. 采伐控制存在漏洞
   - 实际采伐量超出许可证批准量5%
   - 部分区域存在无证采伐现象
3. 防火措施落实不到位
   - 防火设施维护记录缺失
   - 防火巡查频次未达规定要求

三、审计证据
1. 管理制度文件（附件1）
2. 采伐许可证记录（附件2）
3. 实地调查记录（附件3）
4. 访谈记录（附件4）

四、审计结论
森林资源管理存在台账不完善、采伐控制不严、防火措施落实不到位等问题，需要加强管理。

请确认以上内容是否符合要求，我可以根据需要进行调整。`,
  }

  return (
    templates[docType] || templates['default'] || '已收到您的请求，正在为您生成相应的审计文书...'
  )
}

const updateCurrentChat = () => {
  if (!currentChatId.value) return

  const chat = currentConversations.value.find((c) => c.id === currentChatId.value)
  if (chat) {
    chat.messages = [...messages.value]
    chat.time = new Date().toLocaleString()
  }
}

const renderMessages = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-messages')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const formatMessageContent = (content: string) => {
  return content.replace(/\n/g, '<br>')
}

const handlePromptClick = (docType: string) => {
  const projectName = currentProjectInfo.value?.name || ''
  let detailedPrompt = ''

  switch (docType) {
    case '工作方案':
      detailedPrompt = `请帮我生成一份审计工作方案。\n\n项目信息：\n- 项目名称：${projectName}\n- 审计时间：2024年7月-9月\n- 审计范围：${projectName.includes('森林') ? '全市森林资源管理情况' : projectName.includes('水') ? '全市水资源利用和保护情况' : '相关资源管理情况'}\n- 审计重点：资源配置、使用效率、保护措施、政策执行等\n\n请生成包含审计目标、审计范围、审计内容、审计方法、时间安排、人员分工等完整内容的工作方案。`
      break

    case '实施方案':
      detailedPrompt = `请生成一份详细的审计实施方案。\n\n基于已有的工作方案，请细化具体的实施步骤：\n- 项目名称：${projectName}\n- 实施阶段：准备阶段、实施阶段、报告阶段\n- 具体审计程序和方法\n- 重点关注的风险点\n- 证据收集要求\n- 质量控制措施\n\n请生成详细的实施方案，包括具体的审计程序、时间节点、责任分工等。`
      showDocumentSelector('实施方案', '工作方案', false)
      return

    case '取证单':
      detailedPrompt = `请帮我生成一份审计取证单。\n\n项目信息：\n- 项目名称：${projectName}\n- 取证日期：${new Date().toLocaleDateString()}\n- 审计员：当前用户\n\n请生成规范的审计取证单格式，包括：\n- 取证单编号\n- 被审计单位\n- 取证事项\n- 取证方法\n- 发现问题\n- 相关证据\n- 审计结论等内容。`
      showDocumentSelector('取证单', '实施方案', false)
      return

    case '工作底稿':
      detailedPrompt = `请生成一份审计工作底稿。\n\n项目信息：\n- 项目名称：${projectName}\n- 编制日期：${new Date().toLocaleDateString()}\n- 编制人：当前用户\n\n请基于相关取证单生成工作底稿，包括：\n- 审计发现汇总\n- 问题分析\n- 审计结论\n- 改进建议等内容。`
      showDocumentSelector('工作底稿', '取证单', true)
      return

    case '审计意见':
      detailedPrompt = `请帮我生成一份审计意见书。\n\n项目信息：\n- 项目名称：${projectName}\n- 出具日期：${new Date().toLocaleDateString()}\n- 审计机关：市审计局\n\n请基于相关工作底稿生成审计意见书，包括：\n- 审计概况\n- 审计发现的主要问题\n- 审计意见\n- 整改要求\n- 法律责任等内容。`
      showDocumentSelector('审计意见', '工作底稿', true)
      return

    case '综合报告':
      detailedPrompt = `请生成一份综合审计报告。\n\n项目信息：\n- 项目名称：${projectName}\n- 报告日期：${new Date().toLocaleDateString()}\n- 审计机关：市审计局\n\n请基于相关审计意见生成综合审计报告，包括：\n- 审计工作总体情况\n- 主要审计发现\n- 存在的问题及原因分析\n- 审计建议\n- 审计成果运用等内容。`
      showDocumentSelector('综合报告', '审计意见', true)
      return
  }

  inputMessage.value = detailedPrompt
}

const showDocumentSelector = (
  targetType: string,
  dependencyType: string,
  allowMultiple: boolean,
) => {
  currentDocumentType.value = targetType
  currentDependencyType.value = dependencyType
  allowMultipleSelection.value = allowMultiple
  selectedDocuments.value = []
  selectedDocument.value = null
  documentSelectVisible.value = true
}

const selectAllDocuments = () => {
  selectedDocuments.value = availableDocuments.value.map((doc) => doc.id)
}

const deselectAllDocuments = () => {
  selectedDocuments.value = []
  selectedDocument.value = null
}

const confirmDocumentSelection = () => {
  const selectedIds = allowMultipleSelection.value
    ? selectedDocuments.value
    : [selectedDocument.value].filter(Boolean)
  const selectedDocs = availableDocuments.value.filter((doc) => selectedIds.includes(doc.id))

  if (selectedDocs.length === 0) {
    ElMessage.warning('请至少选择一个文书')
    return
  }

  const projectName = currentProjectInfo.value?.name || ''
  let detailedPrompt = ''

  switch (currentDocumentType.value) {
    case '实施方案':
      detailedPrompt = `请生成一份详细的审计实施方案。\n\n基于以下工作方案：\n${selectedDocs.map((doc) => `- ${doc.name}`).join('\n')}\n\n项目信息：\n- 项目名称：${projectName}\n- 实施阶段：准备阶段、实施阶段、报告阶段\n\n请生成详细的实施方案，包括具体的审计程序、时间节点、责任分工等。`
      break

    case '取证单':
      detailedPrompt = `请生成一份审计取证单。\n\n基于以下实施方案：\n${selectedDocs.map((doc) => `- ${doc.name}`).join('\n')}\n\n项目信息：\n- 项目名称：${projectName}\n- 取证日期：${new Date().toLocaleDateString()}\n- 审计员：当前用户\n\n请生成规范的审计取证单格式。`
      break

    case '工作底稿':
      detailedPrompt = `请生成一份审计工作底稿。\n\n基于以下相关文档：\n${selectedDocs.map((doc) => `- ${doc.name}`).join('\n')}\n\n项目信息：\n- 项目名称：${projectName}\n- 编制日期：${new Date().toLocaleDateString()}\n- 编制人：当前用户\n\n请基于选择的相关文档生成工作底稿。`
      break

    case '审计意见':
      detailedPrompt = `请帮我生成一份审计意见书。\n\n基于以下工作底稿：\n${selectedDocs.map((doc) => `- ${doc.name}`).join('\n')}\n\n项目信息：\n- 项目名称：${projectName}\n- 出具日期：${new Date().toLocaleDateString()}\n- 审计机关：市审计局\n\n请基于选择的工作底稿生成审计意见书。`
      break

    case '综合报告':
      detailedPrompt = `请生成一份综合审计报告。\n\n基于以下审计意见：\n${selectedDocs.map((doc) => `- ${doc.name}`).join('\n')}\n\n项目信息：\n- 项目名称：${projectName}\n- 报告日期：${new Date().toLocaleDateString()}\n- 审计机关：市审计局\n\n请基于选择的审计意见生成综合审计报告。`
      break
  }

  inputMessage.value = detailedPrompt
  documentSelectVisible.value = false
}

const refineDocument = (index: number, option: string) => {
  const message = messages.value[index]
  if (!message) return

  const originalContent = message.content
  let refinedContent = originalContent

  switch (option) {
    case 'formal':
      refinedContent = originalContent
        .replace(/我们/g, '本审计组')
        .replace(/建议/g, '审计建议')
        .replace(/问题/g, '审计发现')
      break
    case 'concise':
      refinedContent = originalContent
        .replace(/总体来看/g, '总体')
        .replace(/存在改进空间/g, '需改进')
        .replace(/建议被审计单位/g, '建议')
      break
    case 'professional':
      refinedContent = originalContent
        .replace(/资金管理/g, '财务管理')
        .replace(/资源利用/g, '资源配置')
        .replace(/环境保护/g, '生态保护')
      break
    case 'fluent':
      refinedContent = originalContent
        .replace(/存在/g, '发现存在')
        .replace(/建议/g, '为此建议')
        .replace(/要求/g, '明确要求')
      break
  }

  messages.value[index].content = refinedContent
  messages.value[index].refined = true
  renderMessages()

  addMessage(
    'ai',
    `已根据"${option}"风格对文档进行润色处理。如需进一步调整，请告诉我您的具体要求。`,
  )
}

const submitDocument = (index: number) => {
  const message = messages.value[index]
  if (!message) return

  submittingDocument.value = message.docType || '审计文书'
  submittingIndex.value = index
  submitModalVisible.value = true
}

const confirmSubmit = async () => {
  submitModalVisible.value = false

  try {
    // 模拟提交过程
    await new Promise((resolve) => setTimeout(resolve, 2000))

    ElMessage.success(
      `您的${submittingDocument.value}已成功提交给主审人${submitForm.value.principal}！`,
    )
    addMessage(
      'ai',
      `您的${submittingDocument.value}已成功提交给主审人${submitForm.value.principal}！`,
    )
  } catch {
    ElMessage.error('提交失败，请稍后重试')
  }
}

const uploadFile = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  fileInput?.click()
}

const handleFileUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  const fileNames = Array.from(files)
    .map((f) => f.name)
    .join(', ')
  addMessage('user', `已上传文件: ${fileNames}`)

  setTimeout(() => {
    addMessage(
      'ai',
      '文件上传成功！我已经分析了您上传的文件内容，可以结合这些材料为您生成更准确的审计文书。请告诉我您需要生成什么类型的文书？',
    )
  }, 1000)
}

const saveResult = () => {
  if (messages.value.length === 0) {
    ElMessage.warning('暂无内容可保存')
    return
  }

  const aiMessages = messages.value.filter((msg) => msg.type === 'ai')
  if (aiMessages.length === 0) {
    ElMessage.warning('暂无AI生成内容可保存')
    return
  }

  const lastAiMessage = aiMessages[aiMessages.length - 1]
  const docType = lastAiMessage.docType || '审计文书'

  const newDocId =
    savedDocuments.value.length > 0 ? Math.max(...savedDocuments.value.map((doc) => doc.id)) + 1 : 1

  const fileName = `${currentProjectInfo.value?.name}_${docType}_${new Date().toLocaleDateString().replace(/\//g, '-')}_v1.0`

  const newDocument: Document = {
    id: newDocId,
    name: fileName,
    content: lastAiMessage.content,
    type: docType,
    size: `${Math.round(lastAiMessage.content.length / 1024)}KB`,
    date: new Date().toLocaleString(),
    project: currentProjectInfo.value?.name || '',
  }

  savedDocuments.value.unshift(newDocument)
  addMessage('ai', `结果已保存为: ${fileName} (${docType})`)
  ElMessage.success(`"${fileName}" 已成功保存！`)
}

const viewSavedResults = () => {
  savedResultsVisible.value = true
}

const filterSavedResults = () => {
  // 计算属性会自动处理过滤
}

const previewFile = (doc: Document) => {
  previewDoc.value = doc
  previewModalVisible.value = true
}

const downloadFile = (doc: Document) => {
  const content = doc.content
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.name}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 生命周期
onMounted(() => {
  renderMessages()
})
</script>

<style scoped>
.audit-text-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-selection {
  padding: 12px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
}

.selection-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.chat-container {
  flex: 1;
  display: flex;
  background: #f5f5f5;
  height: calc(100% - 60px);
}

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

.new-chat-btn {
  margin: 8px;
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item:hover {
  background: #f0f0f0;
}

.history-item.active {
  background: #e6f7ff;
  color: #1890ff;
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
  opacity: 0;
  transition: opacity 0.2s ease;
}

.history-item:hover .delete-chat-btn {
  opacity: 1;
}

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

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
}

.prompt-template {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.prompt-template-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.prompt-template-title {
  font-size: 16px;
  font-weight: 600;
  color: #0284c7;
  margin-left: 12px;
}

.prompt-template-content {
  font-size: 14px;
  color: #0369a1;
  line-height: 1.6;
  white-space: pre-line;
  margin-bottom: 20px;
}

.example-questions {
  margin-top: 20px;
}

.example-questions-title {
  font-size: 14px;
  font-weight: 600;
  color: #0284c7;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.example-questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.example-question-card {
  background: #ffffff;
  border: 2px solid #e1f5fe;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.example-question-card:hover {
  border-color: #0284c7;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
  transform: translateY(-2px);
}

.example-question-card:active {
  transform: translateY(0);
}

.question-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: white;
  margin-bottom: 12px;
}

.question-text {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 8px;
}

.question-type {
  font-size: 12px;
  color: #0284c7;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.message {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content-wrapper {
  position: relative;
  flex: 1;
  max-width: 70%;
}

.doc-type-tag {
  position: absolute;
  top: -10px;
  left: 10px;
  background: #1890ff;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  z-index: 5;
}

.message-content {
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

.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

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

.input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.file-list {
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
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
  margin-bottom: 2px;
}

.file-meta {
  font-size: 12px;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.draft-preview {
  max-height: 500px;
  overflow-y: auto;
}

.draft-header {
  text-align: center;
  margin-bottom: 20px;
}

.draft-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
}

.draft-meta {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.draft-content pre {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.document-selector {
  max-height: 500px;
  overflow-y: auto;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.selector-title {
  font-size: 16px;
  font-weight: 600;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin: 12px 0;
}

.empty-hint {
  font-size: 14px;
  color: #666;
}

.document-checkbox-group,
.document-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-checkbox,
.document-radio {
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

.document-checkbox .el-checkbox__label,
.document-radio .el-radio__label {
  width: 100%;
  padding-left: 16px;
}

.document-item-enhanced {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.document-item-enhanced:hover {
  border-color: #0284c7;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.1);
}

.document-checkbox:has(.el-checkbox__input.is-checked) .document-item-enhanced,
.document-radio:has(.el-radio__input.is-checked) .document-item-enhanced {
  border-color: #0284c7;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.15);
}

.document-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.document-content {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.meta-text {
  color: #6b7280;
}

.document-status {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: #f0f9ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

@media (max-width: 768px) {
  .history-sidebar {
    width: 200px;
  }

  .chat-main {
    margin: 8px;
  }

  .message-content-wrapper {
    max-width: 85%;
  }
}
</style>

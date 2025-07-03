<template>
  <div class="audit-text-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">审计文本处理</h2>
        <p class="page-description">智能分析和处理审计相关文本内容</p>
      </div>
    </div>

    <el-row :gutter="24">
      <!-- 文本输入区域 -->
      <el-col :span="12">
        <el-card shadow="never" class="text-input-card">
          <template #header>
            <div class="card-header">
              <span>文本输入</span>
              <el-button
                type="primary"
                size="small"
                :loading="processing"
                @click="handleAnalyze"
              >
                {{ processing ? '分析中...' : '开始分析' }}
              </el-button>
            </div>
          </template>

          <el-input
            v-model="inputText"
            type="textarea"
            :rows="20"
            placeholder="请输入需要分析的审计文本内容..."
            maxlength="10000"
            show-word-limit
          />
        </el-card>
      </el-col>

      <!-- 分析结果区域 -->
      <el-col :span="12">
        <el-card shadow="never" class="analysis-result-card">
          <template #header>
            <div class="card-header">
              <span>分析结果</span>
              <el-button
                v-if="analysisResult"
                type="text"
                size="small"
                @click="handleExport"
              >
                <el-icon><Download /></el-icon>
                导出结果
              </el-button>
            </div>
          </template>

          <div v-if="processing" class="loading-state">
            <el-skeleton :rows="10" animated />
          </div>

          <div v-else-if="!analysisResult" class="empty-state">
            <el-empty description="请输入文本并点击分析" />
          </div>

          <div v-else class="analysis-content">
            <!-- 摘要 -->
            <div class="result-section">
              <h4>文本摘要</h4>
              <p class="summary-text">{{ analysisResult.summary }}</p>
            </div>

            <!-- 关键词 -->
            <div class="result-section">
              <h4>关键词</h4>
              <div class="keywords">
                <el-tag
                  v-for="keyword in analysisResult.keywords"
                  :key="keyword"
                  size="small"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </el-tag>
              </div>
            </div>

            <!-- 分类 -->
            <div class="result-section">
              <h4>文本分类</h4>
              <el-tag type="success" size="small">
                {{ analysisResult.category }}
              </el-tag>
            </div>

            <!-- 风险等级 -->
            <div class="result-section">
              <h4>风险等级</h4>
              <el-tag
                :type="getRiskTagType(analysisResult.riskLevel)"
                size="small"
              >
                {{ analysisResult.riskLevel }}
              </el-tag>
            </div>

            <!-- 建议 -->
            <div class="result-section">
              <h4>审计建议</h4>
              <ul class="suggestions-list">
                <li
                  v-for="suggestion in analysisResult.suggestions"
                  :key="suggestion"
                >
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

// 输入文本
const inputText = ref('')
const processing = ref(false)

// 分析结果类型
interface AnalysisResult {
  summary: string
  keywords: string[]
  category: string
  riskLevel: string
  suggestions: string[]
}

// 分析结果
const analysisResult = ref<AnalysisResult | null>(null)

// 获取风险等级标签类型
const getRiskTagType = (riskLevel: string) => {
  const riskMap: Record<string, string> = {
    '低风险': 'success',
    '中风险': 'warning',
    '高风险': 'danger'
  }
  return riskMap[riskLevel] || 'info'
}

// 处理文本分析
const handleAnalyze = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入需要分析的文本内容')
    return
  }

  processing.value = true

  try {
    // TODO: 调用真实的文本分析接口
    // const result = await textAnalysisApi.analyze(inputText.value)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟分析结果
    analysisResult.value = {
      summary: '该文本涉及土地使用权出让相关内容，主要描述了某地块的出让程序和价格确定过程。文本显示存在程序不规范、价格偏低等问题，需要进一步审计核实。',
      keywords: ['土地使用权', '出让程序', '价格确定', '程序不规范', '价格偏低'],
      category: '土地利用审计',
      riskLevel: '中风险',
      suggestions: [
        '核实土地出让程序是否符合相关法规要求',
        '检查土地出让价格是否按照市场评估价格确定',
        '审查相关审批文件的完整性和合规性',
        '核实土地出让收入是否及时上缴财政'
      ]
    }

    ElMessage.success('文本分析完成')
  } catch (error) {
    ElMessage.error('文本分析失败')
  } finally {
    processing.value = false
  }
}

// 导出分析结果
const handleExport = () => {
  if (!analysisResult.value) return

  // TODO: 实现导出功能
  // 这里可以生成PDF或Word文档
  ElMessage.info('导出功能正在开发中')
}
</script>

<style scoped>
.audit-text-container {
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

.text-input-card,
.analysis-result-card {
  height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-state {
  padding: 20px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.analysis-content {
  height: 500px;
  overflow-y: auto;
}

.result-section {
  margin-bottom: 24px;
}

.result-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.summary-text {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.keywords {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.keyword-tag {
  margin-bottom: 4px;
}

.suggestions-list {
  margin: 0;
  padding-left: 20px;
}

.suggestions-list li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .text-input-card,
  .analysis-result-card {
    height: auto;
    min-height: 400px;
  }

  .analysis-content {
    height: auto;
    max-height: 400px;
  }
}
</style>

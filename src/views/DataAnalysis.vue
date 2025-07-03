<template>
  <div class="data-analysis-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据分析</h2>
        <p class="page-description">可视化展示审计数据分析结果</p>
      </div>
      <div class="header-right">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon projects-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalProjects }}</h3>
                <p>总项目数</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ stats.activeProjects }}</h3>
                <p>进行中项目</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon issues-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ stats.totalIssues }}</h3>
                <p>发现问题数</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="never" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon knowledge-icon">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ stats.knowledgeCount }}</h3>
                <p>知识条目数</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="24">
        <!-- 项目状态分布 -->
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>项目状态分布</span>
                <el-button type="text" size="small">
                  <el-icon><More /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="pie-chart-simulation">
                  <div class="pie-section draft" style="--percentage: 25%">
                    <span>草稿 25%</span>
                  </div>
                  <div class="pie-section active" style="--percentage: 50%">
                    <span>进行中 50%</span>
                  </div>
                  <div class="pie-section completed" style="--percentage: 20%">
                    <span>已完成 20%</span>
                  </div>
                  <div class="pie-section archived" style="--percentage: 5%">
                    <span>已归档 5%</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 月度项目趋势 -->
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>月度项目趋势</span>
                <el-button type="text" size="small">
                  <el-icon><More /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="line-chart-simulation">
                  <div class="chart-axes">
                    <div class="y-axis">
                      <span>10</span>
                      <span>8</span>
                      <span>6</span>
                      <span>4</span>
                      <span>2</span>
                      <span>0</span>
                    </div>
                    <div class="x-axis">
                      <span>1月</span>
                      <span>2月</span>
                      <span>3月</span>
                      <span>4月</span>
                      <span>5月</span>
                      <span>6月</span>
                    </div>
                  </div>
                  <div class="chart-line">
                    <div class="line-point" style="left: 10%; bottom: 20%"></div>
                    <div class="line-point" style="left: 25%; bottom: 40%"></div>
                    <div class="line-point" style="left: 40%; bottom: 60%"></div>
                    <div class="line-point" style="left: 55%; bottom: 45%"></div>
                    <div class="line-point" style="left: 70%; bottom: 70%"></div>
                    <div class="line-point" style="left: 85%; bottom: 80%"></div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="24" style="margin-top: 24px">
        <!-- 审计类型分布 -->
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>审计类型分布</span>
                <el-button type="text" size="small">
                  <el-icon><More /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="bar-chart-simulation">
                  <div class="bar-item">
                    <div class="bar" style="height: 80%"></div>
                    <span>土地利用</span>
                  </div>
                  <div class="bar-item">
                    <div class="bar" style="height: 60%"></div>
                    <span>矿产资源</span>
                  </div>
                  <div class="bar-item">
                    <div class="bar" style="height: 40%"></div>
                    <span>环境保护</span>
                  </div>
                  <div class="bar-item">
                    <div class="bar" style="height: 30%"></div>
                    <span>其他</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 风险等级分布 -->
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>风险等级分布</span>
                <el-button type="text" size="small">
                  <el-icon><More /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="risk-chart-simulation">
                  <div class="risk-item high-risk">
                    <div class="risk-bar" style="width: 20%"></div>
                    <span>高风险 (20%)</span>
                  </div>
                  <div class="risk-item medium-risk">
                    <div class="risk-bar" style="width: 50%"></div>
                    <span>中风险 (50%)</span>
                  </div>
                  <div class="risk-item low-risk">
                    <div class="risk-bar" style="width: 30%"></div>
                    <span>低风险 (30%)</span>
                  </div>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  CircleCheck,
  Warning,
  Reading,
  Refresh,
  More
} from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  totalProjects: 48,
  activeProjects: 24,
  totalIssues: 156,
  knowledgeCount: 89
})

// 刷新数据
const handleRefresh = async () => {
  try {
    // TODO: 调用真实的数据刷新接口
    // await dataAnalysisApi.refreshData()

    // 模拟数据刷新
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟更新统计数据
    stats.totalProjects = Math.floor(Math.random() * 100) + 40
    stats.activeProjects = Math.floor(Math.random() * 30) + 20
    stats.totalIssues = Math.floor(Math.random() * 200) + 100
    stats.knowledgeCount = Math.floor(Math.random() * 150) + 80

    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  // TODO: 初始化图表数据
  // await loadChartData()
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

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.projects-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.active-icon {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.issues-icon {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.knowledge-icon {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.stat-info h3 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.stat-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

/* 饼图模拟 */
.pie-chart-simulation {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  background: conic-gradient(
    #409eff 0deg 90deg,
    #67c23a 90deg 270deg,
    #e6a23c 270deg 342deg,
    #f56c6c 342deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart-simulation::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
}

/* 折线图模拟 */
.line-chart-simulation {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 20px;
}

.chart-axes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.y-axis {
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 40px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.chart-line {
  position: relative;
  height: 100%;
}

.line-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

/* 柱状图模拟 */
.bar-chart-simulation {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  height: 80%;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 40px;
  background: #409eff;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
}

.bar-item span {
  font-size: 12px;
  color: #666;
}

/* 风险图模拟 */
.risk-chart-simulation {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.risk-bar {
  height: 24px;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.high-risk .risk-bar {
  background: #f56c6c;
}

.medium-risk .risk-bar {
  background: #e6a23c;
}

.low-risk .risk-bar {
  background: #67c23a;
}

.risk-item span {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-section .el-col {
    margin-bottom: 16px;
  }

  .chart-container {
    height: 250px;
  }

  .pie-chart-simulation {
    width: 150px;
    height: 150px;
  }

  .pie-chart-simulation::before {
    width: 75px;
    height: 75px;
  }
}
</style>

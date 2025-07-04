<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="sidebar-header">
        <h1>智能审计系统</h1>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="false"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard/audit-projects">
          <el-icon><Document /></el-icon>
          <span>审计项目</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/audit-text">
          <el-icon><Edit /></el-icon>
          <span>审计文本</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/data-analysis">
          <el-icon><TrendCharts /></el-icon>
          <span>数据分析</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/knowledge-management">
          <el-icon><Reading /></el-icon>
          <span>知识管理</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/knowledge-qa">
          <el-icon><ChatDotSquare /></el-icon>
          <span>知识问答</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar size="small" :src="userAvatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ authStore.userName }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Edit,
  TrendCharts,
  Reading,
  ChatDotSquare,
  User,
  ArrowDown,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 用户头像（可以从用户信息中获取）
const userAvatar = ref('')

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 页面标题映射
const pageTitleMap: Record<string, string> = {
  '/dashboard/audit-projects': '审计项目管理',
  '/dashboard/audit-text': '审计文本处理',
  '/dashboard/data-analysis': '数据分析',
  '/dashboard/knowledge-management': '知识库管理',
  '/dashboard/project-edit': '项目编辑',
  '/dashboard/knowledge-edit': '知识编辑',
  '/dashboard/evidence-group-edit': '证据组编辑'
}

// 当前页面标题
const currentPageTitle = computed(() => {
  const currentPath = route.path
  // 处理带参数的路由
  const matchedTitle = Object.entries(pageTitleMap).find(([path]) => {
    if (path.includes(':')) {
      const pathPattern = path.replace(/:\w+/g, '\\w+')
      return new RegExp(`^${pathPattern}$`).test(currentPath)
    }
    return currentPath === path
  })

  return matchedTitle ? matchedTitle[1] : '首页'
})

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  if (index !== route.path) {
    router.push(index)
  }
}

// 处理用户下拉菜单命令
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // TODO: 跳转到个人中心页面
      ElMessage.info('个人中心功能正在开发中')
      break

    case 'settings':
      // TODO: 跳转到系统设置页面
      ElMessage.info('系统设置功能正在开发中')
      break

    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await authStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch (error) {
        // 用户取消操作
        if (error !== 'cancel') {
          ElMessage.error('退出登录失败')
        }
      }
      break
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // 初始化用户认证状态
  authStore.initAuth()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.sidebar-header h1 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: center;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  margin: 0;
  border-radius: 0;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f5f7fa;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

.main-container {
  flex: 1;
  background: #f5f5f5;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
  transition: transform 0.2s;
}

.main-content {
  padding: 24px;
  background: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 60px !important;
  }

  .sidebar-header h1 {
    font-size: 12px;
  }

  .header {
    padding: 0 16px;
  }

  .main-content {
    padding: 16px;
  }
}

@media (min-width: 1200px) {
  .main-content {
    padding: 24px 32px;
  }
}

@media (min-width: 1600px) {
  .main-content {
    padding: 24px 48px;
  }
}
</style>

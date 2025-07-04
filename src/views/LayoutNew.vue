<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h1>{{ systemTitle }}</h1>
      </div>

      <nav class="sidebar-nav">
        <div
          v-for="menu in accessibleMenus"
          :key="menu.id"
          class="nav-item"
        >
          <router-link
            :to="menu.path!"
            class="nav-link"
            active-class="active"
          >
            <el-icon class="nav-icon">
              <component :is="menu.icon" />
            </el-icon>
            {{ menu.name }}
          </router-link>
        </div>

        <!-- 退出登录 -->
        <div class="nav-item">
          <a href="#" class="nav-link" @click.prevent="handleLogout">
            <el-icon class="nav-icon">
              <SwitchButton />
            </el-icon>
            退出登录
          </a>
        </div>
      </nav>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 头部 -->
      <div class="header">
        <div class="header-left">
          <h2>{{ pageTitle }}</h2>
          <div class="breadcrumb">{{ breadcrumb }}</div>
        </div>

        <!-- 用户信息 -->
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <span class="user-name">{{ authStore.userName || '用户' }}</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Edit,
  Histogram,
  ChatLineSquare,
  Reading,
  Rank,
  User,
  Coin,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

// 系统标题
const systemTitle = computed(() => {
  return permissionStore.userRole === 'admin'
    ? '自然资源和生态环境智能审计系统-管理端'
    : '自然资源和生态环境智能审计系统-用户端'
})

// 可访问的菜单
const accessibleMenus = computed(() => {
  return permissionStore.accessibleMenus.sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

// 页面标题
const pageTitle = computed(() => {
  const currentMenu = accessibleMenus.value.find(menu => menu.path === route.path)
  return currentMenu?.name || '首页'
})

// 面包屑导航
const breadcrumb = computed(() => {
  const currentMenu = accessibleMenus.value.find(menu => menu.path === route.path)
  return currentMenu ? `首页 > ${currentMenu.name}` : '首页'
})

// 用户名首字母
const userInitial = computed(() => {
  const name = authStore.userName || '用户'
  return name.charAt(0).toUpperCase()
})

// 退出登录
const handleLogout = async () => {
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
    if (error !== 'cancel') {
      ElMessage.error('退出登录失败')
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
}

.sidebar-header h1 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  margin: 0 8px 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: #666;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f0f0f0;
  color: #1890ff;
}

.nav-link.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

.nav-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.header {
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.header-left h2 {
  font-size: 18px;
  color: #333;
  font-weight: 500;
  margin: 0 0 2px 0;
}

.breadcrumb {
  color: #999;
  font-size: 12px;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 12px;
  margin-right: 6px;
}

.user-name {
  color: #333;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 180px;
  }

  .content {
    padding: 16px;
  }
}
</style>

<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="sidebar">
      <div class="sidebar-header">
        <h1>{{ systemTitle }}</h1>
      </div>

      <!-- Element Plus 菜单 -->
      <el-menu
        :default-active="currentMenuIndex"
        class="sidebar-menu"
        @select="handleMenuSelect"
        router
        background-color="#ffffff"
        text-color="#666666"
        active-text-color="#409EFF"
        :unique-opened="true"
      >
        <template v-for="menu in accessibleMenus" :key="menu.id">
          <!-- 有子菜单的项 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon v-if="menu.icon">
                <component :is="menu.icon" />
              </el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item 
              v-for="child in menu.children" 
              :key="child.id" 
              :index="child.path"
            >
              <el-icon v-if="child.icon">
                <component :is="child.icon" />
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 无子菜单的项 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon v-if="menu.icon">
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
        
        <div class="menu-divider"></div>
        <!-- 退出登录 -->
        <div class="logout-btn" @click="handleLogout">
          <el-icon>
            <SwitchButton />
          </el-icon>
          <span>退出登录</span>
        </div>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-content">
      <!-- 头部 -->
      <el-header class="header" height="auto">
        <div class="header-content">
          <div class="header-left">
            <h2>{{ pageTitle }}</h2>
            <el-breadcrumb separator=">" class="breadcrumb">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="pageTitle !== '首页'">{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <!-- 用户信息 -->
          <el-dropdown class="user-dropdown" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">{{ userInitial }}</el-avatar>
              <span class="user-name">{{ authStore.userName || '用户' }}</span>
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon>
                    <User />
                  </el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, SwitchButton, ArrowDown, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import type { MenuItem } from '@/utils/menuGenerator'

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
  return [...permissionStore.accessibleMenus].sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

// 当前激活的菜单索引
const currentMenuIndex = computed(() => {
  return route.path
})

// 页面标题
const pageTitle = computed(() => {
  const findMenuByPath = (menus: MenuItem[], path: string): MenuItem | null => {
    for (const menu of menus) {
      if (menu.path === path) {
        return menu
      }
      if (menu.children) {
        const found = findMenuByPath(menu.children, path)
        if (found) return found
      }
    }
    return null
  }
  
  const currentMenu = findMenuByPath(accessibleMenus.value, route.path)
  return currentMenu?.name || '首页'
})

// 用户名首字母
const userInitial = computed(() => {
  const name = authStore.userName || '用户'
  return name.charAt(0).toUpperCase()
})

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  if (index !== 'logout') {
    router.push(index)
  }
}

// 处理用户下拉菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能正在开发中')
      break
    case 'settings':
      ElMessage.info('系统设置功能正在开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
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
  height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
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
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.sidebar-menu {
  border: none;
  flex: 1;
}

.menu-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin: 8px 16px;
}

/* 新增退出登录按钮样式 */
.logout-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 24px;
  color: #666;
  font-size: 15px;
  border-radius: 6px;
  margin: 8px;
  transition:
    background 0.2s,
    color 0.2s;
}
.logout-btn:hover {
  background: #ecf5ff;
  color: #409eff;
}
.logout-btn .el-icon {
  margin-right: 8px;
}

/* 主内容区域 */
.main-content {
  background: #fff;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  min-height: 60px;
}

.header-left h2 {
  font-size: 18px;
  color: #333;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.breadcrumb {
  margin: 0;
}

/* 用户信息 */
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.3s ease;
  font-size: 14px;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  margin-right: 8px;
}

.user-name {
  color: #333;
  font-weight: 500;
  margin-right: 4px;
}

.content {
  background-color: #f5f7fa;
  padding: 20px;
}

/* Element Plus Menu 自定义样式 */
:deep(.el-menu-item) {
  margin: 4px 8px;
  border-radius: 6px;
  height: 45px;
}

:deep(.el-menu-item:hover) {
  background-color: #ecf5ff !important;
  color: #409eff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #ffffff !important;
}

/* 子菜单样式 */
:deep(.el-sub-menu) {
  margin: 4px 8px;
}

:deep(.el-sub-menu__title) {
  height: 45px;
  border-radius: 6px;
  margin: 0;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #ecf5ff !important;
  color: #409eff !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  background-color: #409eff !important;
  color: #ffffff !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title .el-icon) {
  color: #ffffff !important;
}

/* 子菜单项缩进 */
:deep(.el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
  margin: 2px 0;
}

/* Element Plus Breadcrumb 自定义样式 */
:deep(.el-breadcrumb__inner) {
  color: #909399;
  font-size: 12px;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: #409eff;
}

/* Element Plus Dropdown 自定义样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px !important;
  }

  .header-content {
    padding: 12px 16px;
  }

  .content {
    padding: 16px;
  }

  .sidebar-header h1 {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .user-info {
    padding: 6px 8px;
  }

  .user-name {
    display: none;
  }
}
</style>

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  // 用户端路由
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/LayoutNew.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: '',
        redirect: '/dashboard/projects'
      },
      {
        path: 'projects',
        name: 'AuditProjects',
        component: () => import('../views/AuditProjects.vue'),
        meta: { requiresAuth: true, permission: 'user:project:list' }
      },
      {
        path: 'audit-assistant',
        name: 'AuditAssistant',
        component: () => import('../views/AuditAssistant.vue'),
        meta: { requiresAuth: true, permission: 'user:audit:assistant' }
      },
      {
        path: 'audit-text',
        name: 'AuditText',
        component: () => import('../views/AuditText.vue'),
        meta: { requiresAuth: true, permission: 'user:audit:text' }
      },
      {
        path: 'data-analysis',
        name: 'DataAnalysis',
        component: () => import('../views/DataAnalysis.vue'),
        meta: { requiresAuth: true, permission: 'user:data:analysis' }
      },
      {
        path: 'knowledge-management',
        name: 'KnowledgeManagement',
        component: () => import('../views/KnowledgeManagement.vue'),
        meta: { requiresAuth: true, permission: 'user:knowledge:list' }
      },
      {
        path: 'ocr-recognition',
        name: 'OcrRecognition',
        component: () => import('../views/OcrRecognition.vue'),
        meta: { requiresAuth: true, permission: 'user:ocr:recognition' }
      },
      {
        path: 'project-edit/:id?',
        name: 'ProjectEdit',
        component: () => import('../views/ProjectEdit.vue'),
        meta: { requiresAuth: true, permission: 'user:project:edit' }
      },
      {
        path: 'knowledge-edit/:id?',
        name: 'KnowledgeEdit',
        component: () => import('../views/KnowledgeEdit.vue'),
        meta: { requiresAuth: true, permission: 'user:knowledge:edit' }
      },
      {
        path: 'evidence-group-edit/:id?',
        name: 'EvidenceGroupEdit',
        component: () => import('../views/EvidenceGroupEdit.vue'),
        meta: { requiresAuth: true, permission: 'user:evidence:edit' }
      }
    ]
  },
  // 管理端路由
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/LayoutNew.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/user-management'
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { requiresAuth: true, permission: 'admin:user:list' }
      },
      {
        path: 'knowledge-management',
        name: 'AdminKnowledgeManagement',
        component: () => import('../views/admin/KnowledgeManagement.vue'),
        meta: { requiresAuth: true, permission: 'admin:knowledge:list' }
      },
      {
        path: 'database-management',
        name: 'DatabaseManagement',
        component: () => import('../views/admin/DatabaseManagement.vue'),
        meta: { requiresAuth: true, permission: 'admin:database:list' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  // 初始化认证状态
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }

  // 如果是登录页面，且已经登录，则重定向到对应的首页
  if (to.path === '/login' && authStore.isAuthenticated) {
    if (permissionStore.userRole === 'admin') {
      next('/admin/user-management')
    } else {
      next('/dashboard/projects')
    }
    return
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // 检查角色权限
  if (to.meta.role && to.meta.role !== permissionStore.userRole) {
    next('/login')
    return
  }

  // 检查具体权限
  if (to.meta.permission && !permissionStore.hasButtonPermission(to.meta.permission as string)) {
    // 权限不足，重定向到首页
    if (permissionStore.userRole === 'admin') {
      next('/admin/user-management')
    } else {
      next('/dashboard/projects')
    }
    return
  }

  next()
})

export default router

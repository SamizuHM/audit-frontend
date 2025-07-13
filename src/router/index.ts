import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'
// import { usePermissionStore } from '@/stores/permission'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  // 主应用路由 - 统一布局
  {
    path: '/app',
    name: 'App',
    component: () => import('../views/LayoutNew.vue'),
    meta: { requiresAuth: true },
    redirect: '/app/home',
    children: [
      // 首页
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/HubeiAuditDashboard.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:home:dashboard',
          title: '首页',
          icon: 'House',
          sort: 1,
        },
      },
      // 用户功能模块
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../views/AuditProjects.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:project:list',
          title: '我的项目',
          icon: 'Document',
          sort: 2,
        },
      },
      {
        path: 'audit-text',
        name: 'AuditText',
        component: () => import('../views/AuditText.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:audit:text',
          title: '审计文书生成',
          icon: 'Edit',
          sort: 3,
        },
      },
      {
        path: 'data-analysis',
        name: 'DataAnalysis',
        component: () => import('../views/DataAnalysis.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:data:analysis',
          title: '数据分析',
          icon: 'Histogram',
          sort: 4,
        },
      },
      {
        path: 'audit-assistant',
        name: 'AuditAssistant',
        component: () => import('../views/AuditAssistant.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:audit:assistant',
          title: '法律法规查询',
          icon: 'ChatLineSquare',
          sort: 5,
        },
      },
      {
        path: 'knowledge-management',
        name: 'KnowledgeManagement',
        component: () => import('../views/KnowledgeManagement.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:knowledge:list',
          title: '知识库',
          icon: 'Reading',
          sort: 6,
        },
      },
      // 管理功能模块
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: {
          requiresAuth: true,
          permission: 'admin:user:list',
          title: '用户管理',
          icon: 'User',
          sort: 10,
        },
      },
      {
        path: 'admin-knowledge-management',
        name: 'AdminKnowledgeManagement',
        component: () => import('../views/admin/KnowledgeManagement.vue'),
        meta: {
          requiresAuth: true,
          permission: 'admin:knowledge:list',
          title: '知识库管理',
          icon: 'Reading',
          sort: 11,
        },
      },
      {
        path: 'database-management',
        name: 'DatabaseManagement',
        component: () => import('../views/admin/DatabaseManagement.vue'),
        meta: {
          requiresAuth: true,
          permission: 'admin:database:list',
          title: '数据库管理',
          icon: 'Coin',
          sort: 12,
        },
      },
      // 编辑页面 - 隐藏在菜单中
      {
        path: 'project-edit/:id?',
        name: 'ProjectEdit',
        component: () => import('../views/ProjectEdit.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:project:edit',
          hideInMenu: true,
        },
      },
      {
        path: 'knowledge-edit/:id?',
        name: 'KnowledgeEdit',
        component: () => import('../views/KnowledgeEdit.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:knowledge:edit',
          hideInMenu: true,
        },
      },
      {
        path: 'evidence-group-edit/:id?',
        name: 'EvidenceGroupEdit',
        component: () => import('../views/EvidenceGroupEdit.vue'),
        meta: {
          requiresAuth: true,
          permission: 'user:evidence:edit',
          hideInMenu: true,
        },
      },
    ],
  },
  // 数据屏路由 - 独立页面
  {
    path: '/data-screen',
    name: 'DataScreen',
    component: () => import('../views/HubeiAuditDashboard.vue'),
    meta: {
      requiresAuth: true,
      permission: 'admin:dashboard:view',
      hideInMenu: true,
    },
  },
  // 兼容旧路由的重定向
  {
    path: '/dashboard/:pathMatch(.*)*',
    redirect: (to) => `/app/${to.params.pathMatch}`,
  },
  {
    path: '/admin/:pathMatch(.*)*',
    redirect: (to) => `/app/${to.params.pathMatch}`,
  },
  // 404页面
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/ErrorPage/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 如果是登录页面，直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 对于其他页面，暂时也直接放行，避免循环依赖
  next()
})

// TODO: 路由守卫
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore()
//   const permissionStore = usePermissionStore()

//   // 初始化认证状态
//   if (!authStore.isAuthenticated) {
//     authStore.initAuth()
//   }

//   // 如果是登录页面，且已经登录，则重定向到首页
//   if (to.path === '/login' && authStore.isAuthenticated) {
//     next('/app/home')
//     return
//   }

//   // 检查是否需要认证
//   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//     next('/login')
//     return
//   }

//   // 检查具体权限
//   if (to.meta.permission && !permissionStore.hasButtonPermission(to.meta.permission as string)) {
//     // 权限不足，重定向到首页
//     next('/app/home')
//     return
//   }

//   next()
// })

export default router

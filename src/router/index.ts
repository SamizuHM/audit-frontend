import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard/audit-projects'
      },
      {
        path: 'audit-projects',
        name: 'AuditProjects',
        component: () => import('../views/AuditProjects.vue')
      },
      {
        path: 'audit-text',
        name: 'AuditText',
        component: () => import('../views/AuditText.vue')
      },
      {
        path: 'data-analysis',
        name: 'DataAnalysis',
        component: () => import('../views/DataAnalysis.vue')
      },
      {
        path: 'knowledge-management',
        name: 'KnowledgeManagement',
        component: () => import('../views/KnowledgeManagement.vue')
      },
      {
        path: 'knowledge-qa',
        name: 'KnowledgeQA',
        component: () => import('../views/KnowledgeQA.vue')
      },
      {
        path: 'project-edit/:id?',
        name: 'ProjectEdit',
        component: () => import('../views/ProjectEdit.vue')
      },
      {
        path: 'knowledge-edit/:id?',
        name: 'KnowledgeEdit',
        component: () => import('../views/KnowledgeEdit.vue')
      },
      {
        path: 'evidence-group-edit/:id?',
        name: 'EvidenceGroupEdit',
        component: () => import('../views/EvidenceGroupEdit.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

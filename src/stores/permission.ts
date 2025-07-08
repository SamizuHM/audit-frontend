import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Permission {
  id: string
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId?: string
  path?: string
  component?: string
  icon?: string
  sort?: number
}

export interface UserPermissions {
  menus: Permission[]
  buttons: string[]
  apis: string[]
}

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<UserPermissions>({
    menus: [],
    buttons: [],
    apis: [],
  })

  const userRole = ref<'admin' | 'user' | ''>('')
  const loading = ref(false)

  // 计算属性：可访问的菜单
  const accessibleMenus = computed(() => {
    return permissions.value.menus.filter((menu) => menu.type === 'menu')
  })

  // 计算属性：可访问的路由
  const accessibleRoutes = computed(() => {
    return permissions.value.menus.filter((menu) => menu.path).map((menu) => menu.path!)
  })

  // 获取用户权限信息
  const fetchUserPermissions = async () => {
    loading.value = true
    try {
      // TODO: 调用实际的权限接口
      // const response = await api.getUserPermissions()

      // 模拟权限数据，根据角色返回不同的权限
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (userRole.value === 'admin') {
        permissions.value = {
          menus: [
            // 管理端菜单
            {
              id: '1',
              name: '用户管理',
              code: 'admin:user:list',
              type: 'menu',
              path: '/admin/user-management',
              icon: 'User',
              sort: 1,
            },
            {
              id: '2',
              name: '知识库管理',
              code: 'admin:knowledge:list',
              type: 'menu',
              path: '/admin/knowledge-management',
              icon: 'Reading',
              sort: 2,
            },
            {
              id: '3',
              name: '数据库管理',
              code: 'admin:database:list',
              type: 'menu',
              path: '/admin/database-management',
              icon: 'Coin',
              sort: 3,
            },
          ],
          buttons: [
            'admin:user:add',
            'admin:user:edit',
            'admin:user:delete',
            'admin:knowledge:add',
            'admin:knowledge:edit',
            'admin:knowledge:delete',
            'admin:database:backup',
            'admin:database:restore',
          ],
          apis: ['admin:user:*', 'admin:knowledge:*', 'admin:database:*'],
        }
      } else {
        permissions.value = {
          menus: [
            // 用户端菜单
            {
              id: '1',
              name: '我的项目',
              code: 'user:project:list',
              type: 'menu',
              path: '/dashboard/projects',
              icon: 'Document',
              sort: 1,
            },
            {
              id: '2',
              name: '审计文书生成',
              code: 'user:audit:text',
              type: 'menu',
              path: '/dashboard/audit-text',
              icon: 'Edit',
              sort: 2,
            },
            {
              id: '3',
              name: '数据分析',
              code: 'user:data:analysis',
              type: 'menu',
              path: '/dashboard/data-analysis',
              icon: 'Histogram',
              sort: 3,
            },
            {
              id: '4',
              name: '法律法规查询',
              code: 'user:audit:assistant',
              type: 'menu',
              path: '/dashboard/audit-assistant',
              icon: 'ChatLineSquare',
              sort: 4,
            },
            {
              id: '5',
              name: '知识库',
              code: 'user:knowledge:list',
              type: 'menu',
              path: '/dashboard/knowledge-management',
              icon: 'Reading',
              sort: 5,
            },
            {
              id: '6',
              name: 'OCR识别',
              code: 'user:ocr:recognition',
              type: 'menu',
              path: '/dashboard/ocr-recognition',
              icon: 'Rank',
              sort: 6,
            },
          ],
          buttons: [
            'user:project:add',
            'user:project:edit',
            'user:project:view',
            'user:audit:generate',
            'user:knowledge:view',
            'user:knowledge:edit',
            'user:evidence:edit',
          ],
          apis: ['user:project:*', 'user:audit:*', 'user:knowledge:*', 'user:ocr:*'],
        }
      }
    } catch (error) {
      console.error('获取权限失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 设置用户角色
  const setUserRole = (role: 'admin' | 'user') => {
    userRole.value = role
  }

  // 检查是否有菜单权限
  const hasMenuPermission = (path: string) => {
    return accessibleRoutes.value.includes(path)
  }

  // 检查是否有按钮权限
  const hasButtonPermission = (code: string) => {
    return permissions.value.buttons.includes(code)
  }

  // 检查是否有API权限
  const hasApiPermission = (apiPath: string) => {
    return permissions.value.apis.some((api) => {
      if (api.endsWith('*')) {
        return apiPath.startsWith(api.slice(0, -1))
      }
      return api === apiPath
    })
  }

  // 清空权限信息
  const clearPermissions = () => {
    permissions.value = {
      menus: [],
      buttons: [],
      apis: [],
    }
    userRole.value = ''
  }

  return {
    permissions,
    userRole,
    loading,
    accessibleMenus,
    accessibleRoutes,
    fetchUserPermissions,
    setUserRole,
    hasMenuPermission,
    hasButtonPermission,
    hasApiPermission,
    clearPermissions,
  }
})

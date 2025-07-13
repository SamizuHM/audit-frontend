import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  generateMenuFromRouter,
  filterMenusByPermissions,
  defaultMenuConfig,
} from '@/utils/menuGenerator'
import type { MenuItem, UserRole } from '@/utils/menuGenerator'
import router from '@/router'

export interface UserPermissions {
  menus: MenuItem[]
  buttons: string[]
  apis: string[]
}

export const usePermissionStore = defineStore(
  'permission',
  () => {
    const permissions = ref<UserPermissions>({
      menus: [],
      buttons: [],
      apis: [],
    })

    const userRole = ref<UserRole | ''>('')
    const loading = ref(false)

    // 计算属性：可访问的菜单
    const accessibleMenus = computed(() => {
      return permissions.value.menus
    })

    // 计算属性：可访问的路由
    const accessibleRoutes = computed(() => {
      const flattenRoutes = (menus: MenuItem[]): string[] => {
        const routes: string[] = []
        for (const menu of menus) {
          if (menu.path) {
            routes.push(menu.path)
          }
          if (menu.children) {
            routes.push(...flattenRoutes(menu.children))
          }
        }
        return routes
      }
      return flattenRoutes(permissions.value.menus)
    })

    // 从路由配置生成菜单
    const generateMenusFromRouter = () => {
      if (!userRole.value) return []

      const userPermissions = getUserPermissionsByRole(userRole.value)

      // 获取主应用路由的子路由
      const appRoute = router.options.routes.find((route) => route.path === '/app')
      if (!appRoute || !appRoute.children) return []

      // 生成菜单
      const allMenus = generateMenuFromRouter(appRoute.children, userRole.value, userPermissions)

      // 根据权限过滤菜单
      return filterMenusByPermissions(allMenus, userPermissions)
    }

    // 根据角色获取权限列表
    const getUserPermissionsByRole = (role: UserRole): string[] => {
      if (role === 'admin') {
        return [...defaultMenuConfig.user.permissions, ...defaultMenuConfig.admin.permissions]
      }
      return defaultMenuConfig.user.permissions
    }

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
            menus: generateMenusFromRouter(),
            buttons: [
              'admin:user:add',
              'admin:user:edit',
              'admin:user:delete',
              'admin:knowledge:add',
              'admin:knowledge:edit',
              'admin:knowledge:delete',
              'admin:database:backup',
              'admin:database:restore',
              'user:project:add',
              'user:project:edit',
              'user:project:view',
              'user:audit:generate',
              'user:knowledge:view',
              'user:knowledge:edit',
              'user:evidence:edit',
            ],
            apis: [
              'admin:user:*',
              'admin:knowledge:*',
              'admin:database:*',
              'user:project:*',
              'user:audit:*',
              'user:knowledge:*',
            ],
          }
        } else {
          permissions.value = {
            menus: generateMenusFromRouter(),
            buttons: [
              'user:project:add',
              'user:project:edit',
              'user:project:view',
              'user:audit:generate',
              'user:knowledge:view',
              'user:knowledge:edit',
              'user:evidence:edit',
            ],
            apis: ['user:project:*', 'user:audit:*', 'user:knowledge:*'],
          }
        }
      } catch (error) {
        console.error('获取权限失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 设置用户角色
    const setUserRole = (role: UserRole) => {
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
  },
  {
    persist: true, // 默认使用 localStorage
  },
)

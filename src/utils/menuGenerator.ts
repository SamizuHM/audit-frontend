import type { RouteRecordRaw } from 'vue-router'

export interface MenuItem {
  id: string
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
  permission?: string
  sort?: number
  meta?: MenuMeta
}

export interface MenuMeta {
  title?: string
  icon?: string
  permission?: string
  sort?: number
  hideInMenu?: boolean
  requiresAuth?: boolean
  [key: string]: unknown
}

export type UserRole = 'admin' | 'user'

export function generateMenuFromRouter(
  routes: RouteRecordRaw[],
  userRole: UserRole,
  userPermissions: string[] = []
): MenuItem[] {
  const menus: MenuItem[] = []

  for (const route of routes) {
    if (shouldIncludeInMenu(route, userRole)) {
      const menuItem = createMenuItem(route, userRole, userPermissions)
      if (menuItem) {
        menus.push(menuItem)
      }
    }
  }

  return menus.sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

function shouldIncludeInMenu(route: RouteRecordRaw, userRole: UserRole): boolean {
  if (!route.meta) return false
  
  if (route.meta.hideInMenu) return false
  
  if (route.meta.role && route.meta.role !== userRole) return false
  
  if (route.path === '/login' || route.path === '/' || route.name === 'NotFound') {
    return false
  }
  
  return true
}

function createMenuItem(
  route: RouteRecordRaw,
  userRole: UserRole,
  userPermissions: string[]
): MenuItem | null {
  const meta = route.meta as MenuMeta
  
  if (meta?.permission && !userPermissions.includes(meta.permission)) {
    return null
  }

  // 构建完整路径
  const fullPath = route.path.startsWith('/') ? route.path : `/app/${route.path}`

  const menuItem: MenuItem = {
    id: route.name as string || route.path,
    name: meta?.title || (route.name as string) || '',
    path: fullPath,
    icon: meta?.icon,
    permission: meta?.permission,
    sort: meta?.sort || 0,
    meta: route.meta
  }

  if (route.children && route.children.length > 0) {
    const children = route.children
      .map(child => createMenuItem(child, userRole, userPermissions))
      .filter(Boolean) as MenuItem[]
    
    if (children.length > 0) {
      menuItem.children = children.sort((a, b) => (a.sort || 0) - (b.sort || 0))
    }
  }

  return menuItem
}

export function filterMenusByPermissions(
  menus: MenuItem[],
  userPermissions: string[]
): MenuItem[] {
  return menus
    .filter(menu => {
      if (menu.permission && !userPermissions.includes(menu.permission)) {
        return false
      }
      return true
    })
    .map(menu => {
      if (menu.children) {
        const filteredChildren = filterMenusByPermissions(menu.children, userPermissions)
        return {
          ...menu,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        }
      }
      return menu
    })
    .filter(menu => {
      if (menu.children === undefined || menu.children.length > 0) {
        return true
      }
      return !menu.permission || userPermissions.includes(menu.permission)
    })
}

export function flattenMenus(menus: MenuItem[]): MenuItem[] {
  const flattened: MenuItem[] = []
  
  function flatten(items: MenuItem[]) {
    for (const item of items) {
      flattened.push(item)
      if (item.children) {
        flatten(item.children)
      }
    }
  }
  
  flatten(menus)
  return flattened
}

export function findMenuByPath(menus: MenuItem[], path: string): MenuItem | null {
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

export const defaultMenuConfig = {
  user: {
    sort: 1,
    permissions: [
      'user:home:dashboard',
      'user:project:list',
      'user:audit:text',
      'user:data:analysis',
      'user:audit:assistant',
      'user:knowledge:list',
      'user:project:edit',
      'user:knowledge:edit',
      'user:evidence:edit'
    ]
  },
  admin: {
    sort: 2,
    permissions: [
      'admin:user:list',
      'admin:knowledge:list',
      'admin:database:list',
      'admin:dashboard:view'
    ]
  }
}
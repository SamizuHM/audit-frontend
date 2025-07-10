import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginRequest, type LoginResponse } from '@/services/api'
import { usePermissionStore } from './permission'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // 状态
    const token = ref<string>('')
    const user = ref<LoginResponse['user'] | null>(null)
    const loading = ref(false)

    // 计算属性
    const isAuthenticated = computed(() => !!token.value)
    const userName = computed(() => user.value?.name || '')
    const userRole = computed(() => user.value?.role || '')

    // 从localStorage恢复状态
    const initAuth = () => {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (savedToken) {
        token.value = savedToken
      }

      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch (e) {
          console.error('Failed to parse saved user data:', e)
        }
      }
    }

    // 登录
    const login = async (loginData: LoginRequest) => {
      loading.value = true
      try {
        // TODO: 调用真实登录接口
        const response = await authApi.login(loginData)

        token.value = response.token
        user.value = response.user

        // 保存到localStorage
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        // 获取用户权限
        const permissionStore = usePermissionStore()
        permissionStore.setUserRole(loginData.role)
        await permissionStore.fetchUserPermissions()

        return response
      } catch (error) {
        throw error
      } finally {
        loading.value = false
      }
    }

    // 退出登录
    const logout = async () => {
      loading.value = true
      try {
        // TODO: 调用真实退出接口
        await authApi.logout()

        token.value = ''
        user.value = null

        // 清除localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // 清除权限信息
        const permissionStore = usePermissionStore()
        permissionStore.clearPermissions()
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        loading.value = false
      }
    }

    // 清除认证状态
    const clearAuth = () => {
      token.value = ''
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // 清除权限信息
      const permissionStore = usePermissionStore()
      permissionStore.clearPermissions()
    }

    return {
      // 状态
      token,
      user,
      loading,

      // 计算属性
      isAuthenticated,
      userName,
      userRole,

      // 方法
      initAuth,
      login,
      logout,
      clearAuth,
    }
  },
  {
    persist: true,
  }, // 使用 pinia-plugin-persistedstate 插件进行状态持久化
)

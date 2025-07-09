<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">自然资源和生态环境智能审计系统</h1>
        <p class="login-subtitle">
          Natural Resources and Ecological Environment Intelligent Audit System
        </p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="role">
          <el-select
            v-model="loginForm.role"
            placeholder="请选择登录角色"
            size="large"
            style="width: 100%"
          >
            <el-option label="用户端" value="user" />
            <el-option label="管理端" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="authStore.loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ authStore.loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p class="demo-tip">
          <el-icon>
            <InfoFilled />
          </el-icon>
          演示账号：admin / admin123
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Lock, InfoFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive<LoginRequest>({
  username: '',
  password: '',
  role: 'user',
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20字符之间', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择登录角色', trigger: 'change' }],
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    await authStore.login(loginForm)

    ElMessage.success('登录成功')

    // 根据角色跳转到不同的页面
    if (loginForm.role === 'admin') {
      router.push('/admin/user-management')
    } else if (loginForm.role === 'user') {
      router.push('/dashboard/home')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 如果已登录，直接跳转到仪表盘
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
}

.login-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #68577a 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.demo-tip {
  color: #666;
  font-size: 14px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.demo-tip .el-icon {
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>

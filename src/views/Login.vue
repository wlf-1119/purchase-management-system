<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { User, Lock, ArrowRight } from '@element-plus/icons-vue'
import { ElButton, ElInput, ElForm, ElFormItem, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)

function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  loading.value = true
  setTimeout(() => {
    const success = userStore.login(loginForm.value.username, loginForm.value.password)
    if (success) {
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.error('账号或密码错误')
    }
    loading.value = false
  }, 500)
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="app-title">采购管理系统</h1>
        <p class="app-subtitle">高效管理您的采购业务</p>
      </div>

      <div class="login-form-wrapper">
        <h2 class="form-title">账号登录</h2>
        <ElForm :model="loginForm" class="login-form">
          <ElFormItem>
            <ElInput
              v-model="loginForm.username"
              placeholder="请输入账号"
              size="large"
              :prefix-icon="User"
              @keyup.enter="handleLogin"
            />
          </ElFormItem>
          <ElFormItem>
            <ElInput
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
              <ArrowRight class="btn-icon" />
            </ElButton>
          </ElFormItem>
        </ElForm>

        <div class="form-footer">
          <span class="footer-text">还没有账号？</span>
          <span class="register-link" @click="goToRegister">立即注册</span>
        </div>

        <div class="admin-hint">
          <p>管理员账号：0846</p>
          <p>密码：666666</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: #FFFFFF;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.app-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.login-form-wrapper {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 32px 0;
  text-align: center;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.form-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.footer-text {
  color: #6B7280;
  font-size: 14px;
}

.register-link {
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
  transition: color 0.2s;
}

.register-link:hover {
  color: #764ba2;
}

.admin-hint {
  margin-top: 24px;
  padding: 16px;
  background: #F3F4F6;
  border-radius: 12px;
  text-align: center;
}

.admin-hint p {
  margin: 4px 0;
  font-size: 13px;
  color: #4B5563;
}
</style>

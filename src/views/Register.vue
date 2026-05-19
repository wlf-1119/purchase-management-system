<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { User, Lock, UserFilled, ArrowLeft } from '@element-plus/icons-vue'
import { ElButton, ElInput, ElForm, ElFormItem, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  name: ''
})

const loading = ref(false)

function handleRegister() {
  if (!registerForm.value.username || !registerForm.value.password || !registerForm.value.name) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (registerForm.value.username.length < 4) {
    ElMessage.warning('账号至少4位')
    return
  }

  if (registerForm.value.password.length < 6) {
    ElMessage.warning('密码至少6位')
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  loading.value = true
  setTimeout(() => {
    const success = userStore.register(
      registerForm.value.username,
      registerForm.value.password,
      registerForm.value.name
    )
    if (success) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      ElMessage.error('账号已存在')
    }
    loading.value = false
  }, 500)
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="app-title">采购管理系统</h1>
        <p class="app-subtitle">创建您的账号</p>
      </div>

      <div class="register-form-wrapper">
        <div class="back-btn" @click="goToLogin">
          <ArrowLeft class="back-icon" />
          <span>返回登录</span>
        </div>

        <h2 class="form-title">用户注册</h2>
        <ElForm :model="registerForm" class="register-form">
          <ElFormItem>
            <ElInput
              v-model="registerForm.username"
              placeholder="请输入账号（至少4位）"
              size="large"
              :prefix-icon="User"
            />
          </ElFormItem>
          <ElFormItem>
            <ElInput
              v-model="registerForm.name"
              placeholder="请输入姓名"
              size="large"
              :prefix-icon="UserFilled"
            />
          </ElFormItem>
          <ElFormItem>
            <ElInput
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </ElFormItem>
          <ElFormItem>
            <ElInput
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton
              type="primary"
              size="large"
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
            >
              注册
            </ElButton>
          </ElFormItem>
        </ElForm>

        <div class="form-footer">
          <span class="footer-text">已有账号？</span>
          <span class="login-link" @click="goToLogin">立即登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 420px;
}

.register-header {
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

.register-form-wrapper {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6B7280;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: color 0.2s;
  width: fit-content;
}

.back-btn:hover {
  color: #667eea;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 32px 0;
  text-align: center;
}

.register-form {
  margin-bottom: 24px;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
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

.login-link {
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
  transition: color 0.2s;
}

.login-link:hover {
  color: #764ba2;
}
</style>

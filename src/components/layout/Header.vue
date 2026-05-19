<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { Search, Bell, Moon, Monitor, User, Sunny, ArrowDown } from '@element-plus/icons-vue'
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'

const props = defineProps<{
  currentView: string
}>()

const themeStore = useThemeStore()
const userStore = useUserStore()
const router = useRouter()

const searchQuery = ref('')
const showSearch = ref(false)
const notifications = ref([
  { id: 1, type: 'approval', message: '有2条采购申请待审批', time: '5分钟前' },
  { id: 2, type: 'order', message: 'PO002订单已发货', time: '15分钟前' },
  { id: 3, type: 'risk', message: '鑫源化工资质即将到期', time: '1小时前' }
])

const viewTitles: Record<string, string> = {
  dashboard: '数据驾驶舱',
  'user-dashboard': '个人中心',
  suppliers: '供应商管理',
  requests: '采购申请',
  orders: '采购订单',
  inventory: '库存管理',
  budget: '预算报表',
  settings: '系统设置'
}

const currentTitle = computed(() => viewTitles[props.currentView] || '')
const userName = computed(() => userStore.currentUser?.name || '管理员')

function toggleSearch() {
  showSearch.value = !showSearch.value
}

function setTheme(theme: 'light' | 'dark' | 'soft') {
  themeStore.setTheme(theme)
}

function handleNotificationClick(notification: typeof notifications.value[0]) {
  if (notification.type === 'approval') {
    const event = new CustomEvent('navigate', { detail: 'requests' })
    window.dispatchEvent(event)
  } else if (notification.type === 'order') {
    const event = new CustomEvent('navigate', { detail: 'orders' })
    window.dispatchEvent(event)
  } else if (notification.type === 'risk') {
    const event = new CustomEvent('navigate', { detail: 'suppliers' })
    window.dispatchEvent(event)
  }
}

function handleViewAllNotifications() {
  console.log('查看全部通知')
}

function handlePersonalSettings() {
  const event = new CustomEvent('navigate', { detail: 'settings' })
  window.dispatchEvent(event)
}

function handleOperationLogs() {
  alert('操作日志功能开发中')
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <header class="header">
    <div class="header-left">
      <h1 class="page-title">{{ currentTitle }}</h1>
    </div>

    <div class="header-center">
      <div class="search-wrapper" :class="{ 'active': showSearch }">
        <Search class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索采购申请、订单、供应商..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn">×</button>
      </div>
      <button v-if="!showSearch" class="search-btn" @click="toggleSearch">
        <Search class="search-btn-icon" />
      </button>
    </div>

    <div class="header-right">
      <div class="action-buttons">
        <ElDropdown trigger="click">
          <button class="theme-btn">
            <Sunny class="btn-icon" v-if="themeStore.currentTheme === 'light'" />
            <Moon class="btn-icon" v-else-if="themeStore.currentTheme === 'dark'" />
            <Monitor class="btn-icon" v-else />
          </button>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem @click="setTheme('light')">
                <Sunny class="theme-icon" />
                <span>亮色模式</span>
              </ElDropdownItem>
              <ElDropdownItem @click="setTheme('dark')">
                <Moon class="theme-icon" />
                <span>暗色模式</span>
              </ElDropdownItem>
              <ElDropdownItem @click="setTheme('soft')">
                <Monitor class="theme-icon" />
                <span>护眼模式</span>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>

        <ElDropdown trigger="click">
          <button class="notification-btn">
            <Bell class="btn-icon" />
            <span v-if="notifications.length > 0" class="badge">{{ notifications.length }}</span>
          </button>
          <template #dropdown>
            <div class="notification-dropdown">
              <div class="dropdown-header">
                <span>通知中心</span>
              </div>
              <div class="notification-list">
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="notification-item"
                  @click="handleNotificationClick(notif)"
                >
                  <div class="notif-icon" :class="notif.type">
                    <Bell />
                  </div>
                  <div class="notif-content">
                    <p class="notif-message">{{ notif.message }}</p>
                    <span class="notif-time">{{ notif.time }}</span>
                  </div>
                </div>
              </div>
              <div class="dropdown-footer" @click="handleViewAllNotifications">
                <span>查看全部</span>
              </div>
            </div>
          </template>
        </ElDropdown>

        <ElDropdown trigger="click">
          <button class="user-btn">
            <div class="user-avatar">
              <User class="avatar-icon" />
            </div>
            <span class="user-name">{{ userName }}</span>
            <ArrowDown class="arrow-icon" />
          </button>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem @click="handlePersonalSettings">个人设置</ElDropdownItem>
              <ElDropdownItem @click="handleOperationLogs">操作日志</ElDropdownItem>
              <ElDropdownItem @click="handleLogout">退出登录</ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 8px 16px;
  width: 400px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.search-wrapper.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--text-placeholder);
  margin-right: 10px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-placeholder);
}

.clear-btn {
  background: var(--text-placeholder);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;
}

.search-btn {
  background: var(--bg-primary);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.search-btn-icon {
  width: 18px;
  height: 18px;
}

.search-btn:hover {
  background: var(--primary-color);
  color: #FFFFFF;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-btn,
.notification-btn {
  background: var(--bg-primary);
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  position: relative;
}

.theme-btn:hover,
.notification-btn:hover {
  background: var(--bg-hover);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--danger-color);
  color: #FFFFFF;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--bg-primary);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-btn:hover {
  background: var(--bg-hover);
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--info-color) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.avatar-icon {
  width: 14px;
  height: 14px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.arrow-icon {
  width: 14px;
  height: 14px;
  color: var(--text-secondary);
}

.notification-dropdown {
  width: 320px;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notification-item:hover {
  background: var(--bg-hover);
}

.notif-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon.approval {
  background: rgba(22, 93, 255, 0.1);
  color: var(--primary-color);
}

.notif-icon.order {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.notif-icon.risk {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-message {
  font-size: 13px;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-time {
  font-size: 12px;
  color: var(--text-placeholder);
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--primary-color);
  font-size: 13px;
  cursor: pointer;
}

.theme-icon {
  margin-right: 8px;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useDataStore } from '@/stores/data'
import { 
  Setting as SettingsIcon, 
  User, 
  Bell, 
  Lock as Shield, 
  FolderOpened as Database,
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  Download,
  Upload
} from '@element-plus/icons-vue'
import { 
  ElCard, 
  ElButton, 
  ElSwitch, 
  ElSelect, 
  ElOption, 
  ElInput,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElForm,
  ElFormItem,
  ElMessageBox,
  ElMessage,
  ElCheckbox,
  ElCheckboxGroup
} from 'element-plus'

const themeStore = useThemeStore()
const dataStore = useDataStore()

const activeTab = ref('system')

const tabs = [
  { id: 'system', label: '系统设置', icon: SettingsIcon },
  { id: 'user', label: '用户管理', icon: User },
  { id: 'permission', label: '权限管理', icon: Shield },
  { id: 'notification', label: '通知设置', icon: Bell },
  { id: 'appearance', label: '外观设置', icon: Bell },
  { id: 'data', label: '数据管理', icon: Database }
]

const settings = computed(() => dataStore.settings)

function setTheme(theme: 'light' | 'dark' | 'soft') {
  themeStore.setTheme(theme)
  dataStore.saveSettings({ appearance: { ...dataStore.settings.appearance, theme } })
}

// 用户管理相关
const users = ref([
  { id: '1', username: '0846', name: '管理员', role: 'admin', email: 'admin@example.com', status: 'active', createdAt: '2026-01-01' },
  { id: '2', username: 'user001', name: '张三', role: 'user', email: 'zhangsan@example.com', status: 'active', createdAt: '2026-02-15' },
  { id: '3', username: 'user002', name: '李四', role: 'user', email: 'lisi@example.com', status: 'inactive', createdAt: '2026-03-20' },
  { id: '4', username: 'user003', name: '王五', role: 'user', email: 'wangwu@example.com', status: 'active', createdAt: '2026-04-05' }
])

const searchKeyword = ref('')
const showUserDialog = ref(false)
const editingUserId = ref<string | null>(null)

const formUser = ref<UserForm>({
  username: '',
  name: '',
  role: 'user',
  email: '',
  password: '',
  status: 'active'
})

interface UserForm {
  id?: string
  username: string
  name: string
  role: string
  email: string
  password?: string
  status: string
}

const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value
  const keyword = searchKeyword.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(keyword) ||
    user.name.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword)
  )
})

function openAddUser() {
  editingUserId.value = null
  formUser.value = {
    username: '',
    name: '',
    role: 'user',
    email: '',
    password: '',
    status: 'active'
  }
  showUserDialog.value = true
}

function openEditUser(user: typeof users.value[0]) {
  editingUserId.value = user.id
  formUser.value = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email,
    status: user.status
  }
  showUserDialog.value = true
}

function saveUser() {
  if (!formUser.value.username || !formUser.value.name) {
    ElMessage.error('请填写必填字段')
    return
  }
  
  if (!editingUserId.value) {
    // 添加新用户
    if (!formUser.value.password) {
      ElMessage.error('添加用户时密码不能为空')
      return
    }
    const newUser = {
      ...formUser.value,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    users.value.push(newUser as typeof users.value[0])
    ElMessage.success('用户添加成功')
  } else {
    // 编辑用户
    const index = users.value.findIndex(u => u.id === editingUserId.value)
    if (index !== -1) {
      const { password, ...userData } = formUser.value
      users.value[index] = { ...users.value[index], ...userData } as typeof users.value[0]
      ElMessage.success('用户更新成功')
    }
  }
  
  showUserDialog.value = false
  editingUserId.value = null
}

function deleteUser(user: typeof users.value[0]) {
  ElMessageBox.confirm(
    `确定要删除用户「${user.name}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    users.value = users.value.filter(u => u.id !== user.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 权限管理相关
const roles = computed(() => dataStore.roles)

const permissions = ref([
  { id: 'dashboard', name: '数据驾驶舱', description: '查看数据统计' },
  { id: 'user-dashboard', name: '个人中心', description: '用户个人中心' },
  { id: 'suppliers', name: '供应商管理', description: '管理供应商信息' },
  { id: 'requests', name: '采购申请', description: '提交和查看采购申请' },
  { id: 'orders', name: '采购订单', description: '查看和管理采购订单' },
  { id: 'inventory', name: '库存管理', description: '查看库存信息' },
  { id: 'budget', name: '预算报表', description: '查看预算报表' },
  { id: 'settings', name: '系统设置', description: '系统设置管理' }
])

const showRoleDialog = ref(false)
const editingRoleId = ref<string | null>(null)

const formRole = ref<RoleForm>({
  name: '',
  description: '',
  permissions: []
})

interface RoleForm {
  id?: string
  name: string
  description: string
  permissions: string[]
}

function openAddRole() {
  editingRoleId.value = null
  formRole.value = {
    name: '',
    description: '',
    permissions: []
  }
  showRoleDialog.value = true
}

function openEditRole(role: typeof roles.value[0]) {
  editingRoleId.value = role.id
  formRole.value = {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: [...role.permissions]
  }
  showRoleDialog.value = true
}

function saveRole() {
  if (!formRole.value.name) {
    ElMessage.error('请填写角色名称')
    return
  }
  
  if (!editingRoleId.value) {
    const newRole = {
      ...formRole.value,
      id: formRole.value.name.toLowerCase().replace(/\s+/g, '-')
    }
    dataStore.addRole(newRole as typeof roles.value[0])
    ElMessage.success('角色添加成功')
  } else {
    dataStore.updateRole(editingRoleId.value, formRole.value)
    ElMessage.success('角色更新成功')
  }
  
  showRoleDialog.value = false
  editingRoleId.value = null
}

function deleteRole(role: typeof roles.value[0]) {
  ElMessageBox.confirm(
    `确定要删除角色「${role.name}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    dataStore.deleteRole(role.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 保存设置
function saveSettings() {
  dataStore.saveSettings(settings.value)
  ElMessage.success('设置已保存')
}

function resetSettings() {
  dataStore.saveSettings({
    system: {
      name: '采购管理系统',
      version: '1.0.0',
      apiUrl: 'http://localhost:8080/api',
      debugMode: false,
      autoSave: true,
      sessionTimeout: 30
    },
    notification: {
      enableEmail: true,
      enableSms: false,
      enablePush: true,
      approvalNotify: true,
      orderNotify: true,
      riskNotify: true
    },
    appearance: {
      theme: 'light',
      fontSize: 14,
      compactMode: false,
      animationEnabled: true,
      watermarkEnabled: true
    }
  })
  ElMessage.info('设置已重置')
}
const backupHistory = ref([
  { id: '1', name: 'backup_20260518.sql', size: '2.5 MB', date: '2026-05-18 09:00:00', type: 'full' },
  { id: '2', name: 'backup_20260517.sql', size: '2.3 MB', date: '2026-05-17 09:00:00', type: 'full' },
  { id: '3', name: 'backup_20260516.sql', size: '2.1 MB', date: '2026-05-16 09:00:00', type: 'full' },
  { id: '4', name: 'backup_20260515.sql', size: '1.9 MB', date: '2026-05-15 09:00:00', type: 'incremental' }
])

function createBackup() {
  ElMessage.info('正在创建备份...')
  setTimeout(() => {
    const newBackup = {
      id: Date.now().toString(),
      name: `backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.sql`,
      size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
      date: new Date().toLocaleString('zh-CN'),
      type: Math.random() > 0.7 ? 'incremental' : 'full'
    }
    backupHistory.value.unshift(newBackup)
    ElMessage.success('备份创建成功')
  }, 1500)
}

function restoreBackup(backup: typeof backupHistory.value[0]) {
  ElMessageBox.confirm(
    `确定要从备份「${backup.name}」恢复数据吗？这将覆盖当前数据！`,
    '恢复确认',
    {
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    ElMessage.info('正在恢复数据...')
    setTimeout(() => {
      ElMessage.success('数据恢复成功')
    }, 2000)
  }).catch(() => {
    ElMessage.info('已取消恢复')
  })
}

function deleteBackup(backup: typeof backupHistory.value[0]) {
  ElMessageBox.confirm(
    `确定要删除备份「${backup.name}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    backupHistory.value = backupHistory.value.filter(b => b.id !== backup.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

function exportData() {
  ElMessage.info('正在导出数据...')
  setTimeout(() => {
    ElMessage.success('数据导出成功，文件已下载')
  }, 1500)
}

function clearCache() {
  ElMessageBox.confirm(
    '确定要清空系统缓存吗？',
    '清空缓存',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('缓存已清空')
  }).catch(() => {
    ElMessage.info('已取消')
  })
}
</script>

<template>
  <div class="settings-page">
    <div class="settings-content">
      <div class="sidebar-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="tab-icon" />
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <div class="settings-panel">
        <template v-if="activeTab === 'system'">
          <ElCard class="setting-card">
            <h3 class="card-title">系统信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">系统名称</span>
                <ElInput v-model="settings.system.name" class="info-input" />
              </div>
              <div class="info-item">
                <span class="info-label">版本号</span>
                <span class="info-value">{{ settings.system.version }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">API地址</span>
                <ElInput v-model="settings.system.apiUrl" class="info-input" />
              </div>
            </div>
          </ElCard>

          <ElCard class="setting-card">
            <h3 class="card-title">系统配置</h3>
            <div class="setting-row">
              <span class="setting-label">调试模式</span>
              <ElSwitch v-model="settings.system.debugMode" />
            </div>
            <div class="setting-row">
              <span class="setting-label">自动保存</span>
              <ElSwitch v-model="settings.system.autoSave" />
            </div>
            <div class="setting-row">
              <span class="setting-label">会话超时（分钟）</span>
              <ElSelect v-model="settings.system.sessionTimeout" class="setting-select">
                <ElOption label="15分钟" :value="15" />
                <ElOption label="30分钟" :value="30" />
                <ElOption label="60分钟" :value="60" />
                <ElOption label="120分钟" :value="120" />
              </ElSelect>
            </div>
          </ElCard>
        </template>

        <template v-else-if="activeTab === 'appearance'">
          <ElCard class="setting-card">
            <h3 class="card-title">主题设置</h3>
            <div class="theme-options">
              <button
                :class="['theme-option', { active: settings.appearance.theme === 'light' }]"
                @click="setTheme('light')"
              >
                <div class="theme-preview light"></div>
                <span class="theme-name">亮色模式</span>
              </button>
              <button
                :class="['theme-option', { active: settings.appearance.theme === 'dark' }]"
                @click="setTheme('dark')"
              >
                <div class="theme-preview dark"></div>
                <span class="theme-name">暗色模式</span>
              </button>
              <button
                :class="['theme-option', { active: settings.appearance.theme === 'soft' }]"
                @click="setTheme('soft')"
              >
                <div class="theme-preview soft"></div>
                <span class="theme-name">护眼模式</span>
              </button>
            </div>
          </ElCard>

          <ElCard class="setting-card">
            <h3 class="card-title">显示设置</h3>
            <div class="setting-row">
              <span class="setting-label">字体大小</span>
              <ElSelect v-model="settings.appearance.fontSize" class="setting-select">
                <ElOption label="12px" :value="12" />
                <ElOption label="14px" :value="14" />
                <ElOption label="16px" :value="16" />
              </ElSelect>
            </div>
            <div class="setting-row">
              <span class="setting-label">紧凑模式</span>
              <ElSwitch v-model="settings.appearance.compactMode" />
            </div>
            <div class="setting-row">
              <span class="setting-label">动画效果</span>
              <ElSwitch v-model="settings.appearance.animationEnabled" />
            </div>
            <div class="setting-row">
              <span class="setting-label">页面水印</span>
              <ElSwitch v-model="settings.appearance.watermarkEnabled" />
            </div>
          </ElCard>
        </template>

        <template v-else-if="activeTab === 'notification'">
          <ElCard class="setting-card">
            <h3 class="card-title">通知渠道</h3>
            <div class="setting-row">
              <span class="setting-label">邮件通知</span>
              <ElSwitch v-model="settings.notification.enableEmail" />
            </div>
            <div class="setting-row">
              <span class="setting-label">短信通知</span>
              <ElSwitch v-model="settings.notification.enableSms" />
            </div>
            <div class="setting-row">
              <span class="setting-label">推送通知</span>
              <ElSwitch v-model="settings.notification.enablePush" />
            </div>
          </ElCard>

          <ElCard class="setting-card">
            <h3 class="card-title">通知类型</h3>
            <div class="setting-row">
              <span class="setting-label">审批通知</span>
              <ElSwitch v-model="settings.notification.approvalNotify" />
            </div>
            <div class="setting-row">
              <span class="setting-label">订单通知</span>
              <ElSwitch v-model="settings.notification.orderNotify" />
            </div>
            <div class="setting-row">
              <span class="setting-label">风险预警</span>
              <ElSwitch v-model="settings.notification.riskNotify" />
            </div>
          </ElCard>
        </template>

        <template v-else-if="activeTab === 'user'">
          <ElCard class="setting-card">
            <div class="card-header">
              <h3 class="card-title">用户列表</h3>
              <div class="card-actions">
                <ElInput 
                  v-model="searchKeyword" 
                  placeholder="搜索用户名、姓名或邮箱" 
                  class="search-input"
                  :prefix-icon="Search"
                />
                <ElButton type="primary" :icon="Plus" @click="openAddUser">
                  添加用户
                </ElButton>
              </div>
            </div>
            <ElTable :data="filteredUsers" border class="data-table">
              <ElTableColumn prop="username" label="用户名" />
              <ElTableColumn prop="name" label="姓名" />
              <ElTableColumn prop="role" label="角色">
                <template #default="scope">
                  <span :class="['role-tag', scope.row.role]">
                    {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="email" label="邮箱" />
              <ElTableColumn prop="status" label="状态">
                <template #default="scope">
                  <span :class="['status-tag', scope.row.status]">
                    {{ scope.row.status === 'active' ? '活跃' : '禁用' }}
                  </span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="createdAt" label="创建时间" />
              <ElTableColumn label="操作" width="120">
                <template #default="scope">
                  <div class="action-group">
                    <ElButton type="text" :icon="Edit" @click="openEditUser(scope.row)" title="编辑">
                    </ElButton>
                    <ElButton type="text" :icon="Delete" @click="deleteUser(scope.row)" title="删除" class="delete-btn">
                    </ElButton>
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCard>
        </template>

        <template v-else-if="activeTab === 'permission'">
          <ElCard class="setting-card">
            <div class="card-header">
              <h3 class="card-title">角色列表</h3>
              <ElButton type="primary" :icon="Plus" @click="openAddRole">
                添加角色
              </ElButton>
            </div>
            <ElTable :data="roles" border class="data-table">
              <ElTableColumn prop="name" label="角色名称" />
              <ElTableColumn prop="description" label="描述" />
              <ElTableColumn prop="permissions" label="权限数量">
                <template #default="scope">
                  <span class="permission-count">{{ scope.row.permissions.length }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="权限列表" width="200">
                <template #default="scope">
                  <div class="permission-list">
                    <span 
                      v-for="perm in scope.row.permissions.slice(0, 3)" 
                      :key="perm"
                      class="permission-item"
                    >
                      {{ permissions.find(p => p.id === perm)?.name || perm }}
                    </span>
                    <span v-if="scope.row.permissions.length > 3" class="permission-more">
                      +{{ scope.row.permissions.length - 3 }}
                    </span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="120">
                <template #default="scope">
                  <div class="action-group">
                    <ElButton type="text" :icon="Edit" @click="openEditRole(scope.row)" title="编辑">
                    </ElButton>
                    <ElButton type="text" :icon="Delete" @click="deleteRole(scope.row)" title="删除" class="delete-btn">
                    </ElButton>
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCard>

          <ElCard class="setting-card">
            <h3 class="card-title">权限列表</h3>
            <div class="permission-grid">
              <div v-for="perm in permissions" :key="perm.id" class="permission-card">
                <div class="permission-icon">
                  <SettingsIcon />
                </div>
                <div class="permission-info">
                  <div class="permission-name">{{ perm.name }}</div>
                  <div class="permission-desc">{{ perm.description }}</div>
                </div>
              </div>
            </div>
          </ElCard>
        </template>

        <template v-else-if="activeTab === 'data'">
          <ElCard class="setting-card">
            <h3 class="card-title">数据备份</h3>
            <div class="backup-actions">
              <ElButton type="primary" :icon="Refresh" @click="createBackup">
                创建备份
              </ElButton>
              <ElButton :icon="Download" @click="exportData">
                导出数据
              </ElButton>
              <ElButton :icon="Delete" @click="clearCache" class="cache-btn">
                清空缓存
              </ElButton>
            </div>
            <ElTable :data="backupHistory" border class="data-table" style="margin-top: 20px;">
              <ElTableColumn prop="name" label="备份文件名" />
              <ElTableColumn prop="size" label="大小" />
              <ElTableColumn prop="type" label="类型">
                <template #default="scope">
                  <span :class="['type-tag', scope.row.type]">
                    {{ scope.row.type === 'full' ? '完整备份' : '增量备份' }}
                  </span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="date" label="创建时间" />
              <ElTableColumn label="操作" width="180">
                <template #default="scope">
                  <div class="action-group">
                    <ElButton type="text" :icon="Upload" @click="restoreBackup(scope.row)" title="恢复">
                    </ElButton>
                    <ElButton type="text" :icon="Download" @click="exportData" title="下载">
                    </ElButton>
                    <ElButton type="text" :icon="Delete" @click="deleteBackup(scope.row)" title="删除" class="delete-btn">
                    </ElButton>
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCard>

          <ElCard class="setting-card">
            <h3 class="card-title">数据统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">4</div>
                <div class="stat-label">用户总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">3</div>
                <div class="stat-label">角色数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">8</div>
                <div class="stat-label">权限项</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">4</div>
                <div class="stat-label">备份文件</div>
              </div>
            </div>
          </ElCard>
        </template>

        <div class="settings-footer">
          <ElButton @click="resetSettings">重置设置</ElButton>
          <ElButton type="primary" @click="saveSettings">保存设置</ElButton>
        </div>
      </div>
    </div>

    <!-- 用户编辑对话框 -->
    <ElDialog 
      :title="editingUserId ? '编辑用户' : '添加用户'" 
      v-model="showUserDialog"
      width="450px"
    >
      <ElForm :model="formUser" class="form-container">
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="formUser.username" placeholder="请输入用户名" />
        </ElFormItem>
        <ElFormItem label="姓名" prop="name">
          <ElInput v-model="formUser.name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="角色" prop="role">
          <ElSelect v-model="formUser.role">
            <ElOption label="管理员" value="admin" />
            <ElOption label="普通用户" value="user" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="formUser.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="密码" prop="password">
          <ElInput v-model="formUser.password" type="password" placeholder="添加时必填，编辑时留空则不修改" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSelect v-model="formUser.status">
            <ElOption label="活跃" value="active" />
            <ElOption label="禁用" value="inactive" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showUserDialog = false">取消</ElButton>
        <ElButton type="primary" @click="saveUser">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 角色编辑对话框 -->
    <ElDialog 
      :title="editingRoleId ? '编辑角色' : '添加角色'" 
      v-model="showRoleDialog"
      width="500px"
    >
      <ElForm :model="formRole" class="form-container">
        <ElFormItem label="角色名称" prop="name">
          <ElInput v-model="formRole.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput v-model="formRole.description" placeholder="请输入角色描述" />
        </ElFormItem>
        <ElFormItem label="权限列表" prop="permissions">
          <ElCheckboxGroup v-model="formRole.permissions">
            <div class="permission-checkboxes">
              <ElCheckbox 
                v-for="perm in permissions" 
                :key="perm.id" 
                :label="perm.id"
              >
                {{ perm.name }}
              </ElCheckbox>
            </div>
          </ElCheckboxGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showRoleDialog = false">取消</ElButton>
        <ElButton type="primary" @click="saveRole">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.settings-page {
  height: 100%;
}

.settings-content {
  display: flex;
  gap: 20px;
}

.sidebar-tabs {
  width: 200px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow-sm);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.tab-btn:hover {
  background: var(--bg-hover);
}

.tab-btn.active {
  background: var(--primary-color);
  color: #FFFFFF;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-label {
  font-size: 14px;
}

.settings-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: var(--text-placeholder);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  padding: 8px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.info-input {
  width: 100%;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: var(--text-primary);
}

.setting-select {
  width: 160px;
}

.theme-options {
  display: flex;
  gap: 16px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  border-color: var(--primary-color);
}

.theme-option.active {
  border-color: var(--primary-color);
  background: rgba(22, 93, 255, 0.05);
}

.theme-preview {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-preview.light {
  background: linear-gradient(135deg, #FFFFFF 0%, #F2F3F5 100%);
  border: 1px solid #E5E6EB;
}

.theme-preview.dark {
  background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
}

.theme-preview.soft {
  background: linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%);
  border: 1px solid #E2E8F0;
}

.theme-name {
  font-size: 13px;
  color: var(--text-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  color: var(--text-placeholder);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

/* 用户管理样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 280px;
}

.data-table {
  --el-table-row-hover-bg-color: var(--bg-hover);
}

.role-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.role-tag.admin {
  background: rgba(10, 186, 181, 0.15);
  color: #0ABAB5;
}

.role-tag.user {
  background: rgba(142, 158, 171, 0.15);
  color: #8E9EAB;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.active {
  background: rgba(0, 180, 42, 0.15);
  color: #00B42A;
}

.status-tag.inactive {
  background: rgba(156, 163, 175, 0.15);
  color: #9CA3AF;
}

.action-group {
  display: flex;
  gap: 8px;
}

.action-group .delete-btn {
  color: #F53F3F;
}

.form-container {
  padding: 10px 0;
}

.permission-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* 权限管理样式 */
.permission-count {
  display: inline-block;
  padding: 2px 10px;
  background: var(--primary-color);
  color: #FFFFFF;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-item {
  padding: 2px 8px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 12px;
}

.permission-more {
  font-size: 12px;
  color: var(--text-placeholder);
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.permission-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.permission-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 186, 181, 0.1);
  border-radius: 10px;
  color: var(--primary-color);
}

.permission-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.permission-desc {
  font-size: 12px;
  color: var(--text-placeholder);
  margin-top: 2px;
}

/* 数据管理样式 */
.backup-actions {
  display: flex;
  gap: 12px;
}

.cache-btn {
  color: #F53F3F;
}

.cache-btn:hover {
  background: rgba(245, 63, 63, 0.1);
}

.type-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.type-tag.full {
  background: rgba(10, 186, 181, 0.15);
  color: #0ABAB5;
}

.type-tag.incremental {
  background: rgba(142, 158, 171, 0.15);
  color: #8E9EAB;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-placeholder);
  margin-top: 8px;
}

/* 统一表项样式 */
.item-row {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.item-form-item {
  flex: 1;
  min-width: 100px;
  max-width: 150px;
  margin-bottom: 0;
}

.item-form-item :deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

.item-form-item :deep(.el-form-item__label) {
  width: 60px;
  text-align: right;
  padding-right: 8px;
  flex-shrink: 0;
}

.item-form-item :deep(.el-input__wrapper) {
  flex: 1;
  min-width: 0;
}

.form-input-sm {
  width: 100%;
}

.disabled-input {
  background: var(--bg-hover);
  color: var(--text-placeholder);
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

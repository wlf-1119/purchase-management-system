<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  User,
  Document,
  ShoppingCart,
  Box,
  PieChart,
  Setting,
  DArrowLeft,
  DArrowRight
} from '@element-plus/icons-vue'

const emit = defineEmits<{
  navigate: [view: string]
}>()

const sidebarStore = useSidebarStore()
const userStore = useUserStore()

const isAdmin = computed(() => userStore.isAdmin)

// 权限菜单映射
const permissionMenuMap: Record<string, { id: string; label: string; icon: any }[]> = {
  admin: [
    { id: 'dashboard', label: '数据驾驶舱', icon: HomeFilled },
    { id: 'suppliers', label: '供应商管理', icon: User },
    { id: 'requests', label: '采购申请', icon: Document },
    { id: 'orders', label: '采购订单', icon: ShoppingCart },
    { id: 'inventory', label: '库存管理', icon: Box },
    { id: 'budget', label: '预算报表', icon: PieChart },
    { id: 'settings', label: '系统设置', icon: Setting }
  ],
  user: [
    { id: 'user-dashboard', label: '个人中心', icon: HomeFilled },
    { id: 'requests', label: '采购申请', icon: Document },
    { id: 'orders', label: '采购订单', icon: ShoppingCart },
    { id: 'inventory', label: '库存查看', icon: Box }
  ],
  viewer: [
    { id: 'dashboard', label: '数据驾驶舱', icon: HomeFilled },
    { id: 'inventory', label: '库存查看', icon: Box }
  ]
}

const menuItems = computed(() => {
  const userRole = userStore.currentUser?.role || 'user'
  return permissionMenuMap[userRole] || permissionMenuMap['user']
})

const sidebarWidth = computed(() => {
  if (sidebarStore.collapsed && !sidebarStore.hovered) return 64
  return 220
})
</script>

<template>
  <aside
    class="sidebar"
    :style="{ width: `${sidebarWidth}px` }"
    @mouseenter="sidebarStore.setHovered(true)"
    @mouseleave="sidebarStore.setHovered(false)"
  >
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <ShoppingCart class="icon" />
        </div>
        <span v-if="!sidebarStore.collapsed || sidebarStore.hovered" class="logo-text">{{ isAdmin ? '采购管理系统' : '个人采购平台' }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <li
          v-for="item in menuItems"
          :key="item.id"
          class="nav-item"
          @click="emit('navigate', item.id)"
        >
          <div class="nav-link">
            <component :is="item.icon" class="nav-icon" />
            <span v-if="!sidebarStore.collapsed || sidebarStore.hovered" class="nav-label">{{ item.label }}</span>
          </div>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button class="collapse-btn" @click="sidebarStore.toggleCollapse">
        <DArrowLeft v-if="!sidebarStore.collapsed" />
        <DArrowRight v-else />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #5DCFC9 0%, #0ABAB5 100%);
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #0ABAB5 0%, #089794 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon .icon {
  width: 20px;
  height: 20px;
  color: #FFFFFF;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.9);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.nav-link:active {
  transform: scale(0.98);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.collapse-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
}
</style>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useSidebarStore } from '@/stores/sidebar'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const route = useRoute()
const router = useRouter()

const routeMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/suppliers': 'suppliers',
  '/requests': 'requests',
  '/orders': 'orders',
  '/inventory': 'inventory',
  '/budget': 'budget',
  '/settings': 'settings'
}

const currentView = computed(() => routeMap[route.path] || 'dashboard')

const sidebarWidth = computed(() => {
  if (sidebarStore.collapsed && !sidebarStore.hovered) return 64
  return 220
})

function handleNavigation(view: string) {
  const pathMap: Record<string, string> = {
    dashboard: '/dashboard',
    suppliers: '/suppliers',
    requests: '/requests',
    orders: '/orders',
    inventory: '/inventory',
    budget: '/budget',
    settings: '/settings'
  }
  router.push(pathMap[view] || '/dashboard')
}

function handleNavigateEvent(event: Event) {
  const detail = (event as CustomEvent).detail
  if (detail) {
    handleNavigation(detail)
  }
}

onMounted(() => {
  window.addEventListener('navigate', handleNavigateEvent)
})

onUnmounted(() => {
  window.removeEventListener('navigate', handleNavigateEvent)
})
</script>

<template>
  <div class="app-container" :class="themeStore.themeClass">
    <Sidebar @navigate="handleNavigation" />
    <div class="main-content" :style="{ marginLeft: `${sidebarWidth}px` }">
      <Header :current-view="currentView" />
      <main class="content-area">
        <transition name="fade" mode="out-in">
          <slot />
        </transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  transition: background-color 0.3s ease;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--bg-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

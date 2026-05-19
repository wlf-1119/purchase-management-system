import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const collapsed = ref(false)
  const hovered = ref(false)

  function toggleCollapse() {
    collapsed.value = !collapsed.value
  }

  function setHovered(value: boolean) {
    hovered.value = value
  }

  return {
    collapsed,
    hovered,
    toggleCollapse,
    setHovered
  }
})

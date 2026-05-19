import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeType } from '@/types'

export const useThemeStore = defineStore('theme', () => {
  const themes: ThemeType[] = [
    { value: 'light', label: '亮色' },
    { value: 'dark', label: '暗色' },
    { value: 'soft', label: '护眼灰' }
  ]
  
  const currentTheme = ref<'light' | 'dark' | 'soft'>('light')

  const themeClass = computed(() => {
    if (currentTheme.value === 'dark') return 'theme-dark'
    if (currentTheme.value === 'soft') return 'theme-soft'
    return ''
  })

  function setTheme(theme: 'light' | 'dark' | 'soft') {
    currentTheme.value = theme
    document.body.className = themeClass.value
    localStorage.setItem('theme', theme)
  }

  function loadTheme() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'soft' | null
    if (saved) {
      setTheme(saved)
    }
  }

  return {
    themes,
    currentTheme,
    themeClass,
    setTheme,
    loadTheme
  }
})

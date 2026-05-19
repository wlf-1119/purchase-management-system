import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([
    {
      id: 'admin',
      username: '0846',
      password: '666666',
      role: 'admin',
      name: '管理员',
      createdAt: '2026-01-01'
    }
  ])

  const isLoggedIn = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  function loadFromStorage() {
    const savedUser = localStorage.getItem('currentUser')
    const savedUsers = localStorage.getItem('users')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
    if (savedUsers) {
      users.value = JSON.parse(savedUsers)
    }
  }

  function saveToStorage() {
    if (currentUser.value) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
    localStorage.setItem('users', JSON.stringify(users.value))
  }

  function login(username: string, password: string): boolean {
    const user = users.value.find(u => u.username === username && u.password === password)
    if (user) {
      currentUser.value = user
      saveToStorage()
      return true
    }
    return false
  }

  function register(username: string, password: string, name: string): boolean {
    const existingUser = users.value.find(u => u.username === username)
    if (existingUser) {
      return false
    }
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role: 'user',
      name,
      createdAt: new Date().toISOString().split('T')[0]
    }
    users.value.push(newUser)
    saveToStorage()
    return true
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    isAdmin,
    loadFromStorage,
    login,
    register,
    logout
  }
})

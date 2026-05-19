import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Supplier, PurchaseRequest, PurchaseOrder, InventoryItem, Budget } from '@/types'
import {
  mockSuppliers,
  mockPurchaseRequests,
  mockPurchaseOrders,
  mockInventory,
  mockBudgets
} from '@/data/mockData'

interface SettingsData {
  system: {
    name: string
    version: string
    apiUrl: string
    debugMode: boolean
    autoSave: boolean
    sessionTimeout: number
  }
  notification: {
    enableEmail: boolean
    enableSms: boolean
    enablePush: boolean
    approvalNotify: boolean
    orderNotify: boolean
    riskNotify: boolean
  }
  appearance: {
    theme: string
    fontSize: number
    compactMode: boolean
    animationEnabled: boolean
    watermarkEnabled: boolean
  }
}

interface RoleData {
  id: string
  name: string
  description: string
  permissions: string[]
}

export const useDataStore = defineStore('data', () => {
  // 供应商
  const suppliers = ref<Supplier[]>([])

  // 采购申请
  const purchaseRequests = ref<PurchaseRequest[]>([])

  // 采购订单
  const purchaseOrders = ref<PurchaseOrder[]>([])

  // 库存
  const inventory = ref<InventoryItem[]>([])

  // 预算
  const budgets = ref<Budget[]>([])

  // 系统设置
  const settings = ref<SettingsData>({
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

  // 角色数据
  const roles = ref<RoleData[]>([
    { id: 'admin', name: '管理员', description: '拥有系统全部权限', permissions: ['dashboard', 'suppliers', 'requests', 'orders', 'inventory', 'budget', 'settings'] },
    { id: 'user', name: '普通用户', description: '可提交采购申请，查看相关订单', permissions: ['user-dashboard', 'requests', 'orders'] },
    { id: 'viewer', name: '查看员', description: '仅可查看数据，不可操作', permissions: ['dashboard', 'inventory'] }
  ])

  // 从 localStorage 加载数据
  function loadFromStorage() {
    const savedSuppliers = localStorage.getItem('suppliers')
    const savedRequests = localStorage.getItem('purchaseRequests')
    const savedOrders = localStorage.getItem('purchaseOrders')
    const savedInventory = localStorage.getItem('inventory')
    const savedBudgets = localStorage.getItem('budgets')
    const savedSettings = localStorage.getItem('settings')
    const savedRoles = localStorage.getItem('roles')

    if (savedSuppliers) {
      suppliers.value = JSON.parse(savedSuppliers)
    } else {
      suppliers.value = [...mockSuppliers]
    }

    if (savedRequests) {
      purchaseRequests.value = JSON.parse(savedRequests)
    } else {
      purchaseRequests.value = [...mockPurchaseRequests]
    }

    if (savedOrders) {
      purchaseOrders.value = JSON.parse(savedOrders)
    } else {
      purchaseOrders.value = [...mockPurchaseOrders]
    }

    if (savedInventory) {
      inventory.value = JSON.parse(savedInventory)
    } else {
      inventory.value = [...mockInventory]
    }

    if (savedBudgets) {
      budgets.value = JSON.parse(savedBudgets)
    } else {
      budgets.value = [...mockBudgets]
    }

    if (savedSettings) {
      settings.value = JSON.parse(savedSettings)
    }

    if (savedRoles) {
      roles.value = JSON.parse(savedRoles)
    }
  }

  // 保存数据到 localStorage
  function saveToStorage() {
    localStorage.setItem('suppliers', JSON.stringify(suppliers.value))
    localStorage.setItem('purchaseRequests', JSON.stringify(purchaseRequests.value))
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders.value))
    localStorage.setItem('inventory', JSON.stringify(inventory.value))
    localStorage.setItem('budgets', JSON.stringify(budgets.value))
    localStorage.setItem('settings', JSON.stringify(settings.value))
    localStorage.setItem('roles', JSON.stringify(roles.value))
  }

  // 保存供应商
  function saveSuppliers(data: Supplier[]) {
    suppliers.value = data
    saveToStorage()
  }

  // 添加供应商
  function addSupplier(supplier: Supplier) {
    suppliers.value.push(supplier)
    saveToStorage()
  }

  // 更新供应商
  function updateSupplier(id: string, supplier: Partial<Supplier>) {
    const index = suppliers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      suppliers.value[index] = { ...suppliers.value[index], ...supplier }
      saveToStorage()
    }
  }

  // 删除供应商
  function deleteSupplier(id: string) {
    suppliers.value = suppliers.value.filter(s => s.id !== id)
    saveToStorage()
  }

  // 保存采购申请
  function savePurchaseRequests(data: PurchaseRequest[]) {
    purchaseRequests.value = data
    saveToStorage()
  }

  // 添加采购申请
  function addPurchaseRequest(request: PurchaseRequest) {
    purchaseRequests.value.push(request)
    saveToStorage()
  }

  // 更新采购申请
  function updatePurchaseRequest(id: string, request: Partial<PurchaseRequest>) {
    const index = purchaseRequests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      purchaseRequests.value[index] = { ...purchaseRequests.value[index], ...request }
      saveToStorage()
    }
  }

  // 删除采购申请
  function deletePurchaseRequest(id: string) {
    purchaseRequests.value = purchaseRequests.value.filter(r => r.id !== id)
    saveToStorage()
  }

  // 保存采购订单
  function savePurchaseOrders(data: PurchaseOrder[]) {
    purchaseOrders.value = data
    saveToStorage()
  }

  // 添加采购订单
  function addPurchaseOrder(order: PurchaseOrder) {
    purchaseOrders.value.push(order)
    saveToStorage()
  }

  // 更新采购订单
  function updatePurchaseOrder(id: string, order: Partial<PurchaseOrder>) {
    const index = purchaseOrders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      purchaseOrders.value[index] = { ...purchaseOrders.value[index], ...order }
      saveToStorage()
    }
  }

  // 删除采购订单
  function deletePurchaseOrder(id: string) {
    purchaseOrders.value = purchaseOrders.value.filter(o => o.id !== id)
    saveToStorage()
  }

  // 保存库存
  function saveInventory(data: InventoryItem[]) {
    inventory.value = data
    saveToStorage()
  }

  // 添加库存
  function addInventoryItem(item: InventoryItem) {
    inventory.value.push(item)
    saveToStorage()
  }

  // 更新库存
  function updateInventoryItem(id: string, item: Partial<InventoryItem>) {
    const index = inventory.value.findIndex(i => i.id === id)
    if (index !== -1) {
      inventory.value[index] = { ...inventory.value[index], ...item }
      saveToStorage()
    }
  }

  // 删除库存
  function deleteInventoryItem(id: string) {
    inventory.value = inventory.value.filter(i => i.id !== id)
    saveToStorage()
  }

  // 保存预算
  function saveBudgets(data: Budget[]) {
    budgets.value = data
    saveToStorage()
  }

  // 添加预算
  function addBudget(budget: Budget) {
    budgets.value.push(budget)
    saveToStorage()
  }

  // 更新预算
  function updateBudget(id: string, budget: Partial<Budget>) {
    const index = budgets.value.findIndex(b => b.id === id)
    if (index !== -1) {
      budgets.value[index] = { ...budgets.value[index], ...budget }
      saveToStorage()
    }
  }

  // 删除预算
  function deleteBudget(id: string) {
    budgets.value = budgets.value.filter(b => b.id !== id)
    saveToStorage()
  }

  // 保存设置
  function saveSettings(data: Partial<SettingsData>) {
    settings.value = { ...settings.value, ...data }
    saveToStorage()
  }

  // 保存角色
  function saveRoles(data: RoleData[]) {
    roles.value = data
    saveToStorage()
  }

  // 添加角色
  function addRole(role: RoleData) {
    roles.value.push(role)
    saveToStorage()
  }

  // 更新角色
  function updateRole(id: string, role: Partial<RoleData>) {
    const index = roles.value.findIndex(r => r.id === id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...role }
      saveToStorage()
    }
  }

  // 删除角色
  function deleteRole(id: string) {
    roles.value = roles.value.filter(r => r.id !== id)
    saveToStorage()
  }

  // 重置所有数据到默认值
  function resetAllData() {
    suppliers.value = [...mockSuppliers]
    purchaseRequests.value = [...mockPurchaseRequests]
    purchaseOrders.value = [...mockPurchaseOrders]
    inventory.value = [...mockInventory]
    budgets.value = [...mockBudgets]
    settings.value = {
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
    }
    roles.value = [
      { id: 'admin', name: '管理员', description: '拥有系统全部权限', permissions: ['dashboard', 'suppliers', 'requests', 'orders', 'inventory', 'budget', 'settings'] },
      { id: 'user', name: '普通用户', description: '可提交采购申请，查看相关订单', permissions: ['user-dashboard', 'requests', 'orders'] },
      { id: 'viewer', name: '查看员', description: '仅可查看数据，不可操作', permissions: ['dashboard', 'inventory'] }
    ]
    saveToStorage()
  }

  return {
    suppliers,
    purchaseRequests,
    purchaseOrders,
    inventory,
    budgets,
    settings,
    roles,
    loadFromStorage,
    saveToStorage,
    saveSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    savePurchaseRequests,
    addPurchaseRequest,
    updatePurchaseRequest,
    deletePurchaseRequest,
    savePurchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    saveInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    saveBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    saveSettings,
    saveRoles,
    addRole,
    updateRole,
    deleteRole,
    resetAllData
  }
})

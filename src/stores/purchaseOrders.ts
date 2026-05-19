import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PurchaseOrder } from '@/types'
import { mockPurchaseOrders } from '@/data/mockData'

export const usePurchaseOrdersStore = defineStore('purchaseOrders', () => {
  const orders = ref<PurchaseOrder[]>([])

  function loadFromStorage() {
    const saved = localStorage.getItem('purchaseOrders')
    if (saved) {
      orders.value = JSON.parse(saved)
    } else {
      orders.value = [...mockPurchaseOrders]
    }
  }

  function saveToStorage() {
    localStorage.setItem('purchaseOrders', JSON.stringify(orders.value))
  }

  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending')
  )

  const activeOrders = computed(() => 
    orders.value.filter(o => 
      o.status === 'ordered' || o.status === 'shipping' || o.status === 'received'
    )
  )

  function getOrderById(id: string): PurchaseOrder | undefined {
    return orders.value.find(o => o.id === id)
  }

  function addOrder(order: Omit<PurchaseOrder, 'id'>) {
    const newOrder: PurchaseOrder = {
      ...order,
      id: Date.now().toString()
    }
    orders.value.push(newOrder)
    saveToStorage()
  }

  function updateOrder(id: string, updates: Partial<PurchaseOrder>) {
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      orders.value[index] = { ...orders.value[index], ...updates }
      saveToStorage()
    }
  }

  function updateStatus(id: string, status: PurchaseOrder['status']) {
    const order = orders.value.find(o => o.id === id)
    if (order) {
      order.status = status
      saveToStorage()
    }
  }

  function deleteOrder(id: string) {
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      orders.value.splice(index, 1)
      saveToStorage()
    }
  }

  return {
    orders,
    pendingOrders,
    activeOrders,
    loadFromStorage,
    getOrderById,
    addOrder,
    updateOrder,
    updateStatus,
    deleteOrder
  }
})

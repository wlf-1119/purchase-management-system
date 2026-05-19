import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PurchaseRequest } from '@/types'
import { mockPurchaseRequests } from '@/data/mockData'

export const usePurchaseRequestsStore = defineStore('purchaseRequests', () => {
  const requests = ref<PurchaseRequest[]>([])

  function loadFromStorage() {
    const saved = localStorage.getItem('purchaseRequests')
    if (saved) {
      requests.value = JSON.parse(saved)
    } else {
      requests.value = [...mockPurchaseRequests]
    }
  }

  function saveToStorage() {
    localStorage.setItem('purchaseRequests', JSON.stringify(requests.value))
  }

  const pendingRequests = computed(() => 
    requests.value.filter(r => r.status === 'pending')
  )

  const approvedRequests = computed(() => 
    requests.value.filter(r => r.status === 'approved')
  )

  function getRequestById(id: string): PurchaseRequest | undefined {
    return requests.value.find(r => r.id === id)
  }

  function addRequest(request: Omit<PurchaseRequest, 'id'>) {
    const newRequest: PurchaseRequest = {
      ...request,
      id: Date.now().toString()
    }
    requests.value.push(newRequest)
    saveToStorage()
  }

  function updateRequest(id: string, updates: Partial<PurchaseRequest>) {
    const index = requests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      requests.value[index] = { ...requests.value[index], ...updates }
      saveToStorage()
    }
  }

  function approveRequest(id: string, comment?: string) {
    const request = requests.value.find(r => r.id === id)
    if (request) {
      request.status = 'approved'
      request.approvalHistory.push({
        id: Date.now().toString(),
        approver: '当前用户',
        role: '审批人',
        action: 'approve',
        comment,
        time: new Date().toISOString()
      })
      saveToStorage()
    }
  }

  function rejectRequest(id: string, comment: string) {
    const request = requests.value.find(r => r.id === id)
    if (request) {
      request.status = 'rejected'
      request.approvalHistory.push({
        id: Date.now().toString(),
        approver: '当前用户',
        role: '审批人',
        action: 'reject',
        comment,
        time: new Date().toISOString()
      })
      saveToStorage()
    }
  }

  function deleteRequest(id: string) {
    const index = requests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      requests.value.splice(index, 1)
      saveToStorage()
    }
  }

  return {
    requests,
    pendingRequests,
    approvedRequests,
    loadFromStorage,
    getRequestById,
    addRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest
  }
})

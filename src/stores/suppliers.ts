import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Supplier } from '@/types'
import { mockSuppliers } from '@/data/mockData'

export const useSuppliersStore = defineStore('suppliers', () => {
  const suppliers = ref<Supplier[]>([])

  function loadFromStorage() {
    const saved = localStorage.getItem('suppliers')
    if (saved) {
      suppliers.value = JSON.parse(saved)
    } else {
      suppliers.value = [...mockSuppliers]
    }
  }

  function saveToStorage() {
    localStorage.setItem('suppliers', JSON.stringify(suppliers.value))
  }

  const activeSuppliers = computed(() => 
    suppliers.value.filter(s => s.status === 'active')
  )

  const highRiskSuppliers = computed(() => 
    suppliers.value.filter(s => s.riskLevel === 'high')
  )

  function getSupplierById(id: string): Supplier | undefined {
    return suppliers.value.find(s => s.id === id)
  }

  function addSupplier(supplier: Omit<Supplier, 'id'>) {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString()
    }
    suppliers.value.push(newSupplier)
    saveToStorage()
  }

  function updateSupplier(supplier: Supplier) {
    const index = suppliers.value.findIndex(s => s.id === supplier.id)
    if (index !== -1) {
      suppliers.value[index] = supplier
      saveToStorage()
    }
  }

  function deleteSupplier(id: string) {
    const index = suppliers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      suppliers.value.splice(index, 1)
      saveToStorage()
    }
  }

  return {
    suppliers,
    activeSuppliers,
    highRiskSuppliers,
    loadFromStorage,
    getSupplierById,
    addSupplier,
    updateSupplier,
    deleteSupplier
  }
})

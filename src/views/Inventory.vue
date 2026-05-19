<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockInventory } from '@/data/mockData'
import type { InventoryItem } from '@/types'
import { Search, Filter, Download, Upload, Monitor, Box, Warning, Delete } from '@element-plus/icons-vue'
import { ElCard, ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElTag, ElDrawer, ElInputNumber } from 'element-plus'

const inventory = ref<InventoryItem[]>(mockInventory)
const showAddModal = ref(false)
const showDetailDrawer = ref(false)
const selectedItem = ref<InventoryItem | null>(null)
const searchQuery = ref('')
const categoryFilter = ref('all')
const stockAdjust = ref({ in: 0, out: 0 })

const filteredInventory = computed(() => {
  let result = inventory.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.specification.toLowerCase().includes(query)
    )
  }
  if (categoryFilter.value !== 'all') {
    result = result.filter(item => item.category === categoryFilter.value)
  }
  return result
})

const categories = computed(() => {
  const cats = new Set(inventory.value.map(item => item.category))
  return Array.from(cats)
})

const lowStockItems = computed(() => {
  return inventory.value.filter(item => item.quantity <= item.minStock)
})

const newItem = ref({
  name: '',
  specification: '',
  unit: '',
  quantity: 0,
  minStock: 0,
  maxStock: 0,
  location: '',
  category: ''
})

function getStockStatus(item: InventoryItem): { class: string; label: string } {
  if (item.quantity <= item.minStock) {
    return { class: 'low', label: '库存不足' }
  }
  if (item.quantity >= item.maxStock) {
    return { class: 'high', label: '库存充足' }
  }
  return { class: 'normal', label: '正常' }
}

function openDetail(item: InventoryItem) {
  selectedItem.value = item
  showDetailDrawer.value = true
}

function closeDetail() {
  showDetailDrawer.value = false
  selectedItem.value = null
}

function submitItem() {
  const newInventoryItem: InventoryItem = {
    id: Date.now().toString(),
    ...newItem.value,
    lastUpdateTime: new Date().toISOString().split('T')[0]
  }
  inventory.value.push(newInventoryItem)
  showAddModal.value = false
  newItem.value = {
    name: '',
    specification: '',
    unit: '',
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    location: '',
    category: ''
  }
}

function updateStock() {
  if (selectedItem.value) {
    selectedItem.value.quantity += stockAdjust.value.in - stockAdjust.value.out
    selectedItem.value.lastUpdateTime = new Date().toISOString().split('T')[0]
  }
  stockAdjust.value = { in: 0, out: 0 }
  closeDetail()
}

function deleteItem(item: InventoryItem) {
  if (confirm(`确定要删除物品 ${item.name} 吗？`)) {
    const index = inventory.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      inventory.value.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="inventory-page">
    <div class="page-header">
      <div class="header-left">
        <div class="search-bar">
          <Search class="search-icon" />
          <input v-model="searchQuery" placeholder="搜索物品名称、规格..." class="search-input" />
        </div>
        <div class="filter-bar">
          <Filter class="filter-icon" />
          <ElSelect v-model="categoryFilter" class="filter-select">
            <ElOption label="全部品类" value="all" />
            <ElOption v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </ElSelect>
        </div>
      </div>
      <div class="header-right">
        <ElButton class="import-btn">
          <Upload />
          导入
        </ElButton>
        <ElButton class="export-btn">
          <Download />
          导出
        </ElButton>
        <ElButton type="primary" class="add-btn" @click="showAddModal = true">
          <Box />
          新增物品
        </ElButton>
      </div>
    </div>

    <div v-if="lowStockItems.length > 0" class="low-stock-warning">
      <Warning class="warning-icon" />
      <span class="warning-text">有 {{ lowStockItems.length }} 种物品库存不足，需要补货</span>
      <button class="warning-btn">查看详情</button>
    </div>

    <ElCard class="inventory-card">
      <div class="card-header">
        <h3 class="card-title">库存台账</h3>
        <span class="total-count">共 {{ filteredInventory.length }} 种物品</span>
      </div>
      <ElTable :data="filteredInventory" class="inventory-table">
        <ElTableColumn prop="name" label="物品名称" min-width="150" />
        <ElTableColumn prop="specification" label="规格型号" min-width="150" />
        <ElTableColumn prop="unit" label="单位" />
        <ElTableColumn label="库存数量">
          <template #default="scope">
            <div class="quantity-cell">
              <span class="quantity-value">{{ scope.row.quantity }}</span>
              <span class="quantity-range">({{ scope.row.minStock }}-{{ scope.row.maxStock }})</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="库存状态">
          <template #default="scope">
            <ElTag :class="['status-tag', getStockStatus(scope.row).class]">
              {{ getStockStatus(scope.row).label }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="location" label="存放位置" />
        <ElTableColumn prop="category" label="品类" />
        <ElTableColumn prop="lastUpdateTime" label="更新时间" />
        <ElTableColumn label="操作" width="120">
          <template #default="scope">
            <div class="action-group">
              <button class="action-btn" @click="openDetail(scope.row)" title="管理">
                <Monitor class="action-icon" />
              </button>
              <button class="action-btn delete-btn" @click="deleteItem(scope.row)" title="删除">
                <Delete class="action-icon" />
              </button>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElDialog title="新增库存物品" v-model="showAddModal" width="500px">
      <ElForm :model="newItem" class="inventory-form creative-form">
        <ElFormItem label="物品名称" prop="name">
          <ElInput v-model="newItem.name" placeholder="请输入物品名称" />
        </ElFormItem>
        <ElFormItem label="规格型号" prop="specification">
          <ElInput v-model="newItem.specification" placeholder="请输入规格型号" />
        </ElFormItem>
        <ElFormItem label="单位" prop="unit">
          <ElInput v-model="newItem.unit" placeholder="请输入单位" />
        </ElFormItem>
        <ElFormItem label="库存数量" prop="quantity">
          <ElInputNumber v-model="newItem.quantity" :min="0" />
        </ElFormItem>
        <ElFormItem label="最低库存" prop="minStock">
          <ElInputNumber v-model="newItem.minStock" :min="0" />
        </ElFormItem>
        <ElFormItem label="最高库存" prop="maxStock">
          <ElInputNumber v-model="newItem.maxStock" :min="0" />
        </ElFormItem>
        <ElFormItem label="存放位置" prop="location">
          <ElInput v-model="newItem.location" placeholder="请输入存放位置" />
        </ElFormItem>
        <ElFormItem label="品类" prop="category">
          <ElSelect v-model="newItem.category">
            <ElOption v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddModal = false">取消</ElButton>
        <ElButton type="primary" @click="submitItem">确认添加</ElButton>
      </template>
    </ElDialog>

    <ElDrawer title="库存管理" v-model="showDetailDrawer" direction="rtl" size="500px">
      <div v-if="selectedItem" class="inventory-detail">
        <div class="detail-header">
          <h2 class="detail-name">{{ selectedItem.name }}</h2>
          <ElTag :class="['status-tag', getStockStatus(selectedItem).class]">
            {{ getStockStatus(selectedItem).label }}
          </ElTag>
        </div>

        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">规格型号</span>
              <span class="info-value">{{ selectedItem.specification }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">单位</span>
              <span class="info-value">{{ selectedItem.unit }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">存放位置</span>
              <span class="info-value">{{ selectedItem.location }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">品类</span>
              <span class="info-value">{{ selectedItem.category }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">库存控制</h3>
          <div class="stock-control">
            <div class="stock-item">
              <span class="stock-label">当前库存</span>
              <span class="stock-value current">{{ selectedItem.quantity }}</span>
            </div>
            <div class="stock-item">
              <span class="stock-label">最低库存</span>
              <span class="stock-value min">{{ selectedItem.minStock }}</span>
            </div>
            <div class="stock-item">
              <span class="stock-label">最高库存</span>
              <span class="stock-value max">{{ selectedItem.maxStock }}</span>
            </div>
          </div>
          <div class="stock-bar">
            <div 
              class="stock-fill" 
              :style="{ width: `${(selectedItem.quantity / selectedItem.maxStock) * 100}%` }"
            ></div>
            <span class="stock-marker min" :style="{ left: `${(selectedItem.minStock / selectedItem.maxStock) * 100}%` }"></span>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">库存调整</h3>
          <div class="adjust-form">
            <ElFormItem label="入库数量">
              <ElInputNumber v-model="stockAdjust.in" :min="0" />
            </ElFormItem>
            <ElFormItem label="出库数量">
              <ElInputNumber v-model="stockAdjust.out" :min="0" />
            </ElFormItem>
          </div>
        </div>

        <div class="detail-actions">
          <ElButton>扫码入库</ElButton>
          <ElButton>扫码出库</ElButton>
          <ElButton type="primary" @click="updateStock">确认调整</ElButton>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<style scoped>
.inventory-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  gap: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 8px 12px;
  width: 250px;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--text-placeholder);
  margin-right: 8px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
}

.filter-bar {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 8px 12px;
}

.filter-icon {
  width: 16px;
  height: 16px;
  color: var(--text-placeholder);
  margin-right: 8px;
}

.filter-select {
  width: 140px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.import-btn,
.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.low-stock-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 125, 0, 0.1);
  padding: 12px 20px;
  border-radius: 12px;
  color: var(--warning-color);
}

.warning-icon {
  width: 20px;
  height: 20px;
}

.warning-text {
  flex: 1;
  font-size: 14px;
}

.warning-btn {
  background: var(--warning-color);
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
}

.inventory-card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.total-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.inventory-table {
  --el-table-header-text-color: var(--text-secondary);
}

.quantity-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.quantity-range {
  font-size: 12px;
  color: var(--text-placeholder);
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.status-tag.normal {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.status-tag.low {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.status-tag.high {
  background: rgba(22, 93, 255, 0.1);
  color: var(--primary-color);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: var(--bg-primary);
  color: #FFA500;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 165, 0, 0.1);
}

.action-icon {
  width: 16px;
  height: 16px;
}

.delete-btn {
  color: #D4A574;
}

.delete-btn:hover {
  background: rgba(212, 165, 116, 0.1);
}

.inventory-form {
  padding: 20px 0;
}

.inventory-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.detail-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--text-placeholder);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
}

.stock-control {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stock-item {
  text-align: center;
}

.stock-label {
  display: block;
  font-size: 12px;
  color: var(--text-placeholder);
  margin-bottom: 4px;
}

.stock-value {
  font-size: 24px;
  font-weight: 700;
}

.stock-value.current {
  color: var(--primary-color);
}

.stock-value.min {
  color: var(--danger-color);
}

.stock-value.max {
  color: var(--success-color);
}

.stock-bar {
  position: relative;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: visible;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--danger-color) 0%, var(--warning-color) 50%, var(--success-color) 100%);
  border-radius: 4px;
}

.stock-marker {
  position: absolute;
  top: -4px;
  width: 8px;
  height: 16px;
  border-radius: 4px;
  transform: translateX(-50%);
}

.stock-marker.min {
  background: var(--danger-color);
}

.adjust-form {
  display: flex;
  gap: 20px;
}

.adjust-form .el-form-item {
  flex: 1;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.stockAdjust {
  in: 0;
  out: 0;
}
</style>

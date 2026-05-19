<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePurchaseOrdersStore } from '@/stores/purchaseOrders'
import type { PurchaseOrder } from '@/types'
import { Plus, Clock, Monitor, Edit, ArrowRight, CircleCheck, Delete } from '@element-plus/icons-vue'
import { ElCard, ElTable, ElTableColumn, ElButton, ElTag, ElDrawer, ElProgress, ElSelect, ElOption, ElInput, ElFormItem } from 'element-plus'

const ordersStore = usePurchaseOrdersStore()

const showDetailDrawer = ref(false)
const showStatusModal = ref(false)
const showCreateModal = ref(false)
const selectedOrder = ref<PurchaseOrder | null>(null)
const editingOrder = ref<PurchaseOrder | null>(null)
const newStatus = ref('')
const statusFilter = ref('all')

const newOrder = ref({
  supplierId: '',
  supplierName: '',
  items: [{ id: '1', name: '', specification: '', unit: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
  totalAmount: 0,
  taxAmount: 0,
  deliveryDate: '',
  contractNo: ''
})

const suppliers = ref([
  { id: 'S001', name: '深圳市鸿远电子科技有限公司' },
  { id: 'S002', name: '上海精密仪器设备有限公司' },
  { id: 'S003', name: '广州市金源新材料有限公司' },
  { id: 'S004', name: '杭州市佳美包装材料有限公司' }
])

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') {
    return ordersStore.orders
  }
  return ordersStore.orders.filter(o => o.status === statusFilter.value)
})

function getStatusClass(status: string): string {
  switch (status) {
    case 'pending': return 'pending'
    case 'approved': return 'approved'
    case 'ordered': return 'ordered'
    case 'shipping': return 'shipping'
    case 'received': return 'received'
    case 'completed': return 'completed'
    default: return 'draft'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return '待审批'
    case 'approved': return '已审批'
    case 'ordered': return '已下单'
    case 'shipping': return '运输中'
    case 'received': return '已收货'
    case 'completed': return '已完成'
    default: return '草稿'
  }
}

function getPaymentLabel(status: string): string {
  switch (status) {
    case 'unpaid': return '未付款'
    case 'partial': return '部分付款'
    case 'paid': return '已付清'
    default: return '未知'
  }
}

function getPaymentClass(status: string): string {
  switch (status) {
    case 'unpaid': return 'unpaid'
    case 'partial': return 'partial'
    case 'paid': return 'paid'
    default: return 'unpaid'
  }
}

function getProgress(status: string): number {
  switch (status) {
    case 'pending': return 10
    case 'approved': return 25
    case 'ordered': return 40
    case 'shipping': return 65
    case 'received': return 85
    case 'completed': return 100
    default: return 0
  }
}

function getReceivedProgress(order: PurchaseOrder): number {
  const total = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const received = order.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)
  if (total === 0) return 0
  return Math.round((received / total) * 100)
}

function openDetail(order: PurchaseOrder) {
  selectedOrder.value = order
  showDetailDrawer.value = true
}

function openEditStatus(order: PurchaseOrder) {
  editingOrder.value = order
  newStatus.value = order.status
  showStatusModal.value = true
}

function updateStatus() {
  if (editingOrder.value && newStatus.value) {
    ordersStore.updateStatus(editingOrder.value.id, newStatus.value as PurchaseOrder['status'])
    showStatusModal.value = false
    editingOrder.value = null
    newStatus.value = ''
  }
}

function openCreateModal() {
  newOrder.value = {
    supplierId: '',
    supplierName: '',
    items: [{ id: '1', name: '', specification: '', unit: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    totalAmount: 0,
    taxAmount: 0,
    deliveryDate: '',
    contractNo: ''
  }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function addItem() {
  const newId = (newOrder.value.items.length + 1).toString()
  newOrder.value.items.push({ id: newId, name: '', specification: '', unit: '', quantity: 1, unitPrice: 0, totalPrice: 0 })
}

function removeItem(index: number) {
  if (newOrder.value.items.length > 1) {
    newOrder.value.items.splice(index, 1)
    calculateTotal()
  }
}

function calculateItemTotal(index: number) {
  const item = newOrder.value.items[index]
  item.totalPrice = item.quantity * item.unitPrice
  calculateTotal()
}

function calculateTotal() {
  newOrder.value.totalAmount = newOrder.value.items.reduce((sum, item) => sum + item.totalPrice, 0)
  newOrder.value.taxAmount = Math.round(newOrder.value.totalAmount * 0.13)
}

function handleSupplierChange() {
  const supplier = suppliers.value.find(s => s.id === newOrder.value.supplierId)
  if (supplier) {
    newOrder.value.supplierName = supplier.name
  }
}

function createOrder() {
  if (!newOrder.value.supplierId || !newOrder.value.supplierName) {
    return
  }
  
  const order: Omit<PurchaseOrder, 'id'> = {
    supplierId: newOrder.value.supplierId,
    supplierName: newOrder.value.supplierName,
    items: newOrder.value.items.map(item => ({
      ...item,
      receivedQuantity: 0
    })),
    totalAmount: newOrder.value.totalAmount,
    taxAmount: newOrder.value.taxAmount,
    status: 'pending',
    createTime: '2026-05-18',
    deliveryDate: newOrder.value.deliveryDate,
    contractNo: newOrder.value.contractNo,
    paymentStatus: 'unpaid'
  }
  
  ordersStore.addOrder(order)
  showCreateModal.value = false
}

function deleteOrder(order: PurchaseOrder) {
  if (confirm(`确定要删除订单 ${order.id} 吗？`)) {
    ordersStore.deleteOrder(order.id)
  }
}

function formatCurrency(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  return '¥' + value.toLocaleString()
}
</script>

<template>
  <div class="orders-page">
    <div class="page-header">
      <div class="header-left">
        <ElSelect v-model="statusFilter" class="status-select">
          <ElOption label="全部" value="all" />
          <ElOption label="待审批" value="pending" />
          <ElOption label="已下单" value="ordered" />
          <ElOption label="运输中" value="shipping" />
          <ElOption label="已收货" value="received" />
          <ElOption label="已完成" value="completed" />
        </ElSelect>
      </div>
      <div class="header-right">
        <ElButton type="primary" class="add-btn" @click="openCreateModal">
          <Plus />
          新建订单
        </ElButton>
      </div>
    </div>

    <div class="orders-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon pending">
            <Clock />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ ordersStore.pendingOrders.length }}</span>
            <span class="stat-label">待审批订单</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon shipping">
            <ArrowRight />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ ordersStore.activeOrders.length }}</span>
            <span class="stat-label">进行中订单</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">
            <CircleCheck />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ ordersStore.orders.filter(o => o.status === 'completed').length }}</span>
            <span class="stat-label">已完成订单</span>
          </div>
        </div>
      </div>

      <ElCard class="orders-list-card">
        <div class="card-header">
          <h3 class="card-title">采购订单列表</h3>
        </div>
        <ElTable :data="filteredOrders" class="orders-table">
          <ElTableColumn prop="id" label="订单编号" />
          <ElTableColumn prop="supplierName" label="供应商" min-width="200" />
          <ElTableColumn label="订单金额">
            <template #default="scope">{{ formatCurrency(scope.row.totalAmount) }}</template>
          </ElTableColumn>
          <ElTableColumn label="付款状态">
            <template #default="scope">
              <ElTag :class="['payment-tag', getPaymentClass(scope.row.paymentStatus)]">
                {{ getPaymentLabel(scope.row.paymentStatus) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态">
            <template #default="scope">
              <div class="status-cell">
                <ElTag :class="['status-tag', getStatusClass(scope.row.status)]">
                  {{ getStatusLabel(scope.row.status) }}
                </ElTag>
                <ElProgress 
                  :percentage="getProgress(scope.row.status)" 
                  :stroke-width="4" 
                  :show-text="false"
                  class="status-progress"
                />
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="收货进度">
            <template #default="scope">
              <div class="progress-cell">
                <span class="progress-text">{{ getReceivedProgress(scope.row) }}%</span>
                <ElProgress 
                  :percentage="getReceivedProgress(scope.row)" 
                  :stroke-width="4" 
                  :show-text="false"
                  class="received-progress"
                />
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="预计送达" prop="deliveryDate" />
          <ElTableColumn label="操作" width="120">
            <template #default="scope">
              <div class="action-group">
                <button class="action-btn" @click="openDetail(scope.row)" title="查看详情">
                  <Monitor class="action-icon" />
                </button>
                <button class="action-btn" @click="openEditStatus(scope.row)" title="修改状态">
                  <Edit class="action-icon" />
                </button>
                <button class="action-btn delete-btn" @click="deleteOrder(scope.row)" title="删除订单">
                  <Delete class="action-icon" />
                </button>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>

    <ElDrawer title="订单详情" v-model="showDetailDrawer" direction="rtl" size="600px">
      <div v-if="selectedOrder" class="order-detail">
        <div class="detail-header">
          <div class="header-info">
            <span class="detail-id">{{ selectedOrder.id }}</span>
            <h2 class="detail-title">{{ selectedOrder.supplierName }}</h2>
          </div>
          <div class="header-tags">
            <ElTag :class="['status-tag', getStatusClass(selectedOrder.status)]">
              {{ getStatusLabel(selectedOrder.status) }}
            </ElTag>
            <ElTag :class="['payment-tag', getPaymentClass(selectedOrder.paymentStatus)]">
              {{ getPaymentLabel(selectedOrder.paymentStatus) }}
            </ElTag>
          </div>
        </div>

        <div class="detail-progress">
          <div class="progress-section">
            <span class="progress-label">订单进度</span>
            <div class="progress-bar-wrapper">
              <ElProgress 
                :percentage="getProgress(selectedOrder.status)" 
                :stroke-width="8" 
                class="main-progress"
              />
            </div>
            <div class="progress-steps">
              <span class="step" :class="{ active: getProgress(selectedOrder.status) >= 10 }">待审批</span>
              <span class="step" :class="{ active: getProgress(selectedOrder.status) >= 25 }">已审批</span>
              <span class="step" :class="{ active: getProgress(selectedOrder.status) >= 40 }">已下单</span>
              <span class="step" :class="{ active: getProgress(selectedOrder.status) >= 65 }">运输中</span>
              <span class="step" :class="{ active: getProgress(selectedOrder.status) >= 85 }">已收货</span>
              <span class="step" :class="{ active: getProgress(selectedOrder.status) >= 100 }">已完成</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">订单信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">供应商ID</span>
              <span class="info-value">{{ selectedOrder.supplierId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">合同编号</span>
              <span class="info-value">{{ selectedOrder.contractNo || '无' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">订单金额</span>
              <span class="info-value amount">{{ formatCurrency(selectedOrder.totalAmount) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">税额</span>
              <span class="info-value">{{ formatCurrency(selectedOrder.taxAmount) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ selectedOrder.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">预计送达</span>
              <span class="info-value">{{ selectedOrder.deliveryDate || '未指定' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">订单物品</h3>
          <ElTable :data="selectedOrder.items" class="items-table">
            <ElTableColumn prop="name" label="物品名称" />
            <ElTableColumn prop="specification" label="规格型号" />
            <ElTableColumn prop="unit" label="单位" />
            <ElTableColumn prop="quantity" label="数量" />
            <ElTableColumn prop="receivedQuantity" label="已收数量">
              <template #default="scope">{{ scope.row.receivedQuantity || 0 }}</template>
            </ElTableColumn>
            <ElTableColumn prop="unitPrice" label="单价">
              <template #default="scope">¥{{ scope.row.unitPrice }}</template>
            </ElTableColumn>
            <ElTableColumn prop="totalPrice" label="小计">
              <template #default="scope">¥{{ scope.row.totalPrice }}</template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="detail-actions">
          <ElButton>打印订单</ElButton>
          <ElButton>导出合同</ElButton>
          <ElButton type="primary">确认收货</ElButton>
        </div>
      </div>
    </ElDrawer>

    <ElDialog title="修改订单状态" v-model="showStatusModal" width="400px">
      <div v-if="editingOrder" class="status-modal creative-form">
        <div class="modal-info">
          <div class="info-row">
            <span class="info-label">订单编号</span>
            <span class="order-id">{{ editingOrder.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">当前状态</span>
            <ElTag :class="['status-tag', getStatusClass(editingOrder.status)]">{{ getStatusLabel(editingOrder.status) }}</ElTag>
          </div>
        </div>
        <div class="form-section">
          <ElFormItem label="新状态" class="form-item">
            <ElSelect v-model="newStatus" class="status-select-modal">
              <ElOption label="待审批" value="pending" />
              <ElOption label="已审批" value="approved" />
              <ElOption label="已下单" value="ordered" />
              <ElOption label="运输中" value="shipping" />
              <ElOption label="已收货" value="received" />
              <ElOption label="已完成" value="completed" />
            </ElSelect>
          </ElFormItem>
        </div>
      </div>
      <template #footer>
        <ElButton @click="showStatusModal = false">取消</ElButton>
        <ElButton type="primary" @click="updateStatus">确认修改</ElButton>
      </template>
    </ElDialog>

    <ElDialog title="新建采购订单" v-model="showCreateModal" width="600px">
      <div class="create-modal creative-form">
        <div class="form-section">
          <ElFormItem label="供应商" class="form-item">
            <ElSelect v-model="newOrder.supplierId" @change="handleSupplierChange" class="form-select">
              <ElOption label="请选择供应商" value="" />
              <ElOption v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
            </ElSelect>
          </ElFormItem>
        </div>

        <div class="form-section">
          <ElFormItem label="合同编号" class="form-item">
            <ElInput v-model="newOrder.contractNo" class="form-input" placeholder="请输入合同编号" />
          </ElFormItem>
        </div>

        <div class="form-section">
          <ElFormItem label="预计送达日期" class="form-item">
            <ElInput v-model="newOrder.deliveryDate" type="date" class="form-input" />
          </ElFormItem>
        </div>

        <div class="items-section">
          <div class="section-header">
            <span class="section-title">订单物品</span>
            <ElButton type="primary" size="small" class="add-item-btn" @click="addItem">
              <Plus />
              添加物品
            </ElButton>
          </div>
          
          <div v-for="(item, index) in newOrder.items" :key="item.id" class="item-row">
            <ElFormItem label="物品名称" class="item-form-item">
              <ElInput v-model="item.name" class="form-input-sm" placeholder="物品名称" />
            </ElFormItem>
            <ElFormItem label="规格型号" class="item-form-item">
              <ElInput v-model="item.specification" class="form-input-sm" placeholder="规格型号" />
            </ElFormItem>
            <ElFormItem label="单位" class="item-form-item">
              <ElInput v-model="item.unit" class="form-input-sm" placeholder="单位" />
            </ElFormItem>
            <ElFormItem label="数量" class="item-form-item">
              <ElInput v-model.number="item.quantity" type="number" class="form-input-sm" @change="calculateItemTotal(index)" />
            </ElFormItem>
            <ElFormItem label="单价" class="item-form-item">
              <ElInput v-model.number="item.unitPrice" type="number" class="form-input-sm" @change="calculateItemTotal(index)" />
            </ElFormItem>
            <ElFormItem label="小计" class="item-form-item">
              <ElInput :value="'¥' + item.totalPrice" disabled class="form-input-sm disabled-input" />
            </ElFormItem>
            <div class="item-actions">
              <ElButton v-if="newOrder.items.length > 1" type="danger" size="small" @click="removeItem(index)">
                删除
              </ElButton>
            </div>
          </div>
        </div>

        <div class="total-section">
          <div class="total-row">
            <span class="total-label">订单金额</span>
            <span class="total-value">¥{{ newOrder.totalAmount.toLocaleString() }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">税额(13%)</span>
            <span class="total-value">¥{{ newOrder.taxAmount.toLocaleString() }}</span>
          </div>
          <div class="total-row total-row-highlight">
            <span class="total-label">合计金额</span>
            <span class="total-value highlight">¥{{ (newOrder.totalAmount + newOrder.taxAmount).toLocaleString() }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <ElButton @click="closeCreateModal">取消</ElButton>
        <ElButton type="primary" @click="createOrder">创建订单</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.orders-page {
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

.status-select {
  width: 140px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.orders-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-cards {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon.pending {
  background: rgba(255, 125, 0, 0.1);
  color: var(--warning-color);
}

.stat-icon.shipping {
  background: rgba(22, 93, 255, 0.1);
  color: var(--primary-color);
}

.stat-icon.completed {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.orders-list-card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.orders-table {
  --el-table-header-text-color: var(--text-secondary);
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  align-self: flex-start;
}

.status-tag.pending {
  background: rgba(255, 125, 0, 0.1);
  color: var(--warning-color);
}

.status-tag.approved {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.status-tag.ordered {
  background: rgba(22, 93, 255, 0.1);
  color: var(--primary-color);
}

.status-tag.shipping {
  background: rgba(137, 92, 246, 0.1);
  color: var(--info-color);
}

.status-tag.received {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.status-tag.completed {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.status-progress {
  width: 100%;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
}

.received-progress {
  flex: 1;
}

.payment-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.payment-tag.unpaid {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.payment-tag.partial {
  background: rgba(255, 125, 0, 0.1);
  color: var(--warning-color);
}

.payment-tag.paid {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
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

.order-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.detail-id {
  font-size: 12px;
  color: var(--primary-color);
}

.detail-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 4px 0 0 0;
}

.header-tags {
  display: flex;
  gap: 8px;
}

.detail-progress {
  background: var(--bg-primary);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.main-progress {
  width: 100%;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
}

.step {
  font-size: 12px;
  color: var(--text-placeholder);
}

.step.active {
  color: var(--primary-color);
  font-weight: 500;
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

.info-value.amount {
  font-weight: 600;
  color: var(--primary-color);
}

.items-table {
  --el-table-header-text-color: var(--text-secondary);
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.status-modal {
  padding: 16px;
}

.modal-info {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.form-section {
  margin-top: 16px;
}

.form-item {
  margin-bottom: 0;
}

.status-select-modal {
  width: 100%;
}

.create-modal {
  padding: 16px;
}

.form-section {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 0;
}

.form-select {
  width: 100%;
}

.form-input {
  width: 100%;
}

.form-input-sm {
  width: 100%;
}

.disabled-input {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.items-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.add-item-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-row {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.item-form-item {
  flex: 1;
  min-width: 100px;
  max-width: 150px;
  margin-bottom: 0;
}

.item-form-item :deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

.item-form-item :deep(.el-form-item__label) {
  width: 60px;
  text-align: right;
  padding-right: 8px;
  flex-shrink: 0;
}

.item-form-item :deep(.el-input__wrapper) {
  flex: 1;
  min-width: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.total-section {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
}

.total-row-highlight {
  margin-top: 8px;
  padding-top: 12px;
}

.total-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.total-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  
  &.highlight {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-color);
  }
}
</style>

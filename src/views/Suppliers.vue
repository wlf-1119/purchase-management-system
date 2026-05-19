<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useSuppliersStore } from '@/stores/suppliers'
import type { Supplier } from '@/types'
import { Plus, Search, Filter, Star, Edit, Delete, Monitor, WarningFilled } from '@element-plus/icons-vue'
import { ElCard, ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElTag, ElDrawer } from 'element-plus'

const suppliersStore = useSuppliersStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailDrawer = ref(false)
const selectedSupplier = ref<Supplier | null>(null)
interface EditSupplierForm {
  id: string
  name: string
  shortName: string
  contact: string
  phone: string
  email: string
  address: string
  category: string
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'inactive'
  creditScore: number
  createTime: string
  cooperationHistory: Array<{ date: string; amount: number; type: 'purchase' | 'service' | 'other' }>
  qualificationExpireDate?: string
}

const editingSupplier = ref<EditSupplierForm | null>(null)
const searchQuery = ref('')
const riskFilter = ref('all')
const mapChartRef = ref<HTMLDivElement | null>(null)

const filteredSuppliers = computed(() => {
  let result = suppliersStore.suppliers
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.shortName.toLowerCase().includes(query) ||
      s.contact.toLowerCase().includes(query)
    )
  }
  if (riskFilter.value !== 'all') {
    result = result.filter(s => s.riskLevel === riskFilter.value)
  }
  return result
})

const supplierDistribution = computed(() => [
  { name: '广东', value: 3 },
  { name: '上海', value: 1 },
  { name: '北京', value: 1 },
  { name: '浙江', value: 1 }
])

const newSupplier = ref({
  name: '',
  shortName: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  category: '',
  riskLevel: 'low' as const
})

function getRiskLevelClass(level: string): string {
  switch (level) {
    case 'high': return 'high'
    case 'medium': return 'medium'
    default: return 'low'
  }
}

function getRiskLevelLabel(level: string): string {
  switch (level) {
    case 'high': return '高风险'
    case 'medium': return '中风险'
    default: return '低风险'
  }
}

function getStatusLabel(status: string): string {
  return status === 'active' ? '合作中' : '已停用'
}

function openDetail(supplier: Supplier) {
  selectedSupplier.value = supplier
  showDetailDrawer.value = true
}

function openEdit(supplier: Supplier) {
  editingSupplier.value = { ...supplier, category: supplier.category.join(', ') }
  showEditModal.value = true
}

function submitEdit() {
  if (editingSupplier.value) {
    suppliersStore.updateSupplier({
      ...editingSupplier.value,
      category: editingSupplier.value.category.split(',').map(s => s.trim())
    })
    showEditModal.value = false
    editingSupplier.value = null
  }
}

function deleteSupplier(id: string) {
  if (confirm('确定要删除该供应商吗？')) {
    suppliersStore.deleteSupplier(id)
  }
}

function submitSupplier() {
  suppliersStore.addSupplier({
    ...newSupplier.value,
    creditScore: 85,
    status: 'active',
    createTime: new Date().toISOString().split('T')[0],
    category: newSupplier.value.category.split(',').map(s => s.trim()),
    cooperationHistory: []
  })
  showAddModal.value = false
  newSupplier.value = {
    name: '',
    shortName: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    category: '',
    riskLevel: 'low'
  }
}

onMounted(() => {
  initMapChart()
})

function initMapChart() {
  if (mapChartRef.value) {
    const chart = echarts.init(mapChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: { name: string; value: number }) => {
          return `${params.name}: ${params.value} 家供应商`
        }
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          center: ['50%', '50%'],
          data: supplierDistribution.value.map((item, index) => ({
            ...item,
            itemStyle: {
              color: ['#0ABAB5', '#00B42A', '#8F5CF6', '#FF7D00'][index]
            }
          })),
          label: {
            fontSize: 12
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          }
        }
      ]
    }
    chart.setOption(option)
  }
}
</script>

<template>
  <div class="suppliers-page">
    <div class="page-header">
      <div class="header-actions">
        <div class="search-bar">
          <Search class="search-icon" />
          <input v-model="searchQuery" placeholder="搜索供应商名称、联系人..." class="search-input" />
        </div>
        <div class="filter-bar">
          <Filter class="filter-icon" />
          <ElSelect v-model="riskFilter" placeholder="风险等级" class="filter-select">
            <ElOption label="全部" value="all" />
            <ElOption label="低风险" value="low" />
            <ElOption label="中风险" value="medium" />
            <ElOption label="高风险" value="high" />
          </ElSelect>
        </div>
        <ElButton type="primary" class="add-btn" @click="showAddModal = true">
          <Plus />
          新增供应商
        </ElButton>
      </div>
    </div>

    <div class="page-content">
      <div class="left-panel">
        <ElCard class="map-card">
          <h3 class="card-title">供应商分布</h3>
          <div ref="mapChartRef" class="map-chart"></div>
        </ElCard>
      </div>

      <div class="right-panel">
        <ElCard class="supplier-list-card">
          <div class="card-header">
            <h3 class="card-title">供应商列表</h3>
            <span class="total-count">共 {{ filteredSuppliers.length }} 家</span>
          </div>
          <ElTable :data="filteredSuppliers" class="supplier-table">
            <ElTableColumn prop="name" label="供应商名称" min-width="200">
              <template #default="scope">
                <div class="supplier-name">
                  <span class="full-name">{{ scope.row.name }}</span>
                  <span class="short-name">{{ scope.row.shortName }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="contact" label="联系人" />
            <ElTableColumn prop="phone" label="联系电话" />
            <ElTableColumn label="信用评分">
              <template #default="scope">
                <div class="score-wrapper">
                  <Star class="star-icon" />
                  <span class="score-value">{{ scope.row.creditScore }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="风险等级">
              <template #default="scope">
                <ElTag :class="['risk-tag', getRiskLevelClass(scope.row.riskLevel)]">
                  {{ getRiskLevelLabel(scope.row.riskLevel) }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="状态">
              <template #default="scope">
                <span :class="['status-badge', scope.row.status]">
                  {{ getStatusLabel(scope.row.status) }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="160">
              <template #default="scope">
                <div class="action-group">
                  <button class="action-btn edit-btn" @click="openEdit(scope.row)" title="编辑">
                    <Edit class="action-icon" />
                  </button>
                  <button class="action-btn delete-btn" @click="deleteSupplier(scope.row.id)" title="删除">
                    <Delete class="action-icon" />
                  </button>
                  <button class="action-btn detail-btn" @click="openDetail(scope.row)" title="详情">
                    <Monitor class="action-icon" />
                  </button>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </div>
    </div>

    <ElDialog title="新增供应商" v-model="showAddModal" width="500px">
      <ElForm :model="newSupplier" class="supplier-form creative-form">
        <ElFormItem label="供应商全称" prop="name">
          <ElInput v-model="newSupplier.name" placeholder="请输入供应商全称" />
        </ElFormItem>
        <ElFormItem label="简称" prop="shortName">
          <ElInput v-model="newSupplier.shortName" placeholder="请输入简称" />
        </ElFormItem>
        <ElFormItem label="联系人" prop="contact">
          <ElInput v-model="newSupplier.contact" placeholder="请输入联系人" />
        </ElFormItem>
        <ElFormItem label="联系电话" prop="phone">
          <ElInput v-model="newSupplier.phone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="newSupplier.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="地址" prop="address">
          <ElInput v-model="newSupplier.address" placeholder="请输入地址" />
        </ElFormItem>
        <ElFormItem label="品类" prop="category">
          <ElInput v-model="newSupplier.category" placeholder="多个品类用逗号分隔" />
        </ElFormItem>
        <ElFormItem label="风险等级" prop="riskLevel">
          <ElSelect v-model="newSupplier.riskLevel">
            <ElOption label="低风险" value="low" />
            <ElOption label="中风险" value="medium" />
            <ElOption label="高风险" value="high" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddModal = false">取消</ElButton>
        <ElButton type="primary" @click="submitSupplier">确认添加</ElButton>
      </template>
    </ElDialog>

    <ElDialog title="编辑供应商" v-model="showEditModal" width="500px">
      <ElForm v-if="editingSupplier" :model="editingSupplier" class="supplier-form creative-form">
        <ElFormItem label="供应商全称" prop="name">
          <ElInput v-model="editingSupplier.name" placeholder="请输入供应商全称" />
        </ElFormItem>
        <ElFormItem label="简称" prop="shortName">
          <ElInput v-model="editingSupplier.shortName" placeholder="请输入简称" />
        </ElFormItem>
        <ElFormItem label="联系人" prop="contact">
          <ElInput v-model="editingSupplier.contact" placeholder="请输入联系人" />
        </ElFormItem>
        <ElFormItem label="联系电话" prop="phone">
          <ElInput v-model="editingSupplier.phone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="editingSupplier.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="地址" prop="address">
          <ElInput v-model="editingSupplier.address" placeholder="请输入地址" />
        </ElFormItem>
        <ElFormItem label="品类" prop="category">
          <ElInput v-model="editingSupplier.category" placeholder="多个品类用逗号分隔" />
        </ElFormItem>
        <ElFormItem label="风险等级" prop="riskLevel">
          <ElSelect v-model="editingSupplier.riskLevel">
            <ElOption label="低风险" value="low" />
            <ElOption label="中风险" value="medium" />
            <ElOption label="高风险" value="high" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showEditModal = false">取消</ElButton>
        <ElButton type="primary" @click="submitEdit">确认修改</ElButton>
      </template>
    </ElDialog>

    <ElDrawer title="供应商详情" v-model="showDetailDrawer" direction="rtl" size="500px">
      <div v-if="selectedSupplier" class="supplier-detail">
        <div class="detail-header">
          <div class="header-info">
            <h2 class="detail-name">{{ selectedSupplier.name }}</h2>
            <span class="detail-short">{{ selectedSupplier.shortName }}</span>
          </div>
          <ElTag :class="['risk-tag', getRiskLevelClass(selectedSupplier.riskLevel)]">
            {{ getRiskLevelLabel(selectedSupplier.riskLevel) }}
          </ElTag>
        </div>

        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">联系人</span>
              <span class="info-value">{{ selectedSupplier.contact }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">联系电话</span>
              <span class="info-value">{{ selectedSupplier.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ selectedSupplier.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">地址</span>
              <span class="info-value">{{ selectedSupplier.address }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">信用评分</span>
              <span class="info-value score">{{ selectedSupplier.creditScore }} <Star class="star" /></span>
            </div>
            <div class="info-item">
              <span class="info-label">合作状态</span>
              <span :class="['info-value', 'status', selectedSupplier.status]">
                {{ getStatusLabel(selectedSupplier.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">合作品类</h3>
          <div class="category-tags">
            <ElTag v-for="cat in selectedSupplier.category" :key="cat" class="category-tag">
              {{ cat }}
            </ElTag>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">合作记录</h3>
          <div v-if="selectedSupplier.cooperationHistory.length === 0" class="empty-history">
            <p>暂无合作记录</p>
          </div>
          <div v-else class="history-list">
            <div v-for="(record, index) in selectedSupplier.cooperationHistory" :key="index" class="history-item">
              <span class="history-date">{{ record.date }}</span>
              <span class="history-amount">¥{{ record.amount.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedSupplier.qualificationExpireDate" class="expire-warning">
          <WarningFilled class="warning-icon" />
          <span>资质到期时间: {{ selectedSupplier.qualificationExpireDate }}</span>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<style scoped>
.suppliers-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  background: var(--bg-card);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 8px 12px;
  width: 300px;
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
  width: 120px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
}

.page-content {
  display: flex;
  gap: 20px;
}

.left-panel {
  width: 320px;
  flex-shrink: 0;
}

.right-panel {
  flex: 1;
}

.map-card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
}

.title-icon {
  color: var(--primary-color);
}

.map-chart {
  height: 200px;
}

.supplier-list-card {
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

.total-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.supplier-table {
  --el-table-header-text-color: var(--text-secondary);
  --el-table-row-hover-bg-color: var(--bg-hover);
}

.supplier-name {
  display: flex;
  flex-direction: column;
}

.full-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.short-name {
  font-size: 12px;
  color: var(--text-placeholder);
}

.score-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-icon {
  color: #FFB800;
}

.score-value {
  font-weight: 600;
  color: var(--text-primary);
}

.risk-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.risk-tag.low {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.risk-tag.medium {
  background: rgba(255, 125, 0, 0.1);
  color: var(--warning-color);
}

.risk-tag.high {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.status-badge.active {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.status-badge.inactive {
  background: rgba(137, 149, 158, 0.1);
  color: var(--text-placeholder);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  color: #FFA500;
}

.action-btn:hover {
  background: var(--bg-hover);
}

.action-icon {
  width: 16px;
  height: 16px;
}

.edit-btn:hover {
  background: rgba(22, 93, 255, 0.1);
  color: var(--primary-color);
}

.delete-btn:hover {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.detail-btn:hover {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.supplier-form {
  padding: 20px 0;
}

.supplier-detail {
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

.header-info {
  display: flex;
  flex-direction: column;
}

.detail-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.detail-short {
  font-size: 14px;
  color: var(--text-secondary);
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

.info-value.score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.info-value.score .star {
  color: #FFB800;
}

.info-value.status.active {
  color: var(--success-color);
}

.info-value.status.inactive {
  color: var(--text-placeholder);
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.empty-history {
  padding: 20px;
  text-align: center;
  color: var(--text-placeholder);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.history-date {
  font-size: 13px;
  color: var(--text-secondary);
}

.history-amount {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.expire-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 125, 0, 0.1);
  border-radius: 8px;
  color: var(--warning-color);
  font-size: 13px;
  margin-top: 12px;
}

.warning-icon {
  width: 18px;
  height: 18px;
}
</style>

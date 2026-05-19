<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePurchaseRequestsStore } from '@/stores/purchaseRequests';
import type { PurchaseRequest, RequestItem } from '@/types';
import { Plus, Check, Monitor, Document, Minus, Delete } from '@element-plus/icons-vue';
import { ElCard, ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElTag, ElDrawer, ElRow, ElCol } from 'element-plus';

const approvalComment = ref('');
const requestsStore = usePurchaseRequestsStore();
const showAddModal = ref(false);
const showDetailDrawer = ref(false);
const showApproveModal = ref(false);
const selectedRequest = ref<PurchaseRequest | null>(null);
const viewMode = ref<'list' | 'kanban'>('list');
const statusFilter = ref('all');
const filteredRequests = computed(() => {
 if (statusFilter.value === 'all') {
 return requestsStore.requests;
 }
 return requestsStore.requests.filter(r => r.status === statusFilter.value);
});
const newRequest = ref({
 title: '',
 requester: '',
 department: '',
 budgetCode: '',
 reason: '',
 items: [] as RequestItem[]
});
const newItem = ref({
 name: '',
 specification: '',
 unit: '',
 quantity: 1,
 unitPrice: 0
});
function getStatusClass(status: string): string {
 switch (status) {
 case 'pending': return 'pending';
 case 'approved': return 'approved';
 case 'rejected': return 'rejected';
 default: return 'draft';
 }
}
function getStatusLabel(status: string): string {
 switch (status) {
 case 'pending': return '待审批';
 case 'approved': return '已通过';
 case 'rejected': return '已驳回';
 default: return '草稿';
 }
}
function openDetail(request: PurchaseRequest) {
 selectedRequest.value = request;
 showDetailDrawer.value = true;
}
function openApprove(request: PurchaseRequest) {
 selectedRequest.value = request;
 showApproveModal.value = true;
}
function approve() {
 if (selectedRequest.value) {
 requestsStore.approveRequest(selectedRequest.value.id);
 showApproveModal.value = false;
 selectedRequest.value = null;
 }
}
function reject() {
 if (selectedRequest.value) {
 requestsStore.rejectRequest(selectedRequest.value.id, '驳回原因');
 showApproveModal.value = false;
 selectedRequest.value = null;
 }
}
function addItem() {
 newRequest.value.items.push({
 id: Date.now().toString(),
 name: newItem.value.name,
 specification: newItem.value.specification,
 unit: newItem.value.unit,
 quantity: newItem.value.quantity,
 unitPrice: newItem.value.unitPrice,
 totalPrice: newItem.value.quantity * newItem.value.unitPrice,
 category: ''
 });
 newItem.value = { name: '', specification: '', unit: '', quantity: 1, unitPrice: 0 };
}
function removeItem(index: number) {
 newRequest.value.items.splice(index, 1);
}
function submitRequest() {
 const totalAmount = newRequest.value.items.reduce((sum, item) => sum + item.totalPrice, 0);
 requestsStore.addRequest({
 ...newRequest.value,
 totalAmount,
 status: 'pending',
 createTime: new Date().toISOString(),
 updateTime: new Date().toISOString(),
 approvalHistory: []
 });
 showAddModal.value = false;
 newRequest.value = { title: '', requester: '', department: '', budgetCode: '', reason: '', items: [] };
}
function formatCurrency(value: number): string {
 if (value >= 10000) {
 return (value / 10000).toFixed(1) + '万';
 }
 return '¥' + value.toLocaleString();
}
function deleteRequest(request: PurchaseRequest) {
 if (confirm(`确定要删除采购申请 ${request.id} 吗？`)) {
 requestsStore.deleteRequest(request.id);
 }
}
</script>

<template>
  <div class="requests-page">
    <div class="page-header">
      <div class="header-left">
        <div class="view-toggle">
          <button
            :class="['toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            列表视图
          </button>
          <button
            :class="['toggle-btn', { active: viewMode === 'kanban' }]"
            @click="viewMode = 'kanban'"
          >
            看板视图
          </button>
        </div>
      </div>
      <div class="header-right">
        <ElSelect v-model="statusFilter" class="status-select">
          <ElOption label="全部" value="all" />
          <ElOption label="待审批" value="pending" />
          <ElOption label="已通过" value="approved" />
          <ElOption label="已驳回" value="rejected" />
        </ElSelect>
        <ElButton type="primary" class="add-btn" @click="showAddModal = true">
          <Plus />
          新建申请
        </ElButton>
      </div>
    </div>

    <div v-if="viewMode === 'list'" class="list-view">
      <ElCard class="request-list-card">
        <ElTable :data="filteredRequests" class="request-table">
          <ElTableColumn prop="id" label="申请编号" />
          <ElTableColumn prop="title" label="申请标题" min-width="200" />
          <ElTableColumn prop="requester" label="申请人" />
          <ElTableColumn prop="department" label="部门" />
          <ElTableColumn label="金额">
            <template #default="scope">{{ formatCurrency(scope.row.totalAmount) }}</template>
          </ElTableColumn>
          <ElTableColumn label="状态">
            <template #default="scope">
              <ElTag :class="['status-tag', getStatusClass(scope.row.status)]">
                {{ getStatusLabel(scope.row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="创建时间" prop="createTime" width="160">
            <template #default="scope">{{ scope.row.createTime.split('T')[0] }}</template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="120">
            <template #default="scope">
              <div class="action-group">
                <button class="action-btn" @click="openDetail(scope.row)" title="查看详情">
                  <Monitor class="action-icon" />
                </button>
                <button
                  v-if="scope.row.status === 'pending'"
                  class="action-btn"
                  @click="openApprove(scope.row)"
                  title="审批通过"
                >
                  <Check class="action-icon" />
                </button>
                <button class="action-btn delete-btn" @click="deleteRequest(scope.row)" title="删除申请">
                  <Delete class="action-icon" />
                </button>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>

    <div v-else class="kanban-view">
      <div class="kanban-column">
        <div class="column-header">
          <span class="column-title">待审批</span>
          <span class="column-count">{{ filteredRequests.filter(r => r.status === 'pending').length }}</span>
        </div>
        <div class="column-content">
          <div
            v-for="req in filteredRequests.filter(r => r.status === 'pending')"
            :key="req.id"
            class="kanban-card"
            @click="openDetail(req)"
          >
            <div class="card-header">
              <span class="card-id">{{ req.id }}</span>
              <ElTag class="priority-tag">普通</ElTag>
            </div>
            <h4 class="card-title">{{ req.title }}</h4>
            <p class="card-meta">{{ req.requester }} · {{ req.department }}</p>
            <div class="card-footer">
              <span class="card-amount">{{ formatCurrency(req.totalAmount) }}</span>
              <button class="quick-approve" @click.stop="openApprove(req)">
                <Check />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="kanban-column">
        <div class="column-header">
          <span class="column-title approved">已通过</span>
          <span class="column-count">{{ filteredRequests.filter(r => r.status === 'approved').length }}</span>
        </div>
        <div class="column-content">
          <div
            v-for="req in filteredRequests.filter(r => r.status === 'approved')"
            :key="req.id"
            class="kanban-card"
            @click="openDetail(req)"
          >
            <div class="card-header">
              <span class="card-id">{{ req.id }}</span>
            </div>
            <h4 class="card-title">{{ req.title }}</h4>
            <p class="card-meta">{{ req.requester }} · {{ req.department }}</p>
            <div class="card-footer">
              <span class="card-amount">{{ formatCurrency(req.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="kanban-column">
        <div class="column-header">
          <span class="column-title rejected">已驳回</span>
          <span class="column-count">{{ filteredRequests.filter(r => r.status === 'rejected').length }}</span>
        </div>
        <div class="column-content">
          <div
            v-for="req in filteredRequests.filter(r => r.status === 'rejected')"
            :key="req.id"
            class="kanban-card"
            @click="openDetail(req)"
          >
            <div class="card-header">
              <span class="card-id">{{ req.id }}</span>
            </div>
            <h4 class="card-title">{{ req.title }}</h4>
            <p class="card-meta">{{ req.requester }} · {{ req.department }}</p>
            <div class="card-footer">
              <span class="card-amount">{{ formatCurrency(req.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog title="新建采购申请" v-model="showAddModal" width="700px">
      <ElForm :model="newRequest" class="request-form creative-form">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="申请标题" prop="title">
              <ElInput v-model="newRequest.title" placeholder="请输入申请标题" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="预算编号" prop="budgetCode">
              <ElInput v-model="newRequest.budgetCode" placeholder="请输入预算编号" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="申请人" prop="requester">
              <ElInput v-model="newRequest.requester" placeholder="请输入申请人" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="部门" prop="department">
              <ElSelect v-model="newRequest.department">
                <ElOption label="财务部" value="财务部" />
                <ElOption label="生产部" value="生产部" />
                <ElOption label="研发部" value="研发部" />
                <ElOption label="采购部" value="采购部" />
                <ElOption label="行政部" value="行政部" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="申请理由" prop="reason">
          <ElInput type="textarea" v-model="newRequest.reason" placeholder="请输入申请理由" :rows="3" />
        </ElFormItem>

        <div class="items-section">
          <h4 class="section-title">采购物品</h4>
          <div v-if="newRequest.items.length === 0" class="empty-items">
            <Document class="empty-icon" />
            <p>暂无采购物品</p>
          </div>
          <div v-else class="items-list">
            <div v-for="(item, index) in newRequest.items" :key="item.id" class="item-row">
              <ElInput :value="item.name" placeholder="物品名称" />
              <ElInput :value="item.specification" placeholder="规格型号" />
              <ElInput :value="item.unit" placeholder="单位" />
              <ElNumber :value="item.quantity" :min="1" />
              <ElNumber :value="item.unitPrice" :min="0" />
              <span class="item-total">¥{{ item.totalPrice }}</span>
              <button class="remove-item" @click="removeItem(index)">
                <Minus />
              </button>
            </div>
          </div>
          <div class="add-item-row">
            <ElInput v-model="newItem.name" placeholder="物品名称" />
            <ElInput v-model="newItem.specification" placeholder="规格型号" />
            <ElInput v-model="newItem.unit" placeholder="单位" />
            <ElNumber v-model="newItem.quantity" :min="1" />
            <ElNumber v-model="newItem.unitPrice" :min="0" />
            <button class="add-item-btn" @click="addItem">
              <Plus />
            </button>
          </div>
        </div>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddModal = false">取消</ElButton>
        <ElButton type="primary" @click="submitRequest">提交申请</ElButton>
      </template>
    </ElDialog>

    <ElDrawer title="申请详情" v-model="showDetailDrawer" direction="rtl" size="600px">
      <div v-if="selectedRequest" class="request-detail">
        <div class="detail-header">
          <div class="header-info">
            <span class="detail-id">{{ selectedRequest.id }}</span>
            <h2 class="detail-title">{{ selectedRequest.title }}</h2>
          </div>
          <ElTag :class="['status-tag', getStatusClass(selectedRequest.status)]">
            {{ getStatusLabel(selectedRequest.status) }}
          </ElTag>
        </div>

        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">申请人</span>
              <span class="info-value">{{ selectedRequest.requester }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">部门</span>
              <span class="info-value">{{ selectedRequest.department }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">预算编号</span>
              <span class="info-value">{{ selectedRequest.budgetCode }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请金额</span>
              <span class="info-value amount">{{ formatCurrency(selectedRequest.totalAmount) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ selectedRequest.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">申请理由</span>
              <span class="info-value">{{ selectedRequest.reason || '无' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">采购物品</h3>
          <ElTable :data="selectedRequest.items" class="items-table">
            <ElTableColumn prop="name" label="物品名称" />
            <ElTableColumn prop="specification" label="规格型号" />
            <ElTableColumn prop="unit" label="单位" />
            <ElTableColumn prop="quantity" label="数量" />
            <ElTableColumn prop="unitPrice" label="单价">
              <template #default="scope">¥{{ scope.row.unitPrice }}</template>
            </ElTableColumn>
            <ElTableColumn prop="totalPrice" label="小计">
              <template #default="scope">¥{{ scope.row.totalPrice }}</template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="detail-section">
          <h3 class="section-title">审批流程</h3>
          <div v-if="selectedRequest.approvalHistory.length === 0" class="empty-history">
            <p>暂无审批记录</p>
          </div>
          <div v-else class="approval-timeline">
            <div
              v-for="record in selectedRequest.approvalHistory"
              :key="record.id"
              class="timeline-item"
            >
              <div class="timeline-dot" :class="record.action"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-name">{{ record.approver }}</span>
                  <span class="timeline-role">{{ record.role }}</span>
                </div>
                <span class="timeline-action" :class="record.action">
                  {{ record.action === 'approve' ? '已通过' : record.action === 'reject' ? '已驳回' : '待处理' }}
                </span>
                <span class="timeline-time">{{ record.time }}</span>
                <p v-if="record.comment" class="timeline-comment">{{ record.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedRequest.status === 'pending'" class="detail-actions">
          <ElButton type="primary" @click="openApprove(selectedRequest)">审批通过</ElButton>
          <ElButton @click="reject">驳回申请</ElButton>
        </div>
      </div>
    </ElDrawer>

    <ElDialog title="审批确认" v-model="showApproveModal">
      <div class="approve-modal">
        <p class="modal-message">确认审批通过此采购申请？</p>
        <ElInput type="textarea" v-model="approvalComment" placeholder="请输入审批意见（可选）" :rows="3" />
      </div>
      <template #footer>
        <ElButton @click="showApproveModal = false">取消</ElButton>
        <ElButton type="primary" @click="approve">确认通过</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.requests-page {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #FFFFFF;
  box-shadow: var(--shadow-sm);
  font-weight: 500;
}

.status-select {
  width: 120px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn :deep(svg) {
  width: 16px !important;
  height: 16px !important;
}

.list-view {
  flex: 1;
}

.request-list-card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.request-table {
  --el-table-header-text-color: var(--text-secondary);
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.status-tag.pending {
  background: rgba(255, 125, 0, 0.1);
  color: var(--warning-color);
}

.status-tag.approved {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.status-tag.rejected {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.status-tag.draft {
  background: rgba(137, 92, 246, 0.1);
  color: var(--info-color);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: var(--bg-primary);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #FFA500;
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

.kanban-view {
  display: flex;
  gap: 20px;
}

.kanban-column {
  flex: 1;
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.column-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.column-title.approved {
  color: var(--success-color);
}

.column-title.rejected {
  color: var(--danger-color);
}

.column-count {
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.column-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kanban-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-id {
  font-size: 12px;
  color: var(--text-placeholder);
}

.priority-tag {
  font-size: 10px;
  padding: 1px 6px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.card-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.quick-approve {
  background: rgba(0, 180, 42, 0.1);
  border: none;
  border-radius: 6px;
  padding: 4px;
  color: var(--success-color);
  cursor: pointer;
}

.request-form {
  padding: 20px 0;
}

.items-section {
  margin-top: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: var(--text-placeholder);
}

.empty-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row,
.add-item-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-row > *,
.add-item-row > * {
  flex: 1;
}

.item-total {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
  width: 80px;
  text-align: right;
}

.remove-item,
.add-item-btn {
  background: var(--bg-primary);
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
}

.add-item-btn {
  background: var(--primary-color);
  color: #FFFFFF;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-item-btn svg {
  width: 18px;
  height: 18px;
}

.request-detail {
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
  --el-table-row-hover-bg-color: transparent;
}

.empty-history {
  padding: 20px;
  text-align: center;
  color: var(--text-placeholder);
}

.approval-timeline {
  padding-left: 20px;
  position: relative;
}

.approval-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -17px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--border-color);
}

.timeline-dot.approve {
  background: var(--success-color);
}

.timeline-dot.reject {
  background: var(--danger-color);
}

.timeline-content {
  margin-left: 12px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.timeline-role {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
}

.timeline-action {
  display: block;
  font-size: 13px;
  margin: 4px 0;
}

.timeline-action.approve {
  color: var(--success-color);
}

.timeline-action.reject {
  color: var(--danger-color);
}

.timeline-time {
  display: block;
  font-size: 12px;
  color: var(--text-placeholder);
}

.timeline-comment {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 8px;
  border-radius: 6px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.approve-modal {
  padding: 20px 0;
}

.modal-message {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}
</style>

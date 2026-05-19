<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { useSuppliersStore } from '@/stores/suppliers'
import { usePurchaseRequestsStore } from '@/stores/purchaseRequests'
import { usePurchaseOrdersStore } from '@/stores/purchaseOrders'
import { mockDashboardStats } from '@/data/mockData'
import { Clock, TrendCharts, WarningFilled, User, Clock as EmptyIcon } from '@element-plus/icons-vue'
import { ElCard } from 'element-plus'

const suppliersStore = useSuppliersStore()
const requestsStore = usePurchaseRequestsStore()
const ordersStore = usePurchaseOrdersStore()

const chartRef = ref<HTMLDivElement | null>(null)
const categoryChartRef = ref<HTMLDivElement | null>(null)

const stats = computed(() => ({
  totalAmount: mockDashboardStats.totalPurchaseAmount,
  pendingRequests: requestsStore.pendingRequests.length,
  pendingOrders: ordersStore.pendingOrders.length,
  supplierCount: suppliersStore.suppliers.length,
  riskSuppliers: suppliersStore.highRiskSuppliers.length,
  monthlyData: mockDashboardStats.monthlyData
}))

function formatCurrency(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  return value.toLocaleString()
}

onMounted(() => {
  initCharts()
})

function initCharts() {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E6EB',
        borderWidth: 1,
        textStyle: { color: '#1D2129' },
        formatter: (params: { axisValue: string; seriesName: string; value: number }[]) => {
          let result = `<div style="padding: 8px;"><strong>${params[0].axisValue}</strong></div>`
          params.forEach(item => {
            result += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span>${item.seriesName}</span>
              <span style="font-weight: 600; margin-left: 20px;">¥${formatCurrency(item.value)}</span>
            </div>`
          })
          return result
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: stats.value.monthlyData.map(d => d.month),
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        axisLabel: { color: '#646A73' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F0F1F5' } },
        axisLabel: {
          color: '#646A73',
          formatter: (value: number) => formatCurrency(value)
        }
      },
      series: [
        {
          name: '采购金额',
          type: 'line',
          data: stats.value.monthlyData.map(d => d.amount),
          smooth: true,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#0ABAB5' },
              { offset: 1, color: '#8F5CF6' }
            ])
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(10, 186, 181, 0.15)' },
              { offset: 1, color: 'rgba(10, 186, 181, 0.02)' }
            ])
          },
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#FFFFFF',
            borderWidth: 3,
            borderColor: '#0ABAB5'
          }
        }
      ]
    }
    chart.setOption(option)

    window.addEventListener('resize', () => chart.resize())
  }

  if (categoryChartRef.value) {
    const chart = echarts.init(categoryChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E6EB',
        borderWidth: 1,
        textStyle: { color: '#1D2129' },
        formatter: (params: { name: string; value: number; percent: number }) => {
          return `<div style="padding: 8px;">
            <strong>${params.name}</strong>
            <div style="margin-top: 4px;">金额: ¥${formatCurrency(params.value)}</div>
            <div>占比: ${params.percent.toFixed(1)}%</div>
          </div>`
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#FFFFFF',
            borderWidth: 2,
            cursor: 'pointer'
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 420000, name: '电子元器件', itemStyle: { color: '#0ABAB5' } },
            { value: 280000, name: '金属材料', itemStyle: { color: '#00B42A' } },
            { value: 220000, name: '精密仪器', itemStyle: { color: '#8F5CF6' } },
            { value: 180000, name: '化工原料', itemStyle: { color: '#FF7D00' } },
            { value: 158500, name: '其他', itemStyle: { color: '#646A73' } }
          ]
        }
      ]
    }
    chart.setOption(option)

    chart.on('click', (params: { name: string }) => {
      handleCategoryClick(params.name)
    })

    window.addEventListener('resize', () => chart.resize())
  }
}

const riskSuppliers = computed(() => suppliersStore.highRiskSuppliers.slice(0, 3))
const recentRequests = computed(() => requestsStore.requests.slice(0, 5))

function handleStatCardClick(type: string) {
  console.log('Stat card clicked:', type)
  switch (type) {
    case 'totalAmount':
      navigateToBudget()
      break
    case 'pendingRequests':
      navigateToRequests()
      break
    case 'riskSuppliers':
      navigateToSuppliers()
      break
    case 'supplierCount':
      navigateToSuppliers()
      break
  }
}

function navigateToRequests() {
  const event = new CustomEvent('navigate', { detail: 'requests' })
  window.dispatchEvent(event)
}

function navigateToSuppliers() {
  const event = new CustomEvent('navigate', { detail: 'suppliers' })
  window.dispatchEvent(event)
}

function navigateToBudget() {
  const event = new CustomEvent('navigate', { detail: 'budget' })
  window.dispatchEvent(event)
}

function handleViewTrendDetail() {
  console.log('查看采购趋势详情')
  navigateToBudget()
}

function handleViewAllWarnings() {
  console.log('查看全部预警')
  navigateToSuppliers()
}

function handleProcessWarning(supplierId: string) {
  const supplier = suppliersStore.getSupplierById(supplierId)
  if (supplier) {
    if (confirm(`确定要处理供应商 ${supplier.name} 的风险预警吗？`)) {
      supplier.riskLevel = 'low'
    }
  }
}

function handleViewAllRequests() {
  console.log('查看全部采购申请')
  navigateToRequests()
}

function handleCategoryClick(categoryName: string) {
  console.log('点击品类:', categoryName)
}
</script>

<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card primary" @click="handleStatCardClick('totalAmount')">
        <div class="stat-icon">
          <TrendCharts />
        </div>
        <div class="stat-content">
          <p class="stat-label">本月采购总额</p>
          <p class="stat-value">¥{{ formatCurrency(stats.totalAmount) }}</p>
          <span class="stat-change positive">+12.5%</span>
        </div>
        <div class="stat-arrow">›</div>
      </div>

      <div class="stat-card warning" @click="handleStatCardClick('pendingRequests')">
        <div class="stat-icon">
          <Clock />
        </div>
        <div class="stat-content">
          <p class="stat-label">待审批申请</p>
          <p class="stat-value">{{ stats.pendingRequests }}</p>
          <span class="stat-change neutral">待处理</span>
        </div>
        <div class="stat-arrow">›</div>
      </div>

      <div class="stat-card danger" @click="handleStatCardClick('riskSuppliers')">
        <div class="stat-icon">
          <WarningFilled />
        </div>
        <div class="stat-content">
          <p class="stat-label">高风险供应商</p>
          <p class="stat-value">{{ stats.riskSuppliers }}</p>
          <span class="stat-change negative">需关注</span>
        </div>
        <div class="stat-arrow">›</div>
      </div>

      <div class="stat-card success" @click="handleStatCardClick('supplierCount')">
        <div class="stat-icon">
          <User />
        </div>
        <div class="stat-content">
          <p class="stat-label">合作供应商</p>
          <p class="stat-value">{{ stats.supplierCount }}</p>
          <span class="stat-change positive">+2 新增</span>
        </div>
        <div class="stat-arrow">›</div>
      </div>
    </div>

    <div class="chart-section">
      <ElCard class="chart-card">
        <div class="card-header">
          <h3 class="card-title">采购趋势</h3>
          <span class="card-action" @click="handleViewTrendDetail">查看详情</span>
        </div>
        <div ref="chartRef" class="chart"></div>
      </ElCard>

      <ElCard class="chart-card">
        <div class="card-header">
          <h3 class="card-title">采购品类分布</h3>
        </div>
        <div ref="categoryChartRef" class="chart small"></div>
      </ElCard>
    </div>

    <div class="bottom-section">
      <ElCard class="list-card">
        <div class="card-header">
          <h3 class="card-title">风险预警</h3>
          <span class="card-action" @click="handleViewAllWarnings">全部预警</span>
        </div>
        <div class="risk-list">
          <div v-if="riskSuppliers.length === 0" class="empty-state">
            <EmptyIcon class="empty-icon" />
            <p>暂无风险预警</p>
          </div>
          <div v-else v-for="supplier in riskSuppliers" :key="supplier.id" class="risk-item">
            <div class="risk-badge high"></div>
            <div class="risk-info">
              <span class="risk-name">{{ supplier.name }}</span>
              <span class="risk-desc">资质即将到期: {{ supplier.qualificationExpireDate }}</span>
            </div>
            <button class="risk-action" @click="handleProcessWarning(supplier.id)">处理</button>
          </div>
        </div>
      </ElCard>

      <ElCard class="list-card">
        <div class="card-header">
          <h3 class="card-title">最新采购申请</h3>
          <span class="card-action" @click="handleViewAllRequests">查看全部</span>
        </div>
        <div class="request-list">
          <div v-for="req in recentRequests" :key="req.id" class="request-item">
            <div class="request-info">
              <span class="request-title">{{ req.title }}</span>
              <span class="request-meta">{{ req.requester }} · {{ req.department }}</span>
            </div>
            <div class="request-status" :class="req.status">
              {{ req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已通过' : req.status === 'rejected' ? '已驳回' : '草稿' }}
            </div>
            <span class="request-amount">¥{{ formatCurrency(req.totalAmount) }}</span>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-arrow {
  font-size: 20px;
  color: var(--text-placeholder);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.stat-card:hover .stat-arrow {
  opacity: 1;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(22, 93, 255, 0.05) 100%);
  color: var(--primary-color);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, rgba(255, 125, 0, 0.1) 0%, rgba(255, 125, 0, 0.05) 100%);
  color: var(--warning-color);
}

.stat-card.danger .stat-icon {
  background: linear-gradient(135deg, rgba(245, 63, 63, 0.1) 0%, rgba(245, 63, 63, 0.05) 100%);
  color: var(--danger-color);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, rgba(0, 180, 42, 0.1) 0%, rgba(0, 180, 42, 0.05) 100%);
  color: var(--success-color);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.stat-change {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.stat-change.positive {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.stat-change.negative {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.stat-change.neutral {
  background: rgba(22, 93, 255, 0.1);
  color: var(--primary-color);
}

.chart-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-card {
  border: none;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-action {
  font-size: 13px;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-action:hover {
  text-decoration: underline;
}

.chart {
  height: 280px;
}

.chart.small {
  height: 250px;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.list-card {
  border: none;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: var(--text-placeholder);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.risk-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.risk-badge.high {
  background: var(--danger-color);
  box-shadow: 0 0 8px var(--danger-color);
}

.risk-info {
  flex: 1;
}

.risk-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.risk-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.risk-action {
  background: var(--primary-color);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.risk-action:hover {
  background: var(--primary-light);
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.request-info {
  flex: 1;
  min-width: 0;
}

.request-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.request-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.request-status.pending {
  background: rgba(255, 125, 0, 0.1);
  color: var(--warning-color);
}

.request-status.approved {
  background: rgba(0, 180, 42, 0.1);
  color: var(--success-color);
}

.request-status.rejected {
  background: rgba(245, 63, 63, 0.1);
  color: var(--danger-color);
}

.request-status.draft {
  background: rgba(137, 92, 246, 0.1);
  color: var(--info-color);
}

.request-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>

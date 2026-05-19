<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import { mockDashboardStats } from '@/data/mockData'
import { Clock, Document, ShoppingCart, Box, User } from '@element-plus/icons-vue'
import { ElCard } from 'element-plus'

const userStore = useUserStore()

const chartRef = ref<HTMLDivElement | null>(null)

const userName = computed(() => userStore.currentUser?.name || '用户')
const stats = computed(() => ({
  totalAmount: mockDashboardStats.totalPurchaseAmount,
  pendingRequests: mockDashboardStats.pendingRequests,
  pendingOrders: mockDashboardStats.pendingOrders,
  monthlyData: mockDashboardStats.monthlyData.slice(-6)
}))

function formatCurrency(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  return value.toLocaleString()
}

onMounted(() => {
  initChart()
})

function initChart() {
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
}
</script>

<template>
  <div class="user-dashboard">
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-icon">
          <User />
        </div>
        <div class="welcome-text">
          <h1>欢迎回来，{{ userName }}</h1>
          <p>这里是您的个人采购管理平台</p>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'requests'}))">
        <div class="stat-icon">
          <Document />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pendingRequests }}</span>
          <span class="stat-label">待处理申请</span>
        </div>
      </div>

      <div class="stat-card success" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'orders'}))">
        <div class="stat-icon">
          <ShoppingCart />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pendingOrders }}</span>
          <span class="stat-label">进行中订单</span>
        </div>
      </div>

      <div class="stat-card warning" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'inventory'}))">
        <div class="stat-icon">
          <Box />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatCurrency(stats.totalAmount) }}</span>
          <span class="stat-label">年度采购总额</span>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <ElCard class="chart-card">
        <template #header>
          <div class="card-header">
            <span>采购趋势</span>
          </div>
        </template>
        <div ref="chartRef" class="chart-container"></div>
      </ElCard>

      <ElCard class="quick-actions-card">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <div class="quick-actions">
          <button class="action-btn primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'requests'}))">
            <Document class="btn-icon" />
            <span>提交采购申请</span>
          </button>
          <button class="action-btn success" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'orders'}))">
            <ShoppingCart class="btn-icon" />
            <span>查看采购订单</span>
          </button>
          <button class="action-btn info" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'inventory'}))">
            <Box class="btn-icon" />
            <span>查看库存</span>
          </button>
        </div>
      </ElCard>
    </div>

    <div class="info-cards">
      <ElCard class="info-card">
        <template #header>
          <div class="card-header">
            <Clock class="header-icon" />
            <span>使用指南</span>
          </div>
        </template>
        <div class="guide-content">
          <div class="guide-item">
            <span class="guide-number">1</span>
            <span class="guide-text">提交采购申请，等待审批</span>
          </div>
          <div class="guide-item">
            <span class="guide-number">2</span>
            <span class="guide-text">审批通过后生成采购订单</span>
          </div>
          <div class="guide-item">
            <span class="guide-number">3</span>
            <span class="guide-text">跟踪订单状态，等待收货</span>
          </div>
          <div class="guide-item">
            <span class="guide-number">4</span>
            <span class="guide-text">确认收货，完成采购流程</span>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.user-dashboard {
  padding: 0;
}

.welcome-section {
  background: linear-gradient(135deg, #0ABAB5 0%, #089794 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(10, 186, 181, 0.2);
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.welcome-icon :deep(svg) {
  width: 32px;
  height: 32px;
}

.welcome-text h1 {
  color: #FFFFFF;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon :deep(svg) {
  width: 28px;
  height: 28px;
}

.stat-card.primary .stat-icon {
  background: rgba(10, 186, 181, 0.1);
  color: #0ABAB5;
}

.stat-card.success .stat-icon {
  background: rgba(0, 180, 42, 0.1);
  color: #00B42A;
}

.stat-card.warning .stat-icon {
  background: rgba(255, 125, 0, 0.1);
  color: #FF7D00;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #646A73;
  margin-top: 4px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card,
.quick-actions-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.chart-card :deep(.el-card__header),
.quick-actions-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #F0F1F5;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1D2129;
}

.header-icon {
  width: 18px;
  height: 18px;
  color: #0ABAB5;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn :deep(svg) {
  width: 20px;
  height: 20px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #0ABAB5 0%, #089794 100%);
  color: #FFFFFF;
}

.action-btn.primary:hover {
  box-shadow: 0 4px 16px rgba(10, 186, 181, 0.3);
  transform: translateX(4px);
}

.action-btn.success {
  background: linear-gradient(135deg, #00B42A 0%, #00A020 100%);
  color: #FFFFFF;
}

.action-btn.success:hover {
  box-shadow: 0 4px 16px rgba(0, 180, 42, 0.3);
  transform: translateX(4px);
}

.action-btn.info {
  background: linear-gradient(135deg, #8F5CF6 0%, #7B4ED9 100%);
  color: #FFFFFF;
}

.action-btn.info:hover {
  box-shadow: 0 4px 16px rgba(143, 92, 246, 0.3);
  transform: translateX(4px);
}

.info-cards {
  display: grid;
  grid-template-columns: 1fr;
}

.info-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #F7F8FA;
  border-radius: 8px;
}

.guide-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #0ABAB5 0%, #089794 100%);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.guide-text {
  color: #1D2129;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>

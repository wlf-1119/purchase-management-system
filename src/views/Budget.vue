<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { mockBudgets } from '@/data/mockData'
import type { Budget } from '@/types'
import { PieChart, Download } from '@element-plus/icons-vue'
import { ElCard, ElTable, ElTableColumn, ElButton, ElProgress, ElDialog } from 'element-plus'

const budgets = ref<Budget[]>(mockBudgets)
const chartRef = ref<HTMLDivElement | null>(null)
const trendChartRef = ref<HTMLDivElement | null>(null)
const showReportModal = ref(false)

const totalBudget = computed(() => budgets.value.reduce((sum, b) => sum + b.totalAmount, 0))
const totalUsed = computed(() => budgets.value.reduce((sum, b) => sum + b.usedAmount, 0))
const totalRemaining = computed(() => budgets.value.reduce((sum, b) => sum + b.remainingAmount, 0))

function getUsagePercent(budget: Budget): number {
  if (budget.totalAmount === 0) return 0
  return Math.round((budget.usedAmount / budget.totalAmount) * 100)
}

function getStatusClass(percent: number): string {
  if (percent >= 90) return 'danger'
  if (percent >= 70) return 'warning'
  return 'success'
}

function formatCurrency(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  return '¥' + value.toLocaleString()
}

onMounted(() => {
  initCharts()
})

function initCharts() {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
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
            <div style="margin-top: 4px;">预算: ¥${formatCurrency(params.value)}</div>
            <div>占比: ${params.percent.toFixed(1)}%</div>
          </div>`
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#FFFFFF',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c}万',
            fontSize: 12
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: budgets.value.map((b, index) => ({
            value: b.totalAmount,
            name: b.name,
            itemStyle: {
              color: ['#0ABAB5', '#00B42A', '#8F5CF6', '#FF7D00', '#F53F3F'][index]
            }
          }))
        }
      ]
    }
    chart.setOption(option)
    window.addEventListener('resize', () => chart.resize())
  }

  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E6EB',
        borderWidth: 1,
        textStyle: { color: '#1D2129' }
      },
      legend: {
        data: ['预算总额', '已使用', '剩余'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: budgets.value.map(b => b.name),
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        axisLabel: { color: '#646A73', rotate: 30, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#F0F1F5' } },
        axisLabel: {
          color: '#646A73',
          formatter: (value: number) => (value / 10000).toFixed(0) + '万'
        }
      },
      series: [
        {
          name: '预算总额',
          type: 'bar',
          data: budgets.value.map(b => b.totalAmount),
          barWidth: '20%',
          itemStyle: {
            color: '#E5E6EB',
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '已使用',
          type: 'bar',
          data: budgets.value.map(b => b.usedAmount),
          barWidth: '20%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#0ABAB5' },
              { offset: 1, color: '#5DCFC9' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '剩余',
          type: 'bar',
          data: budgets.value.map(b => b.remainingAmount),
          barWidth: '20%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00B42A' },
              { offset: 1, color: '#52C41A' }
            ]),
            borderRadius: [4, 4, 0, 0]
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
  <div class="budget-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">预算报表</h2>
        <span class="page-subtitle">2026年度预算执行情况</span>
      </div>
      <div class="header-right">
        <ElButton class="export-btn" @click="showReportModal = true">
          <FileText />
          生成报表
        </ElButton>
        <ElButton type="primary" class="download-btn">
          <Download />
          导出数据
        </ElButton>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">
          <PieChart />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatCurrency(totalBudget) }}</span>
          <span class="stat-label">预算总额</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon used">
          <TrendingUp />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatCurrency(totalUsed) }}</span>
          <span class="stat-label">已使用</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon remaining">
          <PieChart />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatCurrency(totalRemaining) }}</span>
          <span class="stat-label">剩余预算</span>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <ElCard class="chart-card">
        <h3 class="card-title">预算分布</h3>
        <div ref="chartRef" class="chart"></div>
      </ElCard>
      <ElCard class="chart-card">
        <h3 class="card-title">预算执行对比</h3>
        <div ref="trendChartRef" class="chart"></div>
      </ElCard>
    </div>

    <ElCard class="table-card">
      <div class="card-header">
        <h3 class="card-title">预算明细</h3>
      </div>
      <ElTable :data="budgets" class="budget-table">
        <ElTableColumn prop="code" label="预算编号" />
        <ElTableColumn prop="name" label="预算名称" />
        <ElTableColumn prop="department" label="所属部门" />
        <ElTableColumn label="预算总额">
          <template #default="scope">{{ formatCurrency(scope.row.totalAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn label="已使用">
          <template #default="scope">{{ formatCurrency(scope.row.usedAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn label="剩余">
          <template #default="scope">{{ formatCurrency(scope.row.remainingAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn label="使用进度">
          <template #default="scope">
            <div class="progress-cell">
              <ElProgress 
                :percentage="getUsagePercent(scope.row)" 
                :stroke-width="6" 
                :show-text="false"
                :class="['progress-bar', getStatusClass(getUsagePercent(scope.row))]"
              />
              <span :class="['percent-text', getStatusClass(getUsagePercent(scope.row))]">
                {{ getUsagePercent(scope.row) }}%
              </span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态">
          <template #default="scope">
            <span :class="['status-badge', scope.row.status]">
              {{ scope.row.status === 'active' ? '执行中' : '已关闭' }}
            </span>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElDialog title="生成报表" v-model="showReportModal" width="600px">
      <div class="report-modal">
        <div class="modal-section">
          <h4 class="section-title">报表设置</h4>
          <div class="form-group">
            <label>报表类型</label>
            <select class="form-select">
              <option>预算执行报表</option>
              <option>采购分析报表</option>
              <option>供应商分析报表</option>
            </select>
          </div>
          <div class="form-group">
            <label>时间范围</label>
            <select class="form-select">
              <option>本月</option>
              <option>本季度</option>
              <option>本年度</option>
              <option>自定义</option>
            </select>
          </div>
          <div class="form-group">
            <label>包含图表</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" checked /> 预算分布饼图
              </label>
              <label class="checkbox-item">
                <input type="checkbox" checked /> 执行趋势图
              </label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="showReportModal = false">取消</ElButton>
        <ElButton type="primary">生成PDF</ElButton>
        <ElButton type="success">导出Excel</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.budget-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  gap: 12px;
}

.export-btn,
.download-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
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

.stat-icon.total {
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(22, 93, 255, 0.05) 100%);
  color: var(--primary-color);
}

.stat-icon.used {
  background: linear-gradient(135deg, rgba(137, 92, 246, 0.1) 0%, rgba(137, 92, 246, 0.05) 100%);
  color: var(--info-color);
}

.stat-icon.remaining {
  background: linear-gradient(135deg, rgba(0, 180, 42, 0.1) 0%, rgba(0, 180, 42, 0.05) 100%);
  color: var(--success-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.chart {
  height: 280px;
}

.table-card {
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: 16px;
}

.budget-table {
  --el-table-header-text-color: var(--text-secondary);
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
}

.progress-bar.success .el-progress-bar__inner {
  background: var(--success-color);
}

.progress-bar.warning .el-progress-bar__inner {
  background: var(--warning-color);
}

.progress-bar.danger .el-progress-bar__inner {
  background: var(--danger-color);
}

.percent-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
}

.percent-text.success {
  color: var(--success-color);
}

.percent-text.warning {
  color: var(--warning-color);
}

.percent-text.danger {
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

.status-badge.closed {
  background: rgba(137, 149, 158, 0.1);
  color: var(--text-placeholder);
}

.report-modal {
  padding: 20px 0;
}

.modal-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary);
}
</style>

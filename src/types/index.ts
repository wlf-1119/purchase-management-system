export interface Supplier {
  id: string
  name: string
  shortName: string
  contact: string
  phone: string
  email: string
  address: string
  creditScore: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'inactive'
  createTime: string
  category: string[]
  cooperationHistory: CooperationRecord[]
  qualificationExpireDate?: string
}

export interface CooperationRecord {
  date: string
  amount: number
  type: 'purchase' | 'service' | 'other'
}

export interface PurchaseRequest {
  id: string
  title: string
  requester: string
  department: string
  items: RequestItem[]
  totalAmount: number
  budgetCode: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
  createTime: string
  updateTime: string
  approvalHistory: ApprovalRecord[]
  reason?: string
}

export interface RequestItem {
  id: string
  name: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: string
}

export interface ApprovalRecord {
  id: string
  approver: string
  role: string
  action: 'approve' | 'reject' | 'pending'
  comment?: string
  time: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  supplierName: string
  items: OrderItem[]
  totalAmount: number
  taxAmount: number
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'shipping' | 'received' | 'completed'
  createTime: string
  deliveryDate?: string
  contractNo?: string
  paymentStatus: 'unpaid' | 'partial' | 'paid'
}

export interface OrderItem {
  id: string
  name: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity?: number
}

export interface InventoryItem {
  id: string
  name: string
  specification: string
  unit: string
  quantity: number
  minStock: number
  maxStock: number
  location: string
  category: string
  lastUpdateTime: string
}

export interface Budget {
  id: string
  code: string
  name: string
  department: string
  totalAmount: number
  usedAmount: number
  remainingAmount: number
  year: number
  status: 'active' | 'closed'
}

export interface DashboardStats {
  totalPurchaseAmount: number
  pendingRequests: number
  pendingOrders: number
  supplierCount: number
  riskSuppliers: number
  monthlyData: MonthlyData[]
}

export interface MonthlyData {
  month: string
  amount: number
  count: number
}

export interface ThemeType {
  value: 'light' | 'dark' | 'soft'
  label: string
}

export interface User {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
  name: string
  createdAt: string
}

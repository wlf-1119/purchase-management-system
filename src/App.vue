<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { useSuppliersStore } from '@/stores/suppliers'
import { usePurchaseRequestsStore } from '@/stores/purchaseRequests'
import { usePurchaseOrdersStore } from '@/stores/purchaseOrders'
import { useDataStore } from '@/stores/data'
import { RouterView } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'

const themeStore = useThemeStore()
const userStore = useUserStore()
const suppliersStore = useSuppliersStore()
const purchaseRequestsStore = usePurchaseRequestsStore()
const purchaseOrdersStore = usePurchaseOrdersStore()
const dataStore = useDataStore()

onMounted(() => {
  themeStore.loadTheme()
  userStore.loadFromStorage()
  suppliersStore.loadFromStorage()
  purchaseRequestsStore.loadFromStorage()
  purchaseOrdersStore.loadFromStorage()
  dataStore.loadFromStorage()
})
</script>

<template>
  <RouterView>
    <template #default="{ Component }">
      <Layout v-if="userStore.isLoggedIn">
        <component :is="Component" />
      </Layout>
      <component :is="Component" v-else />
    </template>
  </RouterView>
</template>

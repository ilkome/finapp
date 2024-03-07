<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { getStyles } from '~/components/ui/classes'

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'rounded'])"
    class="px-3 py-1 text-sm"
    @click="currenciesStore.showBaseCurrenciesModal"
  >
    {{ currenciesStore.base }}
  </div>
</template>

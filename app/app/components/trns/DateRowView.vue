<script setup lang="ts">
const props = defineProps<{
  currencyCode: string
  date: number
  isShowGroupSum?: boolean
  /** Day total in the base currency; omitted for a single-transaction day. */
  sum?: { expense: number, income: number }
}>()

const emit = defineEmits<{
  click: []
}>()

const isShowSum = computed(() => props.isShowGroupSum && !!props.sum)
</script>

<template>
  <div
    :class="{ 'border-accented': isShowSum }"
    class="flex items-center gap-2 px-3 pt-3 pb-1"
  >
    <TrnsDateHeader
      :date="props.date"
      class="grow"
      @click="emit('click')"
    />

    <div
      v-if="isShowSum && props.sum"
      class="opacity-60"
    >
      <TrnsListGroupSum
        :currencyCode="props.currencyCode"
        :expense="props.sum.expense"
        :income="props.sum.income"
      />
    </div>
  </div>
</template>

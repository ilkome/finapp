<script setup lang="ts">
import { currencies } from '~/components/currencies/currencies'

interface Props {
  active: string
}
const props = defineProps<Props>()
const { active } = toRefs(props)

const emit = defineEmits(['onSelect'])
</script>

<template lang="pug">
div
  .cursor-pointer.border-b.border-gray-50.dark_border-neutral-800.p-3.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
    v-for="(item, currency) in $store.state.currencies.rates"
    :key="item"
    :class="{ '_active cursor-default text-blue3 dark_text-blue1': currency === active }"
    @click="emit('onSelect', currency, close)"
  )
    .flex.items-center
      .w-14 {{ currency }}
      .text-sm(
        v-if="currencies.find(c => c.code === currency)"
      ) {{ currencies.find(c => c.code === currency).name }}
</template>

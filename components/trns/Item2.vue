<script setup lang="ts">
import type { TrnItemFull } from '~/components/trns/types'

const props = defineProps<{
  trn: TrnItemFull
}>()
</script>

<template>
  <UiElement>
    <template #leftIcon>
      <Icon2
        :categoryId="props.trn.categoryId"
        :color="props.trn.category.color"
        :icon="props.trn.category.icon"
      />
    </template>
    <!-- <pre>{{ props }}</pre> -->
  </UiElement>
</template>

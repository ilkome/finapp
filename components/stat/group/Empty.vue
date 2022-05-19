<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'

const props = defineProps<{
  typeText: String
}>()

const { statPage } = useStatPage()
const isShow = computed(() => statPage.current[props.typeText]?.categoriesIds?.length === 0)
</script>

<template lang="pug">
.my-4.px-2.text-sm(v-if="isShow")
  | {{ $t('stat.empty') }}
</template>

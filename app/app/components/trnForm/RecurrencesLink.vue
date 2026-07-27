<script setup lang="ts">
import { recurrenceEveryLabel } from '~/components/recurrences/format'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const recurrencesStore = useRecurrencesStore()
const isShow = ref(false)

// The linked rule, when the edited trn is an occurrence of an existing series.
const rule = computed(() => {
  const trnId = trnsFormStore.values.trnId
  const recurrenceId = trnId ? trnsStore.items?.[trnId]?.recurrenceId : undefined
  return recurrenceId ? { id: recurrenceId, item: recurrencesStore.items?.[recurrenceId] } : undefined
})

const periodLabel = computed(() => {
  const r = rule.value?.item
  return r ? recurrenceEveryLabel(t, r.freq, r.interval) : ''
})

async function openSeries() {
  const id = rule.value?.id
  if (!id)
    return
  // Navigate first, THEN close the form. On mobile the form is a bottom sheet with a synthetic
  // history entry (useSheetHistory); closing it first fires history.go(-1), which would race the
  // route change and drop the ?edit query. Letting the router guard unwind the sheet keeps it.
  await navigateTo({ path: '/recurrences', query: { edit: id } })
  trnsFormStore.onClose()
}
</script>

<template>
  <BottomSheetOrDropdown
    v-if="rule?.item"
    :isOpen="isShow"
    :title="t('recurrences.form.repeat')"
    class="shrink-0 grow-0!"
    dragClassesCustom="bottomSheetDragClassesCustom"
    isShowCloseBtn
    @closeModal="isShow = false"
    @openModal="isShow = true"
  >
    <template #trigger>
      <UiActionButton class="relative overflow-visible">
        <Icon name="lucide:repeat" size="20" />
        <div class="absolute top-0 right-0 aspect-square w-2.5 rounded-full bg-primary" />
      </UiActionButton>
    </template>

    <template #content>
      <div class="grid min-w-80 gap-4 px-2 pb-4 md:pb-0">
        <div>
          <div class="text-sm text-highlighted">
            {{ t('recurrences.form.repeat') }} · {{ periodLabel }}
          </div>
          <div class="text-2xs text-muted">
            {{ t('recurrences.partOfSeries') }}
          </div>
        </div>

        <div class="flex-center">
          <UiButtonAccent rounded @click="openSeries">
            {{ t('recurrences.editTitle') }}
          </UiButtonAccent>
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>

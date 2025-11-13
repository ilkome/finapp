<script lang="ts" setup>
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
const { t } = useI18n()

const showModalConfirm = ref(false)

function handleDeleteConfirm() {
  trnsStore.deleteTrn(JSON.parse(JSON.stringify(trnsFormStore.values.trnId)))
  showModalConfirm.value = false
}

const items = computed(() => ({
  duplicate: {
    click: () => {
      if (trnsFormStore.values.trnId) {
        trnsFormStore.trnFormDuplicate(trnsFormStore.values.trnId)
        trnsFormStore.values.trnId = null
      }
    },
    icon: 'mdi:content-copy',
    label: t('base.duplicate'),
  },
  // eslint-disable-next-line perfectionist/sort-objects
  delete: {
    click: () => {
      showModalConfirm.value = true
    },
    icon: 'mdi:delete-empty-outline',
    label: t('base.delete'),
  },
}))

const actions = computed(() => ({
  no: {
    click: () => {
      showModalConfirm.value = false
    },
    icon: 'mdi:close',
    label: t('base.no'),
  },

  yes: {
    click: () => {
      handleDeleteConfirm()
      trnsFormStore.onClose()
    },
    icon: 'mdi:check',
    label: t('base.yes'),
  },
}))
</script>

<template>
  <div
    v-if="trnsFormStore.values.trnId"
    class="relative mb-2 px-3"
  >
    <TrnsItem
      :trnItem="trnsStore.computeTrnItem(trnsFormStore.values.trnId)"
      class="group bg-item-3 rounded-lg"
      @click="trnsFormStore.values.trnId = null"
    />

    <div
      v-if="showModalConfirm"
      class="absolute -bottom-4 left-0 z-20 w-full px-4"
    >
      <div class="text-1 z-10 grid h-full content-center gap-4 rounded-lg border border-(--ui-primary) bg-[var(--item-1)] p-3">
        {{ t('trnForm.delete.alert') }}

        <div class="flex gap-2">
          <UiElement
            v-for="(item, slug) in actions"
            :key="slug"
            :insideClasses="slug === 'yes' ? '!min-h-[44px] bg-item-4' : '!min-h-[44px] bg-item-3'"
            class="grow"
            @click="item.click"
          >
            <template #leftIcon>
              <Icon
                :name="item.icon"
                size="22"
              />
            </template>

            <div class="text-muted leading-none">
              {{ item.label }}
            </div>
          </UiElement>
        </div>
      </div>
    </div>

    <!-- Trn actions -->
    <div class="flex pt-2">
      <UiItem1
        v-for="(item, slug) in items"
        :key="slug"
        variant="text"
        @click="item.click"
      >
        <template #leftIcon>
          <Icon
            :name="item.icon"
            size="22"
          />
        </template>

        <div class="text-muted leading-none">
          {{ t(item.label) }}
        </div>
      </UiItem1>
    </div>
  </div>
</template>

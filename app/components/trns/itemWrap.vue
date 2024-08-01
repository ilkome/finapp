<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import { getStyles } from '../ui/getStyles'
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { random, successEmo } from '~/assets/js/emo'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const { $toast } = useNuxtApp()
const trnsStore = useTrnsStore()
const { trnFormDuplicate, trnFormEdit } = useTrnForm()

const showModalConfirm = ref(false)

function handleDeleteConfirm() {
  trnsStore.deleteTrn(JSON.parse(JSON.stringify(props.trnId)))

  showModalConfirm.value = false
  $toast(UiToastContent, {
    autoClose: 6000,
    data: {
      // TODO: Translate
      description: 'Deleted',
      title: random(successEmo),
    },
    type: 'success',
  } as ToastOptions)
}

const items = computed(() => ({
  edit: {
    click: (hide: () => void) => {
      trnFormEdit(props.trnId)
      hide()
    },
    icon: 'mdi:pencil-outline',
    localeKey: 'base.edit',
  },
  // eslint-disable-next-line perfectionist/sort-objects
  duplicate: {
    click: (hide: () => void) => {
      trnFormDuplicate(props.trnId)
      hide()
    },
    icon: 'mdi:content-copy',
    localeKey: 'base.duplicate',
  },
  // eslint-disable-next-line perfectionist/sort-objects
  delete: {
    click: (hide: () => void) => {
      hide()
      showModalConfirm.value = true
    },
    icon: 'mdi:delete-empty-outline',
    localeKey: 'base.delete',
  },
}))
</script>

<template>
  <div>
    <VDropdown
      :overflowPadding="12"
      autoBoundaryMaxSize
      placement="bottom-start"
    >
      <TrnsItem
        :alt="props.alt"
        :trnItem
        :date
      />

      <template #popper="{ hide }">
        <div class="bg-foreground-1 p-1 w-[90dvw] max-w-[320px]">
          <UiElement
            v-for="(item, slug) in items"
            :key="slug"
            isShowLine
            class="group"
            :insideClasses="getStyles('item', ['minh4'])"
            @click="item.click(hide)"
          >
            <template #leftIcon>
              <Icon
                :name="item.icon"
                size="22"
              />
            </template>

            <div class="text-secondary leading-none">
              {{ $t(item.localeKey) }}
            </div>
          </UiElement>
        </div>
      </template>
    </VDropdown>

    <LayoutConfirmModal
      v-if="showModalConfirm"
      show
      @closed="showModalConfirm = false"
      @onConfirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useTrnForm } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const trnsStore = useTrnsStore()
const { trnFormDuplicate, trnFormEdit } = useTrnForm()

const showModalConfirm = ref(false)

function handleDeleteConfirm() {
  trnsStore.deleteTrn(JSON.parse(JSON.stringify(props.trnId)))
  showModalConfirm.value = false
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
    click: () => {
      showModalConfirm.value = true
    },
    icon: 'mdi:delete-empty-outline',
    localeKey: 'base.delete',
  },
}))

const items2 = computed(() => ({
  no: {
    click: (close: () => void) => {
      showModalConfirm.value = false
    },
    icon: 'mdi:close',
    localeKey: 'base.no',
  },
  // eslint-disable-next-line perfectionist/sort-objects
  yes: {
    click: (close: () => void) => {
      handleDeleteConfirm()
      close()
    },
    icon: 'mdi:check',
    localeKey: 'base.yes',
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
          <div
            v-if="showModalConfirm"
            class="fixed inset-0 p-[1px] size-full z-10"
          >
          <div class="grid gap-4 px-4 bg-foreground-1 h-full content-center text-1 rounded-xl z-10">
            <div>
              {{ $t('base.sure') }}
            </div>

            <div class="flex gap-2">
              <UiElement
                v-for="(item, slug) in items2"
                :key="slug"
                class="grow"
                insideClasses="!min-h-[48px] bg-item-4"
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
          </div>
          </div>


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

    <!-- <LayoutConfirmModal
      v-if="showModalConfirm"
      show
      @closed="showModalConfirm = false"
      @onConfirm="handleDeleteConfirm"
    /> -->
  </div>
</template>

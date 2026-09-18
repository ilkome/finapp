<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CurrencyCode } from '~/components/currencies/types'

import { getCreditAvailable } from '~/components/wallets/types'

export type StatisticsViewItem = {
  id: string
  /** Credit limit for the credit row; the list shows available/limit under the title. */
  secondValue?: number
  title: string
  value: number
}

const props = withDefaults(defineProps<{
  activeType?: string | false
  currencyCode: CurrencyCode
  isShowList?: boolean
  items: StatisticsViewItem[]
  /** Context menu per row id; a row without one has no menu. */
  menuItems?: Record<string, ContextMenuItem[][]>
  pinnedItems: StatisticsViewItem[]
}>(), {
  isShowList: true,
})

const emit = defineEmits<{
  click: [id: string]
}>()

const isShown = defineModel<boolean>('isShown', { default: true })

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-2">
    <div
      v-if="props.pinnedItems.length"
      class="-mx-2 scroll-strip flex scroll-fade snap-x snap-mandatory scroll-px-2 gap-2 overflow-x-auto px-2 py-px @xl/page:mx-0 @xl/page:grid @xl/page:grid-cols-2 @xl/page:overflow-visible @xl/page:px-0"
    >
      <UiContextMenuMy
        v-for="item in props.pinnedItems"
        :key="item.id"
        :items="props.menuItems?.[item.id]"
      >
        <StatSumItemView
          :amount="item.value"
          class="min-w-max flex-1 snap-start snap-always @xl/page:min-w-0"
          :currencyCode="props.currencyCode"
          :isActive="props.activeType === item.id"
          :title="item.title"
          type="net"
          @click="emit('click', item.id)"
        />
      </UiContextMenuMy>
    </div>

    <div v-if="props.isShowList" class="group relative md:max-w-lg">
      <div class="-my-px overflow-hidden">
        <UCollapsible v-model:open="isShown">
          <UiTitleDropRight :isShown="isShown">
            <UiEntityName>{{ t('statistics.title') }}</UiEntityName>
          </UiTitleDropRight>

          <template #content>
            <div class="rounded-sm bg-elevated/30 py-px">
              <UiContextMenuMy
                v-for="(item, index) in props.items"
                :key="item.id"
                :items="props.menuItems?.[item.id]"
              >
                <UiElement
                  :isActive="props.activeType === item.id"
                  :lineWidth="index === props.items.length - 1 ? 0 : 3"
                  class="group"
                  insideClasses="min-h-11!"
                  @click="emit('click', item.id)"
                >
                  <div class="grow pl-1 text-sm leading-none text-muted">
                    <div>
                      {{ item.title }}
                    </div>

                    <div
                      v-if="item.secondValue"
                      class="flex items-center gap-1 pt-1 opacity-90"
                    >
                      <Amount
                        :amount="getCreditAvailable(item.secondValue, item.value)"
                        :currencyCode="props.currencyCode"
                        variant="secondary"
                      />
                      <div class="text-2xs leading-none opacity-70">
                        /
                      </div>
                      <Amount
                        :amount="item.secondValue"
                        :currencyCode="props.currencyCode"
                        variant="secondary"
                      />
                    </div>
                  </div>

                  <div class="pr-1 opacity-90">
                    <Amount
                      :amount="item.value"
                      :currencyCode="props.currencyCode"
                      variant="row"
                    />
                  </div>
                </UiElement>
              </UiContextMenuMy>
            </div>
          </template>
        </UCollapsible>
      </div>
    </div>
  </div>
</template>

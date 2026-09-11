<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletsStatistics } from '~/components/wallets/useWalletsStatistics'

import { getCreditAvailable } from '~/components/wallets/types'

const props = withDefaults(defineProps<{
  activeType?: string | false
  currencyCode: CurrencyCode
  isShowList?: boolean
  state: WalletsStatistics
  storageKey: string
}>(), {
  isShowList: true,
})

const emit = defineEmits<{
  click: [v: string]
  openSettings: []
}>()

const { t } = useI18n()

const shown = useStoredToggle(props.storageKey, true)

function menuItems(id: string, pinned: boolean) {
  return props.state.menuItems(id, p => emit('openSettings', p), pinned)
}
</script>

<template>
  <div class="grid gap-2">
    <div
      v-if="state.pinnedItems.value.length"
      class="-mx-2 scroll-strip flex scroll-fade snap-x snap-mandatory scroll-px-2 gap-2 overflow-x-auto px-2 py-px @xl/page:mx-0 @xl/page:grid @xl/page:grid-cols-2 @xl/page:overflow-visible @xl/page:px-0"
    >
      <UiContextMenuMy
        v-for="item in state.pinnedItems.value"
        :key="item.id"
        :items="menuItems(item.id)"
      >
        <StatSumItem
          :amount="item.value"
          class="min-w-max flex-1 snap-start snap-always @xl/page:min-w-0"
          :currencyCode="currencyCode"
          :isActive="props.activeType === item.id"
          :title="t(`money.types.${item.id}`)"
          type="net"
          @click="emit('click', item.id)"
        />
      </UiContextMenuMy>
    </div>

    <div v-if="props.isShowList" class="group relative md:max-w-lg">
      <div class="-my-px overflow-hidden">
        <UCollapsible v-model:open="shown">
          <UiTitleDropRight :isShown="shown">
            <UiEntityName>{{ t('statistics.title') }}</UiEntityName>
          </UiTitleDropRight>

          <template #content>
            <div class="rounded-sm bg-elevated/30 py-px">
              <UiContextMenuMy
                v-for="(item, index) in state.items.value"
                :key="item.id"
                :items="menuItems(item.id)"
              >
                <UiElement
                  :isActive="props.activeType === item.id"
                  :lineWidth="index === state.items.value.length - 1 ? 0 : 3"
                  class="group"
                  insideClasses="min-h-11!"
                  @click="emit('click', item.id)"
                >
                  <div class="grow pl-1 text-sm leading-none text-muted">
                    <div>
                      {{ t(`money.types.${item.id}`) }}
                    </div>

                    <div
                      v-if="item.secondValue"
                      class="flex items-center gap-1 pt-1 opacity-90"
                    >
                      <Amount
                        :amount="getCreditAvailable(item.secondValue, item.value)"
                        :currencyCode="currencyCode"
                        variant="secondary"
                      />
                      <div class="text-2xs leading-none opacity-70">
                        /
                      </div>
                      <Amount
                        :amount="item.secondValue"
                        :currencyCode="currencyCode"
                        variant="secondary"
                      />
                    </div>
                  </div>

                  <div class="pr-1 opacity-90">
                    <Amount
                      :amount="item.value"
                      :currencyCode="currencyCode"
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

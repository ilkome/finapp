<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { colorsWithoutShades } from '~/components/color/colors'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  activeColor?: string
  icon?: string
  isCategory?: boolean
  isWallet?: boolean
}>()

const emit = defineEmits<{
  click: [color: string]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

function findCategoryIconByColor(color: string) {
  return categoriesStore.categoriesRootIds.map(id => categoriesStore.items[id]).find(c => c?.color === color)?.icon
}

function findWalletWithColor(color: string) {
  return Object.values(walletsStore.items ?? {}).some(w => w?.color === color)
}
</script>

<template>
  <div class="grid gap-6">
    <div>
      <div
        v-for="(colorsGroup, groupIdx) in colorsWithoutShades"
        :key="groupIdx"
        class="pb-1"
      >
        <div class="flex gap-1">
          <div
            v-for="(color, idx) in colorsGroup"
            :key="idx"
            class="w-full overflow-hidden rounded border-2 border-transparent"
            :class="[{ '!border-accent-1 !shadow': color === props.activeColor, 'pointer-events-none': !color }]"
            @click="emit('click', color)"
          >
            <div class="flex-center h-10" :style="{ background: color }">
              <Icon
                v-if="props.isCategory && (findCategoryIconByColor(color) || color === props.activeColor)"
                :name="props.activeColor === color ? props.icon : findCategoryIconByColor(color)"
                size="20"
                class="text-icon-primary"
              />

              <div
                v-if="props.isWallet && findWalletWithColor(color)"
                class="bg-item-3 size-3 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <UiFormElement>
      <template #label>
        {{ t('color.custom') }}
      </template>
      <input
        :value="activeColor"
        class="border-item-3 focus:border-accent-2 focus:bg-item-hover focus:text-1 h-12 w-full rounded-lg border border-solid p-0 transition ease-in-out focus:outline-none"
        type="color"
        @input="(event: HTMLInputEvent) => emit('click', event.target.value)"
      >
    </UiFormElement>
  </div>
</template>

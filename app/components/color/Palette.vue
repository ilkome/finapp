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
            class="w-full overflow-hidden rounded-sm border-2 border-transparent"
            :class="[{ '!border-(--ui-primary) !shadow': color === props.activeColor, 'pointer-events-none': !color }]"
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
                class="bg-item-4 size-3 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <FormElement>
      <template #label>
        {{ t('color.custom') }}
      </template>
      <FormInput
        :value="activeColor"
        type="color"
        @updateValue="(event: HTMLInputEvent) => emit('click', event.target.value)"
      />
    </FormElement>
  </div>
</template>

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

const categoryIconByColor = computed(() => {
  const map = new Map<string, string>()
  for (const id of categoriesStore.categoriesRootIds) {
    const cat = categoriesStore.items[id]
    if (cat?.color && cat.icon)
      map.set(cat.color, cat.icon)
  }
  return map
})

const walletColorsUsed = computed(() => {
  const set = new Set<string>()
  for (const w of Object.values(walletsStore.items ?? {})) {
    if (w?.color)
      set.add(w.color)
  }
  return set
})
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
            :class="cn('w-full overflow-hidden rounded-sm border-2 border-transparent',
                       color === props.activeColor && 'border-(--ui-primary) shadow',
                       !color && 'pointer-events-none',
            )"
            @click="emit('click', color)"
          >
            <div class="flex-center h-10" :style="{ background: color }">
              <Icon
                v-if="props.isCategory && (categoryIconByColor.has(color) || color === props.activeColor)"
                :name="props.activeColor === color ? props.icon ?? '' : categoryIconByColor.get(color) ?? ''"
                size="20"
                class="text-icon-primary"
              />

              <div
                v-if="props.isWallet && walletColorsUsed.has(color)"
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
        :modelValue="activeColor ?? ''"
        type="color"
        @update:modelValue="(value: string) => emit('click', value)"
      />
    </FormElement>
  </div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { FilterProvider } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'
import { useNewStat } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const filter = inject('filter') as FilterProvider
const { getCats } = useNewStat()
const categoriesStore = useCategoriesStore()

const isShowLinesChart = useStorage<boolean>('isShowLinesChart', false)
// const period = useStorage<PeriodNameWithoutAll>(`${props.storageKey}-period`, 'month')

const newBaseStorageKey = computed(() => `${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)
const baseStorageKey = computed(() => `${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)

/**
 * Cats
 */
const isGroupCategoriesByParent = useStorage<boolean>(`${baseStorageKey.value}-isGroupCategoriesByParent`, false)
const isGroupCategoriesByParentRounded = useStorage<boolean>(`${baseStorageKey.value}-isGroupCategoriesByParentRounded`, true)

const cats = computed(() => getCats(props.trnsIds ?? [], isGroupCategoriesByParent.value))
const catsRounded = computed(() => getCats(props.trnsIds ?? [], isGroupCategoriesByParentRounded.value))

const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)

const isOpenedAll = useStorage<boolean>(`${baseStorageKey.value}-isOpenedAll`, false)
const openedCats = useStorage<CategoryId[]>(`${baseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${baseStorageKey.value}-openedTrns`, [])
const catsView = useStorage<'list' | 'round'>(`${baseStorageKey.value}-catsView`, 'list')

watch(cats, () => {
  if (isOpenedAll.value) {
    openedCats.value = cats.value.map(d => d.id)
  }
}, { immediate: true })

function toggleCats() {
  if (openedCats.value.length === cats.value.length) {
    openedCats.value = []
  }
  else {
    openedCats.value = cats.value.map(d => d.id)
  }
}

function onClickCategory(categoryId: CategoryId) {
  const category = categoriesStore.items[categoryId]

  if (category?.childIds && category?.childIds?.length > 0) {
    openedCats.value.includes(categoryId)
      ? (openedCats.value = openedCats.value.filter(d => d !== categoryId))
      : openedCats.value.push(categoryId)
  }

  else {
    openedTrns.value.includes(categoryId)
      ? (openedTrns.value = openedTrns.value.filter(d => d !== categoryId))
      : openedTrns.value.push(categoryId)
  }
}

// function onClickCategoryIcon(categoryId: CategoryId) {
//   filter.setCategoryId(categoryId)
// }

function onClickCategoryRounded(categoryId: CategoryId) {
  isGroupCategoriesByParentRounded.value = false
  filter.clearFilter()
  filter.setCategoryId(categoryId)
  // const category = categoriesStore.items[categoryId]

  // if (category?.childIds && category?.childIds?.length > 0) {
  //   isGroupCategoriesByParentRounded.value = false
  // }
  // else {
  //   isGroupCategoriesByParentRounded.value = true
  // }
}

const isAllCatsOpened = computed(() => arraysAreEqualUnordered(cats.value.map(d => d.id), openedCats.value))

function arraysAreEqualUnordered(arr1: CategoryId[], arr2: CategoryId[]) {
  // Check if the lengths are the same
  if (arr1.length !== arr2.length) {
    return false
  }

  // Sort both arrays
  const sortedArr1 = arr1.slice().sort()
  const sortedArr2 = arr2.slice().sort()

  // Check each element
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false
    }
  }

  // If all elements are the same
  return true
}
</script>

<template>
  <div class="grid content-start gap-3">
    <!-- Stat -->
    <div class="_@3xl/main:grid-cols-[1fr,.8fr] _gap-8 grid @container/stat px-3">
      <div class="grid gap-2">
        <div class="grid @3xl/stat:grid-cols-[1.3fr,auto] @xl/stat:gap-12 gap-2">
          <!-- Categories first level -->
          <UiToggle
            v-if="props.trnsIds && props.trnsIds?.length > 0"
            :class="{
              'md:max-w-4xl': catsView === 'round',
              'md:max-w-lg': catsView === 'list',
            }"
            :storageKey="`${newBaseStorageKey}-cats-root`"
            :initStatus="true"
            isPadding
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between">
                <UiTitle
                  :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                  class="grow flex items-center gap-2 pb-0 -ml-1"
                  @click="toggle"
                >
                  <Icon
                    v-if="!isShown"
                    name="mdi:chevron-right"
                    size="22"
                    class="-ml-1"
                  />
                  <div>{{ $t('categories.title') }}</div>
                  <div>{{ catsView === 'list' ? cats.length : catsRounded.length }}</div>
                </UiTitle>

                <template v-if="isShown">
                  <VDropdown
                    v-if="isShown && catsView === 'list'"
                    :overflowPadding="12"
                    autoBoundaryMaxSize
                    placement="bottom-start"
                    class="group"
                  >
                    <div
                      :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                      class="justify-center text-xl"
                    >
                      <Icon
                        name="fluent:settings-20-regular"
                        size="24"
                      />
                    </div>

                    <template #popper>
                      <div class="p-1">
                        <UiCheckbox
                          :checkboxValue="isShowLinesChart"
                          title="Show Lines"
                          showCheckbox
                          @onClick="isShowLinesChart = !isShowLinesChart"
                        />
                      </div>
                    </template>
                  </VDropdown>

                  <!-- Folder -->
                  <div
                    v-if="catsView === 'list'"
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="toggleCats"
                  >
                    <Icon
                      :name="isAllCatsOpened ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
                      size="24"
                    />
                  </div>

                  <div
                    v-if="catsView === 'round'"
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="isGroupCategoriesByParentRounded = !isGroupCategoriesByParentRounded"
                  >
                    <Icon
                      :name="isGroupCategoriesByParentRounded ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                      size="22"
                    />
                  </div>

                  <div
                    v-if="catsView === 'list'"
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="isGroupCategoriesByParent = !isGroupCategoriesByParent"
                  >
                    <Icon
                      :name="isGroupCategoriesByParent ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                      size="22"
                    />
                  </div>

                  <!-- Cat view -->
                  <div
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="catsView = catsView === 'list' ? 'round' : 'list'"
                  >
                    <Icon
                      :name="catsView === 'list' ? 'fluent:apps-list-20-regular' : 'fluent:equal-circle-20-regular'"
                      size="24"
                    />
                  </div>
                </template>
              </div>
            </template>

            <div
              v-if="cats.length > 0 && catsView === 'round'"
              class="flex flex-wrap gap-1 md:gap-2 pl-1"
            >
              <StatLinesItemRound
                v-for="item in catsRounded"
                :key="item.id"
                class="flex-auto flex-grow-1 w-28"
                :item
                :isShowLinesChart
                :biggestCatNumber
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                @click="onClickCategoryRounded"
              />
            </div>

            <div
              v-if="cats.length > 0 && catsView === 'list'"
              class="pl-0"
            >
              <StatLinesItemLine
                v-for="item in cats"
                :key="item.id"
                :item
                :isShowLinesChart
                :biggestCatNumber
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                @click="onClickCategory"
                @onClickIcon="onClickCategoryRounded"
              >
                <div
                  class="pl-2"
                >
                  <div
                    v-if="isGroupCategoriesByParent && openedCats.includes(item.id) && getCats(item.trnsIds).length > 1"
                  >
                    <StatLinesItemLine
                      v-for="insideItem in getCats(item.trnsIds)"
                      :key="insideItem.id"
                      :item="insideItem"
                      :isShowLinesChart
                      isAltIcon
                      :isActive="openedTrns.includes(insideItem.id)"
                      :biggestCatNumber
                      @click="onClickCategory"
                      @onClickIcon="onClickCategoryRounded"
                    >
                      <div
                        v-if="openedTrns.includes(insideItem.id)"
                        class="pl-0"
                      >
                        <TrnsList
                          class="pl-8"
                          :trnsIds="insideItem.trnsIds ?? []"
                          :size="5"
                          alt2
                          isHideDates
                          isShowFilterByDesc
                        />
                        <!-- Inside: trns -->
                      </div>
                    </StatLinesItemLine>
                  </div>

                  <div
                    v-if="!isGroupCategoriesByParent && openedCats.includes(item.id) || openedTrns.includes(item.id)"
                  >
                    <TrnsList
                      class="pl-8"
                      :trnsIds="item.trnsIds ?? []"
                      :size="5"
                      alt2
                      isHideDates
                      isShowFilterByDesc
                    />
                  </div>
                </div>
              </StatLinesItemLine>
            </div>
          </UiToggle>

          <!-- Trns first level -->
          <UiToggle
            v-if="props.trnsIds && props.trnsIds?.length > 0"
            :storageKey="`${newBaseStorageKey}-trns-root`"
            class="@xl/stat:min-w-96 max-w-lg"
            isPadding
          >
            <template #header="{ toggle, isShown }">
              <UiTitle
                :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                class="grow flex items-center gap-2 -ml-1"
                @click="toggle"
              >
                <Icon
                  v-if="!isShown"
                  name="mdi:chevron-right"
                  size="22"
                  class="-ml-1"
                />
                <div>{{ $t('trns.title') }}</div>
                <div>{{ props.trnsIds?.length }}</div>
              </UiTitle>
            </template>

            <TrnsList
              class="pl-1"
              :groupedBy="period"
              :isShowGroupSum="period !== 'day'"
              :trnsIds="props.trnsIds"
              isShowFilterByDesc
              isShowHeader2
            />
          </UiToggle>
        </div>

        <!-- Empty -->
        <div
          v-if="props.trnsIds?.length === 0"
          class="flex-col gap-2 flex-center h-full py-3 text-center text-secondary"
        >
          <UiIconBase name="mdi mdi-palm-tree" class="!text-3xl" />
          <div class="text-md">
            {{ $t("trns.noTrns") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

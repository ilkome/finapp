<script setup lang="ts">
import useFilter from '~/modules/filter/useFilter'
import { getTrnsIds } from '~/components/trns/functions/getTrns'

const { $store } = useNuxtApp()
const { setFilterCatsId } = useFilter()

const route = useRoute()
const router = useRouter()

const categoryId = computed(() => route.params.id)
const category = computed(() => $store.state.categories.items[categoryId.value])
if (!category.value)
  router.replace('/categories')

const trnsItems = computed(() => $store.state.trns.items)
const backLink = computed(() => category.value?.parentId ? `/categories/${category.value.parentId}` : '/categories')

const filter = reactive({ trnType: null })

const categoryChildIds = computed(() => category.value.childIds?.sort((a, b) => {
  if ($store.state.categories.items[a].name < $store.state.categories.items[b].name) return -1
  if ($store.state.categories.items[a].name > $store.state.categories.items[b].name) return 1
  return 0
}))

const trnsIds = computed(() =>
  getTrnsIds({
    categoriesIds: category.value?.childIds ? category.value?.childIds : [categoryId.value],
    trnType: filter.trnType,
    trnsItems: trnsItems.value,
  }))

function handleSetFilterCategory() {
  setFilterCatsId(categoryId.value)
  $store.commit('filter/setFilterDateNow')
  $store.dispatch('ui/setActiveTabStat', 'details')
}

function handleEditClick() {
  $store.commit('categories/setCategoryEditId', categoryId.value)
  $store.dispatch('ui/setActiveTab', 'createCategory')
}
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto(v-if="category")
  router-link(
    v-slot='{ href, navigate }'
    :to='backLink'
    custom
  )
    .flex.items-start
      a.grow.cursor-pointer.block.py-5.mb-3.px-3.font-nunito.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
        :href='href'
        @click='navigate'
      )
        .pb-2.text-2xs.font-medium(class="text-white/50")
          | {{ $t('categories.title') }}
          template(v-if="category.parentId")
            |
            | • {{ $store.state.categories.items[category.parentId].name }}

        .pb-0.flex.items-center.gap-3
          .text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold {{ category.name }}
          .w-6.h-6.rounded-full.flex-center.text-sm.text-neutral-50(
            :style="{ background: category.color }"
          )
            div(:class="category.icon")

      .mdi.mdi-pencil-outline.cursor-pointer.rounded-full.mt-3.mr-2.w-16.h-16.flex-center.text-2xl.p-4.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
        @click="handleEditClick"
      )

  .pb-12
    .px-4.flex
      .cursor-pointer.p-1.px-3.flex.items-center.gap-3.bg-gray-50.dark_bg-dark4.rounded-md.hocus_bg-gray-100.dark_hocus_bg-neutral-800.shadow.hocus_shadow-lg(
        class="dark_text-white/60"
        @click="handleSetFilterCategory"
      )
        .mdi.mdi-poll.text-xl
        .text-xs.leading-none {{ $t('statBy') }} {{ category.name }}
        .mdi.mdi-chevron-right.opacity-70.text-lg.leading-none

  //- Childs categories
  .pb-12(v-if="category.childIds && category.childIds.length > 0")
    .statTitle.flex.gap-2.px-3(class="!pb-3")
      div {{ $t('categories.title') }}:
      div {{ category.childIds.length }}

    .px-3
      CategoriesView(
        :ids="categoryChildIds"
        :slider="() => ({})"
        isHideParentCategory
        borderTop
        noPadding
        @onClick="id => $router.push(`/categories/${id}`)"
      )

  //- History
  .px-3
    TrnsHistory(
      :trnsIds="trnsIds"
      :trnType="filter.trnType"
      hideTransfers
      @setFilterTrnType="value => filter.trnType = value"
    )
</template>

<i18n lang="json5">
{
  "en": {
    "statBy": "Statistics: ",
  },
  "ru": {
    "statBy": "Статистика: ",
  },
}
</i18n>

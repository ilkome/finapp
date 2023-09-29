<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'
import useFilter from '~/components/filter/useFilter'

const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const { setFilterCatsId } = useFilter()

const route = useRoute()
const router = useRouter()

const categoryId = computed(() => route.params.id)
const category = computed(() => $store.state.categories.items[categoryId.value])
if (!category.value)
  router.replace('/categories')

const trnsItems = computed(() => $store.state.trns.items)
const backLink = computed(() => category.value?.parentId
  ? `/categories/${category.value.parentId}`
  : '/categories')

const categoryChildIds = computed(() => category.value.childIds?.sort((a, b) =>
  $store.state.categories.items[a].name.localeCompare($store.state.categories.items[b].name)))

const trnsIds = computed(() =>
  getTrnsIds({
    categoriesIds: category.value?.childIds?.length > 0
      ? category.value?.childIds
      : [categoryId.value],
    trnsItems: trnsItems.value,
  }))

// TODO: useFilter
function handleSetFilterCategory() {
  setFilterCatsId(categoryId.value)
  $store.commit('filter/setFilterDateNow')
  $store.dispatch('ui/setActiveTabStat', 'details')
}

const onClickEdit = () => router.push(`/categories/${categoryId.value}/edit`)

useHead({
  // title: `${category.value.name} / ${i18n.t('categories.title')}`,
  title: category.value.name,
})
</script>

<template lang="pug">
UiPage(v-if="category")
  UiHeader
    router-link(v-slot="{ href, navigate }" :to="backLink" custom)
      a.grow.hocus_bg-skin-item-main-hover(:href="href" @click="navigate")
        UiHeaderTitle
          .pt-1.text-xs.font-medium.text-skin-item-base-down
            | {{ $t('categories.title') }}
            template(v-if="category.parentId")
              |
              | • {{ $store.state.categories.items[category.parentId].name }}

          .pb-1.flex.items-center.gap-4
            | {{ category.name }}
            .w-8.h-8.rounded-full.flex-center.text-xl.text-skin-icon-base(
              :style="{ background: category.color }"
            )
              div(:class="category.icon")

    template(#actions v-if="categoryId !== 'transfer'")
      UiHeaderLink(@click="onClickEdit")
        .mdi.mdi-pencil-outline.group-hover_text-white.text-xl
      UiHeaderLink(@click="$router.push('/categories/new')")
        UiIconAdd.group-hover_text-white.w-6.h-6

  //- Open stat
  .pt-3.mb-12
    .px-2.flex
      .cursor-pointer.p-1.px-2.flex.items-center.gap-3.bg-gray-50.dark_bg-dark4.rounded-md.hocus_bg-gray-100.dark_hocus_bg-neutral-800.shadow.hocus_shadow-lg(
        class="dark_text-white/60"
        @click="handleSetFilterCategory"
      )
        .mdi.mdi-poll.text-xl
        .text-xs.leading-none {{ $t('statBy') }} {{ category.name }}
        .mdi.mdi-chevron-right.opacity-70.text-lg.leading-none

  //- Childs categories
  .mb-12(v-if="category.childIds && category.childIds.length > 0")
    .pb-3.px-2.flex.gap-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
      div {{ $t('categories.title') }}:
      div {{ category.childIds.length }}

    .px-2
      CategoriesList(
        :ids="categoryChildIds"
        :slider="() => ({})"
        isHideParentCategory
        @click="id => $router.push(`/categories/${id}`)"
      )

  //- History
  .px-2
    TrnsListWithControl(:trnsIds="trnsIds")
</template>

<i18n lang="yaml">
en:
  statBy: 'Statistics: '

ru:
  statBy: 'Статистика: '
</i18n>

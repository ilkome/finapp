<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useFilter } from '~/components/filter/useFilter'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { setFilterCatStat } = useFilter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const categoryId = computed(() => route.params.id)
const category = computed(() => categoriesStore.items[categoryId.value])
if (!category.value)
  router.replace('/categories')

const backLink = computed(() => category.value?.parentId
  ? `/categories/${category.value.parentId}`
  : '/categories')

const categoryChildIds = computed(() => category.value.childIds?.sort((a, b) =>
  categoriesStore.items[a].name.localeCompare(categoriesStore.items[b].name)))

const trnsIds = computed(() =>
  getTrnsIds({
    categoriesIds: category.value?.childIds?.length > 0
      ? category.value?.childIds
      : [categoryId.value],
    trnsItems: trnsStore.items,
  }))

// TODO: useFilter
function onClickFilterCategory() {
  setFilterCatStat(categoryId.value)
}

const onClickEdit = () => router.push(`/categories/${categoryId.value}/edit`)

useHead({
  title: category.value?.name,
})
</script>

<template>
  <UiPage v-if="category">
    <UiHeader>
      <router-link
        v-slot="{ href, navigate }"
        :to="backLink"
        custom
      >
        <a class="grow hocus_bg-item-main-hover" :href="href" @click="navigate">
          <UiHeaderTitle>
            <div class="pt-1 text-xs font-medium text-item-base-down">
              {{ $t('categories.title') }}
              <template v-if="category.parentId">
                |
                | • {{ categoriesStore.items[category.parentId].name }}
              </template>

            </div>
            <div class="pb-1 flex items-center gap-4">
              {{ category.name }}
              <div class="w-8 h-8 rounded-full flex-center text-xl text-icon-base" :style="{ background: category.color }">
                <div :class="category.icon" />
              </div>
            </div>
          </UiHeaderTitle>
        </a>
      </router-link>

      <template v-if="categoryId !== 'transfer'">
        <UiHeaderLink @click="onClickEdit">
          <div class="mdi mdi-pencil-outline group-hover_text-white text-xl" />
        </UiHeaderLink>
        <UiHeaderLink @click="$router.push('/categories/new')">
          <UiIconAdd class="group-hover_text-white w-6 h-6" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <!-- Open stat -->
    <div class="pt-3 mb-12">
      <div class="px-2 flex">
        <UiItemShadow class="cursor-pointer p-1 px-2 flex items-center gap-3" @click="onClickFilterCategory">
          <div class="mdi mdi-poll text-xl" />

          <div class="text-xs leading-none">
            {{ t('statBy') }} {{ category.name }}
          </div>

          <div class="mdi mdi-chevron-right opacity-70 text-lg leading-none" />
        </UiItemShadow>
      </div>
    </div>

    <!-- Childs categories -->
    <div v-if="category.childIds && category.childIds.length > 0" class="mb-12">
      <div class="pb-3 px-2 flex gap-2 text-lg leading-none font-nunito font-semibold text-item-base">
        <div>
          {{ $t('categories.title') }}:
        </div>

        <div>
          {{ category.childIds.length }}
        </div>
      </div>
      <div class="px-2">
        <CategoriesList :ids="categoryChildIds" :slider="() => ({})" isHideParentCategory @click="id => $router.push(`/categories/${id}`)" />
      </div>
    </div>

    <!-- History -->
    <div class="px-2">
      <TrnsListWithControl :trnsIds="trnsIds" />
    </div>
  </UiPage>
</template>

<i18n lang="yaml">
en:
  statBy: 'Statistics: '

ru:
  statBy: 'Статистика: '
</i18n>

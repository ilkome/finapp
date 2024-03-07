<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useFilter } from '~/components/filter/useFilter'
import type { CategoryId } from '~/components/categories/types'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { setFilterCatStat } = useFilter()
const categoriesStore = useCategoriesStore()

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = computed(() => categoriesStore.items[categoryId.value])

if (!category.value)
  router.replace('/categories')

const backLink = computed(() =>
  category.value?.parentId
    ? `/categories/${category.value.parentId}`
    : '/categories',
)

const categoryChildIds = computed(() =>
  category.value.childIds?.sort((a, b) =>
    categoriesStore.items[a].name.localeCompare(categoriesStore.items[b].name),
  ),
)

const categoriesIds = computed(() =>
  category.value?.childIds?.length > 0
    ? category.value?.childIds
    : [categoryId.value],
)

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
      <router-link v-slot="{ href, navigate }" :to="backLink" custom>
        <a class="grow hocus_bg-item-5" :href="href" @click="navigate">
          <UiHeaderTitle>
            <div class="pt-1 text-xs font-medium text-item-2">
              {{ $t("categories.title") }}
              <template v-if="category.parentId">
                | | • {{ categoriesStore.items[category.parentId].name }}
              </template>
            </div>
            <div class="flex items-center gap-4 pb-1">
              {{ category.name }}
              <div
                class="flex-center h-8 w-8 rounded-full text-xl text-icon-primary"
                :style="{ background: category.color }"
              >
                <div :class="category.icon" />
              </div>
            </div>
          </UiHeaderTitle>
        </a>
      </router-link>

      <template v-if="categoryId !== 'transfer'">
        <UiHeaderLink @click="onClickEdit">
          <div class="mdi mdi-pencil-outline text-xl group-hover_text-white" />
        </UiHeaderLink>
        <UiHeaderLink @click="$router.push('/categories/new')">
          <UiIconAdd class="h-6 w-6 group-hover_text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <!-- Open stat -->
    <div class="mb-12 pt-3">
      <div class="flex px-2">
        <UiItemShadow
          class="flex cursor-pointer items-center gap-3 p-1 px-2"
          @click="onClickFilterCategory"
        >
          <div class="mdi mdi-poll text-xl" />

          <div class="text-xs leading-none">
            {{ t("statBy") }} {{ category.name }}
          </div>

          <div class="mdi mdi-chevron-right text-lg leading-none opacity-70" />
        </UiItemShadow>
      </div>
    </div>

    <!-- Childs categories -->
    <div v-if="category.childIds && category.childIds.length > 0" class="mb-12">
      <div
        class="text-item-base flex gap-2 px-2 pb-3 font-primary text-lg font-semibold leading-none"
      >
        <div>{{ $t("categories.title") }}:</div>

        <div>
          {{ category.childIds.length }}
        </div>
      </div>
      <div class="px-2">
        <CategoriesList
          :ids="categoryChildIds"
          :slider="() => ({})"
          isHideParentCategory
          @click="(id) => $router.push(`/categories/${id}`)"
        />
      </div>
    </div>

    <!-- Stat -->
    <div class="px-2">
      <CategoriesStat :categoriesIds />
    </div>
  </UiPage>
</template>

<i18n lang="yaml">
en:
  statBy: "Statistics: "

ru:
  statBy: "Статистика: "
</i18n>

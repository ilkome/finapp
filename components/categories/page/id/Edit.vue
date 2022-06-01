<script setup lang="ts">
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'

const { $store } = useNuxtApp()
const router = useRouter()
const route = useRoute()

const categoryId = computed(() => route.params.id)
const category = computed(() => $store.state.categories.items[categoryId.value])

const categoryForm = ref({
  color: category.value?.color || random(allColors),
  icon: category.value?.icon || random(random(icons)),
  name: category.value?.name || null,
  order: category.value?.order ?? 1,
  parentId: category.value?.parentId ?? 0,
  showInLastUsed: category.value?.showInLastUsed ?? true,
  showInQuickSelector: category.value?.showInQuickSelector ?? false,
  showStat: category.value?.showStat ?? true,
})

const parentCategory = computed(() => {
  if (category.value.parentId === 0)
    return false

  return $store.state.categories.items[categoryForm.value.parentId]
})

function updateValue(id, value) {
  categoryForm.value[id] = value
}

function afterSave() {
  router.replace(`/categories/${categoryId.value}`)
}
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.edit')}: ${this.categoryForm.name ? this.categoryForm.name : this.$t('wallets.form.name.label')}`,
    }
  },
})
</script>

<template lang="pug">
UiPage(v-if="category")
  UiHeader
    router-link(v-slot="{ href, navigate }" :to='`/categories/${categoryId}`' custom)
      a.grow.hocus_bg-skin-item-main-hover(
        :href='href'
        @click='navigate'
      )
        UiHeaderTitle
          .pt-1.text-xs.font-medium.text-skin-item-base-down
            | {{ $t('categories.title') }}
            template(v-if="parentCategory")
              |
              | • {{ parentCategory.name }}

          .pb-1.flex.items-center.gap-4
            | {{ categoryForm.name }}
            .w-8.h-8.rounded-full.flex-center.text-xl.text-skin-icon-base(
              :style="{ background: categoryForm.color }"
            )
              div(:class="categoryForm.icon")

    template(#actions)
      CategoriesDelete(:categoryId="categoryId")

  .mt-3
    CategoriesForm(
      :categoryId="categoryId"
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    )
</template>

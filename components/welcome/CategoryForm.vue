<script setup lang="ts">
import { getPreparedFormData } from '~/components/categories/getForm'
import { getParentCategory } from '~/components/categories/getCategories'

const emit = defineEmits(['afterSave'])
const { $store } = useNuxtApp()

const categoryForm = ref(getPreparedFormData())
const parentCategory = computed(() =>
  getParentCategory($store.state.categories.items, categoryForm.value.parentId))

const updateValue = (id, value) => categoryForm.value[id] = value
const afterSave = () => emit('afterSave')
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: `${this.$t('base.add')}: ${this.categoryForm.name ? this.categoryForm.name : this.$t('categories.form.name.label')}`,
    }
  },
})
</script>

<template lang="pug">
UiPage
  UiHeader
    UiHeaderTitle
      .pt-1.text-xs.font-medium.text-skin-item-base-down
        | {{ $t('categories.createNewTitle') }}
        template(v-if="parentCategory")
          |
          | {{ $t('common.in')}} {{ parentCategory.name }}

      .pb-1.flex.items-center.gap-4
        | {{ categoryForm.name ? categoryForm.name : $t("categories.form.name.label") }}
        .w-8.h-8.rounded-full.flex-center.text-xl.text-skin-icon-base(
          :style="{ background: categoryForm.color }"
        )
          div(:class="categoryForm.icon")
  .pb-12
    CategoriesForm(
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    )
</template>

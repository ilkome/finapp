<script setup lang="ts">
import { allColors } from '~/assets/js/colors'
import { random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'

const { $store } = useNuxtApp()
const emit = defineEmits(['afterSave'])

const categoryForm = ref({
  color: random(random(allColors)),
  icon: random(random(icons)),
  name: null,
  order: 1,
  parentId: 0,
  showInLastUsed: true,
  showInQuickSelector: false,
  showStat: true,
})

const parentCategory = computed(() => {
  if (categoryForm.value.parentId === 0)
    return false

  return $store.state.categories.items[categoryForm.value.parentId]
})

function updateValue(id, value) {
  categoryForm.value[id] = value
}

function afterSave() {
  emit('afterSave')
}
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
    router-link(v-slot="{ href, navigate }" to="/categories" custom)
      a.grow.hocus_bg-skin-item-main-hover(:href="href" @click="navigate")
        UiHeaderTitle
          .pb-1.text-xs.font-medium.text-skin-item-base-down
            | {{ $t('categories.createNewTitle') }}
            template(v-if="parentCategory")
              |
              | in {{ parentCategory.name }}

          .flex.items-center.gap-4
            | {{ categoryForm.name ? categoryForm.name : $t("categories.form.name.label") }}
            .w-8.h-8.rounded-full.flex-center.text-xl.text-skin-icon-base(:style="{ background: categoryForm.color }")
              div(:class="categoryForm.icon")
  .pb-12
    CategoriesForm(
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    )
</template>

<script setup lang="ts">
import { getPreparedFormData } from '~/components/categories/getForm'
import { getParentCategory } from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategories'

const categoriesStore = useCategoriesStore()
const router = useRouter()

const categoryForm = ref(getPreparedFormData())
const parentCategory = computed(() =>
  getParentCategory(categoriesStore.items, categoryForm.value.parentId))

const updateValue = (id, value) => categoryForm.value[id] = value
const afterSave = () => router.replace('/categories/')
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

<template lang="html">
  <UiPage>
    <UiHeader>
      <RouterLink
        v-slot="{ href, navigate }"
        to="/categories"
        custom
      >
        <a
          class="grow hocus:bg-item-5"
          :href="href"
          @click="navigate"
        >
          <UiHeaderTitle2>
            <div class="pt-1 text-xs font-medium text-item-2">
              {{ $t('categories.createNewTitle') }}
              <template v-if="parentCategory">
                {{ $t('common.in') }} {{ parentCategory.name }}
              </template>
            </div>
            <div class="pb-1 flex items-center gap-4">
              {{ categoryForm.name ? categoryForm.name : $t("categories.form.name.label") }}
              <div
                class="size-8 rounded-full flex-center text-xl text-icon-primary"
                :style="{ background: categoryForm.color }"
              >
                <div :class="categoryForm.icon" />
              </div>
            </div>
          </UiHeaderTitle2>
        </a>
      </RouterLink>
    </UiHeader>

    <CategoriesForm
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    />
  </UiPage>
</template>

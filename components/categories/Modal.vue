<script>
import { useContext } from '@nuxtjs/composition-api'
import { removeData } from '~/services/firebaseHelpers'
import useFilter from '~/modules/filter/useFilter'

export default {
  setup () {
    const { store } = useContext()
    const { setCategoryFilter } = useFilter()

    const closed = () => {
      store.commit('categories/hideCategoryModal')
      store.commit('categories/setCategoryModalId', null)
    }

    return {
      setCategoryFilter,
      closed
    }
  },

  data () {
    return {
      showModalConfirm: false
    }
  },

  computed: {
    categoryId () {
      return this.$store.state.categories.modal.id
    },
    category () {
      return this.$store.state.categories.items[this.categoryId]
    },

    deleteInfo () {
      if (this.trnsIds.length > 0)
        return `It's also will delete ${this.trnsIds.length} trns in this category`

      return null
    },

    childCategoriesIds () {
      return this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)
    },

    trnsIds () {
      const trns = this.$store.state.trns.items
      const trnsIds = []
      for (const trnId in trns)
        if (trns[trnId].categoryId === this.categoryId) trnsIds.push(trnId)

      return trnsIds
    }
  },

  methods: {
    handleSetFilterCategory () {
      this.setCategoryFilter(this.categoryId)
      this.$store.commit('filter/setFilterDateNow')

      this.$store.commit('categories/hideCategoryModal')
      this.$store.commit('categories/setCategoryModalId', null)

      this.$store.dispatch('ui/setActiveTabStat', 'details')
    },

    handleEditClick () {
      const categoryId = this.categoryId
      this.$store.commit('categories/hideCategoryModal')
      this.$store.commit('categories/setCategoryModalId', null)
      this.$store.commit('categories/setCategoryEditId', categoryId)
      this.$store.dispatch('ui/setActiveTab', 'createCategory')
    },

    handleDeleteClick () {
      const categories = this.$store.state.categories.items
      const id = this.categoryId
      let isChildCategories = false

      for (const categoryId in categories) {
        if (categories[categoryId].parentId === id) {
          this.$notify({
            title: '👆',
            text: 'You can not delete category with child categories'
          })
          isChildCategories = true
          break
        }
      }

      if (!isChildCategories) this.showModalConfirm = true
    },

    handleDeleteConfirm () {
      const trnsIds = this.trnsIds
      const uid = this.$store.state.user.user.uid
      const id = this.categoryId

      this.showModalConfirm = false
      if (this.category.parentId !== 0) {
        this.$store.commit('categories/setCategoryModalId', this.category.parentId)
      }
      else {
        this.$store.commit('categories/hideCategoryModal')
        this.$store.commit('categories/setCategoryModalId', null)
      }

      setTimeout(async () => {
        await this.$store.dispatch('trns/deleteTrnsByIds', trnsIds)
        removeData(`users/${uid}/categories/${id}`)
      }, 200)
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="$store.state.categories.modal.show"
  key="categoriesModal"
  to="modal"
)
  LazyBaseBottomSheet(
    v-if="$store.state.categories.modal.id"
    :maxHeight="$store.state.ui.height"
    key="categoriesModal"
    @closed="closed()"
  )
    template(#handler="{ close }")
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      .header
        .header__category
          .header__icon
            Icon(
              :icon="category.icon"
              :background="category.color || $store.state.ui.defaultBgColor"
              :round="true"
              :big="true"
            )
          .header__title {{ category.name }}
          .header__subCategory(v-if="category.parentId") {{ $store.state.categories.items[category.parentId].name }}

    template(#default="{ close }")
      .content
        .tools
          .modalLinks
            ModalButton(
              v-if="categoryId !== 'transfer'"
              :name="$t('base.delete')"
              icon="mdi mdi-delete-empty-outline"
              @onClick="handleDeleteClick"
            )
            ModalButton(
              :name="$t('base.edit')"
              icon="mdi mdi-pencil-outline"
              @onClick="handleEditClick"
            )
            ModalButton(
              :name="$t('base.filter')"
              icon="mdi mdi-filter-outline"
              @onClick="handleSetFilterCategory"
            )

        template(v-if="childCategoriesIds.length")
          .categoriesTitle {{ $t('categories.title') }}
          .categories
            CategoriesView(
              :borderTop="true"
              :ids="childCategoriesIds"
              :noPadding="true"
              @onClick="id => $store.dispatch('categories/showCategoryModal', id)"
            )

        .wrap
          .button(
            v-if="category.parentId"
            @click="$store.dispatch('categories/showCategoryModal', category.parentId)"
          ) {{ $t('backTo') }} {{ $store.state.categories.items[category.parentId].name }}

          .button(
            v-if="category.parentId === 0"
            @click="close()"
          ) {{ $t('close') }}

  ModalBottomConfirm(
    :description="deleteInfo"
    :show="showModalConfirm"
    @onClose="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.content
  padding 0
  padding-bottom $m6
  background var(--c-bg-3)
  +media(600px)
    border-radius 0 0 $m7 $m7

.tools
  padding-top 0

.categoriesTitle
  margin-bottom (- $m5)
  padding $m8
  padding-bottom 0
  color var(--c-font-3)
  font-size 10px
  letter-spacing 1px
  font-weight 600
  text-transform uppercase

.categories
  padding $m6
  padding-bottom $m4

.wrap
  padding 0 $m8

.button
  button-base-1()
  margin $m8 auto $m5 auto

.header
  flex-grow 1
  position relative
  display flex
  align-items center
  padding $m7
  padding-bottom $m8
  color var(--c-font-2)
  fontFamilyNunito()
  background var(--c-bg-3)
  border-radius $m7 $m7 0 0

  &__subCategory
    padding-top $m3

  &__title
    font-size 28px
    font-weight 700
    text-align center
    flex-grow 1

  &__category
    flex-grow 1
    display flex
    align-items center
    justify-content center
    flex-flow column

  &__icon
    flex-grow 1
    display flex
    align-items center
    justify-content center
    margin-top -36px
    padding-bottom 12px
</style>

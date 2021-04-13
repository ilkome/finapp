<script>
import { db } from '~/services/firebaseConfig'

export default {
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
      if (this.trnsIds.length > 0) {
        return `It's also will delete ${this.trnsIds.length} trns in this category`
      }
      return null
    },

    childCategoriesIds () {
      return this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)
    },

    trnsIds () {
      const trns = this.$store.state.trns.items
      const trnsIds = []
      for (const trnId in trns) {
        if (trns[trnId].categoryId === this.categoryId) { trnsIds.push(trnId) }
      }
      return trnsIds
    }
  },

  methods: {
    handleSetFilterCategory () {
      this.$store.commit('categories/hideCategoryModal')
      this.$store.dispatch('ui/setActiveTab', 'stat')
      this.$store.commit('filter/setFilterDateNow')
      this.$store.dispatch('filter/setFilterCategoryId', this.categoryId)
      this.$store.commit('categories/hideCategoryModal')
      this.$store.commit('categories/setCategoryModalId', null)

      if (this.$store.state.ui.mobile) {
        this.$store.dispatch('ui/setActiveTabViewName', 'stat')
        this.$store.dispatch('ui/setActiveTabStat', 'details')
      }
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

      if (!isChildCategories) { this.showModalConfirm = true }
    },

    handleDeleteConfirm () {
      const trnsIds = this.trnsIds
      const uid = this.$store.state.user.user.uid
      const id = this.categoryId

      this.showModalConfirm = false
      this.$store.commit('categories/hideCategoryModal')
      this.$store.commit('categories/setCategoryModalId', null)

      setTimeout(async () => {
        await this.$store.dispatch('trns/deleteTrnsByIds', trnsIds)
        db.ref(`users/${uid}/categories/${id}`)
          .remove()
          .then(() => { console.log('category deleted') })
      }, 200)
    }
  }
}
</script>

<template lang="pug">
Portal(
  v-if="$store.state.categories.modal.show"
  to="modal"
)
  ModalBottom(
    :key="$store.state.categories.modal.id"
    @onClose="$store.commit('categories/hideCategoryModal')"
    @afterClose="$store.commit('categories/setCategoryModalId', null)"
  )
    template(slot="header")
      .categoryWrap
        .categoryIcon
          Icon(
            :icon="category.icon"
            :background="category.color || $store.state.ui.defaultBgColor"
            :round="true"
            :big="true"
          )
        .modalBottom__header__title {{ category.name }}

    template(slot="btns")
      ModalButton(
        v-if="categoryId !== 'transfer'"
        :name="$t('base.delete')"
        icon="mdi mdi-delete"
        @onClick="handleDeleteClick"
      )
      ModalButton(
        :name="$t('base.edit')"
        icon="mdi mdi-pencil"
        @onClick="handleEditClick"
      )
      ModalButton(
        :name="$t('base.filter')"
        icon="mdi mdi-filter-outline"
        @onClick="handleSetFilterCategory"
      )

    template(v-if="childCategoriesIds.length")
      CategoriesView(
        :borderTop="true"
        :ids="childCategoriesIds"
        :noPadding="true"
        @onClick="id => $store.dispatch('categories/showCategoryModal', id)"
      )

  ModalBottomConfirm(
    :description="deleteInfo"
    :show="showModalConfirm"
    @onClose="showModalConfirm = false"
    @onConfirm="handleDeleteConfirm"
  )
</template>

<style lang="stylus" scoped>
.categoryWrap
  flex-grow 1
  display flex
  align-items center
  justify-content center
  flex-flow column
  margin-bottom -10px

.categoryIcon
  flex-grow 1
  display flex
  align-items center
  justify-content center
  margin-top -38px
  padding-bottom 12px
</style>

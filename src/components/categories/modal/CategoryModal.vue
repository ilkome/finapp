<script>
import { db } from '@/firebase'

import CategoriesView from '@/components/categories/list/CategoriesView'
import Icon from '@/components/icon/Icon'
import ModalBottom from '@/components/modal/ModalBottom'
import ModalBottomConfirm from '@/components/modal/ModalBottomConfirm'
import ModalButton from '@/components/modal/ModalButton'

export default {
  components: {
    CategoriesView,
    Icon,
    ModalBottom,
    ModalBottomConfirm,
    ModalButton
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
      if (this.trnsIds.length > 0) {
        return `It's also will delete ${this.trnsIds.length} trns in this category`
      }
    },
    childCategoriesIds () {
      return this.$store.getters.getChildCategoriesIds(this.categoryId)
    },
    trnsIds () {
      const trns = this.$store.state.trns.items
      let trnsIds = []
      for (const trnId in trns) {
        if (trns[trnId].categoryId === this.categoryId) trnsIds.push(trnId)
      }
      return trnsIds
    }
  },

  methods: {
    handleSetFilterCategory (id) {
      this.$store.commit('hideCategoryModal')
      this.$store.dispatch('setActiveTab', 'stat')
      this.$store.commit('setFilterDateNow')
      this.$store.dispatch('setFilterCategoryId', this.categoryId)
    },

    handleEditClick () {
      const categoryId = this.categoryId
      this.$store.commit('hideCategoryModal')
      this.$store.commit('setCategoryEditId', categoryId)
      this.$store.dispatch('setActiveTab', 'createCategory')
    },

    handleDeleteClick () {
      const categories = this.$store.state.categories.items
      const id = this.categoryId
      let isChildCategories = false

      for (const categoryId in categories) {
        if (categories[categoryId].parentId === id) {
          this.$notify({
            group: 'main',
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
      this.$store.commit('hideCategoryModal')
      this.$store.commit('setCategoryModalId', null)

      setTimeout(async () => {
        await this.$store.dispatch('deleteTrnsByIds', trnsIds)
        db.ref(`users/${uid}/categories/${id}`)
          .remove()
          .then(() => { console.log('category deleted') })
      }, 200)
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  v-if="$store.state.categories.modal.id"
  :show="$store.state.categories.modal.show"
  v-on:onClose="$store.commit('hideCategoryModal')"
  v-on:afterClose="$store.commit('setCategoryModalId', null)")
  template(slot="header")
    .modalBottom__header__back: .mdi.mdi-chevron-left
    .modalBottom__header__title {{ category.name }}
    .modalBottom__child(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
    .modalBottom__icon
      Icon(
        :icon="category.icon"
        :background="category.color || $store.state.ui.defaultBgColor"
        :round="true"
        :big="true")

  template(slot="btns")
    ModalButton(
      :name="$lang.base.delete"
      icon="mdi mdi-delete"
      v-on:onClick="handleDeleteClick")
    ModalButton(
      :name="$lang.base.edit"
      icon="mdi mdi-pencil"
      v-on:onClick="handleEditClick")
    ModalButton(
      :name="$lang.base.filter"
      icon="mdi mdi-filter-outline"
      v-on:onClick="handleSetFilterCategory")

  template(v-if="childCategoriesIds.length")
    CategoriesView(
      :borderTop="true"
      :ids="childCategoriesIds"
      :noPadding="true"
      v-on:onClick="id => $store.dispatch('showCategoryModal', id)")

  ModalBottomConfirm(
    :show="showModalConfirm"
    :description="deleteInfo"
    v-on:onClose="showModalConfirm = false"
    v-on:onConfirm="handleDeleteConfirm")
</template>

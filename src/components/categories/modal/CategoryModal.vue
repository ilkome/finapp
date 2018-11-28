<script>
import { db } from '@/firebase'

import CategoriesView from '@/components/categories/list/CategoriesView'
import Icon from '@/components/icon/Icon'
import ModalBottom from '@/components/modal/ModalBottom'
import ModalBottomConfirm from '@/components/modal/ModalBottomConfirm'
import ModalButton from '@/components/modal/ModalButton'
import TrnItem from '@/components/trns/item/TrnItem'

export default {
  components: {
    CategoriesView,
    Icon,
    ModalBottom,
    ModalBottomConfirm,
    ModalButton,
    TrnItem
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
    handleCategoryClick (id) {
      this.$store.commit('showCategoryModal')
      this.$store.commit('setCategoryModalId', id)
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

      let isTrns = false
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

      if (!isTrns && !isChildCategories) this.showModalConfirm = true
    },

    handleDeleteConfirm () {
      const trnsIds = this.trnsIds
      const uid = this.$store.state.user.user.uid
      const id = this.categoryId

      this.showModalConfirm = false
      this.$store.commit('hideCategoryModal')
      this.$store.commit('setCategoryModalId', null)

      setTimeout(async () => {
        await this.deleteAllTrns(trnsIds)
        db.ref(`users/${uid}/categories/${id}`)
          .remove()
          .then(() => { console.log('removed category') })
      }, 200)
    },

    async deleteAllTrns (trnsIds) {
      const uid = this.$store.state.user.user.uid
      const removeTrnsIds = {}
      for (const trnId of trnsIds) {
        removeTrnsIds[trnId] = null
      }

      await db.ref(`users/${uid}/trns`)
        .update(removeTrnsIds)
        .then(() => console.log('removed all'))
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  v-if="$store.state.categories.modal.id"
  :show="$store.state.categories.modal.show"
  v-on:onClose="$store.commit('hideCategoryModal')"
  v-on:afterClose="$store.commit('setCategoryModalId', null)"
)
  template(slot="header")
    .modalBottom__header__back: .mdi.mdi-chevron-left
    .modalBottom__header__title {{ category.name }}
    .modalBottom__child(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
    .modalBottom__icon
      Icon(
        :icon="category.icon"
        :background="category.color || $store.state.ui.defaultBgColor"
        :round="true"
        :big="true"
      )

  template(slot="btns")
    ModalButton(
      name="Delete"
      icon="mdi mdi-delete"
      v-on:onClick="handleDeleteClick"
    )
    ModalButton(
      name="Edit"
      icon="mdi mdi-pencil"
      v-on:onClick="handleEditClick"
    )
    ModalButton(
      name="Set filter"
      icon="mdi mdi-filter-outline"
      v-on:onClick="handleSetFilterCategory"
    )

  template(v-if="childCategoriesIds.length > 0 && trnsIds.length > 0")
    TrnItem(
      v-for="trnId in trnsIds"
      :key="trnId"
      :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
      :trnId="trnId"
      :trn="$store.state.trns.items[trnId]"
      :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].accountId]"
    )

  template(v-if="childCategoriesIds.length")
    CategoriesView(
      :borderTop="true"
      :ids="childCategoriesIds"
      :noPadding="true"
      v-on:onClick="handleCategoryClick"
    )

  ModalBottomConfirm(
    :show="showModalConfirm"
    :description="deleteInfo"
    v-on:onClose="showModalConfirm = false"
    v-on:onConfirm="handleDeleteConfirm"
  )
</template>

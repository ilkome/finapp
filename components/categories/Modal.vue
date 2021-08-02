<script>
import { useContext } from '@nuxtjs/composition-api'
import { db } from '~/services/firebaseConfig'

export default {
  setup () {
    const { store } = useContext()

    const closed = () => {
      store.commit('categories/hideCategoryModal')
      store.commit('categories/setCategoryModalId', null)
    }

    return {
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

      if (!isChildCategories) this.showModalConfirm = true
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
          // .then(() => { console.log('category deleted') })
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
    key="categoriesModal"
    @closed="closed()"
  )
    template(#handler="{ close }")
      .handler__close(@click="close")
        svg(
          viewBox='0 0 24 24'
          fill='none'
          stroke='#000'
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='3'
        )
          path(d='M.75 23.249l22.5-22.5')
          path(d='M23.25 23.249L.75.749')

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

    template
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

        //- TODO: translate
        .wrap
          .header__back(
            v-if="category.parentId"
            @click="$store.dispatch('categories/showCategoryModal', category.parentId)"
          )
            svg(width="24" height="24" fill="currentColor")
              path(d="M17.171 2.937a1.5 1.5 0 0 0-2.343-1.874l2.343 1.874zM8 12l-1.171-.937a1.5 1.5 0 0 0 0 1.874L8 12zm6.829 10.937a1.5 1.5 0 0 0 2.343-1.874l-2.343 1.874zm0-21.874l-8 10 2.343 1.874 8-10-2.343-1.874zm-8 11.874l8 10 2.343-1.874-8-10-2.343 1.874z")

            | Back to {{ $store.state.categories.items[category.parentId].name }}

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
  background var(--c-bg-3)
  +media(600px)
    border-radius 0 0 $m7 $m7

.tools
  padding-top $m6

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

.wrap
  padding 0 $m8

.header
  flex-grow 1
  position relative
  display flex
  align-items center
  padding $m7
  color var(--c-font-2)
  fontFamilyNunito()
  background var(--c-bg-3)
  border-radius $m7 $m7 0 0

  &__subCategory
    padding-top $m3

  &__back
    button-base-1()
    margin $m8 auto $m5 auto

    svg
      display none

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
    margin-bottom -10px

  &__icon
    flex-grow 1
    display flex
    align-items center
    justify-content center
    margin-top -38px
    padding-bottom 12px
</style>

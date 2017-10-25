<template lang="pug">
div
  .filter
    input(
      type="text",
      v-model.trim="filter",
      v-focus.lazy="true && !$store.state.isMobile",
      placeholder="Search"
    ).filter__input

    .filter__btns
      template(v-if="!filter")
        .filter__btn._toogle(@click.prevent="toogleShowAllChildCategories()")
          template(v-if="showedChildIds.length")
            .fa.fa-eye
          template(v-else)
            .fa.fa-eye-slash
      template(v-else)
        .filter__btn._edit(@click.prevent="filter = ''")
          .fa.fa-eraser

      .filter__btn._edit(@click.prevent="toogleEditMode()")
        .fa.fa-pencil-square-o

      .filter__btn._edit(@click="$store.commit('toogleCategoryCreate')")
        .fa.fa-plus

  template(v-if="filter.length > 0 && filter.length < 2")
    div Continue typing...

  template(v-if="filter.length >= 2 && searchedCategoriesList.length === 0")
    div Nothing found

  div
    //- Category Item
    template(v-for="category in showedCategories")
      CategoryItem(
        :view="view",
        :isShowEditActions="isShowEditActions",
        :category="category",
        :showedChildIds="showedChildIds",
        :confirmPopCategoryId="confirmPopCategoryId",
        v-on:toogleEditCategory="toogleEditCategory",
        v-on:confirmPop="confirmPop",
        v-on:onClickContent="onClickContent"
      )
        //- Category Item Confirm
        template(slot="confirm")
          CategoryItemConfirm(
            :category="category",
            :avaliableForDelete="avaliableForDelete",
            :deleteCategory="deleteCategory",
            :closeConfirmPop="closeConfirmPop"
          )

        //- Category Item Child
        template(slot="child")
          template(v-if="category.child && category.child.length")
            template(v-for="childCategory in category.child")
              CategoryItem(
                :view="view",
                :isShowEditActions="isShowEditActions",
                :category="childCategory",
                :showedChildIds="showedChildIds",
                :confirmPopCategoryId="confirmPopCategoryId",
                v-on:toogleEditCategory="toogleEditCategory",
                v-on:confirmPop="confirmPop",
                v-on:onClickContent="onClickContent"
              )
                //- Category Item Child Confirm
                template(slot="confirm")
                  CategoryItemConfirm(
                    :category="childCategory",
                    :avaliableForDelete="avaliableForDelete",
                    :deleteCategory="deleteCategory",
                    :closeConfirmPop="closeConfirmPop"
                  )
</template>

<script>
import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import { mapGetters } from 'vuex'
import { mixin } from 'vue-focus'
import CategoryItemConfirm from './CategoryConfirm.vue'
import CategoryItem from './CategoryItem.vue'

export default {
  mixins: [mixin],
  components: { CategoryItem, CategoryItemConfirm },

  props: {
    isShowEditActions: {
      type: Boolean,
      default: false
    },
    view: {
      type: String,
      default: 'page'
    }
  },

  data() {
    return {
      error: null,
      focus: false,
      filter: '',
      confirmPopCategoryId: false,
      showedChildIds: []
    }
  },

  mounted() {
    setTimeout(function () {
      this.focus = true
    }.bind(this), 100)
  },

  computed: {
    ...mapGetters(['trns', 'categories']),

    sortedCategories() {
      return orderBy(this.categories, c => c.parentId, 'asc')
    },

    searchedCategoriesList() {
      const searchOptions = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name']
      }

      const fuse = new Fuse(this.categories, searchOptions)
      const searchResults = fuse.search(this.filter)
      const categoriesResult = []

      if (this.filter.length >= 2) {
        this.showedChildIds = []

        searchResults.map(item => {
          // Root category
          if (item.parentId === 0) {
            if (this.showedChildIds.indexOf(item.id) === -1) {
              this.showedChildIds.push(item.id)
            }

            categoriesResult.push({
              ...item,
              child: []
            })
          }
          // Child category
          if (item.parentId !== 0) {
            if (this.showedChildIds.indexOf(item.parentId) === -1) {
              this.showedChildIds.push(item.parentId)
            }
            const parentCategory = categoriesResult.find(category => category.id === item.parentId)

            // Category already exist in result
            if (parentCategory) {
              parentCategory.child.push(item)
            } else {
              // New category
              const parent = this.categories.find(category => category.id === item.parentId)
              categoriesResult.push({
                ...parent,
                child: [item]
              })
            }
          }
        })
      }

      return categoriesResult
    },

    categoriesList() {
      let categoriesOrganazed = []
      const rootCategories = this.categories.filter(c => c.parentId === 0)
      rootCategories.forEach((category) => {
        const childCategories = this.categories.filter(c => c.parentId === category.id)
        if (childCategories && childCategories.length > 0) {
          categoriesOrganazed.push({
            ...category,
            child: childCategories
          })
        } else {
          categoriesOrganazed.push({
            ...category,
            child: []
          })
        }
      })
      categoriesOrganazed = orderBy(categoriesOrganazed, c => c.name, 'asc')
      return categoriesOrganazed
    },

    showedCategories() {
      if (!this.filter) {
        return this.categoriesList
      }

      if (this.filter.length >= 2 && this.searchedCategoriesList.length) {
        return this.searchedCategoriesList
      }
    }
  },

  methods: {
    onClickContent(category) {
      if (category.child && category.child.length) {
        if (this.showedChildIds.indexOf(category.id) === -1) {
          const ids = this.showedChildIds.concat(category.id)
          this.showedChildIds = ids
        } else {
          const ids = this.showedChildIds.filter(cId => cId !== category.id)
          this.showedChildIds = ids
        }
      } else {
        if (this.view === 'trnForm') {
          this.$emit('onClickContent', category.id)
        }
      }
    },

    avaliableForDelete(categoryId) {
      const parentCategory = this.categories.find(c => c.parentId === categoryId)
      const trnsInCategory = this.trns.filter(trn => trn.categoryId === categoryId)
      if (trnsInCategory.length) {
        return {
          allow: false,
          explain: `You can not delete a category containing trns!`
        }
      }
      if (parentCategory) {
        return {
          allow: false,
          explain: `You can not delete catgory containing child categories!`
        }
      }
      return {
        allow: true
      }
    },

    confirmPop(categoryId) {
      this.confirmPopCategoryId = categoryId
    },

    closeConfirmPop() {
      this.confirmPopCategoryId = false
    },

    toogleShowAllChildCategories() {
      if (this.showedChildIds.length) {
        this.showedChildIds = []
      } else {
        this.categoriesList
          .filter(category => category.child.length)
          .forEach(category => this.showedChildIds.push(category.id))
      }
    },

    toogleEditCategory(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      this.showedChildIds = this.showedChildIds.filter(cId => cId !== category.id)

      if (this.$store.state.categories.editCategory && this.$store.state.categories.editCategory.id === categoryId) {
        this.$store.commit('toogleCategoryEdit', 'hide')
        this.$store.commit('setEditCategory', null)
      } else {
        this.$store.commit('toogleCategoryEdit', 'show')
        this.$store.commit('setEditCategory', category)
      }
    },

    toogleEditMode() {
      this.$emit('update:isShowEditActions', !this.isShowEditActions)
    },

    async deleteCategory(categoryId) {
      this.$store.commit('showLoader')

      // Collapse the parent category when last child category is removed
      const categoryForDelete = this.categories.find(category => category.id === categoryId)
      if (categoryForDelete.parentId !== 0) {
        const parentCategory = this.categories.find(category => category.id === categoryForDelete.parentId)
        if (parentCategory) {
          const childCategories = this.categories.filter(cat => cat.parentId === parentCategory.id)
          if (childCategories && childCategories.length === 1) {
            if (this.showedChildIds.indexOf(parentCategory.id) !== -1) {
              this.showedChildIds = this.showedChildIds.filter(cId => cId !== parentCategory.id)
            }
          }
        }
      }

      this.confirmPopCategoryId = false
      await this.$store.dispatch('deleteCategory', categoryForDelete.id)
      this.$store.commit('closeLoader')
    }
  }
}
</script>

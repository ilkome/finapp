<template lang="pug">
.categories
  .categories__filter
    input(
      type="text",
      v-model.trim="filter",
      v-focus.lazy="true",
      placeholder="Search category"
    ).categories__filter__input

    template(v-if="!filter")
      .categories__filter__btn._edit(@click.prevent="toogleShowAllChildCategories()")
        template(v-if="showedChildIds.length")
          .fa.fa-eye
        template(v-else)
          .fa.fa-eye-slash
    template(v-else)
      .categories__filter__btn._edit(@click.prevent="filter = ''")
        .fa.fa-eraser

    .categories__filter__btn._edit(@click.prevent="toogleEditMode()")
      .fa.fa-pencil-square-o

  template(v-if="filter.length > 0 && filter.length < 2")
    div Continue typing...

  template(v-if="filter.length >= 2 && searchedCategoriesList.length === 0")
    div Nothing found

  .categories_list
    //- Category Item
    template(v-for="category in showedCategories")
      CategoryItem(
        :view="view",
        :isShowEditActions="isShowEditActions",
        :category="category",
        :editCategoryId="editCategoryId",
        :showedChildIds="showedChildIds",
        :toogleEditCategory="toogleEditCategory",
        :confirmPopCategoryId="confirmPopCategoryId",
        v-on:confirmPop="confirmPop",
        v-on:onClickContent="onClickContent"
      )
        //- Category Item Confirm
        template(slot="confirm")
          CategoryItemConfirm(
            :category="category",
            :isAvaliableForDelete="isAvaliableForDelete",
            :deleteCategory="deleteCategory",
            :closeConfirmPop="closeConfirmPop"
          )
        //- Category Item Edit
        template(slot="edit")
          CategoryEdit(:values="editCategoryValues")

        //- Category Item Child
        template(slot="child")
          template(v-for="childCategory in category.child")
            CategoryItem(
              :view="view",
              :isShowEditActions="isShowEditActions",
              :category="childCategory",
              :editCategoryId="editCategoryId",
              :showedChildIds="showedChildIds",
              :toogleEditCategory="toogleEditCategory",
              :confirmPopCategoryId="confirmPopCategoryId",
              v-on:confirmPop="confirmPop",
              v-on:onClickContent="onClickContent"
            )
              //- Category Item Child Confirm
              template(slot="confirm")
                CategoryItemConfirm(
                  :category="childCategory",
                  :isAvaliableForDelete="isAvaliableForDelete",
                  :deleteCategory="deleteCategory",
                  :closeConfirmPop="closeConfirmPop"
                )
              //- Category Item Edit
              template(slot="edit")
                CategoryEdit(:values="editCategoryValues")
</template>

<script>
import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import { mapGetters } from 'vuex'
import { mixin } from 'vue-focus'
import CategoryItemConfirm from './CategoryConfirm.vue'
import CategoryCreate from './CategoryCreate.vue'
import CategoryItemForm from './CategoryForm.vue'
import CategoryEdit from './CategoryEdit.vue'
import CategoryItem from './CategoryItem.vue'

export default {
  mixins: [mixin],
  components: { CategoryCreate, CategoryEdit, CategoryItem, CategoryItemForm, CategoryItemConfirm },

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
      focus: false,
      filter: '',
      editCategoryId: false,
      editCategoryValues: {
        name: null,
        color: '#000000',
        icon: null,
        parentId: 0
      },
      newCategory: {
        name: 'Hello',
        color: '#000000',
        icon: null,
        parentId: 0
      },
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
          if (item.parentId > 0) {
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
      if (category.child && category.child.length && this.editCategoryId !== category.id) {
        if (this.showedChildIds.indexOf(category.id) === -1) {
          const ids = this.showedChildIds.concat(category.id)
          this.showedChildIds = ids
        } else {
          const ids = this.showedChildIds.filter(cId => cId !== category.id)
          this.showedChildIds = ids
        }
      } else {
        if (this.view === 'trnForm') {
          this.$emit('onClickContent', category)
        }
      }
    },

    isAvaliableForDelete(categoryId) {
      const parentCategory = this.categories.filter(c => c.parentId === categoryId)
      const trnsInCategory = this.trns.filter(trn => trn.categoryId === categoryId)
      if (trnsInCategory.length) {
        return {
          allow: false,
          explain: `You can not delete a category containing trns!`
        }
      }
      if (parentCategory.length) {
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
      // Collapse the parent category when edit
      if (this.showedChildIds.indexOf(categoryId) !== -1) {
        this.editCategoryValues = null
        this.showedChildIds = this.showedChildIds.filter(cId => cId !== categoryId)
      }

      if (this.editCategoryId === +categoryId) {
        this.editCategoryId = false
        this.editCategoryValues = null
      } else {
        this.editCategoryId = categoryId
        const category = this.categories.find(c => c.id === categoryId)
        this.editCategoryValues = {
          ...category
        }
      }
    },

    toogleEditMode() {
      this.$emit('update:isShowEditActions', !this.isShowEditActions)
    },

    async editCategory(values) {
      this.$store.commit('showLoader')
      const formatedValues = {
        ...values,
        color: values.color ? values.color : '#000000'
      }
      const result = await this.$store.dispatch('updateCategory', formatedValues)
      if (result) {
        this.editCategoryId = false
        this.editCategoryValues = null
        this.$store.commit('closeLoader')
      }
    },

    async deleteCategory(categoryId) {
      // Collapse the parent category when last child category is removed
      const deletedCategory = this.categories.find(category => category.id === categoryId)
      if (deletedCategory.parentId !== 0) {
        const parentCategory = this.categories.find(category => category.id === deletedCategory.parentId)
        const childCategories = this.categories.filter(cat => cat.parentId === parentCategory.id)
        if (childCategories.length === 1) {
          if (this.showedChildIds.indexOf(parentCategory.id) !== -1) {
            this.showedChildIds = this.showedChildIds.filter(cId => cId !== parentCategory.id)
          }
        }
      }

      this.confirmPopCategoryId = false
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteCategory', +categoryId)
      this.$store.commit('closeLoader')
    }
  }
}
</script>

<template lang="pug">
.content
  .module
    h1.title Categories

    .gridTable
      .gridTable__item
        input(type="text", v-model.trim="filter", placeholder="Filter" v-focus.lazy="true").filterBtn

        .categories
          //- Category
          //------------------------------------------------
          .categoryItem(
            v-for="category in categoriesList",
            :key="category.id",
            :class="{_editable: editedCategory === category.id, _opened: showedChildrenCategories.indexOf(category.id) !== -1}"
          )
            .categoryItem__content
              router-link(:to="`/categories/${category.id}`").categoryItem__icon
                .icon(:class="`icon-${category.id}`"): .icon__pic
              .categoryItem__name {{ category.name }}
              template(v-if="category.children")
                .categoryItem__action(@click="toogleShowChildrenCategoriess(category.id)"): .fa.fa-list

              template(v-if="editedCategory === category.id")
                .categoryItem__action(@click.prevent="setEditedCategory(category.id)")
                  .fa.fa-times-circle
              template(v-else)
                .categoryItem__action(@click.prevent="setEditedCategory(category.id)")
                  .fa.fa-pencil-square-o

              .categoryItem__action(@click.prevent="askQuestion(category.id)")
                .fa.fa-trash-o

            .item__question(:class="{_visible: questionId === category.id}")
              .item__el._question
                div Удалить транзакцию?
              .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
              .item__el._action(@click.prevent.stop="deleteCategory(category.id)"): .fa.fa-check

            //- Category edit
            //------------------------------------------------
            template(v-if="editedCategory === category.id")
              .categoryItem__edit
                .form
                  .input
                    input.input__field(
                      v-model.lazy="values.name = category.name", type="text" name="name")
                  .input
                    input.input__field(
                      v-model.lazy="values.parentId = category.parentId", type="text" name="parentId")
                  .btn(@click="updateCategory(category, values)") Update

            //- Children
            //------------------------------------------------
            template(v-if="category.children")
              template(v-if="showedChildrenCategories.indexOf(category.id) !== -1")
                .categoryItem__children
                  .categoryItem(
                    v-for="childrenCategory in category.children",
                    :key="childrenCategory.id",
                    :class="{_editable: editedCategory === childrenCategory.id}")
                    .categoryItem__content
                      router-link(:to="`/categories/${childrenCategory.id}`").categoryItem__icon
                        .icon(:class="`icon-${childrenCategory.parentId} icon-${childrenCategory.id}`"): .icon__pic
                      router-link(:to="`/categories/${childrenCategory.id}`").categoryItem__name {{ childrenCategory.name }}
                      template(v-if="editedCategory === childrenCategory.id")
                        .categoryItem__action(@click.prevent="setEditedCategory(childrenCategory.id)"): .fa.fa-times-circle
                      template(v-else)
                        .categoryItem__action(@click.prevent="setEditedCategory(childrenCategory.id)"): .fa.fa-pencil-square-o
                      .categoryItem__action(@click.prevent="askQuestion(childrenCategory.id)")
                        .fa.fa-trash-o

                    .item__question(:class="{_visible: questionId === childrenCategory.id}")
                      .item__el._question
                        div Удалить транзакцию?
                      .item__el._action(@click.prevent.stop="close()"): .fa.fa-ban
                      .item__el._action(@click.prevent.stop="deleteCategory(childrenCategory.id)"): .fa.fa-check

                    //- Children edit
                    //------------------------------------------------
                    template(v-if="editedCategory === childrenCategory.id")
                      .categoryItem__edit
                        .form
                          .input
                            input.input__field(
                              v-model.lazy="values.name = childrenCategory.name", type="text" name="name")
                          .input
                            input.input__field(
                              v-model.lazy="values.parentId = childrenCategory.parentId", type="text" name="parentId")
                          .btn(@click="updateCategory(childrenCategory, values)") Update


      .gridTable__item
        .panel._mb
          h4.title._mbs Create category
          .panel__content
            .input
              input(v-model.trim="newCategory.name", placeholder="Write category name" type="text").input__field
              .input__label Name
            .input
              input(v-model.trim="newCategory.parentId", placeholder="Write parent id" type="text").input__field
              .input__label Parent id
            .submit
              .submit__btn(@click.prevent="addCategory(newCategory)") Create category

        .categoriesIcons._mb
          .categoriesIcons__el(v-for="category in categoriesList", :key="category.id")
            router-link.icon(
              :to="`/categories/${category.id}`",
              :class="`icon-${category.id}`",
              :title="category.name"): .icon__pic

</template>

<script>
import { mapGetters } from 'vuex'
import orderBy from 'lodash/orderBy'
import { mixin } from 'vue-focus'

export default {
  mixins: [mixin],

  data() {
    return {
      filter: '',
      editedCategory: false,
      values: {
        name: null,
        parentId: 0
      },
      newCategory: {
        name: '',
        parentId: 0
      },
      questionId: false,
      showedChildrenCategories: []
    }
  },

  computed: {
    ...mapGetters(['categories']),

    categoriesList() {
      let filteredCategories = []
      if (this.filter !== '') {
        filteredCategories = this.categories
          .filter(c => c.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
      } else {
        filteredCategories = this.categories
      }

      const sortedCategories = []
      const rootCategories = filteredCategories.filter(c => c.parentId === 0)
      rootCategories.forEach((category) => {
        const childrenCategories = filteredCategories.filter(c => c.parentId === category.id)
        if (childrenCategories && childrenCategories.length > 0) {
          sortedCategories.push({
            ...category,
            children: childrenCategories
          })
        } else {
          sortedCategories.push({ ...category })
        }
      })

      return orderBy(sortedCategories, c => c.name, 'asc')
    }
  },

  methods: {
    askQuestion(accountId) {
      console.log(accountId)
      this.questionId = accountId
    },

    close() {
      this.questionId = false
    },

    toogleShowChildrenCategoriess(categoryId) {
      if (this.showedChildrenCategories.indexOf(categoryId) === -1) {
        this.showedChildrenCategories.push(categoryId)
      } else {
        this.showedChildrenCategories = this.showedChildrenCategories.filter(cId => cId !== categoryId)
      }
    },

    setEditedCategory(categoryId) {
      if (this.editedCategory === +categoryId) this.editedCategory = false
      else this.editedCategory = categoryId
    },

    async addCategory(category) {
      console.groupCollapsed('CategoriesList: addCategory')
      this.$store.commit('showLoader')
      const result = await this.$store.dispatch('addCategory', category)
      if (result) {
        this.newCategory.name = ''
        this.newCategory.parentId = ''
        this.$store.commit('disableLoader')
      }
      console.groupEnd()
    },

    async updateCategory(category, values) {
      console.groupCollapsed('CategoriesList: updateCategory')
      this.$store.commit('showLoader')
      const updatedCategory = {
        ...category,
        ...values
      }
      const result = await this.$store.dispatch('updateCategory', updatedCategory)
      if (result) {
        this.editedCategory = false
        this.$store.commit('disableLoader')
      }
      console.groupEnd()
    },

    async deleteCategory(categoryId) {
      this.questionId = false
      console.groupCollapsed('CategoriesList: deleteCategory')
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteCategory', +categoryId)
      this.$store.commit('disableLoader')
      console.groupEnd()
    }
  }
}
</script>

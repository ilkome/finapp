<template lang="pug">
.sidebar._active
  .sidebar__overlay(
    @click="hideBar()"
  )

  .sidebar__block
    .sidebar__close(@click="hideBar()")
      .sidebar__close-title Edit category
      .sidebar__close-icon: .mdi.mdi-plus

    .rightBar__in
      .rightBar__main
        .rightBar__main__in
          .form
            .form__table
              //- Name
              .form__table__cell._name
                .input
                  input.input__field(
                    v-model="values.name"
                    v-focus.lazy="true && !$store.state.isMobile",
                    type="text"
                    placeholder="Write category name"
                    name="name"
                  )
                  .input__label Name

              //- Color
              .form__table__cell._color
                input.input__field._color(
                  v-model="values.color"
                  type="color"
                  name="color"
                )

              //- Icon
              .form__table__cell._icon
                .icon._link._small(
                  :style="`background: ${values.color}`"
                  @click.prevent="toogleIconsPop()"
                )
                  template(v-if="selectedIcon")
                    .icon__i(:class="selectedIcon")
                  template(v-else)
                    .icon__i(class="fa fa-question-circle-o")
                  .icon__label
                    .icon__label__in Select icon

            .checkbox
              input#showStat.checkbox__none(type="checkbox" v-model="values.showStat")
              label.checkbox__input(for="showStat")
              label.checkbox__label(for="showStat") Show stat on Dashboard

            //- Has children categories
            template(v-if="isHasChildrenCategories(editedCategory.id)")
              div.mb20
                div Category has children categories.
                div You can not change parent of this category.

            //- Categories
            //- Good to set parent category
            template(v-else)
              .trnForm__icons
                .trnForm__subTitle
                  .trnForm__subTitle__flex
                    //- It's parent
                    template(v-if="values.parentId !== 0")
                      .icon._link._small(
                        :style="{ background: selectedParentCategory.color }"
                        :title="selectedParentCategory.name"
                      )
                        .icon__i(:class="selectedParentCategory.icon")
                        .icon__label
                          .icon__label__in {{ selectedParentCategory.name }}
                      .name {{ selectedParentCategory.name }}
                    template(v-else)
                      .icon._link._small
                        .icon__i(class="fa fa-question-circle-o")
                        .icon__label
                          .icon__label__in Root category
                      .name Root category

                //- Parents icons
                .iconsGroup
                  //- Set root
                  .iconsGroup__el
                    .icon._link(
                      :class="{_active: (values.parentId === 0)}"
                      @click.prevent="selectParent(null)"
                    )
                      .icon__i(class="fa fa-question-circle-o")
                      .icon__label
                        .icon__label__in Root category

                  //- Select
                  .iconsGroup__el(v-for="category in showedCategories")
                    .icon._link._small(
                      :class="{_active: (selectedParentCategory && selectedParentCategory.id === category.id)}",
                      @click.prevent="selectParent(category)",
                      :style="{ background: category.color }"
                    )
                      //- :style="{ background: category.color, color: selectedParentCategory && (category.id === selectedParentCategory.id ? category.color : '') }"
                      .icon__i(:class="category.icon")
                      .icon__label
                        .icon__label__in {{ category.name }}

                  //- Show all
                  .iconsGroup__el
                    .icon._link._more._small(
                      @click.prevent="toogleCategoriesPop()",
                      @keyup.enter.prevent="toogleCategoriesPop()",
                      v-shortkey="['alt', 'arrowup']",
                      @shortkey="toogleCategoriesPop()",
                      aria-checked="false", tabindex="0")
                      .mdi.mdi-dots-horizontal
                      .icon__label
                        .icon__label__in Show all categories

            .trnForm__actions__btn(
              @click.prevent="onEditCategory()"
              :class="{ _disable: $store.state.loader}"
            )
              template Update
              template(v-if="$store.state.loader")
                .trnForm__actions__btn__loading
                  .fa.fa-spinner

      //- Categories popup block
      //------------------------------------------------
      transition(name="trnFormAnimation")
        .trnForm__categories(
          v-if="showCategoriesPop"
          v-shortkey="['alt', 'arrowdown']"
          @shortkey="toogleShowCategories()"
        )

          .sidebar__close(@click="toogleCategoriesPop")
            .sidebar__close-title Select category
            .sidebar__close-icon: .mdi.mdi-plus

          .rightBar__parentCategoryPop
            .rightBar__main__in
              template(v-for="category in showedCategories")
                .itemList
                  .itemList__content(@click.prevent="selectParent(category)")
                    .itemList__icon
                      .icon._link(:style="`background: ${category.color}`")
                        .icon__pic: div(:class="category.icon")
                    .itemList__name
                      div {{ category.name }}

      //- Icons popup block
      //------------------------------------------------
      transition(name="trnFormAnimation")
        .trnForm__categories(
          v-if="showIconsPop"
        )
          .sidebar__close(@click="toogleIconsPop")
            .sidebar__close-title Select icon
            .sidebar__close-icon: .mdi.mdi-plus

          .filter
            input(
              type="text",
              v-model.trim="iconFilter",
              v-focus.lazy="showIconsPop && !$store.state.isMobile",
              placeholder="Search"
            ).filter__input
            template(v-if="iconFilter !== ''")
              .filter__btns
                .filter__btn._edit(@click.prevent="iconFilter = ''")
                  .fa.fa-eraser

          .rightBar__iconsPop
            .rightBar__main__in
              template(v-if="iconFilter.length >= 2 && searchedIcons.length === 0")
                div Nothing found

              CategoryColor(v-on:setColor="setColor")

              //- .input
                input.input__field(
                  v-model="values.icon"
                  v-focus.lazy="true",
                  name="icon"
                  type="text"
                  placeholder="Category icon"
                )
                .input__label Icon

              .iconsGroup
                template(v-for="icon in searchedIcons")
                  .iconsGroup__el
                    .icon._link(
                      @click.prevent="selectIcon(icon)"
                      :style="`background: ${values.color}`"
                    )
                      .icon__i(:class="`fa fa-${icon.id}`")
                      .icon__label
                        .icon__label__in {{ icon.name }}
</template>

<script>
import Fuse from 'fuse.js'
import { mixin } from 'vue-focus'
import { mapGetters } from 'vuex'
import icons from '../../libs/icons'
import CategoryList from './CategoryList.vue'
import CategoryColor from './CategoryColor.vue'

export default {
  components: { CategoryList, CategoryColor },
  mixins: [mixin],

  data() {
    return {
      iconFilter: '',
      selectedParentCategory: this.$store.state.categories.editCategory.parent,
      selectedIcon: this.$store.state.categories.editCategory.icon,
      showCategoriesPop: false,
      showedIcons: icons,
      showIconsPop: false,
      values: {
        ...this.$store.state.categories.editCategory
      }
    }
  },

  watch: {
    editedCategory() {
      this.values = {
        ...this.$store.state.categories.editCategory
      }
    }
  },

  computed: {
    ...mapGetters(['trns', 'categories']),
    editedCategory() {
      return this.$store.state.categories.editCategory
    },
    showedCategories() {
      return this.categories.filter(cat => cat.parentId === 0 && cat.id !== this.editedCategory.id)
    },
    searchedIcons() {
      if (this.iconFilter.length >= 2) {
        const searchOptions = {
          shouldSort: true,
          threshold: 0.3,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['name', 'filter', 'categories']
        }

        const fuse = new Fuse(icons, searchOptions)
        const searchResults = fuse.search(this.iconFilter)
        return searchResults
      }
      return icons
    }
  },

  methods: {
    hideBar() {
      this.$store.commit('toogleCategoryEdit', 'hide')
      this.$store.commit('setEditCategory', null)
    },
    async onEditCategory() {
      const formatedValues = {
        id: this.values.id,
        name: this.values.name.trim(),
        color: this.values.color,
        icon: this.values.icon,
        parentId: this.values.parentId ? this.values.parentId : 0,
        showStat: this.values.showStat ? this.values.showStat : false
      }

      if (!formatedValues.name) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Please write category name.',
          type: 'error'
        })
        return
      }

      const sameCategory = this.$store.state.categories.all
        .filter(category =>
          category.name === formatedValues.name &&
          category.icon === formatedValues.icon &&
          category.color === formatedValues.color &&
          category.showStat === formatedValues.showStat &&
          category.parentId === formatedValues.parentId)

      if (sameCategory.length) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          text: 'Same category name is already exist.',
          type: 'error'
        })
        return
      }

      await this.$store.dispatch('updateCategory', formatedValues)
      this.$store.commit('toogleCategoryEdit', 'hide')
      this.$store.commit('setEditCategory', null)
      this.$store.commit('closeLoader')
      this.$notify({
        group: 'foo',
        title: 'Succesed',
        text: 'Category was updated.',
        type: 'success'
      })
    },
    isHasChildrenCategories(categoryId) {
      const childCategories = this.categories.filter(cat => cat.parentId === categoryId)
      if (childCategories.length) {
        return true
      }
    },
    isHasTrns(categoryId) {
      const trns = this.trns.find(trn => trn.categoryId === categoryId)
      if (trns) {
        return true
      }
    },
    selectParent(category) {
      if (category) {
        this.values.parentId = category.id
      } else {
        this.values.parentId = 0
      }
      this.selectedParentCategory = category
      this.showCategoriesPop = false
    },
    selectIcon(icon) {
      if (icon) {
        this.values.icon = `fa fa-${icon.id}`
        this.selectedIcon = `fa fa-${icon.id}`
      }
      this.showIconsPop = false
    },
    setColor(color) {
      this.values.color = color
    },
    toogleCategoriesPop() {
      this.showCategoriesPop = !this.showCategoriesPop
    },
    toogleIconsPop() {
      this.showIconsPop = !this.showIconsPop
    }
  }
}
</script>

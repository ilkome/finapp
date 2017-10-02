<template lang="pug">
.trnForm__in
  .trnForm__form
    .trnForm__form__close(@click="$store.commit('toogleCategoryCreate', 'hide')") +
    .trnForm__form__in
      template(v-if="$store.state.categories.create")
        .trnFormToogle(
          @click.prevent.stop="$store.commit('toogleCategoryCreate', 'hide')",
          :class="{_active: $store.state.categories.create}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      h4.title._mbs Create category
      template(v-if="error")
        .error {{ error }}

      .form
        .input
          .input__label Name
          input.input__field(
            v-model="values.name", type="text", placeholder="Name", name="name")
          input.input__field._color(
            v-model="values.color", type="color", placeholder="Color", name="color")
        .input
          .input__label Icon
          input.input__field(
            v-model="values.icon", type="text", placeholder="Icon", name="icon")

        .trnForm__icons
          .trnForm__subTitle
            template(v-if="values.parentId")
              .name {{ selectedCategory.name }}
            template(v-else)
              .name Root category
            .label Parent category
          .categoriesIcons
            .categoriesIcons__el
              .icon._link(
                :class="{_active: (!selectedCategory)}",
                @click.prevent="selectParent(null)",
                @keyup.enter.prevent="selectParent(null)",
                title="Root category",
                aria-checked="false", tabindex="0")
                .icon__i(class="fa fa-question-circle-o")
                .icon__label Root category

            .categoriesIcons__el(v-for="category in showedCategories")
              .icon._link(
                :class="{_active: (selectedCategory && selectedCategory.id === category.id)}",
                @click.prevent="selectParent(category)",
                @keyup.enter.prevent="selectParent(category)",
                :style="`background: ${category.color}`",
                :title="category.name",
                aria-checked="false", tabindex="0")
                .icon__i(:class="category.icon")
                .icon__label {{ category.name }}

            .categoriesIcons__el
              .icon._link._more(
                @click.prevent="toogleCategoriesPop()",
                @keyup.enter.prevent="toogleCategoriesPop()",
                v-shortkey="['alt', 'arrowup']",
                @shortkey="toogleCategoriesPop()",
                aria-checked="false", tabindex="0")
                .mdi.mdi-dots-horizontal
                .icon__label Show all categories

        .trnForm__actions__btn.mb20(@click.prevent="addCategory") Save

    //- Categories popup block
    //------------------------------------------------
    transition(name="trnFormAnimation")
      .trnForm__categories(
        v-if="show"
        v-shortkey="['alt', 'arrowdown']",
        @shortkey="toogleShowCategories()")

        .trnForm__categories__in
          .trnForm__header
            h4.title._mbn Select category
            .trnForm__header__close.btn._mini(@click.prevent="toogleCategoriesPop()") Back

          .categories
            template(v-for="category in showedCategories")
              .categoryItem
                .categoryItem__content(@click.prevent="selectParent(category)")
                  .categoryItem__icon
                    .icon._link(:style="`background: ${category.color}`")
                      .icon__pic: div(:class="category.icon")
                  .categoryItem__name
                    div {{ category.name }}
</template>

<script>
import { mapGetters } from 'vuex'
import CategoryList from './CategoryList.vue'

export default {
  components: { CategoryList },

  data() {
    return {
      selectedCategory: null,
      show: false,
      values: {
        name: '',
        color: '#242424',
        icon: '',
        parentId: ''
      },
      error: null
    }
  },

  computed: {
    ...mapGetters(['trns', 'categories']),
    showedCategories() {
      return this.categories.filter(cat => cat.parentId === 0)
    }
  },

  methods: {
    async addCategory() {
      this.$store.commit('showLoader')
      this.error = null

      const formatedValues = {
        name: this.values.name.trim(),
        color: this.values.color.trim(),
        icon: this.values.icon ? this.values.icon.trim() : 'fa fa-industry',
        parentId: this.values.parentId ? this.values.parentId.trim() : 0
      }

      if (!formatedValues.name) {
        this.error = 'Please write category name'
        this.$store.commit('closeLoader')
        return
      }

      const sameCategory = this.$store.state.categories.all
        .filter(category =>
          category.name === formatedValues.name &&
          category.icon === formatedValues.icon &&
          category.color === formatedValues.color &&
          category.parentId === formatedValues.parentId)

      if (sameCategory.length) {
        this.error = 'Same category name is already exist!'
        this.$store.commit('closeLoader')
        return
      }

      await this.$store.dispatch('addCategory', formatedValues)
      this.$store.commit('toogleCategoryCreate', 'hide')
      this.values.name = ''
      this.values.color = '#242424'
      this.values.icon = ''
      this.values.parentId = 0
      this.$store.commit('closeLoader')
    },
    selectParent(category) {
      if (category) {
        this.values.parentId = category.id
      } else {
        this.values.parentId = null
      }
      this.selectedCategory = category
      this.show = false
    },
    toogleCategoriesPop() {
      this.show = !this.show
    }
  }
}
</script>

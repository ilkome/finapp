<script>
import { ref, useContext, onMounted } from '@nuxtjs/composition-api'
import { saveData } from '~/services/firebaseHelpers'
import generateId from '~/utils/id'
import { popularColors, allColors } from '~/assets/js/colorsPopular'
import { random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'

export default {
  setup () {
    const { store } = useContext()

    const showColors = ref(false)
    const activeTab = ref('data')

    const category = ref({
      color: '',
      icon: '',
      name: null,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      showStat: true
    })

    function findCategoryWithThisColor (color) {
      const categories = store.state.categories.items
      if (categories) {
        const categoryIdWithThisColor = store.getters['categories/categoriesRootIds']?.find(id => categories[id]?.color === color)
        if (categoryIdWithThisColor)
          return categories[categoryIdWithThisColor]?.icon
      }
    }

    function onSelectColor (color) {
      if (color)
        category.value.color = color
    }

    const documentHeight = ref('100%')
    onMounted(() => {
      documentHeight.value = `${document.documentElement.clientHeight}px`
    })

    return {
      activeTab,
      category,
      findCategoryWithThisColor,

      onSelectColor,
      showColors,

      popularColors,
      allColors,
      documentHeight
    }
  },

  data () {
    return {
      originalParentId: null,
      showParents: false,
      showIcons: false,
      applyChildColor: true
    }
  },

  computed: {
    categoryId () {
      return this.$store.state.categories.editId
    }
  },

  watch: {
    categoryId: {
      handler (categoryId) {
        if (categoryId) {
          this.category = {
            ...this.category,
            ...this.$store.state.categories.items[this.categoryId]
          }

          this.originalParentId = this.category.parentId
        }
      },
      immediate: true
    }
  },

  created () {
    this.colors = allColors
    this.icons = icons
    if (!this.$store.state.categories.editId) {
      this.category.icon = random(random(icons))
      this.category.color = random(popularColors)
    }
  },

  beforeDestroy () {
    this.$store.commit('categories/setCategoryEditId', null)
  },

  methods: {
    closed () {
      this.$store.commit('categories/setCategoryEditId', null)
      this.$store.dispatch('ui/setActiveTab', null)
    },

    handleIconSelect (icon) {
      this.category.icon = icon
      this.showIcons = false
    },

    handleParenCategorySelect (categoryId) {
      const parentCategory = this.$store.state.categories.items[categoryId]
      if (parentCategory)
        this.category.color = parentCategory.color

      this.category.parentId = categoryId
      this.showParents = false
    },

    handleSubmit (close) {
      if (this.validateForm()) {
        const uid = this.$store.state.user.user.uid
        const id = this.categoryId || generateId()
        const categories = this.$store.state.categories.items

        const categoriesValues = {
          order: this.category.order || null,
          color: this.category.color,
          icon: this.category.icon,
          name: this.category.name,
          childIds: this.category.childIds || [],
          parentId: this.category.parentId,
          showInLastUsed: this.category.showInLastUsed,
          showInQuickSelector: this.category.showInQuickSelector,
          showStat: true
        }

        // ad or remove from parent
        if (this.originalParentId !== this.category.parentId) {
          // remove from old parent
          if (this.originalParentId !== 0) {
            const originalParent = categories[this.originalParentId]
            if (originalParent) {
              saveData(`users/${uid}/categories/${this.originalParentId}`, {
                ...originalParent,
                childIds: originalParent.childIds.filter(cId => cId !== id)
              })
            }
          }

          // add to new parent
          if (this.category.parentId !== 0) {
            const parenCategory = categories[this.category.parentId]
            const childIds = parenCategory.childIds
              ? [...parenCategory.childIds.filter(cId => cId !== id), id]
              : [id]

            saveData(`users/${uid}/categories/${this.category.parentId}`, {
              ...parenCategory,
              showInLastUsed: false,
              showInQuickSelector: false,
              childIds
            })
          }
        }

        const childIds = this.$store.getters['categories/getChildCategoriesIds'](id)

        // update category
        saveData(`users/${uid}/categories/${id}`, {
          ...categoriesValues,
          childIds
        })

        // update child categories colors
        if (this.applyChildColor) {
          for (const childId of childIds)
            saveData(`users/${uid}/categories/${childId}/color`, categoriesValues.color)
        }

        close()
      }
    },

    validateForm () {
      const categories = this.$store.state.categories.items
      if (!this.category.name) {
        this.$notify({
          title: '😮',
          text: this.$t('categories.form.name.error')
        })
        return false
      }

      for (const categoryId in categories) {
        if (categories[categoryId].name === this.category.name && categories[categoryId].parentId === this.category.parentId) {
          if (this.categoryId) {
            if (this.categoryId !== categoryId) {
              this.$notify({
                title: '😮',
                text: this.$t('categories.form.name.exist')
              })
              return false
            }
          }
          else {
            this.$notify({
              title: '😮',
              text: this.$t('categories.form.name.exist')
            })
            return false
          }
        }
      }

      return true
    }
  }
}
</script>

<template lang="pug">
div
  Portal(
    key="categoryFormModal"
    to="modal"
  )
    BaseBottomSheet(
      show
      @closed="closed()"
    )
      template(#handler="{ close }")
        BaseBottomSheetClose(@onClick="close")

      template(#default="{ close }")
        .content(:style="{ maxHeight: documentHeight }")
          //- Header
          .header
            template(v-if="!categoryId") {{ $t('categories.createNewTitle') }}
            template(v-else) {{ $t('categories.editTitle') }}

          //-
          //- Menu
          //-
          .menu
            .menuItem(
              :class="{ _active: activeTab === 'data' }"
              @click="activeTab = 'data'"
            ) {{ $t('categories.form.data.label') }}
            .menuItem(
              :class="{ _active: activeTab === 'colors' }"
              @click="activeTab = 'colors'"
            ) {{ $t('categories.form.color.label') }}
            .menuItem(
              :class="{ _active: activeTab === 'icons' }"
              @click="activeTab = 'icons'"
            ) {{ $t('categories.form.icons.label') }}

          .preview(v-if="activeTab !== 'data'")
            .previewIcon
              Icon(
                :icon="category.icon"
                :background="category.color"
                round
              )
            .categoryParentItem(style="width: 100%")
              .categoryParentItem__icon
                Icon(
                  :icon="category.icon"
                  :color="category.color"
                )
              .categoryParentItem__name {{ category.name || $t('categories.form.name.label') }}

          //-
          //- Content
          //-
          .scrollerBlock
            //- Data
            template(v-if="activeTab === 'data'")
              .form
                .inputText
                  .inputText__label {{ $t('categories.form.name.label') }}
                  input(
                    type="text"
                    :placeholder="$t('categories.form.name.placeholder')"
                    v-model="category.name"
                  ).inputText__value

                //- can not change root category if inside this category already has some categories
                div(
                  v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length === 0 && $store.getters['categories/hasCategories']"
                  style="paddingBottom: 8px"
                )
                  .inputText__label {{ $t('categories.form.parent.label') }}

                  div(@click="showParents = true")
                    template(v-if="category.parentId !== 0")
                      CategoriesItemCategoryItem(
                        :category="$store.state.categories.items[category.parentId]"
                        :id="category.parentId"
                      )
                    template(v-else)
                      .categoryParentItem
                        .categoryParentItem__icon
                          Icon(icon="mdi mdi-folder-star")
                        .categoryParentItem__name {{ $t('categories.form.parent.no') }}

                LazySharedContextMenuItem(
                  v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length"
                  :checkboxValue="applyChildColor"
                  :title="$t('categories.form.childColor')"
                  showCheckbox
                  @onClick="applyChildColor = !applyChildColor"
                )
                LazySharedContextMenuItem(
                  v-if="$store.getters['categories/getChildCategoriesIds'](categoryId).length === 0"
                  :checkboxValue="category.showInLastUsed"
                  :title="$t('categories.form.lastUsed')"
                  showCheckbox
                  @onClick="category.showInLastUsed = !category.showInLastUsed"
                )
                SharedContextMenuItem(
                  :checkboxValue="category.showInQuickSelector"
                  :title="$t('categories.form.quickSelector')"
                  showCheckbox
                  @onClick="category.showInQuickSelector = !category.showInQuickSelector"
                )

            //-
            //- Colors
            //-
            template(v-if="activeTab === 'colors'")
              .form
                .subTitle {{ $t('popularColors') }}
                .colors
                  .iconItem(
                    v-for="(color, idx) in popularColors"
                    :key="idx"
                    :class="{ _active: color === category.color }"
                    :style="{ background: color === category.color ? color : 'transparent' }"
                    @click="onSelectColor(color)"
                  )
                    template(v-if="color")
                      //- .colorPreview(:style="{ background: color }")
                      template(v-if="findCategoryWithThisColor(color)")
                        Icon(
                          :icon="findCategoryWithThisColor(color)"
                          :color="color === category.color ? null : color"
                          big
                        )
                      template(v-else-if="color === category.color")
                        Icon(
                          :icon="category.icon"
                          background="transparent"
                          big
                        )
                      template(v-else)
                        .colorPreview(:style="{ background: color }")
                        //- Icon(
                        //-   :icon="category.icon"
                        //-   :color="color"
                        //-   big
                        //- )

                .subTitle {{ $t('palette') }}
                .colors
                  .iconItem(
                    v-for="(color, idx) in allColors"
                    :key="idx"
                    :class="{ _active: color === category.color, _empty: !color }"
                    :style="{ background: color === category.color ? color : 'transparent' }"
                    @click="onSelectColor(color)"
                  )

                    template(v-if="color")
                      template(v-if="findCategoryWithThisColor(color)")
                        Icon(
                          :icon="findCategoryWithThisColor(color)"
                          :color="color === category.color ? null : color"
                          big
                        )
                      template(v-else-if="color === category.color")
                        Icon(
                          :icon="category.icon"
                          background="transparent"
                          big
                        )
                      template(v-else)
                        .colorPreview(:style="{ background: color }")
                        //- Icon(
                        //-   icon="mdi mdi-folder-star"
                        //-   :color="color"
                        //-   big
                        //- )

                .subTitle {{ $t('categories.form.color.custom') }}
                .customColor
                  input.customColor__value(v-model="category.color" type="color")

            template(v-if="activeTab === 'icons'")
              .form
                .icons
                  .icons__group(
                    v-for="iconGroup in icons"
                  )
                    .iconItem(
                      v-for="icon in iconGroup"
                      :class="{ _active: category.icon === icon }"
                      :style="{ color: category.color }"
                      @click="handleIconSelect(icon)"
                    )
                      div(:class="icon")

          //- Submit
          .col(style="padding-top: 16px; text-align: center")
            SharedButton(
              :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
              :title="$t('categories.form.save')"
              @onClick="handleSubmit(close)"
            )
  //-
  //- Parent Modal
  //-
  Portal(to="modal")
    LazyBaseBottomSheet(
      v-if="showParents"
      @closed="showParents = false"
    )
      template(#handler="{ close }")
        BaseBottomSheetClose(@onClick="close")

      template(#default="{ close }")
        .content(:style="{ maxHeight: documentHeight }")
          .scrollerBlock
            .wrap
              //- Header
              .header {{ $t('categories.form.parent.label') }}

              .padding-bottom
                ModalButton(
                  :name="$t('categories.form.parent.no')"
                  icon="mdi mdi-folder-star"
                  @onClick="() => handleParenCategorySelect(0)")

              CategoriesView(
                :activeItemId="category.parentId"
                :noPadding="true"
                :ids="$store.getters['categories/categoriesForBeParent'].filter(cId => cId !== categoryId)"
                @onClick="handleParenCategorySelect"
              )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.preview
  display flex
  align-items center
  justify-content space-between
  padding $m5 $m7
  gap $m7

.subTitle
  padding 0 $m5
  padding-bottom $m6
  color var(--c-font-4)
  font-size 13px
  font-weight 500

.categoryParentItem
  overflow hidden
  cursor pointer
  position relative
  display flex
  flex-flow row nowrap
  align-items center
  justify-content center
  min-height 48px
  padding $m6
  color var(--c-font-1)
  background var(--c-item-bg-main)
  border 1px solid transparent
  border-radius $m5
  anim()
  +media-hover()
    color var(--c-text-1)
    background var(--c-item-bg-hover)
    border 1px solid var(--c-item-bd-hover)

  &__icon
    padding-right $m6
    +media(700px)
      padding-right $m8

  &__name
    overflow hidden
    display flex
    flex-grow 1
    text-overflow ellipsis
    padding-right 0
    font-size 14px

.menu
  overflow hidden
  z-index 10
  display flex
  align-items center
  justify-content space-between
  max-width 480px
  overflow-x auto
  margin 0 auto
  padding $m5 $m6

  +media(600px)
    overflow initial

.menuItem
  cursor pointer
  display flex
  align-items center
  justify-content center
  min-height 38px
  min-width 70px
  margin 0 $m5
  padding $m6 $m7
  color var(--c-font-4)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border-radius $m6
  anim()

  +media(400px)
    min-width 80px
    margin 0 $m5
    padding-right $m7
    padding-left $m7

  +media(600px)
    padding-right $m9
    padding-left $m9

  +media-hover()
    &:not(._active)
      cursor pointer
      color var(--c-font-3)
      background var(--c-item2-bg-hover)

  &._active
    cursor default
    color var(--c-blue-1)
    background var(--c-item-bg-active)

.wrap
  padding 0 $m8
  padding-top $m6

.button
  button-base-1()

.form
  padding $m6

  .inputText
    margin-bottom 0
    padding-bottom $m8

  h2
    padding-bottom $m6

.scrollerBlock
  overflow hidden
  overflow-y auto
  height 100%

.colorPreview
  display flex
  align-items center
  justify-content center
  width 90%
  height 90%
  border-radius 50%

.colors
  display grid
  grid-template-columns repeat(8, minmax(auto, 1fr))
  padding-bottom $m8
  &:last-child
    padding-bottom 0

.icons
  &__group
    display grid
    grid-template-columns repeat(auto-fill, minmax(40px, 1fr))
    padding-bottom $m8

.iconItem
  display flex
  align-items center
  justify-content center
  width 40px
  height 40px
  max-width 40px
  max-height 40px
  padding 4px
  font-size 24px
  border-radius 50%

  +media-hover()
    &:not(._empty)
      cursor pointer
      background var(--c-item-bd-hover)

  &._active
    padding 0
    background var(--c-item-bd-hover)

.header
  position relative
  display flex
  align-items center
  justify-content center
  padding $m7
  padding-top 0
  padding-bottom $m5
  color var(--c-font-3)
  font-size 18px
  font-weight 700
  letter-spacing 1px
  fontFamilyNunito()

  /.light-mode &
    color var(--c-font-4)

.customColor
  padding 0 $m4
  background var(--c-bg-3)

  &__title
    padding-bottom $m6
    color var(--c-font-4)

  &__value
    overflow hidden
    display block
    appearance none
    width 100%
    height 48px
    margin 0
    padding 0
    background none
    border 0
    border-radius $borderRadiusMd

.padding-bottom
  padding-bottom $m8

.content
  overflow hidden
  display grid
  padding-top $m7
  background var(--color-bg-canvas)
  border-radius $m8 $m8 0 0

  +media(600px)
    border-radius 16px

.form__actions
  @media $media-phone
    text-align center

.form__btns
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m9
  grid-row-gap $m9
  padding-bottom $m9

  @media $media-laptop
    grid-column-gap $m10
    grid-row-gap $m10

  &__i._full
    grid-column 1 / -1

  .form-line
    display flex
    align-items center
    justify-content center
    height 100%
    height 56px
    margin-bottom 0

.inputModal
  &._flex
    flex 1
    display flex
    align-items center
    justify-content space-between

  &__content
    display flex

  &__label
    margin 0
    padding 0
    font-size 10px
</style>

<style lang="stylus">
@import '~assets/stylus/variables'
</style>

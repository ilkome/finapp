<script lang="ts">
import { saveData } from '~/services/firebase/api'
import generateId from '~/utils/id'
import { allColors, popularColors } from '~/assets/js/colorsPopular'
import { random } from '~/assets/js/emo'
import icons from '~/assets/js/icons'

export default defineComponent({
  setup() {
    const { $store } = useNuxtApp()
    const activeTab = ref('data')

    const category = ref({
      color: '',
      icon: '',
      name: null,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      showStat: true,
    })

    function findCategoryWithThisColor(color) {
      const categories = $store.state.categories.items
      if (categories) {
        const categoryIdWithThisColor = $store.getters['categories/categoriesRootIds']?.find(id => categories[id]?.color === color)
        if (categoryIdWithThisColor)
          return categories[categoryIdWithThisColor]?.icon
      }
    }

    function onSelectColor(color) {
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

      popularColors,
      allColors,
      documentHeight,
    }
  },

  data() {
    return {
      originalParentId: null,
      showParents: false,
      showIcons: false,
      applyChildColor: true,
    }
  },

  computed: {
    categoryId() {
      return this.$route.params.id
    },
  },

  watch: {
    categoryId: {
      handler(categoryId) {
        if (categoryId) {
          this.category = {
            ...this.category,
            ...this.$store.state.categories.items[this.categoryId],
          }

          this.originalParentId = this.category.parentId
        }
      },
      immediate: true,
    },
  },

  created() {
    this.colors = allColors
    this.icons = icons
    if (!this.categoryId) {
      this.category.icon = random(random(icons))
      this.category.color = random(popularColors)
    }
  },

  beforeUnmount() {
    this.$store.commit('categories/setCategoryEditId', null)
  },

  methods: {
    closed() {
      this.$store.commit('categories/setCategoryEditId', null)
      this.$store.dispatch('ui/setActiveTab', null)
    },

    handleIconSelect(icon) {
      this.category.icon = icon
      this.showIcons = false
    },

    handleParenCategorySelect(categoryId) {
      const parentCategory = this.$store.state.categories.items[categoryId]
      if (parentCategory)
        this.category.color = parentCategory.color

      this.category.parentId = categoryId
      this.showParents = false
    },

    handleSubmit() {
      if (!this.validateForm())
        return

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
        showStat: true,
      }

      // ad or remove from parent
      if (this.originalParentId !== this.category.parentId) {
        // remove from old parent
        if (this.originalParentId !== 0) {
          const originalParent = categories[this.originalParentId]
          if (originalParent) {
            saveData(`users/${uid}/categories/${this.originalParentId}`, {
              ...originalParent,
              childIds: originalParent.childIds.filter(cId => cId !== id),
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
            childIds,
          })
        }
      }

      const childIds = this.$store.getters['categories/getChildCategoriesIds'](id)

      // update category
      saveData(`users/${uid}/categories/${id}`, {
        ...categoriesValues,
      })

      // update child categories colors
      if (this.applyChildColor) {
        for (const childId of childIds)
          saveData(`users/${uid}/categories/${childId}/color`, categoriesValues.color)
      }

      this.$router.replace(`/categories/${id}`)
    },

    validateForm() {
      const categories = this.$store.state.categories.items
      if (!this.category.name) {
        this.$notify({
          title: '😮',
          text: this.$t('categories.form.name.error'),
        })
        return false
      }

      for (const categoryId in categories) {
        if (categories[categoryId].name === this.category.name && categories[categoryId].parentId === this.category.parentId) {
          if (this.categoryId) {
            if (this.categoryId !== categoryId) {
              this.$notify({
                title: '😮',
                text: this.$t('categories.form.name.exist'),
              })
              return false
            }
          }
          else {
            this.$notify({
              title: '😮',
              text: this.$t('categories.form.name.exist'),
            })
            return false
          }
        }
      }

      return true
    },
  },
})
</script>

<template lang="pug">
.relative.h-full.overflow.overflow-x-auto(v-if="category")
  router-link(
    v-slot='{ href, navigate }'
    :to='`/categories/${categoryId}`'
    custom
  )
    a.grow.cursor-pointer.block.py-5.pb-5.mb-3.px-3.font-nunito.hocus_bg-gray-100.dark_hocus_bg-neutral-800(
      :href='href'
      @click='navigate'
    )
      .pb-2.text-xs.font-medium(class="text-white/50") {{ $t('categories.editTitle') }}

      .flex.items-center.gap-3
        .text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold {{ category.name }}
        .w-8.h-8.rounded-full.flex-center.text-xl.text-neutral-50(
          :style="{ background: category.color }"
        )
          div(:class="category.icon")

  //- Menu
  //-----------------------------------
  .px-3.pb-4
    .overflow-hidden.rounded-md.scrollbar.mb-4.bg-gray-50.dark_bg-dark4.dark_shadow
      .overflow-hidden.overflow-x-auto.flex.items-center.text-sm.text-center.max-w-md
        .cursor-pointer.px-6.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTab === 'data' }"
          @click="activeTab = 'data'"
        ) {{ $t('categories.form.data.label') }}

        .cursor-pointer.px-6.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTab === 'colors' }"
          @click="activeTab = 'colors'"
        ) {{ $t('categories.form.colors.label') }}

        .cursor-pointer.px-6.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
          :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': activeTab === 'icons' }"
          @click="activeTab = 'icons'"
        ) {{ $t('categories.form.icons.label') }}

  //- Content
  //-----------------------------------
  .px-3.max-w-md
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

    //- Colors
    //---------------------------------
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

        .subTitle {{ $t('categories.form.colors.custom') }}
        .customColor
          input.customColor__value(v-model="category.color" type="color")

    //- Icons
    //---------------------------------
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
    .pt-4.pb-6
      SharedButton(
        :class="['_text-center _blue2 _ml-big', { _inline: $store.state.ui.pc }]"
        :title="$t('categories.form.save')"
        @onClick="handleSubmit()"
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

      template()
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
                :ids="$store.getters['categories/categoriesForBeParent'].filter(cId => cId !== categoryId)"
                noPadding
                @onClick="handleParenCategorySelect"
              )
</template>

<style lang="stylus" scoped>
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
  /.light &
    color var(--c-font-2)

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

.form
  .inputText
    margin-bottom 0
    padding-bottom $m8

  h2
    padding-bottom $m6

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
  background var(--c-bg-3)
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

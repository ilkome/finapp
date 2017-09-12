<template lang="pug">
.trnForm__in
  .trnForm__form
    .trnForm__form__in
      h2.title._border._mbs
        template(v-if="action === 'create'") Create trn
        template(v-if="action === 'update'") Update trn

      .trnForm__date
        .trnForm__date__link(
          @click="setNextPrevDate('prev')",
          @keyup.enter.prevent="setNextPrevDate('prev')",
          aria-checked="true", tabindex="0"
        ): .fa.fa-chevron-left
        .trnForm__date__value
          .fa.fa-clock-o
          .trnForm__date__value__in {{ values.date | date }}
        .trnForm__date__link(
          @click="setNextPrevDate('next')",
          @keyup.enter.prevent="setNextPrevDate('next')",
          aria-checked="true", tabindex="0"
        ): .fa.fa-chevron-right

      .amount(:class="(values.type === 1) ? '_income' : '_expense'")
        a.amountCount(
          @click="setTrnType()"
          @keyup.enter.prevent="setTrnType()",
          aria-checked="false", tabindex="0"
        )
          .amountCountText
            template(v-if="values.type === 1") +
            template(v-else) -

        .amountValue
          input.amountValueInput(
            v-model.lazy="values.amount",
            @keyup.enter="onSubmitForm",
            v-focus.lazy="$store.state.trnForm.isShow && !show.categories && !$store.state.isMobile",
            type="text",
            name="amount",
            placeholder="0",
            aria-checked="false", tabindex="0"
          )

      .trnForm__icons
        .trnForm__subTitle
          template(v-if="values.categoryId")
            .name {{ selectedCategory.name }}
          .label Category
        .categoriesIcons
          .categoriesIcons__el(v-for="category in lastUsedCategories")
            .icon._link(
              :class="{_active: (category.id === selectedCategory.id)}",
              @click.prevent="setCategory(category.id)",
              @keyup.enter.prevent="setCategory(category.id)",
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

      .trnForm__icons
        .trnForm__subTitle
          .name {{ values.accountName }}
          .label Account
        .categoriesIcons
          .categoriesIcons__el(v-for="account in accounts")
            a.icon._link(
              :class="[{_active: (account.id === values.accountId)}, `bg-${account.id}`]",
              :title="account.name",
              @click.prevent="setAccound(account.id)",
              @keyup.enter.prevent="setAccound(account.id)",
              aria-checked="false", tabindex="0"
            )
              .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
              .icon__label {{ account.name }}

      .trnForm__desc
        input.input-filter._nomargin(
          v-model.trim="values.description",
          @keyup.enter="onSubmitForm",
          type="text",
          name="description",
          placeholder="Description",
          aria-checked="false", tabindex="0"
        )

      .trnForm__actions
      .trnForm__errors(v-if="errors") {{ errors }}
      .trnForm__actions__btn(
        @click.prevent="onSubmitForm()",
        @keyup.enter.prevent="onSubmitForm()",
        aria-checked="false", tabindex="0")
        template(v-if="action === 'create'") Create trn
        template(v-if="action === 'update'") Update trn

  //- Categories popup block
  //------------------------------------------------
  transition(name="trnFormAnimation")
    .trnForm__categories(
      v-if="isShowCategories"
      v-shortkey="['alt', 'arrowdown']",
      @shortkey="toogleShowCategories()")

      .trnForm__categories__in
        .trnForm__header
          h2.title._mbn Select category
          .trnForm__header__close.btn._mini(@click.prevent="toogleCategoriesPop()") Close

        CategoryList(
          v-on:onClickContent="setCategory",
          :isShowEditActions.sync="isShowEditActions",
          view="trnForm")

        CategoryCreate
</template>
<script src="./trnForm.js"></script>

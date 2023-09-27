<template lang="pug">
.h-0
  TrnFormWrap

  //- Trn Item
  TrnsItemModal

  //- Currencies
  CurrenciesModal

  //- Loading
  template(v-if="!$store.state.app.status.ready")
    LoaderSharedLoader

  //- Notifications
  Notifications(
    :max="2"
    :position="$store.state.ui.width < 600 ? 'top center' : 'top center'"
    :width="$store.state.ui.width < 600 ? '94%' : '380px'"
    classes="notifications"
  )
</template>

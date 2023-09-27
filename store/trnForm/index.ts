export function state() {
  return {
    action: 'create',
    height: '100%',

    modal: {
      calendar: false,
      categories: false,
      categoriesChild: false,
      description: false,
      transferFrom: false,
      transferTo: false,
      wallets: false,
      trn: false,
    },

    show: false,
    showModalCategoryId: null,
    showModalTrnId: null,
  }
}

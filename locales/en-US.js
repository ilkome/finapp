export default {
  common: {
    date: 'Date',
    open: 'Open',
    all: 'All',
    in: 'in',
  },

  analytics: {
    title: 'Analytics',
  },

  appName: 'Finapp',

  locale: {
    toggle: 'Toggle locale',
  },

  theme: {
    title: 'Theme',
    change: 'Change theme',
  },

  close: 'Close',

  transfer: {
    titleMoney: 'Transfers',
  },

  trnForm: {
    transferTitle: 'Transfer',
    saveTrnButton: 'Save transaction',
    calcTrnButton: 'Calculate',
    createTrn: 'Add transaction',
    titleEditTrn: 'Edit transaction',
    filterWalletAndCategory: 'Wallet & Category',
    filterWallet: 'Wallet only',
    filterAll: 'Everything',
    title: 'Transaction form',
    lastUsedCats: 'Show last used categories',
    description: {
      title: 'Description',
      placeholder: 'Write description...',
    },
    transfer: {
      from: 'From',
      fromLong: 'From wallet',
      to: 'To',
      toLong: 'To wallet',
    },
  },

  app: {
    version: 'Version',
    desc: 'Powerful personal finance application',
    welcome: 'Welcome to Finapp',
    lang: {
      select: 'Choose language',
      en: 'English',
      ru: 'Русский',
    },
    theme: {
      select: 'Choose style',
      dark: 'Dark',
      light: 'Light',
    },
  },

  userLogout: 'Logout',
  loginWithGoogle: 'Login with Google',
  changeTheme: 'Change theme',

  base: {
    sure: 'Are you sure?',
    yes: 'Yes',
    no: 'No',
    sort: 'Sort',
    save: 'Save',
    cancel: 'Cancel',
    duplicate: 'Duplicate',
    setFilter: 'Filter by',
    on: 'On',
    ok: 'Ok',
    off: 'Off',
    add: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    filter: 'Filter',
  },

  filter: {
    clear: 'Clear',
  },

  welcome: {
    firstRun: {
      text: 'Start with create base configuration of application',
      btn: 'Start',
    },
    create: {
      text: 'Start creating your first wallet and category',
      btn: 'Let\'s go',
    },
    createFirstCategory: {
      text: 'Great! Now let\'s create a category',
      btn: 'Create category',
    },
  },

  settings: {
    title: 'Settings',
    lang: 'Language',
    options: 'Options',
    open: 'Open settings',
    app: 'Application',
    caution: 'With caution',
    deleteButton: 'Delete my data',
  },

  wallets: {
    title: 'Wallets',
    name: 'Wallets',
    new: 'New wallet',
    showAll: 'Show all wallets',
    showOnly: 'Show only',
    sortTitle: 'Sort wallets',
    createNewTitle: 'Add wallet',
    editTitle: 'Edit Wallet',
    form: {
      name: {
        label: 'Wallet name',
        placeholder: 'Write...',
        error: 'Write wallet name',
        exist: 'Wallet with same name is exist',
      },
      description: {
        label: 'Wallet description (optional)',
        placeholder: 'Write...',
      },
      colors: {
        label: 'Color',
        placeholder: 'Select color',
        error: 'Select color',
        custom: 'Custom color',
      },
      currencies: {
        label: 'Currency',
        placeholder: 'Select currency',
        error: 'Select currency',
      },
      total: {
        placeholder: 'Сash withdrawal',
      },
      save: 'Save',
    },
  },

  currency: {
    title: 'Currency',
    selectBaseTitle: 'Select base currency',
  },

  categories: {
    title: 'Categories',
    name: 'Categories',
    shortTitle: 'Cats',
    new: 'New category',
    allTitle: 'All',
    lastUsedTitle: 'Recent',
    favoriteTitle: 'Favorite',
    createNewTitle: 'Add category',
    editTitle: 'Edit category',
    form: {
      name: {
        label: 'Category name',
        placeholder: 'Write category name...',
        error: 'Write category name',
        exist: 'Category with same name is exist',
      },
      parent: {
        no: 'Root category',
        label: 'Parent category',
      },
      colors: {
        label: 'Colors',
        custom: 'Custom color',
      },
      icon: {
        label: 'Icon',
      },
      data: {
        label: 'Data',
      },
      lastUsed: 'Show in last used categories',
      quickSelector: 'Favorite category',
      childColor: 'Apply color to all child categories',
      save: 'Save',
    },
  },

  stat: {
    title: 'Dashboard',
    selectedPeriod: 'Selected period',
    shortTitle: 'Stat',
    periods: 'Summary',
    balanceTitle: 'Balance',
    emptyDesc: 'Change filter, period or add new transactions.',
    customize: {
      showHistory: 'Show history',
      showRoundCats: 'Show round categories list',
      showCategoriesChart: 'Show categories chart',
      showCategoriesList: 'Show categories list',
      showCatsChartPie: 'Show categories pie chart',
      showPeriodsChart: 'Show periods chart',
    },
  },

  chart: {
    title: 'Chart',
    showMain: 'Show main chart',
    view: {
      add: 'Add',
      remove: 'Remove',
      toggle: 'Toggle chart view',
      showed: 'Showed',
      periodsName: 'periods',
      simpleTitle: 'Line view',
      groupedTitle: 'Column view',
      addGroupButton: 'Add group',
      addPeriodButton: 'Add period',
      removeGroupButton: 'Remove group',
      removePeriodButton: 'Remove period',
    },
  },

  trns: {
    inPeriodTitle: 'Transactions',
    shortTitle: 'Trns',
    history: 'History',
    more: 'Show more',
    filter: {
      showTrnsWithDesc: 'Only with description',
    },
    noTrns: 'No transactions',
  },

  create: {
    title: 'Create',
  },

  money: {
    income: 'Income',
    expense: 'Expense',
    total: 'Net income',
    sum: 'Net income',

    transfer: 'Transfer',
    average: {
      base: 'Average',
      income: 'Average',
      expense: 'Average',
    },
    averageTotal: 'Average',
    also: 'Also',
    wallets: 'Wallets',
    all: 'Net income',
  },

  dates: {
    period: 'Period',
    count: 'Count',
    twoDaysAgo: '2 days ago',
    day: {
      current: 'Today',
      today: 'Today',
      yesterday: 'Yesterday',
      simple: 'Day',
    },
    week: {
      current: 'This week',
      last: 'Last week',
      simple: 'Week',
    },
    month: {
      current: 'This month',
      last: 'Last month',
      simple: 'Month',
    },
    year: {
      current: 'This year',
      simple: 'Year',
    },
    all: {
      simple: 'All trns',
    },
  },

  alerts: {
    willDeleteEverything: 'This will delete all your wallets, categories and trns.',
  },

  buttons: {
    nextTitle: 'Next',
    prevTitle: 'Prev',
    nextStep: 'Continue',
  },

  users: {
    title: 'Users',
  },

  colors: 'Colors',
}

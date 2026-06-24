export default {
  about: {
    author: 'Author',
    thanks: 'Thanks for support',
    title: 'Creators',
  },

  actionError: {
    goHome: 'Go to home',
    title: 'Error',
  },

  alerts: {
    removedUserData: 'All data removed.',
    willDeleteEverything: 'All data will be permanently deleted, including wallets, categories and transactions',
  },

  app: {
    about: 'About',
    desc: 'Finapp helps you to control personal finances easily and efficiently.',
    loadError: 'Could not load your data. Check your connection and try again.',
    retry: 'Try again',
    toggleSidebar: 'Toggle sidebar',
    version: 'Version',
  },

  appName: 'Finapp',

  base: {
    add: 'Create',
    apply: 'Apply',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    duplicate: 'Duplicate',
    edit: 'Edit',
    loading: 'Loading...',
    menu: 'Menu',
    moreOptions: 'More options',
    next: 'Next',
    no: 'No',
    noData: 'No data',
    off: 'Off',
    on: 'On',
    open: 'Open',
    previous: 'Previous',
    save: 'Save',
    sure: 'Confirm action',
    today: 'Today',
    toggleExpand: 'Toggle expand',
    toggleFolders: 'Toggle folders',
    toggleGrouping: 'Toggle grouping',
    togglePresets: 'Toggle presets',
    toggleView: 'Toggle view',
    yes: 'Yes',
  },

  budgets: {
    actions: { delete: 'Delete', edit: 'Edit', save: 'Save' },
    add: 'Add budget',
    carried: 'rolled over',
    committed: 'committed to recurring',
    confirm: { deleteText: 'This removes the limit. Your transactions are kept.', deleteTitle: 'Delete budget?' },
    empty: 'No budgets yet. Add a limit for a category.',
    errors: { deleteFailed: 'Could not delete budget', saveFailed: 'Could not save budget' },
    form: { amount: 'Amount per period', amountPer: 'Amount per {period}', category: 'Category', kind: 'Type', rollover: 'Rollover', selectCategory: 'Select category', subtreeHint: 'Covers this category and all subcategories (except any with their own budget).' },
    hero: { safeToSpend: 'Safe to spend', toAssign: 'To assign' },
    kind: { expense: 'Expense', income: 'Income' },
    mode: { envelope: 'Envelope', fifty_thirty_twenty: '50/30/20', limits: 'Limits' },
    overBudget: 'Over budget',
    pace: 'Pace',
    period: { month: 'Month', week: 'Week', year: 'Year' },
    periodUnit: { month: 'month', week: 'week', year: 'year' },
    projected: 'Projected',
    rollover: { none: 'No rollover', surplus: 'Roll over surplus', surplus_deficit: 'Roll over surplus & deficit' },
    title: 'Budgets',
    triad: { assigned: 'Assigned', available: 'Available', spent: 'Spent' },
  },

  categories: {
    actions: {
      addToFavorites: 'Add to favorites',
      addToRecent: 'Show in recent',
      removeFromFavorites: 'Remove from favorites',
      removeFromRecent: 'Hide from recent',
    },
    allTitle: 'All',
    createNewTitle: 'New category',
    errors: {
      deleteFailed: 'Failed to delete category',
      saveFailed: 'Failed to save category',
    },
    favorite: 'Favorites',
    favoriteCategories: 'Favorite categories',
    filter: 'Filter categories',
    form: {
      childColor: 'Apply color to all child categories',
      children: {
        confirmRemove: 'Remove {count} categories from this parent? They will become root categories.',
        empty: 'No children',
        group: {
          current: 'Current children',
          freeRoot: 'Available root categories',
          fromOther: 'Move from another parent',
        },
        label: 'Child categories',
        noCandidates: 'No categories available',
        noMatches: 'No matches',
        searchPlaceholder: 'Search...',
        selected: '{count} selected',
      },
      delete: {
        alertWithTrns: 'This will also delete',
        errorChildren: 'You cannot delete a category with child categories. Delete the child categories first.',
        okWithoutTrns: 'Category deleted',
        okWithTrns: `Category and {trns} transactions deleted`,
        title: 'Delete category?',
      },
      favoriteCategory: 'Favorite category',
      icon: {
        desc: 'Choose any icon from',
        label: 'Icon',
        link: 'Link',
        placeholder: 'Icon name...',
      },
      name: {
        error: 'Please enter a name',
        exist: 'A category with this name already exists',
        label: 'Name',
        placeholder: 'Write...',
      },
      parent: {
        label: 'Parent category',
        no: 'Without parent',
      },
      recentCategory: 'Recent category',
      selectChildren: 'Child categories',
      selectColor: 'Color',
      selectIcon: 'Icon',
      selectParent: 'Parent category',
    },
    name: 'Categories',
    new: 'New category',
    recent: 'Recent',
    recentCategories: 'Recent categories',
    search: {
      placeholder: 'Search',
    },
    selectParent: 'Whole «{name}»',
    selectParentHint: 'incl. all subcategories',
    title: 'Categories',
  },

  chart: {
    empty: 'No data for this period',
    types: {
      bar: 'Bars',
      line: 'Lines',
      pie: 'Donut',
    },
  },

  color: {
    custom: 'Custom color',
    label: 'Color',
  },

  common: {
    all: 'All',
    date: 'Date',
  },

  currencies: {
    ariaFilter: 'Filter currencies',
    base: 'Base currency',
    list: {
      all: 'All',
      notFound: 'Currency not found...',
      search: 'Search',
      showAll: 'Show all wallets',
    },
    page: {
      crypto: 'Crypto',
      fiat: 'Fiat',
      rate: 'Rate',
      setBase: 'Set as base currency',
      showAll: 'All',
      showUsed: 'Used',
      title: 'Currencies',
    },
    select: 'Select currency',
  },

  dates: {
    calendar: {
      calendar: 'Calendar',
      intervalsGrouped: 'Grouped by',
      presets: 'Presets',
    },
    day: {
      current: 'Today',
      last: 'Yesterday',
      plural: 'days | day | days | days',
      short: 'd',
      simple: 'Day',
    },
    last: {
      day: 'Last',
      month: 'Last',
      week: 'Last',
      year: 'Last',
    },
    month: {
      current: 'This month',
      last: 'Last month',
      plural: 'months | month | months',
      short: 'm',
      simple: 'Month',
    },
    ranges: {
      all: 'All',
      allSkipEmpty: 'Maximum',
    },
    select: 'Select period',
    week: {
      current: 'This week',
      last: 'Last week',
      plural: 'weeks | week | weeks',
      short: 'w',
      simple: 'Week',
    },
    year: {
      current: 'This year',
      last: 'Last year',
      plural: 'years | year | years',
      short: 'y',
      simple: 'Year',
    },
  },

  demo: {
    exit: 'Exit demo mode',
    update: 'Update demo data',
    updated: 'Data updated',
  },

  dev: {
    menu: {
      title: 'Development',
    },
  },

  locale: {
    en: 'English',
    ru: 'Russian',
    title: 'Language',
  },

  login: {
    description: 'Powerful open-source finance application',
    error: 'Login failed. Please try again.',
    menu: {
      documentation: 'Documentation',
      title: 'Menu',
    },
    openDemo: 'Open Demo',
    or: 'or',
    signInWithGoogle: 'Sign in with Google',
    title: 'Login',
  },

  menu: {
    documentation: 'Documentation',
    title: 'Menu',
  },

  money: {
    all: 'Total',
    average: 'Average',
    balance: 'Balance',
    expense: 'Expense',
    income: 'Income',
    netIncome: 'Net income',
    options: {
      isExcludeInTotal: 'Excluded from totals',
      withdrawal: 'Withdrawal',
    },
    split: 'Split',
    summary: 'Summary',
    totals: {
      archived: 'Archived',
    },
    type: 'Wallet type',
    types: {
      available: 'Available',
      cash: 'Cash',
      cashless: 'Cashless',
      credit: 'Credit',
      crypto: 'Crypto',
      debt: 'Debt',
      deposit: 'Deposit',
      isArchived: 'Archived',
      isAvailable: 'Available with credits',
      isExcludeInTotal: 'Not included in total',
      isWithdrawal: 'Withdrawal',
      total: 'Total',
    },
  },

  onboarding: {
    actionCategory: 'Add category',
    actionTrn: 'Add transaction',
    actionWallet: 'Add wallet',
    intro: 'Add your first income or expense',
    introCategories: 'Add a category, for example, "Food" or "Salary"',
    introWallets: 'Start tracking your finances by adding your first wallet',
  },

  recurrences: {
    actions: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      pause: 'Pause',
      resume: 'Resume',
      skip: 'Skip',
      skipNext: 'Skip next',
    },
    confirm: {
      cancelText: 'Stops future transactions. Already-created ones stay.',
      cancelTitle: 'Cancel this series?',
      deleteText: 'Removes the rule entirely. Already-created transactions stay.',
      deleteTitle: 'Delete this series?',
    },
    editTitle: 'Edit recurrence',
    empty: 'No recurring transactions yet. Toggle "Repeat" when adding a transaction.',
    end: { count: 'After N', countPlaceholder: 'count', date: 'On date', never: 'Never' },
    errors: { deleteFailed: 'Could not delete recurrence', saveFailed: 'Could not save recurrence' },
    everyOne: { day: 'Every day', month: 'Every month', week: 'Every week', year: 'Every year' },
    form: {
      amount: 'Amount',
      autoCreate: 'Create automatically (off = confirm each time)',
      ends: 'Ends',
      every: 'Every',
      monthLastDay: 'Last day of month',
      repeat: 'Repeat',
      save: 'Save',
    },
    freq: { day: 'Day', month: 'Month', week: 'Week', year: 'Year' },
    manual: 'confirm',
    next: 'next',
    pending: { title: 'Pending to confirm' },
    status: { active: 'Active', cancelled: 'Cancelled', paused: 'Paused' },
    summary: { until: 'until' },
    title: 'Recurring',
    totals: { monthly: 'Per month', yearly: 'Per year' },
    unit: { day: 'day | days', month: 'month | months', week: 'week | weeks', year: 'year | years' },
  },

  search: {
    noResults: 'Nothing found',
    placeholder: 'Search categories, wallets, transactions...',
    title: 'Search',
  },

  settings: {
    caution: 'With caution',
    deleteButton: 'Delete my data',
    errors: {
      saveFailed: 'Failed to save settings',
    },
    menuLabels: 'Show labels in bottom menu',
    mobileMenu: 'Interface',
    title: 'Settings',
  },

  stat: {
    average: {
      forLast: 'for the last periods',
    },
    catButtons: {
      isLines: 'Amount lines',
      isRoundIcon: 'Icons background',
    },
    config: {
      categories: {
        list: {
          description: 'Detailed list of all categories for the period with amounts, shares, and transaction counts.',
          title: 'Categories list',
        },
        rounds: {
          description: 'Strip of round category icons: favorites, recently used.',
          groupByParent: 'Group by parent',
          showFavorites: 'Show favorites',
          showRecent: 'Show recent',
          title: 'Quick categories',
        },
        vertical: {
          groupByParent: 'Group by parent',
          title: 'Comparison bars',
        },
      },
      chart: {
        average: {
          label: 'Show average line',
        },
        byCategories: 'By categories',
        groupByParent: 'Group by parent',
        other: 'Other',
        type: {
          label: 'Chart type',
        },
      },
      chartShow: {
        label: 'Show chart',
        title: 'Main chart',
      },
      chartView: {
        full: 'Full',
        half: 'Compact',
        label: 'Chart view',
      },
      date: {
        quick: {
          label: 'Date selector slider',
        },
      },
      grouping: {
        auto: 'Auto',
        children: 'With children',
        description: 'Auto - each block uses its own setting.\nParents only - subcategory amounts roll up into the parent.\nWith children - every subcategory shown as a separate row.',
        label: 'Categories grouping',
        parents: 'Parents only',
      },
      menu: {
        label: 'Page Settings',
      },
      showedWallets: {
        placeholder: 'Count',
      },
      statAverage: {
        count: {
          label: 'Show average values',
        },
        description: 'Arithmetic mean over the chosen number of past periods. Displayed next to the period total.',
        subtitle: 'Average over last {count} periods',
        title: 'Average totals',
      },
      wallets: {
        description: 'Quick access to the first N wallets from the full list. Order is set on the Wallets page.',
        label: 'Show wallets',
        showIcon: 'Show wallet icon',
        subtitle: 'Top {count}',
        title: 'Wallets',
      },
    },
    forecast: {
      mode: {
        merged: 'Projected total',
        off: 'Off',
        separate: 'Fact + forecast',
      },
      projected: 'Projected',
      short: 'forecast',
      title: 'Forecast',
    },
    title: 'Dashboard',
  },

  statistics: {
    title: 'Statistics',
  },

  sync: {
    actions: {
      reauth: 'Sign in again',
      reloadFromServer: 'Reload from server',
    },
    errors: {
      sessionLostPending: 'Your session ended with {count} change(s) not yet synced. Sign in again to upload them.',
      uploadDiverged: 'A change could not be synced - your local data may differ from the server. Reload to discard unsynced local changes and refresh from the server.',
      uploadRejected: 'Some changes could not be synced to the server',
      uploadReverted: 'A change could not be saved and was reverted',
    },
  },

  theme: {
    color: 'Change theme color',
    dark: 'Dark',
    light: 'Light',
    palette: 'Color palette',
    picker: {
      neutral: 'Background color',
      primary: 'Primary color',
      radius: 'Rounding',
      theme: 'Theme',
    },
    system: 'System',
    title: 'Appearance',
  },

  transfer: {
    titleMoney: 'Transfers',
  },

  trnForm: {
    adjustmentTitle: 'Adjustment',
    ariaCopyAmount: 'Copy amount',
    category: {
      select: 'Select category',
    },
    createTrn: 'Add transaction',
    delete: {
      alert: 'Delete transaction?',
    },
    description: {
      placeholder: 'Write...',
      title: 'Description',
    },
    enterAmount: '0',
    errors: {
      amountEmpty: 'Amount can not be empty',
      amountNegative: 'Amount can not be negative number',
      amountZero: 'Amount can not be equal Zero',
      selectCategory: 'Please select category',
      selectWallet: 'Please select wallet',
      transferAmountEmpty: 'Transfer amounts can not be empty',
      transferSameWallet: 'Transfer in same wallet',
    },
    filterAll: 'All',
    filterWallet: 'Wallet',
    filterWalletAndCategory: 'Wallet & Category',
    titleEditTrn: 'Edit transaction',
    transfer: {
      expenseLabel: 'Transfer from',
      expenseModal: 'Transfer from wallet',
      incomeLabel: 'Transfer to',
      incomeModal: 'Transfer to wallet',
    },
    transferTitle: 'Transfer',
    wallet: {
      select: 'Select wallet',
    },
  },

  trns: {
    errors: {
      deleteFailed: 'Failed to delete transaction',
      orphanedSkipped: '{count} transactions skipped (wallet or category was deleted)',
      saveFailed: 'Failed to save transaction',
    },
    filter: {
      showTrnsWithDesc: 'Only with description',
    },
    history: 'History',
    more: 'Show more',
    noTrns: 'No transactions yet',
    plural: '0 transactions | {n} transaction | {n} transactions | {n} transactions',
    title: 'Transactions',
  },

  user: {
    logout: 'Logout',
    title: 'Account',
  },

  wallets: {
    ariaSwitch: 'Switch wallets',
    createNewTitle: 'New wallet',
    errors: {
      deleteFailed: 'Failed to delete wallet',
      orderFailed: 'Failed to save wallet order',
      saveFailed: 'Failed to save wallet',
    },
    filter: 'Filter wallets',
    filterByCurrency: 'Filter by',
    form: {
      credit: {
        available: 'Available',
        debt: 'Debt',
        limit: 'Limit',
      },
      currencies: {
        label: 'Currency',
      },
      delete: {
        alertWithTrns: 'This will also delete',
        okWithoutTrns: 'Wallet deleted',
        okWithTrns: `Wallet deleted and {trns}`,
        title: 'Delete wallet?',
      },
      description: {
        label: 'Description (optional)',
        placeholder: 'Write...',
      },
      name: {
        error: 'Please enter a name',
        label: 'Name',
        placeholder: 'Write...',
      },
    },
    name: 'Wallets',
    new: 'New wallet',
    options: {
      includeArchivedInStats: 'Include archived in statistics',
      showArchived: 'Show archived wallets',
    },
    page: {
      currencies: 'Currencies',
      none: 'List',
      type: 'Type',
    },
    search: {
      placeholder: 'Search',
    },
    showAll: 'Show all',
    showOnly: 'Show only',
    sortTitle: 'Sort wallets',
    title: 'Wallets',
  },
}

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
    filters: 'Filters',
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
    reset: 'Reset',
    save: 'Save',
    search: 'Search',
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
    add: 'Add budget',
    archive: 'Archive',
    archived: 'Archived',
    assign: {
      forPeriod: 'this period',
      reset: 'Reset',
    },
    autoAssign: 'Copy last period',
    carried: 'rolled over',
    committed: 'committed to recurring',
    confirm: { autoAssignText: 'Fills budgets with no amount set yet this period from the previous one. Manual changes and savings targets are left as-is.', autoAssignTitle: 'Copy last period?', deleteText: 'This removes the limit. Your transactions are kept.', deleteTitle: 'Delete budget?', unarchiveText: 'An active budget for {category} already exists. Restore this one and archive the other?', unarchiveTitle: 'Restore budget?' },
    empty: 'No budgets yet. Add a limit for a category.',
    errors: { deleteFailed: 'Could not delete budget', saveFailed: 'Could not save budget' },
    form: { amount: 'Amount per period', amountPer: 'Amount per {period}', cadence: 'Budget rhythm', category: 'Category', categoryTaken: '{kind} budget for this category already exists.', currency: 'Currency', goalAmount: 'Goal amount', goalDate: 'Target date', kind: 'Type', rollover: 'Rollover', selectCategory: 'Select category', setAsideHint: 'Set aside ≈ {amount} {currency}/month', subtreeHint: 'Covers this category and all subcategories (except any with their own budget).', targetToggle: 'Target by date' },
    goalReached: 'Goal reached',
    help: { open: 'How budgets work' },
    hero: { safeToSpend: 'Safe to spend', toAssign: 'To assign' },
    history: { action: 'History', empty: 'No spending history yet.', title: 'History' },
    kind: { expense: 'Expense', income: 'Income' },
    mode: { envelope: 'Envelope', fifty_thirty_twenty: '50/30/20', limits: 'Limits' },
    move: { action: 'Move money', amount: 'Amount ({currency})', available: 'Available', cover: 'Cover', from: 'From', into: 'Into', noSource: 'No other budgets to move from.', title: 'Move money' },
    overBudget: 'Over budget',
    pace: 'Pace',
    period: { month: 'Month', week: 'Week', year: 'Year' },
    periodUnit: { month: 'month', week: 'week', year: 'year' },
    projected: 'Projected',
    rollover: { none: 'No rollover', surplus: 'Roll over surplus', surplus_deficit: 'Roll over surplus & deficit' },
    skip: 'Skip this period',
    target: { by: 'by {date}', fund: 'Set aside', reached: 'Funded' },
    title: 'Budgets',
    toAssign: { balance: 'Balance to zero', fix: 'Fix this', over: 'Over-assigned by', text: 'Pull assignments back until the pool is zero. Reducing a budget frees its money to reassign.', title: 'Reduce assignments' },
    triad: {
      expense: { activity: 'Spent', assigned: 'Assigned', remaining: 'Available' },
      income: { activity: 'Received', assigned: 'Expected', remaining: 'Left to receive' },
    },
    trns: { empty: 'No transactions this period.' },
    unarchive: 'Unarchive',
    unskip: 'Un-skip',
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

  notifications: {
    description: 'Get push notifications on this device.',
    disabled: 'Notifications disabled',
    enabled: 'Notifications enabled',
    error: 'Couldn\'t enable notifications. Please try again.',
    iosHint: 'On iOS, add the app to your home screen first, then enable notifications.',
    permissionDenied: 'Notifications are blocked in your browser settings.',
    statusOff: 'Disabled',
    statusOn: 'Enabled',
    title: 'Notifications',
    unsupported: 'Push notifications are not supported on this device.',
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
      confirmAll: 'Confirm all',
      pause: 'Pause',
      resume: 'Resume',
      skip: 'Skip',
      skipAll: 'Skip all',
      skipNext: 'Skip next',
    },
    add: 'Add recurring',
    addHint: 'Opens the transaction form with Repeat turned on.',
    confirm: {
      cancelText: 'Stops future transactions. Already-created ones stay.',
      cancelTitle: 'Cancel this series?',
      confirmAllText: 'Creates {count} transactions from the due payments. You can edit or delete them afterwards.',
      confirmAllTitle: 'Confirm {count} payments?',
      deleteText: 'Removes the rule entirely. Already-created transactions stay.',
      deleteTitle: 'Delete this series?',
      skipAllText: 'Skips {count} due payments so they are not created. This cannot be undone here.',
      skipAllTitle: 'Skip {count} payments?',
    },
    editTitle: 'Edit recurrence',
    empty: 'No recurring transactions yet. Toggle "Repeat" when adding a transaction.',
    end: { count: 'After N', countPlaceholder: 'count', date: 'On date', never: 'Never' },
    errors: { deleteFailed: 'Could not delete recurrence', saveFailed: 'Could not save recurrence' },
    everyOne: { day: 'Every day', month: 'Every month', week: 'Every week', year: 'Every year' },
    form: {
      amount: 'Amount',
      autoCreate: 'Create automatically (off = confirm each time)',
      backfill: 'Create past payments',
      backfillOffHint: 'Only track this subscription from its next payment - no past transactions.',
      backfillOnHint: 'Creates every payment from the start date up to today.',
      currentNext: 'now:',
      effectiveFrom: 'From',
      ends: 'Ends',
      every: 'Every',
      futureStart: 'First payment on {date} - it will appear then, not now.',
      lockedHint: 'Category, wallet and type are fixed for the series. Delete and recreate to change them.',
      monthLastDay: 'Last day of month',
      nextCharge: 'Next charge date',
      noNext: 'no upcoming',
      priceFrom: 'from',
      priceHistory: 'Price history',
      repeat: 'Repeat',
      save: 'Save',
      startDate: 'Start date',
    },
    freq: { day: 'Day', month: 'Month', week: 'Week', year: 'Year' },
    help: { open: 'How recurring works' },
    manual: 'confirm',
    next: 'next',
    overdue: 'overdue',
    partOfSeries: 'Part of a recurring series',
    payments: { empty: 'No payments in this period', only: 'Only', paid: 'paid', priceChanged: 'price changed', title: 'Payments' },
    pending: { title: 'Due to confirm' },
    reminders: { firstCharge: { title: 'First charge soon' }, inDays: 'in {count} days', priceHike: { title: 'Price going up' }, title: 'Upcoming payment', today: 'today', tomorrow: 'tomorrow' },
    sort: { cost: 'By cost', date: 'By date' },
    stale: { flag: 'Cancel candidate', hint: 'No payment in the last 2 expected periods - confirm or cancel.' },
    status: { active: 'Active', cancelled: 'Cancelled', paused: 'Paused' },
    subscriptions: { title: 'Subscriptions' },
    summary: { until: 'until' },
    title: 'Recurring',
    totals: { cycle: 'Change timeframe', monthly: 'Avg / month', perDay: '/ day', weekly: 'Avg / week', yearly: 'Per year' },
    unit: { day: 'day | days', month: 'month | months', week: 'week | weeks', year: 'year | years' },
    upcoming: { days: '{count} days', dueSoon: '{count} due soon', title: 'Upcoming' },
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

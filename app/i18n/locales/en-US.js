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
    form: { amount: 'Amount per period', amountPer: 'Amount per {period}', cadence: 'Budget rhythm', category: 'Category', currency: 'Currency', kind: 'Type', rollover: 'Rollover', selectCategory: 'Select category', subtreeHint: 'Covers this category and all subcategories (except any with their own budget).' },
    help: {
      amount: {
        body: 'Each budget has its own rhythm - weekly, monthly or yearly - chosen next to the amount. Enter the amount for one such period (for example 100 a month, or 1200 a year), in your main currency. The page then shows it sliced to whatever timeframe you are viewing.',
        title: 'The amount and its rhythm',
      },
      bar: {
        body: 'The bar fills toward your limit and turns fully red if you go over. The small vertical mark is your pace - where your spending should be by today if you spread the limit evenly across the period. If the fill is past the mark, you are spending faster than planned.',
        title: 'The bar and the pace mark',
      },
      committed: {
        body: 'Planned recurring payments due in this period that have not happened yet. They are set aside so you do not spend money already promised to a bill.',
        title: 'Committed to recurring',
      },
      currency: {
        body: 'You pick the currency a budget is set in (your main currency by default). It is converted to your current main currency for the bar and totals, and spending in other currencies is converted too - so one budget covers everything, and changing your main currency later keeps budgets correct.',
        title: 'Currencies',
      },
      intro: {
        body: 'A budget sets a spending limit for a category over a period of time. As you add transactions, the app shows how much you have spent, how much is left, and whether you are on track.',
        title: 'What budgets do',
      },
      manage: {
        body: 'Use "Add budget" to create one: pick a category, the type (expense or income), an amount, and a rollover rule. Tap Edit on a budget to change it, or delete it from the edit form - your transactions are kept.',
        title: 'Add and edit',
      },
      open: 'How budgets work',
      parent: {
        body: 'Budget a parent category and it covers that whole branch - all its subcategories count toward the one limit. If a subcategory has its own budget, it is tracked separately and not counted twice in the parent.',
        title: 'Parent categories',
      },
      period: {
        body: 'The buttons at the top choose the timeframe everything is shown in. Each budget keeps its own rhythm, so switching the timeframe simply re-slices every budget to it: a 1200 / year budget shows as 100 a month or about 23 a week. The arrows page through time; the middle button jumps back to now.',
        title: 'Week, month or year',
      },
      projected: {
        body: 'An estimate of how much you will have spent by the end of the period if you keep going at the current rate.',
        title: 'Projected',
      },
      rollover: {
        body: 'Choose what happens to a period\'s leftover:\nNo rollover - each period starts fresh.\nRoll over surplus - money you did not spend is added to the next period.\nRoll over surplus & deficit - both unspent money and overspending carry over.\nThe ↺ line on a budget shows what was carried in from earlier periods.',
        title: 'Rollover',
      },
      safeToSpend: {
        body: 'The number at the top is your free-to-spend money: what is left across all expense budgets after setting aside the recurring payments still due this period.',
        title: 'Safe to spend',
      },
      triad: {
        body: 'Spent - what you spent in this category and its subcategories during the period.\nAssigned - your limit.\nAvailable - what is left: assigned plus any rollover, minus spent. It turns red when you go over.',
        title: 'Spent, Assigned, Available',
      },
    },
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
    add: 'Add recurring',
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
    help: {
      autoManual: {
        body: 'You choose this per rule. Automatic - the app creates the transaction itself on each date. Manual - it waits for you and appears under "Pending to confirm". Use automatic for fixed bills, manual when the amount varies.',
        title: 'Automatic or confirm',
      },
      budgetsLink: {
        body: 'Recurring payments still due in the current budget period are set aside - they lower your "safe to spend" so upcoming bills are not counted as free money.',
        title: 'Link with budgets',
      },
      create: {
        body: 'Turn on "Repeat" while adding a transaction - that transaction becomes the first one in the series, and the rest follow your schedule. Open a rule from this page to change the amount, schedule, or end.',
        title: 'Creating one',
      },
      ends: {
        body: 'A series can run forever, stop on a date, or stop after a set number of times.',
        title: 'When it ends',
      },
      forecast: {
        body: 'Operations that have not happened yet still show up in your statistics and forecast for the period ahead, so you can see what is coming before it lands.',
        title: 'Seen ahead of time',
      },
      frequency: {
        body: 'Repeat every day, week, month or year, and every few of them - for example every 2 weeks or every 3 months. For monthly rules you can also pin them to the last day of the month.',
        title: 'How often',
      },
      intro: {
        body: 'Recurring operations are your regular income and expenses - salary, rent, subscriptions - so you do not have to enter them by hand every time.',
        title: 'What this is for',
      },
      manage: {
        body: 'Pause a series to stop it for a while and resume later, or cancel it for good. You can skip a single date without touching the rest. Deleting a rule keeps the transactions it already created.',
        title: 'Pause, skip, cancel',
      },
      open: 'How recurring works',
      pending: {
        body: 'Due manual operations wait here. Confirm to create the transaction (you can adjust the amount first), or Skip to dismiss that one date.',
        title: 'Pending to confirm',
      },
      title: 'How recurring works',
      totals: {
        body: 'These show your combined recurring load converted to a per-month and a per-year amount, across currencies, so you can see the weight of your regular commitments.',
        title: 'Totals at the top',
      },
    },
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

export default {
  about: {
    author: 'Автор',
    thanks: 'Спасибо за поддержку',
    title: 'Создатели',
  },

  actionError: {
    goHome: 'На главную',
    title: 'Ошибка',
  },

  alerts: {
    removedUserData: 'Все данные удалены.',
    willDeleteEverything: 'Все данные будут безвозвратно удалены, включая кошельки, категории и транзакции',
  },

  app: {
    about: 'О приложении',
    desc: 'Приложение для учета личных финансов',
    madeBy: {
      name: 'Илья Комичев',
      text: 'Разработал',
    },
    toggleSidebar: 'Скрыть/показать боковую панель',
    version: 'Версия',
  },

  appName: 'Финапка',

  base: {
    add: 'Создать',
    apply: 'Применить',
    cancel: 'Отмена',
    close: 'Закрыть',
    delete: 'Удалить',
    duplicate: 'Дублировать',
    edit: 'Редактировать',
    loading: 'Загрузка...',
    moreOptions: 'Ещё',
    next: 'Вперёд',
    no: 'Нет',
    noData: 'Нет данных',
    previous: 'Назад',
    save: 'Сохранить',
    sure: 'Удалить?',
    today: 'Сегодня',
    toggleExpand: 'Развернуть/свернуть',
    toggleFolders: 'Папки',
    toggleGrouping: 'Группировка',
    togglePresets: 'Пресеты',
    toggleView: 'Вид',
    yes: 'Да',
  },

  categories: {
    allTitle: 'Все',
    createNewTitle: 'Добавление категории',
    errors: {
      deleteFailed: 'Не удалось удалить категорию',
      saveFailed: 'Не удалось сохранить категорию',
    },
    favoriteCategories: 'Избранные категории',
    filter: 'Фильтр по категориям',
    form: {
      childColor: 'Применить цвет ко всем дочерним категориям',
      delete: {
        alertWithTrns: 'Также будут удалены',
        errorChildren: 'Вы не можете удалить категорию с дочерними категориям. Сначала удалите дочерние категории.',
        okWithoutTrns: 'Категория удалена',
        okWithTrns: `Категория удалена и {trns}`,
        title: 'Удалить категорию?',
      },
      favoriteCategory: 'Избранная категория',
      icon: {
        desc: 'Используйте любую иконку из набора',
        label: 'Иконка',
        link: 'Ссылка',
        placeholder: 'Название иконки...',
      },
      name: {
        error: 'Напишите название',
        exist: 'Категория с таким именем уже существует',
        label: 'Название',
        placeholder: 'Напишите...',
      },
      parent: {
        label: 'Родительская категория',
        no: 'Без родителя',
      },
      recentCategory: 'Показывать в недавно использованных',
      selectColor: 'Цвет',
      selectIcon: 'Иконка',
      selectParent: 'Родительская категория',
    },
    name: 'Категории',
    new: 'Новая категория',
    recentCategories: 'Недавние категории',
    search: {
      placeholder: 'Поиск категорий...',
    },
    title: 'Категории',
  },

  chart: {
    types: {
      bar: 'Колонки',
      line: 'Линии',
    },
  },

  color: {
    custom: 'Произвольный цвет',
    label: 'Цвет',
  },

  common: {
    all: 'Все',
    date: 'Дата',
  },

  currencies: {
    ariaFilter: 'Фильтр валют',
    base: 'Основная валюта',
    list: {
      all: 'Все',
      notFound: 'Валюта не найдена...',
      search: 'Поиск',
      showAll: 'Показать все кошельки',
    },
    page: {
      rate: 'Курс',
      setBase: 'Сделать основной валютой',
      showAll: 'Показать все валюты',
      showUsed: 'Показать валюты кошельков',
      title: 'Валюты',
    },
    select: 'Выбрать валюту',
  },

  dates: {
    calendar: {
      calendar: 'Календарь',
      intervalsGrouped: 'Группировка',
      presets: 'Пресеты',
    },
    day: {
      current: 'Сегодня',
      last: 'Вчера',
      plural: 'дней | день | дня | дней',
      short: 'д',
      simple: 'День',
    },
    last: {
      day: 'Последних | Последний | Последние | Последние',
      month: 'Последний | Последний | Последние | Последние',
      week: 'Последних | Последняя | Последние | Последние',
      year: 'Последний | Последний | Последние | Последние',
    },
    month: {
      current: 'Текущий месяц',
      last: 'Прошлый месяц',
      plural: 'месяцев | месяц | месяца | месяцев',
      short: 'м',
      simple: 'Месяц',
    },
    ranges: {
      all: 'Все',
      allSkipEmpty: 'Максимально',
    },
    select: 'Период',
    week: {
      current: 'Текущая неделя',
      last: 'Прошлая неделя',
      plural: 'недель | неделя | недели | недель',
      short: 'н',
      simple: 'Неделя',
    },
    year: {
      current: 'Текущий год',
      last: 'Прошлый год',
      plural: 'лет | год | лет | лет',
      short: 'г',
      simple: 'Год',
    },
  },

  demo: {
    exit: 'Выйти из демо режима',
    update: 'Обновить демо данные',
    updated: 'Данные обновлены',
  },

  dev: {
    menu: {
      title: 'Разработка',
    },
  },

  locale: {
    en: 'Английский',
    ru: 'Русский',
    title: 'Язык',
  },

  login: {
    description: 'Персональный финансовый ассистент',
    error: 'Ошибка входа. Попробуйте ещё раз.',
    openDemo: 'Открыть демо',
    or: 'или',
    title: 'Вход',
  },

  loginWithGoogle: 'Войти через Google',

  money: {
    all: 'Всего',
    average: 'Среднее',
    balance: 'Баланс',
    expense: 'Расход',
    income: 'Доход',
    netIncome: 'Суммарно',
    options: {
      isExcludeInTotal: 'Не считать в общем балансе',
      withdrawal: 'Доступные для снятия',
    },
    split: 'Раздельно',
    summary: 'Общее',
    totals: {
      archived: 'Архивный',
    },
    type: 'Тип кошельки',
    types: {
      available: 'Доступные для снятия',
      cash: 'Наличные',
      cashless: 'Безнал',
      credit: 'Кредит',
      crypto: 'Крипта',
      debt: 'Долги',
      deposit: 'Вклады',
      isArchived: 'Архивные',
      isAvailable: 'Доступные с учетом кредитов',
      isExcludeInTotal: 'Не учитываемые в общем балансе',
      isWithdrawal: 'Доступные для снятия',
      total: 'Всего',
    },
  },

  onboarding: {
    actionCategory: 'Добавить категорию',
    actionTrn: 'Добавить транзакцию',
    actionWallet: 'Добавить кошелек',
    intro: 'Добавьте свой первый доход или расход',
    introCategories: 'Добавьте категорию, например, «Еда» или «Зарплата»',
    introWallets: 'Начните учёт финансов, добавив первый кошелёк',
  },

  settings: {
    caution: 'C осторожностью',
    deleteButton: 'Удалить все мои данные',
    errors: {
      saveFailed: 'Не удалось сохранить настройки',
    },
    title: 'Настройки',
  },

  stat: {
    average: {
      forLast: 'за прошлые периоды',
    },
    catButtons: {
      alt: 'Альтернативный',
      elements: 'Элементы',
      isItemsBg: 'Фон категорий',
      isLines: 'Линии сумм',
      isRoundIcon: 'Скруглённые категории',
      listItemsOptions: 'Настройки списка категорий',
      minimal: 'Легкий',
      standard: 'Стандартный',
    },
    config: {
      categories: {
        list: {
          title: 'Список категорий',
        },
        rounds: {
          title: 'Круглые категории',
        },
        vertical: {
          title: 'Вертикальный график',
        },
      },
      chart: {
        average: {
          label: 'Показывать средние значения',
        },
        type: {
          label: 'Тип графика',
        },
      },
      chartShow: {
        label: 'Показывать график',
        title: 'График',
      },
      chartView: {
        full: 'Широкий',
        half: 'Компактный',
        label: 'Вид графика',
      },
      date: {
        quick: {
          label: 'Слайдер быстрого выбора даты',
        },
      },
      menu: {
        label: 'Настройки страницы',
      },
      showedWallets: {
        placeholder: 'Количество',
      },
      statAverage: {
        count: {
          label: 'Показывать средние значения',
        },
      },
      wallets: {
        label: 'Показывать кошельки',
        title: 'Кошельки',
      },
    },
    title: 'Статистика',
  },

  statistics: {
    title: 'Статистика',
  },

  theme: {
    color: 'Сменить цвет оформления',
    dark: 'Темная',
    light: 'Светлая',
    picker: {
      neutral: 'Фоновый цвет',
      primary: 'Основной цвет',
      radius: 'Скругление',
      theme: 'Тема',
    },
    system: 'Авто',
    title: 'Оформление',
  },

  transfer: {
    titleMoney: 'Переводы',
  },

  trnForm: {
    adjustmentTitle: 'Корректировка',
    ariaCopyAmount: 'Копировать сумму',
    category: {
      select: 'Выбрать категорию',
    },
    createTrn: 'Создать транзакцию',
    delete: {
      alert: 'Удалить транзакцию?',
    },
    description: {
      placeholder: 'Напишите...',
      title: 'Описание',
    },
    enterAmount: '0',
    errors: {
      amountEmpty: 'Сумма не может быть пустой',
      amountNegative: 'Сумма не может быть отрицательной',
      amountZero: 'Сумма не может быть равна нулю',
      selectCategory: 'Выберите категорию',
      selectWallet: 'Выберите кошелек',
      transferAmountEmpty: 'Суммы перевода не могут быть пустыми',
      transferSameWallet: 'Перевод в тот же кошелек',
    },
    filterAll: 'Все',
    filterWallet: 'Кошелек',
    filterWalletAndCategory: 'Кошелек и Категория',
    titleEditTrn: 'Редактирование транзакции',
    transfer: {
      expense: 'Перевод из',
      income: 'Перевод в',
    },
    transferTitle: 'Перевод',
    wallet: {
      select: 'Выбрать кошелек',
    },
  },

  trns: {
    errors: {
      deleteFailed: 'Не удалось удалить транзакцию',
      orphanedSkipped: '{count} транзакций пропущено (кошелёк или категория были удалены)',
      saveFailed: 'Не удалось сохранить транзакцию',
    },
    filter: {
      showTrnsWithDesc: 'Только с описанием',
    },
    history: 'История',
    more: 'Показать еще',
    noTrns: 'Нет транзакций',
    plural: '0 транзакций | {n} транзакция | {n} транзакции | {n} транзакций',
    title: 'Транзакции',
  },

  userLogout: 'Выйти из аккаунта',

  wallets: {
    ariaSwitch: 'Поменять кошельки',
    createNewTitle: 'Добавление кошелька',
    errors: {
      deleteFailed: 'Не удалось удалить кошелек',
      orderFailed: 'Не удалось сохранить порядок кошельков',
      saveFailed: 'Не удалось сохранить кошелек',
    },
    filter: 'Фильтровать кошельки',
    filterByCurrency: 'Валюты кошельков',
    form: {
      credit: {
        available: 'Доступно',
        debt: 'Долг',
        limit: 'Лимит',
      },
      currencies: {
        label: 'Валюта',
      },
      delete: {
        alertWithTrns: 'Также будут удалены',
        okWithoutTrns: 'Кошелек удален',
        okWithTrns: `Кошелек удален и {trns}`,
        title: 'Удалить кошелёк?',
      },
      description: {
        label: 'Описание (не обязательно)',
        placeholder: 'Напишите...',
      },
      name: {
        error: 'Напишите название',
        label: 'Название',
        placeholder: 'Напишите...',
      },
    },
    name: 'Кошельки',
    new: 'Новый кошелек',
    page: {
      currencies: 'Валюты',
      none: 'Список',
      type: 'Тип',
    },
    showAll: 'Показать все',
    showOnly: 'Показать только',
    sortTitle: 'Сортировать кошельки',
    title: 'Кошельки',
  },
}

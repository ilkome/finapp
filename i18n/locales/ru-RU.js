export default {
  alerts: {
    removedUserData: 'Все данные удалены.',
    willDeleteEverything: 'Все кошельки, категории и транзакции будут удалены',
  },

  analytics: {
    title: 'Аналитика',
  },

  app: {
    desc: 'Приложение для учета личных финансов',
    locale: {
      en: 'English',
      ru: 'Русский',
    },
    theme: {
      change: 'Сменить тему',
      dark: 'Темная',
      light: 'Светлая',
      select: 'Выберите тему',
      system: 'Авто',
    },
  },

  appName: 'Финапка',

  base: {
    add: 'Создать',
    delete: 'Удалить',
    duplicate: 'Дублировать',
    edit: 'Редактировать',
    filter: 'Фильтр',
    loading: 'Загрузка...',
    no: 'Нет',
    off: 'Нет',
    ok: 'Хорошо',
    on: 'Да',
    save: 'Сохранить',
    setFilter: 'Фильтр',
    sort: 'Сортировка',
    sure: 'Удалить?',
    yes: 'Да',
  },

  buttons: {
    nextStep: 'Далее',
    nextTitle: 'Следующий',
    prevTitle: 'Прошлый',
  },

  categories: {
    allTitle: 'Все',
    childs: 'Дочерние категории',
    createNewTitle: 'Добавить категорию',
    editTitle: 'Редактирование категории',
    favoriteTitle: 'Избранные категории',

    form: {
      childColor: 'Применить цвет ко всем дочерним категориям',
      delete: {
        alertWithTrns: `Так же будут удалены {trns}`,
        errorChilds: 'Вы не можете удалить категорию с дочерними категориями. Сначала удалите дочерние категории.',
        okWithoutTrns: 'Категория удалена',
        okWithTrns: `Категория удалена и {trns}`,
      },
      icon: {
        label: 'Иконка',
      },
      lastUsed: 'Показывать в списке недавних категорий',
      name: {
        error: 'Напишите название категории',
        exist: 'Категория с таким именем уже существует',
        label: 'Название категории',
        placeholder: 'Напишите название категории...',
      },
      noChangeParent: 'Вы не можете изменить родительскую категорию, так как редактируемая категория имеет дочерние категории.',
      parent: {
        label: 'Родительская категория',
        no: 'Корневая',
      },
      quickSelector: 'Показывать в быстром выборе',
      save: 'Сохранить',
    },

    lastUsedTitle: 'Недавние категории',
    name: 'Категории',
    new: 'Новая категория',
    shortTitle: 'Категории',
    title: 'Категории',
  },

  chart: {
    options: 'Настройки графика',
    title: 'График',
    types: {
      bar: 'Колонки',
      line: 'Линии',
    },
  },

  close: 'Закрыть',

  color: {
    custom: 'Произвольный цвет',
    error: 'Выберите цвет',
    label: 'Цвет',
    placeholder: 'Выберите цвет',
  },

  colors: 'Цвета',

  common: {
    all: 'Все',
    date: 'Дата',
    in: 'в',
    open: 'Открыть',
  },
  create: {
    title: 'Создать',
  },

  currencies: {
    base: 'Основная валюта',
  },

  currency: {
    title: 'Валюта',
  },

  dates: {
    all: {
      simple: 'Все транзакции',
    },
    count: 'Количество',
    day: {
      current: 'Сегодня',
      simple: 'День',
      today: 'Сегодня',
      yesterday: 'Вчера',
    },
    last: 'Последний',
    month: {
      current: 'Текущий месяц',
      last: 'Прошлый месяц',
      simple: 'Месяц',
    },
    period: 'Период',
    select: 'Выбрать',
    twoDaysAgo: '2 дня назад',
    week: {
      current: 'Текущая неделя',
      last: 'Прошлая неделя',
      simple: 'Неделя',
    },
    year: {
      current: 'Текущий год',
      simple: 'Год',
    },
  },

  demo: {
    exit: 'Выйти из демо режима',
    loaded: 'Данные загружены',
    update: 'Обновить демо данные',
    updated: 'Данные обновлены',
  },

  filter: {
    clear: 'Убрать',
  },
  locale: {
    toggle: 'Сменить язык',
  },

  loginWithGithub: 'Войти через Github',

  loginWithGoogle: 'Войти через Google',

  money: {
    all: 'Всего',
    also: 'Еще',
    average: {
      base: 'Обычно',
      expense: 'Обычно',
      income: 'Обычно',
      sum: 'Обычно',
    },
    averageTotal: 'Обычно',
    balance: 'Баланс',
    expense: 'Расход',
    income: 'Доход',
    netIncome: 'Баланс',
    options: {
      isExcludeInTotal: 'Не считать в общем балансе',
      withdrawal: 'Доступные',
    },
    sum: 'Сумма',
    totals: {
      all: 'Всего',
      archived: 'Скрытые',
      available: 'Доступные',
      creditPossible: 'Доступный кредитный лимит',
      isCash: 'Наличные',
      isCashless: 'Безнал',
      isCredit: 'Кредиты',
      isDebt: 'Долги',
      isDeposit: 'Вклады',
      isExcludeTotal: 'Не считать в общем балансе',
      other: 'Другое',
      withCredit: 'Без учета кредита',
      withdrawal: 'Доступные',
    },
    transfer: 'Перевод',
    type: 'Тип кошельки',
    types: {
      all: 'Все',
      archived: 'Скрытые',
      available: 'Доступные',
      cash: 'Наличные',
      cashless: 'Безнал',
      credit: 'Кредит',
      creditPossible: 'Доступный кредитный лимит',
      crypto: 'Крипта',
      debt: 'Долги',
      deposit: 'Вклады',
      withdrawal: 'Доступные для снятия',
    },
    wallets: 'Кошельки',
  },

  settings: {
    app: 'Приложение',
    caution: 'C осторожностью',
    deleteButton: 'Удалить все мои данные',
    lang: 'Язык приложения',
    open: 'Открыть настройки',
    options: 'Опции',
    title: 'Настройки',
  },

  stat: {
    balanceTitle: 'Баланс',
    config: {
      chartShow: {
        label: 'Показывать график',
        title: 'График',
      },
      chartView: {
        full: 'Полный',
        half: 'Компактный',
        label: 'Вид графика',
      },
      showedWallets: {
        label: 'Показывать кошельки',
        placeholder: 'Количество',
      },
    },
    customize: {
      showCategoriesChart: 'Показывать вертикальный график категорий',
      showCategoriesList: 'Показывать список категорий',
      showCatsChartPie: 'Показывать статистику "пирог"',
      showHistory: 'Показывать историю',
      showPeriodsChart: 'Показывать график периодов',
      showRoundCats: 'Показывать список круглых иконок',
    },
    empty: 'Статистики по выбранным параметрам нет :)',
    emptyDesc: 'Измените фильтр, период или добавьте новую транзакцию.',
    periods: 'Периоды',
    selectedPeriod: 'Выбранный период',
    shortTitle: 'Статистика',
    statNew: 'v2',
    summary: 'Общее',
    tabs: {
      chart: 'График',
      empty: 'Скрыть',
      gLines: 'Группы',
      lines: 'Линии',
      linesChart: 'Линии и график',
      linesTrns: 'Линии и транзакции',
      periods: 'Периоды',
      round: 'Кружочки',
      trns: 'Список',
    },

    title: 'Статистика',
  },

  statistics: {
    title: 'Статистика',
  },

  theme: {
    change: 'Сменить цвет оформления',
    title: 'Тема',
  },

  transfer: {
    titleMoney: 'Переводы',
  },

  trnForm: {
    calcTrnButton: 'Посчитать результат',
    createTrn: 'Создать транзакцию',
    description: {
      placeholder: 'Напишите описание...',
      title: 'Описание',
    },
    filterAll: 'Все',
    filterWallet: 'Кошелек',
    filterWalletAndCategory: 'Кошелек и Категория',
    lastUsedCats: 'Показывать последние использованные категории',
    saveTrnButton: 'Сохранить',
    title: 'Создание транзакции',
    titleEditTrn: 'Редактирование транзакции',
    transfer: {
      from: 'Из',
      fromLong: 'Из кошелька',
      to: 'В',
      toLong: 'В кошелек',
    },
    transferTitle: 'Перевод',
  },

  trns: {
    filter: {
      showTrnsWithDesc: 'Только с описанием',
    },
    history: 'История',
    more: 'Показать еще',
    noTrns: 'Нет транзакций',
    plural: '0 транзакций | {n} транзакция | {n} транзакции | {n} транзакций',
    shortTitle: 'Транзакции',
    title: 'Транзакции',
  },

  userLogout: 'Выход',

  users: {
    title: 'Пользователи',
  },

  wallets: {
    createNewTitle: 'Добавить кошелек',
    editTitle: 'Редактирование кошелька',
    form: {
      credit: {
        available: 'Доступно',
        debt: 'Долг',
        limit: 'Лимит',
      },
      currencies: {
        error: 'Выберите валюту',
        label: 'Валюта',
        placeholder: 'Выберите валюту',
      },
      description: {
        label: 'Описание кошелька (не обязательно)',
        placeholder: 'Напишите...',
      },
      name: {
        error: 'Напишите название кошелька',
        exist: 'Кошелек с таким именем уже существует',
        label: 'Название кошелька',
        placeholder: 'Напишите...',
      },
      save: 'Сохранить',
      total: {
        placeholder: 'Деньги доступны для снятия',
      },
    },
    name: 'Кошельки',
    new: 'Новый кошелек',
    properties: 'Свойства кошелька',
    showOnly: 'Показать только',
    sortTitle: 'Сортировать кошельки',
    title: 'Кошельки',
  },

  welcome: {
    intro: 'Добро пожаловать в Финапку!',
  },
}
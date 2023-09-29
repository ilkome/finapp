export default {
  common: {
    date: 'Дата',
    open: 'Открыть',
    all: 'Все',
    in: 'в',
  },

  analytics: {
    title: 'Аналитика',
  },

  appName: 'Финапка',

  locale: {
    toggle: 'Сменить язык',
  },

  theme: {
    title: 'Тема',
    change: 'Сменить цвет оформления',
  },

  close: 'Закрыть',

  transfer: {
    titleMoney: 'Переводы',
  },

  trnForm: {
    transferTitle: 'Перевод',
    saveTrnButton: 'Сохранить',
    calcTrnButton: 'Посчитать результат',
    createTrn: 'Создать транзакцию',
    titleEditTrn: 'Редактирование транзакции',
    filterWalletAndCategory: 'Кошелек и Категория',
    filterWallet: 'Только Кошелек',
    filterAll: 'Все',
    title: 'Создание транзакции',
    lastUsedCats: 'Показывать последние использованные категории',
    description: {
      title: 'Описание',
      placeholder: 'Напишите описание...',
    },
    transfer: {
      from: 'Из',
      fromLong: 'Из кошелька',
      to: 'В',
      toLong: 'В кошелек',
    },
  },

  app: {
    version: 'Версия',
    desc: 'Приложение для учета личных финансов',
    welcome: 'Добро пожаловать в Финапку',
    lang: {
      select: 'Выберите язык',
      en: 'English',
      ru: 'Русский',
    },
    theme: {
      change: 'Сменить тему',
      select: 'Выберите тему',
      dark: 'Темная',
      light: 'Светлая',
    },
  },

  userLogout: 'Выход',
  loginWithGoogle: 'Войти через Google',
  changeTheme: 'Сменить тему',

  base: {
    sure: 'Ты уверен?',
    yes: 'Да',
    no: 'Нет',
    sort: 'Сортировка',
    save: 'Сохранить',
    cancel: 'Отмена',
    ok: 'Хорошо',
    on: 'Да',
    duplicate: 'Дублировать',
    setFilter: 'Фильтр',
    off: 'Нет',
    add: 'Создать',
    edit: 'Редактировать',
    delete: 'Удалить',
    filter: 'Фильтровать',
  },

  filter: {
    clear: 'Очистить фильтр',
  },

  welcome: {
    firstRun: {
      text: 'Пройти первоначальную настройку приложения',
      btn: 'Начать',
    },
    create: {
      text: 'Начнем с добавления кошелька и категории',
      btn: 'Погнали',
    },
    createFirstCategory: {
      text: 'Отлично! Теперь создадим категорию',
      btn: 'Создать',
    },
  },

  settings: {
    title: 'Настройки',
    lang: 'Язык приложения',
    options: 'Опции',
    open: 'Открыть настройки',
    app: 'Приложение',
    caution: 'C осторожностью',
    deleteButton: 'Удалить все мои данные',
  },

  wallets: {
    title: 'Кошельки',
    name: 'Кошельки',
    new: 'Новый кошелек',
    showAll: 'Показать все кошельки',
    showOnly: 'Показать только',
    sortTitle: 'Сортировать кошельки',
    createNewTitle: 'Добавить кошелек',
    editTitle: 'Редактирование кошелька',
    form: {
      name: {
        label: 'Имя кошелька',
        placeholder: 'Напишите...',
        error: 'Напишите имя кошелька',
        exist: 'Кошелек с таким именем уже существует',
      },
      description: {
        label: 'Описание кошелька (не обязательно)',
        placeholder: 'Напишите...',
      },
      colors: {
        label: 'Цвет',
        placeholder: 'Выберите цвет',
        error: 'Выберите цвет',
        custom: 'Кастомный цвет',
      },
      currencies: {
        label: 'Валюта',
        placeholder: 'Выберите валюту',
        error: 'Выберите валюту',
      },
      total: {
        placeholder: 'Деньги доступны для снятия',
      },
      save: 'Сохранить',
    },
  },

  currency: {
    title: 'Валюта',
    selectBaseTitle: 'Выбрать основную валюту',
  },

  categories: {
    title: 'Категории',
    name: 'Категории',
    shortTitle: 'Категории',
    new: 'Новая категория',
    allTitle: 'Все',
    lastUsedTitle: 'Недавние',
    favoriteTitle: 'Любимые',
    createNewTitle: 'Добавить категорию',
    editTitle: 'Редактирование категории',
    form: {
      name: {
        label: 'Имя категории',
        placeholder: 'Напишите имя категории...',
        error: 'Напишите имя категории',
        exist: 'Категория с таким именем уже существует',
      },
      parent: {
        no: 'Корневая категория',
        label: 'Категория',
      },
      colors: {
        label: 'Цвета',
        custom: 'Кастомный цвет',
      },
      icon: {
        label: 'Иконка',
      },
      data: {
        label: 'Данные',
      },
      lastUsed: 'Показывать в списке недавних категорий',
      quickSelector: 'Любимая категория',
      childColor: 'Применить цвет ко всем дочерним категориям',
      save: 'Сохранить',
    },
  },

  stat: {
    title: 'Статистика',
    selectedPeriod: 'Выбранный период',
    shortTitle: 'Статистика',
    balanceTitle: 'Баланс',
    periods: 'Общее',
    empty: 'Статистики по выбранным параметрам нет :)',
    emptyDesc: 'Измените фильтр, период или добавьте новую транзакцию.',
    customize: {
      showHistory: 'Показывать историю',
      showRoundCats: 'Показывать список круглых иконок',
      showCategoriesChart: 'Показывать вертикальный график категорий',
      showCategoriesList: 'Показывать список категорий',
      showCatsChartPie: 'Показывать статистику "пирог"',
      showPeriodsChart: 'Показывать график периодов',
    },
  },

  chart: {
    title: 'График',
    showMain: 'Показывать основной график',
    view: {
      add: 'Добавить',
      remove: 'Удалить',
      toggle: 'Изменить график',
      showed: 'Показано',
      periodsName: 'период',
      simpleTitle: 'График линия',
      groupedTitle: 'График колонки',
      addGroupButton: 'Добавить группу',
      addPeriodButton: 'Добавить период',
      removeGroupButton: 'Удалить группу',
      removePeriodButton: 'Удалить период',
    },
  },

  trns: {
    inPeriodTitle: 'Транзакции',
    shortTitle: 'Транзакции',
    history: 'История',
    more: 'Показать еще',
    filter: {
      showTrnsWithDesc: 'Только с описанием',
    },
    noTrns: 'Нет транзакций',
  },

  create: {
    title: 'Создать',
  },

  money: {
    income: 'Доход',
    expense: 'Расход',
    total: 'Баланс',
    sum: 'Баланс',

    transfer: 'Перевод',
    average: {
      base: 'Обычно',
      income: 'Обычно',
      expense: 'Обычно',
    },
    averageTotal: 'Обычно',
    also: 'Еще',
    wallets: 'Кошельки',
    all: 'Всего',
  },

  dates: {
    period: 'Период',
    count: 'Количество',
    twoDaysAgo: '2 дня назад',
    day: {
      current: 'Сегодня',
      today: 'Сегодня',
      yesterday: 'Вчера',
      simple: 'День',
    },
    week: {
      current: 'Текущая неделя',
      last: 'Прошлая неделя',
      simple: 'Неделя',
    },
    month: {
      current: 'Текущий месяц',
      last: 'Прошлый месяц',
      simple: 'Месяц',
    },
    year: {
      current: 'Текущий год',
      simple: 'Год',
    },
    all: {
      simple: 'Все транзакции',
    },
  },

  alerts: {
    willDeleteEverything: 'Все кошельки, категории и транзакции будут удалены.',
  },

  buttons: {
    nextTitle: 'Следующий',
    prevTitle: 'Прошлый',
    nextStep: 'Далее',
  },

  users: {
    title: 'Пользователи',
  },

  colors: 'Цвета',
}


export default {
  common: {
    date: 'Дата'
  },

  analytics: {
    title: 'Аналитика'
  },

  appName: 'Финапка',

  for: 'за',

  locale: {
    toogle: 'Сменить язык'
  },

  theme: {
    title: 'Тема',
    change: 'Сменить цвет оформления'
  },

  backTo: 'Назад к ',
  close: 'Закрыть',

  trnForm: {
    transferTitle: 'Перевод',
    saveTrnButton: 'Сохранить',
    calcTrnButton: 'Посчитать результат',
    createTrnButton: 'Создать транзакцию',
    createTransferButton: 'Создать перевод',
    titleEditTrn: 'Редактирование транзакции',
    titleCreateTrn: 'Создание транзакции',
    filterWalletAndCategory: 'Кошелек и Категория',
    filterWallet: 'Только Кошелек',
    filterAll: 'Все',
    title: 'Создание транзакции',
    lastUsedCats: 'Показывать последние использованные категории',
    description: {
      title: 'Описание',
      placeholder: 'Напишите описание...'
    },
    transfer: {
      from: 'Из',
      fromLong: 'Из кошелька',
      to: 'В',
      toLong: 'В кошелек'
    }
  },

  about: {
    creators: {
      title: 'Создатели',
      author: 'Автор',
      thanks: 'Спасибо за поддержку'
    }
  },

  app: {
    update: {
      title: 'Доступа новая версия',
      text: 'Перезагрузи приложение, чтобы использовать все новые фишки.',
      button: ' Перезагрузить'
    },
    version: 'Версия',
    desc: 'Приложение для учета личных финансов',
    welcome: 'Добро пожаловать в Финапку',
    lang: {
      select: 'Выберите язык',
      en: 'English',
      ru: 'Русский'
    },
    theme: {
      change: 'Сменить тему',
      select: 'Выберите тему',
      dark: 'Темная',
      light: 'Светлая'
    },
    madeBy: {
      text: 'Разработал',
      name: 'Илья Комичев'
    }
  },

  userLogout: 'Выход',
  loginWithGoogle: 'Войти через Google',
  changeTheme: 'Сменить оформление',
  createTrn: 'Создать транзакцию',

  base: {
    sure: 'Ты уверен?',
    yes: 'Да',
    no: 'Нет',
    sort: 'Сортировка',
    save: 'Сохранить',
    cancel: 'Отмена',
    ok: 'Хорошо',
    on: 'Да',
    dublicate: 'Дублировать',
    setFilter: 'Фильтр',
    off: 'Нет',
    edit: 'Редактировать',
    delete: 'Удалить',
    filter: 'Фильтровать'
  },

  filter: {
    clear: 'Очистить фильтр'
  },

  welcome: {
    firstRun: {
      text: 'Пройти первоначальную настройку приложения',
      btn: 'Начать'
    },
    create: {
      text: 'Начнем с создания первого кошелька и категории',
      btn: 'Погнали'
    },
    or: 'или',
    demo: {
      text: 'Загрузить приложение с заранее созданными кошельками и категориями',
      btn: 'Открыть демо режим'
    },
    createFirstWallet: {
      text: 'Создадим первый кошелек',
      btn: 'Создать'
    },
    createFirstCategory: {
      text: 'Отлично! Теперь создадим категорию',
      btn: 'Создать'
    }
  },

  settings: {
    title: 'Настройки',
    lang: 'Язык приложения',
    options: 'Опции',
    open: 'Открыть настройки',
    customize: 'Внешний вид',
    app: 'Приложение',
    caution: 'C осторожностью',
    demo: 'Демо режим',
    deleteButton: 'Удалить все мои данные',
    loadDemoButton: 'Загрузить демо данные'
  },

  wallets: {
    title: 'Кошельки',
    name: 'Кошельки',
    new: 'Новый кошелек',
    showAll: 'Показать все кошельки',
    showOnly: 'Показать только',
    sortTitle: 'Сортировать кошельки',
    createNewTitle: 'Создание кошелька',
    editTitle: 'Редактирование кошелек',
    form: {
      name: {
        label: 'Имя кошелька',
        placeholder: 'Напишите имя кошелька...',
        error: 'Напишите имя кошелька',
        exist: 'Кошелек с таким именем уже существует'
      },
      color: {
        label: 'Цвет',
        placeholder: 'Выберите цвет',
        error: 'Выберите цвет',
        custom: 'Кастомный цвет'
      },
      currency: {
        label: 'Валюта',
        placeholder: 'Выберите валюту',
        error: 'Выберите валюту'
      },
      total: {
        placeholder: 'Деньги доступны для снятия'
      },
      save: 'Сохранить'
    }
  },

  currency: {
    title: 'Валюта',
    selectBaseTitle: 'Выбрать основную валюту'
  },

  categories: {
    title: 'Категории',
    name: 'Категории',
    shortTitle: 'Категории',
    new: 'Новая категория',
    allTitle: 'Все',
    lastUsedTitle: 'Недавние',
    favoriteTitle: 'Любимые',
    createNewTitle: 'Создание категории',
    editTitle: 'Редактирование категории',
    form: {
      name: {
        label: 'Имя категории',
        placeholder: 'Напишите имя категории...',
        error: 'Напишите имя категории',
        exist: 'Категория с таким именем уже существует'
      },
      parent: {
        no: 'Корневая категория',
        label: 'Категория',
        placeholder: 'Выберите категрию'
      },
      color: {
        label: 'Цвета',
        custom: 'Кастомный цвет'
      },
      icons: {
        label: 'Иконки'
      },
      data: {
        label: 'Данные'
      },
      lastUsed: 'Показывать в списке недавних категорий',
      quickSelector: 'Любимая категория',
      childColor: 'Применить цвет ко всем дочерним категориям',
      save: 'Сохранить'
    }
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
      showCategorisChart: 'Показывать вертикальный график категорий',
      showCategorisList: 'Показывать список категорий',
      showcatsChartPie: 'Показывать статистику "пирог"',
      showPeriodsChart: 'Показывать график периодов'
    }
  },

  chart: {
    title: 'График',
    showMain: 'Показывать основной график',
    view: {
      add: 'Добавить',
      remove: 'Удалить',
      toogle: 'Изменить график',
      showed: 'Показано',
      periodsName: 'период',
      simpleTitle: 'График линия',
      groupedTitle: 'График колонки',
      addGroupButton: 'Добавить группу',
      addPeriodButton: 'Добавить период',
      removeGroupButton: 'Удалить группу',
      removePeriodButton: 'Удалить период'
    }
  },

  trns: {
    inPeriodTitle: 'Транзакции',
    shortTitle: 'Транзакции',
    history: 'История',
    more: 'Показать еще',
    filter: {
      showTrnsWithDesc: 'Только с описанием'
    }
  },

  create: {
    title: 'Создать'
  },

  money: {
    incomes: 'Доход',
    expenses: 'Расход',
    transfer: 'Перевод',
    total: 'Итого',
    average: {
      base: 'Среднее',
      incomes: 'Средний доход',
      expenses: 'Средний расход'
    },
    averageTotal: 'Обычно',
    also: 'Еще',
    wallets: 'Кошельки',
    all: 'Всего'
  },

  dates: {
    period: 'Период',
    count: 'Количество',
    twoDaysAgo: '2 дня назад',
    day: {
      current: 'Сегодня',
      today: 'Сегодня',
      yesterday: 'Вчера',
      simple: 'День'
    },
    week: {
      current: 'Текущая неделя',
      last: 'Прошлая неделя',
      simple: 'Неделя'
    },
    month: {
      current: 'Текущий месяц',
      last: 'Прошлый месяц',
      simple: 'Месяц'
    },
    year: {
      current: 'Текущий год',
      simple: 'Год'
    },
    all: {
      simple: 'Все транзакции'
    }
  },

  alerts: {
    willDeleteEverything: 'Все кошельки, категории и транзакции будут удалены.'
  },

  buttons: {
    nextTitle: 'Следующий',
    prevTitle: 'Прошлый',
    nextStep: 'Далее'
  },

  users: {
    title: 'Пользователи'
  },

  colors: 'Цвета',
  palette: 'Палитра',
  popularColors: 'Популярные',

  groups: {
    id: 'groups',
    title: 'Группы',
    show: 'Показать группы',
    form: {
      title: 'Create new group',
      name: 'Group name',
      amount: 'Group amount',
      button: 'Create'
    },
    trns: {
      name: 'Group transactions'
    },
    stat: {
      expenses: 'Рассход',
      incomes: 'Доход',
      total: 'Итого'
    }
  }
}

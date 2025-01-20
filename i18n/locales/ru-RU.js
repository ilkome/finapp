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
  },

  appName: 'Финапка',

  base: {
    add: 'Создать',
    apply: 'Применить',
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
        desc: 'Используйте любую иконку из набора',
        label: 'Иконка',
        link: 'Ссылка',
      },
      lastUsed: 'Показывать в списке недавних категорий',
      name: {
        error: 'Напишите название категории',
        exist: 'Категория с таким именем уже существует',
        label: 'Название категории',
        placeholder: 'Напишите...',
      },
      parent: {
        label: 'Родительская категория',
        no: 'Без родителя',
      },
      quickSelector: 'Показывать в быстром выборе',
      save: 'Сохранить',
    },

    lastUsedTitle: 'Недавние категории',
    name: 'Категории',
    new: 'Новая категория',
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
    day: {
      current: 'Сегодня',
      last: 'Вчера',
      next: 'Завтра',
      plural: 'дней | день | дня | дней',
      short: 'д',
      simple: 'День',
      today: 'Сегодня',
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
    period: 'Период',
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
    loaded: 'Данные загружены',
    update: 'Обновить демо данные',
    updated: 'Данные обновлены',
  },

  dev: {
    menu: {
      title: 'Разработка',
    },
  },

  locale: {
    toggle: 'Сменить язык',
  },

  loginWithGithub: 'Войти через Github',
  loginWithGoogle: 'Войти через Google',

  money: {
    all: 'Всего',
    also: 'Еще',
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
    summary: 'Сумма',
    totals: {
      all: 'Всего',
      archived: 'Архивный',
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
      archived: 'Архивные',
      available: 'Доступные для снятия',
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

  periods: {
    menu: 'Периоды',
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
      categories: {
        grouping: {
          grouped: 'Группировать',
          label: 'Группировка',
          ungrouped: 'Не группировать',
        },
        title: 'Настройки категорий',
        vertical: {
          grouped: 'Группировать',
          label: 'Вертикальный график',
          ungrouped: 'Не группировать',
        },
        view: {
          label: 'Вид категорий',
          list: 'Список',
          round: 'Круглые',
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

      statAverage: {
        count: {
          label: 'Количество кошельков',
          placeholder: 'Выберите количество кошельков',
        },
        label: 'Показывать средние значения',
        title: 'Средние значения',
      },

      wallets: {
        label: 'Показывать кошельки',
        title: 'Кошельки',
      },
    },
    empty: 'Статистики по выбранным параметрам нет :)',
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
      placeholder: 'Напишите...',
      title: 'Описание',
    },
    filterAll: 'Все',
    filterWallet: 'Кошелек',
    filterWalletAndCategory: 'Кошелек и Категория',
    lastUsedCats: 'Показывать последние использованные категории',
    saveTrnButton: 'Сохранить',
    title: 'Создание транзакции',
    titleEditTrn: 'Редактирование транзакции',
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
    title: 'Транзакции',
  },

  userLogout: 'Выход',

  users: {
    title: 'Пользователи',
  },

  wallets: {
    createNewTitle: 'Добавить кошелек',
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
      delete: {
        alertWithTrns: `Так же будут удалены {trns}`,
        errorChilds: 'Вы не можете удалить кошелек с транзакциями. Сначала удалите транзакции.',
        okWithoutTrns: 'Кошелек удален',
        okWithTrns: `Кошелек удален и {trns}`,
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

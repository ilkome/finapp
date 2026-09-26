import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'

type LocaleString = {
  en: string
  ru: string
}

/** CategoryItem with localized name + optional order for demo sorting */
type DemoCategoryItem = Omit<CategoryItem, 'name'> & {
  name: LocaleString
  order?: number
}

/** WalletItem with localized name/desc, optional fields for compact demo data */
type DemoWalletItem = Partial<Omit<WalletItem, 'color' | 'currency' | 'desc' | 'name' | 'type'>> & {
  color: string
  creditLimit?: number
  currency: string
  desc: LocaleString
  name: LocaleString
  type: WalletItem['type']
}

// --- Category IDs ---
export const catFood = 'demo_cat_food'
export const catFoodGroceries = 'demo_cat_food_groceries'
export const catFoodCafe = 'demo_cat_food_cafe'
export const catFoodDelivery = 'demo_cat_food_delivery'

export const catTransport = 'demo_cat_transport'
export const catTransportFuel = 'demo_cat_transport_fuel'
export const catTransportPublic = 'demo_cat_transport_public'
export const catTransportParking = 'demo_cat_transport_parking'
export const catTransportService = 'demo_cat_transport_service'

export const catHome = 'demo_cat_home'
export const catHomeRent = 'demo_cat_home_rent'
export const catHomeElectricity = 'demo_cat_home_electricity'
export const catHomeInternet = 'demo_cat_home_internet'
export const catHomeWater = 'demo_cat_home_water'

export const catHealth = 'demo_cat_health'
export const catHealthPharmacy = 'demo_cat_health_pharmacy'
export const catHealthDoctor = 'demo_cat_health_doctor'

export const catEntertainment = 'demo_cat_entertainment'
export const catEntertainmentSubscriptions = 'demo_cat_entertainment_subs'
export const catEntertainmentMovies = 'demo_cat_entertainment_movies'
export const catEntertainmentHobby = 'demo_cat_entertainment_hobby'

export const catClothing = 'demo_cat_clothing'
export const catSport = 'demo_cat_sport'
export const catEducation = 'demo_cat_education'
export const catTravel = 'demo_cat_travel'
export const catPets = 'demo_cat_pets'
export const catGifts = 'demo_cat_gifts'
export const catFamily = 'demo_cat_family'

export const catSalary = 'demo_cat_salary'
export const catFreelance = 'demo_cat_freelance'
export const catInvestments = 'demo_cat_investments'
export const catCashback = 'demo_cat_cashback'

// --- Wallet IDs ---
export const walletCashRub = 'demo_w_cash_rub'
export const walletDebitRub = 'demo_w_debit_rub'
export const walletCreditRub = 'demo_w_credit_rub'
export const walletUsd = 'demo_w_usd'
export const walletDepositEur = 'demo_w_deposit_eur'
export const walletCrypto = 'demo_w_crypto'
export const walletDebt = 'demo_w_debt'
export const walletSavings = 'demo_w_savings'
export const walletEth = 'demo_w_eth'
export const walletUsdt = 'demo_w_usdt'
export const walletRandomFiat = 'demo_w_random_fiat'
export const walletRandomCrypto = 'demo_w_random_crypto'
export const walletMortgage = 'demo_w_mortgage'
export const walletCarLoan = 'demo_w_car_loan'
export const walletPersonalLoan = 'demo_w_personal_loan'
export const walletCashLoan = 'demo_w_cash_loan'
export const walletInstallment = 'demo_w_installment'
export const walletRenovationLoan = 'demo_w_renovation_loan'
export const walletLent = 'demo_w_lent'
export const walletBorrowed = 'demo_w_borrowed'
export const walletVacationLoan = 'demo_w_vacation_loan'
export const walletStudentLoan = 'demo_w_student_loan'
export const walletEuroLoan = 'demo_w_euro_loan'

/**
 * Every amount in this file is RUB-scale. The generator converts it at the demo rates into the
 * currency of the wallet it lands on: RUB wallets take the locale's main currency and the dollar
 * account its foreign one, so an English demo has no roubles.
 */
export const mainCurrency = { en: 'USD', ru: 'RUB' }
export const foreignCurrency = { en: 'GBP', ru: 'USD' }

/** One wallet of each list gets a random currency per generation, to show what else the app handles. */
export const randomFiatCurrencies = ['GBP', 'CNY', 'JPY', 'CHF', 'TRY', 'KZT']
export const randomCryptoCurrencies: Record<string, string> = { DOGE: 'Dogecoin', SOL: 'Solana', TON: 'Toncoin', XRP: 'XRP' }

export const data: {
  categories: Record<CategoryId, DemoCategoryItem>
  wallets: Record<WalletId, DemoWalletItem>
} = {
  categories: {
    [catCashback]: {
      color: '#059669',
      icon: 'mdi:sack-percent',
      name: { en: 'Cashback', ru: 'Кэшбэк' },
      order: 15,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    // ---- Standalone expense categories ----
    [catClothing]: {
      color: '#ec4899',
      icon: 'mdi:tshirt-crew',
      name: { en: 'Clothing', ru: 'Одежда' },
      order: 5,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catEducation]: {
      color: '#3b82f6',
      icon: 'mdi:school',
      name: { en: 'Education', ru: 'Образование' },
      order: 7,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    // ---- Entertainment (parent) ----
    [catEntertainment]: {
      color: '#a855f7',
      icon: 'mdi:drama-masks',
      name: { en: 'Entertainment', ru: 'Развлечения' },
      order: 4,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },

    [catEntertainmentHobby]: {
      color: '#a855f7',
      icon: 'mdi:palette-outline',
      name: { en: 'Hobby', ru: 'Хобби' },
      parentId: catEntertainment,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catEntertainmentMovies]: {
      color: '#a855f7',
      icon: 'mdi:movie-roll',
      name: { en: 'Movies', ru: 'Кино' },
      parentId: catEntertainment,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catEntertainmentSubscriptions]: {
      color: '#a855f7',
      icon: 'mdi:repeat',
      name: { en: 'Subscriptions', ru: 'Подписки' },
      parentId: catEntertainment,
      showInLastUsed: true,
      showInQuickSelector: true,
      updatedAt: 1585408895295,
    },
    [catFamily]: {
      color: '#e11d48',
      icon: 'mdi:account-heart',
      name: { en: 'Family', ru: 'Семья' },
      order: 11,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    // ---- Food (parent) ----
    [catFood]: {
      color: '#f59e0b',
      icon: 'mdi:cupcake',
      name: { en: 'Food', ru: 'Еда' },
      order: 0,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },

    [catFoodCafe]: {
      color: '#f59e0b',
      icon: 'mdi:food-fork-drink',
      name: { en: 'Cafe & Restaurants', ru: 'Кафе и рестораны' },
      parentId: catFood,
      showInLastUsed: true,
      showInQuickSelector: true,
      updatedAt: 1585408895295,
    },
    [catFoodDelivery]: {
      color: '#f59e0b',
      icon: 'mdi:truck-delivery',
      name: { en: 'Delivery', ru: 'Доставка' },
      parentId: catFood,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catFoodGroceries]: {
      color: '#f59e0b',
      icon: 'mdi:food-apple',
      name: { en: 'Groceries', ru: 'Продукты' },
      parentId: catFood,
      showInLastUsed: true,
      showInQuickSelector: true,
      updatedAt: 1585408895295,
    },
    [catFreelance]: {
      color: '#10b981',
      icon: 'mdi:laptop-mac',
      name: { en: 'Freelance', ru: 'Фриланс' },
      order: 13,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catGifts]: {
      color: '#d946ef',
      icon: 'mdi:gift',
      name: { en: 'Gifts', ru: 'Подарки' },
      order: 10,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },

    // ---- Health (parent) ----
    [catHealth]: {
      color: '#ef4444',
      icon: 'mdi:heart-pulse',
      name: { en: 'Health', ru: 'Здоровье' },
      order: 3,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catHealthDoctor]: {
      color: '#ef4444',
      icon: 'mdi:doctor',
      name: { en: 'Doctor', ru: 'Врач' },
      parentId: catHealth,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catHealthPharmacy]: {
      color: '#ef4444',
      icon: 'mdi:pill',
      name: { en: 'Pharmacy', ru: 'Аптека' },
      parentId: catHealth,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },

    // ---- Home (parent) ----
    [catHome]: {
      color: '#8d6e63',
      icon: 'mdi:home',
      name: { en: 'Home', ru: 'Жилье' },
      order: 2,
      parentId: 0,
      showInLastUsed: false,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catHomeElectricity]: {
      color: '#8d6e63',
      icon: 'mdi:wind-turbine',
      name: { en: 'Electricity', ru: 'Электричество' },
      parentId: catHome,
      showInLastUsed: false,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catHomeInternet]: {
      color: '#8d6e63',
      icon: 'mdi:wifi',
      name: { en: 'Internet', ru: 'Интернет' },
      parentId: catHome,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catHomeRent]: {
      color: '#8d6e63',
      icon: 'mdi:home-currency-usd',
      name: { en: 'Rent', ru: 'Аренда' },
      parentId: catHome,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },

    [catHomeWater]: {
      color: '#8d6e63',
      icon: 'mdi:water-outline',
      name: { en: 'Water', ru: 'Вода' },
      parentId: catHome,
      showInLastUsed: false,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catInvestments]: {
      color: '#16a34a',
      icon: 'mdi:chart-timeline-variant',
      name: { en: 'Investments', ru: 'Инвестиции' },
      order: 14,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catPets]: {
      color: '#f97316',
      icon: 'mdi:paw',
      name: { en: 'Pets', ru: 'Питомцы' },
      order: 9,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    // ---- Income categories ----
    [catSalary]: {
      color: '#22c55e',
      icon: 'mdi:cash-multiple',
      name: { en: 'Salary', ru: 'Зарплата' },
      order: 12,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: true,
      updatedAt: 1585408895295,
    },
    [catSport]: {
      color: '#14b8a6',
      icon: 'mdi:dumbbell',
      name: { en: 'Sport', ru: 'Спорт' },
      order: 6,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    // ---- Transport (parent) ----
    [catTransport]: {
      color: '#64748b',
      icon: 'mdi:car-sports',
      name: { en: 'Transport', ru: 'Транспорт' },
      order: 1,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catTransportFuel]: {
      color: '#64748b',
      icon: 'mdi:gas-station',
      name: { en: 'Fuel', ru: 'Бензин' },
      parentId: catTransport,
      showInLastUsed: true,
      showInQuickSelector: true,
      updatedAt: 1585408895295,
    },

    [catTransportParking]: {
      color: '#64748b',
      icon: 'mdi:parking',
      name: { en: 'Parking', ru: 'Парковка' },
      parentId: catTransport,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catTransportPublic]: {
      color: '#64748b',
      icon: 'mdi:bus-side',
      name: { en: 'Public transit', ru: 'Общ. транспорт' },
      parentId: catTransport,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catTransportService]: {
      color: '#64748b',
      icon: 'mdi:cogs',
      name: { en: 'Car service', ru: 'Обслуживание авто' },
      parentId: catTransport,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
    [catTravel]: {
      color: '#0ea5e9',
      icon: 'mdi:airplane',
      name: { en: 'Travel', ru: 'Путешествия' },
      order: 8,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
  },

  wallets: {
    [walletBorrowed]: {
      color: '#e11d48',
      currency: 'RUB',
      desc: { en: 'Paying back in parts', ru: 'Отдаю частями' },
      name: { en: 'Borrowed from parents', ru: 'Занял у родителей' },
      order: 24,
      type: 'debt',
      updatedAt: 1585408895295,
    },
    [walletCarLoan]: {
      color: '#64748b',
      currency: 'RUB',
      desc: { en: 'Paid off early once, lower payment since', ru: 'Досрочное погашение с уменьшением платежа' },
      name: { en: 'Car loan', ru: 'Автокредит' },
      order: 15,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletCashLoan]: {
      color: '#78716c',
      currency: 'RUB',
      desc: { en: 'No published rate, bank schedule, two interest-only months', ru: 'Ставка не указана, график банка, два месяца только проценты' },
      name: { en: 'Cash loan', ru: 'Кредит наличными' },
      order: 17,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletCashRub]: {
      color: '#3b82f6',
      currency: 'RUB',
      desc: { en: '', ru: '' },
      isWithdrawal: true,
      name: { en: 'Cash', ru: 'Наличные' },
      order: 1,
      type: 'cash',
      updatedAt: 1585408895295,
    },
    [walletCreditRub]: {
      color: '#ef4444',
      creditLimit: 300000,
      currency: 'RUB',
      desc: { en: 'Credit limit 300 000', ru: 'Лимит 300 000' },
      name: { en: 'Credit card', ru: 'Кредитная карта' },
      order: 3,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletCrypto]: {
      color: '#f97316',
      currency: 'BTC',
      desc: { en: 'Long-term holding', ru: 'Долгосрочное хранение' },
      name: { en: 'Bitcoin', ru: 'Биткоин' },
      order: 10,
      type: 'crypto',
      updatedAt: 1585408895295,
    },
    [walletDebitRub]: {
      color: '#f59e0b',
      currency: 'RUB',
      desc: { en: 'Main debit card', ru: 'Основная дебетовая карта' },
      name: { en: 'Debit card', ru: 'Дебетовая карта' },
      order: 2,
      type: 'cashless',
      updatedAt: 1585408895295,
    },
    [walletDebt]: {
      color: '#64748b',
      currency: 'RUB',
      desc: { en: 'Returned in full', ru: 'Вернули полностью' },
      isArchived: true,
      name: { en: 'Lent to a friend', ru: 'Одолжил другу' },
      order: 25,
      type: 'debt',
      updatedAt: 1585408895295,
    },
    [walletDepositEur]: {
      color: '#6366f1',
      currency: 'EUR',
      desc: { en: 'Savings deposit', ru: 'Вклад на накопления' },
      name: { en: 'EUR Deposit', ru: 'Вклад EUR' },
      order: 5,
      type: 'deposit',
      updatedAt: 1585408895295,
    },
    [walletEth]: {
      color: '#6366f1',
      currency: 'ETH',
      desc: { en: '', ru: '' },
      name: { en: 'Ethereum', ru: 'Эфириум' },
      order: 11,
      type: 'crypto',
      updatedAt: 1585408895295,
    },
    [walletEuroLoan]: {
      color: '#4f46e5',
      currency: 'EUR',
      desc: { en: 'In euros, paid from the debit card with conversion', ru: 'В евро, платежи с дебетовой карты с конвертацией' },
      name: { en: 'Euro loan', ru: 'Кредит в евро' },
      order: 21,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletInstallment]: {
      color: '#a8a29e',
      currency: 'RUB',
      desc: { en: 'Interest-free, paid off', ru: 'Без процентов, выплачена' },
      name: { en: 'Sofa installment', ru: 'Рассрочка на диван' },
      order: 18,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletLent]: {
      color: '#14b8a6',
      currency: 'RUB',
      desc: { en: 'Returns in parts', ru: 'Возвращает частями' },
      name: { en: 'Lent to Alex', ru: 'Одолжил Саше' },
      order: 23,
      type: 'debt',
      updatedAt: 1585408895295,
    },
    [walletMortgage]: {
      color: '#475569',
      currency: 'RUB',
      desc: { en: 'Checked against the debt the bank reports', ru: 'Сверка с долгом, который сообщает банк' },
      name: { en: 'Mortgage', ru: 'Ипотека' },
      order: 14,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletPersonalLoan]: {
      color: '#94a3b8',
      currency: 'RUB',
      desc: { en: 'Differentiated payments, a month caught up with a fee', ru: 'Дифференцированные платежи, пропуск с пеней' },
      name: { en: 'Personal loan', ru: 'Потребительский кредит' },
      order: 16,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletRandomCrypto]: {
      color: '#a855f7',
      currency: 'SOL',
      desc: { en: '', ru: '' },
      name: { en: 'Altcoin', ru: 'Альткоин' },
      order: 13,
      type: 'crypto',
      updatedAt: 1585408895295,
    },
    [walletRandomFiat]: {
      color: '#0ea5e9',
      currency: 'GBP',
      desc: { en: '', ru: '' },
      name: { en: 'Foreign currency', ru: 'Иностранная валюта' },
      order: 7,
      type: 'cashless',
      updatedAt: 1585408895295,
    },
    [walletRenovationLoan]: {
      color: '#57534e',
      currency: 'RUB',
      desc: { en: 'Paid off early in one go', ru: 'Погашен досрочно одним платежом' },
      name: { en: 'Renovation loan', ru: 'Кредит на ремонт' },
      order: 19,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletSavings]: {
      color: '#8b5cf6',
      currency: 'USD',
      desc: { en: 'Emergency fund', ru: 'Фонд на непредвиденные расходы' },
      isExcludeInTotal: true,
      name: { en: 'Savings', ru: 'Накопления' },
      order: 6,
      type: 'deposit',
      updatedAt: 1585408895295,
    },
    [walletStudentLoan]: {
      color: '#16a34a',
      currency: 'USD',
      desc: { en: 'In the foreign currency, interest accrued by days', ru: 'В валюте, проценты начисляются по дням' },
      name: { en: 'Student loan', ru: 'Образовательный кредит' },
      order: 22,
      type: 'credit',
      updatedAt: 1585408895295,
    },
    [walletUsd]: {
      color: '#22c55e',
      currency: 'USD',
      desc: { en: 'Dollar account', ru: 'Долларовый счет' },
      name: { en: 'Dollar account', ru: 'Долларовый счет' },
      order: 4,
      type: 'cashless',
      updatedAt: 1585408895295,
    },
    [walletUsdt]: {
      color: '#10b981',
      currency: 'USDT',
      desc: { en: 'Stablecoin', ru: 'Стейблкоин' },
      name: { en: 'Tether', ru: 'Tether' },
      order: 12,
      type: 'crypto',
      updatedAt: 1585408895295,
    },
    [walletVacationLoan]: {
      color: '#0891b2',
      currency: 'RUB',
      desc: { en: '6 months, paid off on schedule', ru: '6 месяцев, выплачен по графику' },
      name: { en: 'Vacation loan', ru: 'Кредит на отпуск' },
      order: 20,
      type: 'credit',
      updatedAt: 1585408895295,
    },
  },
}

/**
 * Weighted expense categories with realistic amount ranges (in RUB).
 * weight = relative frequency of transactions in this category.
 */
export type DemoExpenseRule = {
  categoryId: CategoryId
  desc?: LocaleString
  max: number
  min: number
  /** Months (0-11) when this category is more likely. undefined = year-round. */
  seasonMonths?: number[]
  walletIds?: string[]
  weight: number
}

export const expenseRules: DemoExpenseRule[] = [
  // Food - most frequent
  { categoryId: catFoodGroceries, max: 5000, min: 300, weight: 20 },
  { categoryId: catFoodCafe, max: 4000, min: 500, walletIds: [walletDebitRub, walletCreditRub], weight: 10 },
  { categoryId: catFoodDelivery, max: 3000, min: 600, walletIds: [walletDebitRub, walletCreditRub], weight: 6 },

  // Transport
  { categoryId: catTransportFuel, max: 5000, min: 1500, weight: 6 },
  { categoryId: catTransportPublic, max: 500, min: 50, weight: 8 },
  { categoryId: catTransportParking, max: 500, min: 100, weight: 4 },
  { categoryId: catTransportService, desc: { en: 'Oil change', ru: 'Замена масла' }, max: 15000, min: 3000, weight: 1 },

  // Home monthly bills are seeded separately to keep generated history representative.

  // Health
  { categoryId: catHealthPharmacy, max: 3000, min: 200, weight: 3 },
  { categoryId: catHealthDoctor, desc: { en: 'Checkup', ru: 'Осмотр' }, max: 8000, min: 2000, weight: 1 },

  // Entertainment
  { categoryId: catEntertainmentSubscriptions, max: 1500, min: 200, walletIds: [walletCreditRub], weight: 3 },
  { categoryId: catEntertainmentMovies, max: 2000, min: 400, walletIds: [walletDebitRub, walletCreditRub], weight: 2 },
  { categoryId: catEntertainmentHobby, max: 5000, min: 500, weight: 2 },

  // Standalone (with seasonality)
  { categoryId: catClothing, max: 15000, min: 1000, seasonMonths: [2, 3, 8, 9], walletIds: [walletDebitRub, walletCreditRub], weight: 2 },
  // Gym is seeded separately to keep generated history representative.
  { categoryId: catEducation, max: 10000, min: 1000, seasonMonths: [8, 9, 0, 1], weight: 1 },
  { categoryId: catTravel, max: 40000, min: 8000, seasonMonths: [5, 6, 7, 11], walletIds: [walletDebitRub, walletCreditRub], weight: 1 },
  { categoryId: catPets, max: 5000, min: 300, weight: 2 },
  { categoryId: catGifts, max: 10000, min: 1000, seasonMonths: [2, 11], weight: 1 },
  { categoryId: catFamily, max: 10000, min: 1000, weight: 2 },
]

/**
 * One-off larger expenses that create noticeable but not extreme spikes.
 * Each fires once per year at a random point in the specified months.
 */
export type DemoOneOffExpense = {
  categoryId: CategoryId
  desc: LocaleString
  max: number
  min: number
  months: number[]
  walletIds?: string[]
}

export const oneOffExpenses: DemoOneOffExpense[] = [
  { categoryId: catTransportService, desc: { en: 'Tire change', ru: 'Замена шин' }, max: 12000, min: 6000, months: [3, 10] },
  { categoryId: catHealthDoctor, desc: { en: 'Dental cleaning', ru: 'Чистка зубов' }, max: 8000, min: 4000, months: [3, 9] },
  { categoryId: catClothing, desc: { en: 'Winter jacket', ru: 'Зимняя куртка' }, max: 18000, min: 8000, months: [9, 10], walletIds: [walletCreditRub] },
  { categoryId: catGifts, desc: { en: 'Birthday gift', ru: 'Подарок на день рождения' }, max: 8000, min: 3000, months: [4] },
  { categoryId: catGifts, desc: { en: 'New Year gifts', ru: 'Новогодние подарки' }, max: 15000, min: 5000, months: [11], walletIds: [walletCreditRub] },
  { categoryId: catEducation, desc: { en: 'Online course', ru: 'Онлайн курс' }, max: 12000, min: 4000, months: [1, 8] },
  { categoryId: catEntertainmentHobby, desc: { en: 'Concert tickets', ru: 'Билеты на концерт' }, max: 10000, min: 3000, months: [5, 6], walletIds: [walletDebitRub, walletCreditRub] },
]

export type DemoIncomeRule = {
  categoryId: CategoryId
  desc?: LocaleString
  max: number
  min: number
  walletIds?: string[]
  weight: number
}

/**
 * Loans with different terms, each taken `monthsAgo` and repaid monthly from the debit card, so
 * together they show every state the loans page knows. Deviations count due payments back from
 * the latest one (0 = the latest).
 * `purchase`: the loan paid a seller directly, so the credit wallet spends it in that category;
 * without it the money lands on the debit card.
 */
export type DemoLoan = {
  /** null: the bank publishes no rate; the schedule then comes from the bank, built at `bankRate`. */
  annualRate: number | null
  /** Bank sync pushed the debt it reports, so the loan checks the wallet against it. */
  bankDebt?: boolean
  bankRate?: number
  /** This payment is skipped and paid together with the next one, plus a late fee. */
  catchUp?: number
  /** Where the money comes from and payments go out; the main debit card when omitted. */
  debitWalletId?: WalletId
  interestMethod?: 'monthly' | 'daily'
  /** Payment numbers (from 1) the bank made interest-only: a payment holiday. */
  interestOnly?: number[]
  /** This payment is paid a few days late. */
  late?: number
  /** Days after the due date the bank still counts as on time. */
  lateAfterDays?: number
  /** The latest due payment is not paid yet: the loan shows it overdue. */
  missed?: boolean
  monthsAgo: number
  overpaymentMode: 'reducePayment' | 'reduceTerm'
  paymentDay: number
  /** With this payment the whole debt left is paid off, which closes the loan early. */
  payoff?: number
  /** An extra payment on its own day, three weeks before this payment. */
  prepayment?: { amount: number, paymentsAgo: number }
  principalAmount: number
  purchase?: { categoryId: CategoryId, desc: LocaleString }
  scheduleType: 'annuity' | 'differentiated'
  termMonths: number
  walletId: WalletId
}

export const demoLoans: DemoLoan[] = [
  { annualRate: 9.5, bankDebt: true, interestMethod: 'daily', lateAfterDays: 5, monthsAgo: 40, overpaymentMode: 'reducePayment', paymentDay: 5, principalAmount: 4500000, purchase: { categoryId: catHome, desc: { en: 'Apartment purchase', ru: 'Покупка квартиры' } }, scheduleType: 'annuity', termMonths: 240, walletId: walletMortgage },
  { annualRate: 16.9, late: 2, monthsAgo: 14, overpaymentMode: 'reducePayment', paymentDay: 10, prepayment: { amount: 150000, paymentsAgo: 6 }, principalAmount: 1200000, purchase: { categoryId: catTransport, desc: { en: 'Car purchase', ru: 'Покупка автомобиля' } }, scheduleType: 'annuity', termMonths: 60, walletId: walletCarLoan },
  { annualRate: 24.9, catchUp: 4, missed: true, monthsAgo: 8, overpaymentMode: 'reduceTerm', paymentDay: 20, principalAmount: 300000, scheduleType: 'differentiated', termMonths: 24, walletId: walletPersonalLoan },
  { annualRate: null, bankRate: 21.9, interestOnly: [4, 5], monthsAgo: 11, overpaymentMode: 'reduceTerm', paymentDay: 15, principalAmount: 500000, scheduleType: 'annuity', termMonths: 36, walletId: walletCashLoan },
  { annualRate: 18.5, monthsAgo: 30, overpaymentMode: 'reduceTerm', paymentDay: 12, payoff: 9, principalAmount: 400000, purchase: { categoryId: catHome, desc: { en: 'Renovation', ru: 'Ремонт' } }, scheduleType: 'annuity', termMonths: 36, walletId: walletRenovationLoan },
  { annualRate: 14.9, monthsAgo: 10, overpaymentMode: 'reduceTerm', paymentDay: 18, principalAmount: 120000, purchase: { categoryId: catTravel, desc: { en: 'Vacation', ru: 'Отпуск' } }, scheduleType: 'annuity', termMonths: 6, walletId: walletVacationLoan },
  { annualRate: 7.9, debitWalletId: walletUsd, interestMethod: 'daily', monthsAgo: 10, overpaymentMode: 'reducePayment', paymentDay: 1, principalAmount: 400000, scheduleType: 'annuity', termMonths: 36, walletId: walletStudentLoan },
  { annualRate: 4.5, monthsAgo: 20, overpaymentMode: 'reduceTerm', paymentDay: 28, principalAmount: 1200000, purchase: { categoryId: catHome, desc: { en: 'Holiday flat', ru: 'Квартира у моря' } }, scheduleType: 'annuity', termMonths: 84, walletId: walletEuroLoan },
  { annualRate: 0, monthsAgo: 13, overpaymentMode: 'reduceTerm', paymentDay: 25, principalAmount: 90000, purchase: { categoryId: catHome, desc: { en: 'Sofa', ru: 'Диван' } }, scheduleType: 'annuity', termMonths: 12, walletId: walletInstallment },
]

export const loanDebitWalletId = walletDebitRub

/**
 * Money lent and borrowed between people, as transfers with the debit card: `out` leaves the card
 * (lending, or paying a borrowed debt back), `in` comes back to it. A debt wallet is positive while
 * someone owes you and negative while you owe.
 */
export const debtMoves: { amount: number, direction: 'in' | 'out', monthsAgo: number, walletId: WalletId }[] = [
  { amount: 40000, direction: 'out', monthsAgo: 18, walletId: walletDebt },
  { amount: 25000, direction: 'in', monthsAgo: 15, walletId: walletDebt },
  // 0: whatever is still owed, so the debt closes exactly after rounding into the locale's currency.
  { amount: 0, direction: 'in', monthsAgo: 12, walletId: walletDebt },
  { amount: 60000, direction: 'out', monthsAgo: 5, walletId: walletLent },
  { amount: 20000, direction: 'in', monthsAgo: 2, walletId: walletLent },
  { amount: 100000, direction: 'in', monthsAgo: 7, walletId: walletBorrowed },
  { amount: 30000, direction: 'out', monthsAgo: 3, walletId: walletBorrowed },
]

/**
 * Wallets topped up from the debit card once a month by a month's net outflow, so the credit card
 * stays within its limit and cash does not drift.
 */
export const monthlySettlements: { day: number, desc: LocaleString, monthsLater: number, walletId: WalletId }[] = [
  // Cash is withdrawn ahead for the month, the card is repaid after its statement.
  { day: 1, desc: { en: 'ATM withdrawal', ru: 'Снятие в банкомате' }, monthsLater: 0, walletId: walletCashRub },
  { day: 20, desc: { en: 'Credit card repayment', ru: 'Погашение кредитки' }, monthsLater: 1, walletId: walletCreditRub },
]

export const salaryConfig = {
  categoryId: catSalary,
  desc: { en: 'Salary', ru: 'Зарплата' } as LocaleString,
  /** After this many months from start, salary gets a raise */
  raiseAfterMonths: 12,
  raisedMax: 220000,
  raisedMin: 190000,
  startMax: 180000,
  startMin: 150000,
  walletId: walletDebitRub,
}

export const incomeRules: DemoIncomeRule[] = [
  { categoryId: catFreelance, max: 60000, min: 10000, weight: 3 },
  { categoryId: catInvestments, desc: { en: 'Dividends', ru: 'Дивиденды' }, max: 40000, min: 5000, walletIds: [walletUsd], weight: 2 },
  { categoryId: catCashback, max: 3000, min: 100, walletIds: [walletDebitRub, walletCreditRub], weight: 4 },
]

/**
 * Transfer scenarios between wallets.
 */
export type DemoTransferRule = {
  /** Charged to the paying wallet; the receiving side is converted at demo rates. */
  amountMax: number
  amountMin: number
  desc?: LocaleString
  expenseWalletId: string
  incomeWalletId: string
  weight: number
}

export const transferRules: DemoTransferRule[] = [
  { amountMax: 50000, amountMin: 10000, desc: { en: 'Monthly savings', ru: 'Ежемесячные накопления' }, expenseWalletId: walletDebitRub, incomeWalletId: walletSavings, weight: 3 },
  { amountMax: 90000, amountMin: 30000, desc: { en: 'Currency exchange', ru: 'Покупка валюты' }, expenseWalletId: walletDebitRub, incomeWalletId: walletUsd, weight: 3 },
  { amountMax: 50000, amountMin: 5000, desc: { en: 'Buy bitcoin', ru: 'Покупка биткоина' }, expenseWalletId: walletUsd, incomeWalletId: walletCrypto, weight: 2 },
  { amountMax: 30000, amountMin: 5000, desc: { en: 'Buy ether', ru: 'Покупка эфира' }, expenseWalletId: walletUsd, incomeWalletId: walletEth, weight: 1 },
  { amountMax: 40000, amountMin: 10000, desc: { en: 'Buy USDT', ru: 'Покупка USDT' }, expenseWalletId: walletUsd, incomeWalletId: walletUsdt, weight: 1 },
  { amountMax: 20000, amountMin: 3000, expenseWalletId: walletUsd, incomeWalletId: walletRandomCrypto, weight: 1 },
  { amountMax: 30000, amountMin: 5000, desc: { en: 'Currency exchange', ru: 'Обмен валюты' }, expenseWalletId: walletDebitRub, incomeWalletId: walletRandomFiat, weight: 1 },
  { amountMax: 90000, amountMin: 20000, desc: { en: 'Top up deposit', ru: 'Пополнение вклада' }, expenseWalletId: walletDebitRub, incomeWalletId: walletDepositEur, weight: 2 },
]

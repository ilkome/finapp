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
const catFood = 'demo_cat_food'
const catFoodGroceries = 'demo_cat_food_groceries'
const catFoodCafe = 'demo_cat_food_cafe'
const catFoodDelivery = 'demo_cat_food_delivery'

const catTransport = 'demo_cat_transport'
const catTransportFuel = 'demo_cat_transport_fuel'
const catTransportPublic = 'demo_cat_transport_public'
const catTransportParking = 'demo_cat_transport_parking'
const catTransportService = 'demo_cat_transport_service'

const catHome = 'demo_cat_home'
const catHomeRent = 'demo_cat_home_rent'
const catHomeElectricity = 'demo_cat_home_electricity'
const catHomeInternet = 'demo_cat_home_internet'
const catHomeWater = 'demo_cat_home_water'

const catHealth = 'demo_cat_health'
const catHealthPharmacy = 'demo_cat_health_pharmacy'
const catHealthDoctor = 'demo_cat_health_doctor'

const catEntertainment = 'demo_cat_entertainment'
const catEntertainmentSubscriptions = 'demo_cat_entertainment_subs'
const catEntertainmentMovies = 'demo_cat_entertainment_movies'
const catEntertainmentHobby = 'demo_cat_entertainment_hobby'

const catClothing = 'demo_cat_clothing'
const catSport = 'demo_cat_sport'
const catEducation = 'demo_cat_education'
const catTravel = 'demo_cat_travel'
const catPets = 'demo_cat_pets'
const catGifts = 'demo_cat_gifts'
const catFamily = 'demo_cat_family'

const catSalary = 'demo_cat_salary'
const catFreelance = 'demo_cat_freelance'
const catInvestments = 'demo_cat_investments'
const catCashback = 'demo_cat_cashback'

// --- Wallet IDs ---
export const walletCashRub = 'demo_w_cash_rub'
export const walletDebitRub = 'demo_w_debit_rub'
export const walletCreditRub = 'demo_w_credit_rub'
export const walletUsd = 'demo_w_usd'
export const walletDepositEur = 'demo_w_deposit_eur'
export const walletCrypto = 'demo_w_crypto'
export const walletDebt = 'demo_w_debt'
export const walletSavings = 'demo_w_savings'

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
      currency: 'USD',
      desc: { en: 'Crypto portfolio', ru: 'Крипто портфель' },
      name: { en: 'Crypto', ru: 'Крипто' },
      order: 6,
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
      desc: { en: 'Borrowed to a friend', ru: 'Одолжил другу' },
      isArchived: true,
      name: { en: 'Debt', ru: 'Долг' },
      order: 7,
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
    [walletSavings]: {
      color: '#8b5cf6',
      currency: 'USD',
      desc: { en: 'Emergency fund', ru: 'Фонд на непредвиденные расходы' },
      isExcludeInTotal: true,
      name: { en: 'Savings', ru: 'Накопления' },
      order: 8,
      type: 'deposit',
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

  // Home - monthly bills
  { categoryId: catHomeRent, max: 55000, min: 45000, weight: 2 },
  { categoryId: catHomeElectricity, max: 3000, min: 800, weight: 1 },
  { categoryId: catHomeInternet, max: 1200, min: 800, weight: 1 },
  { categoryId: catHomeWater, max: 1500, min: 400, weight: 1 },

  // Health
  { categoryId: catHealthPharmacy, max: 3000, min: 200, weight: 3 },
  { categoryId: catHealthDoctor, desc: { en: 'Checkup', ru: 'Осмотр' }, max: 8000, min: 2000, weight: 1 },

  // Entertainment
  { categoryId: catEntertainmentSubscriptions, max: 1500, min: 200, walletIds: [walletCreditRub], weight: 3 },
  { categoryId: catEntertainmentMovies, max: 2000, min: 400, walletIds: [walletDebitRub, walletCreditRub], weight: 2 },
  { categoryId: catEntertainmentHobby, max: 5000, min: 500, weight: 2 },

  // Standalone (with seasonality)
  { categoryId: catClothing, max: 15000, min: 1000, seasonMonths: [2, 3, 8, 9], walletIds: [walletDebitRub, walletCreditRub], weight: 2 },
  { categoryId: catSport, desc: { en: 'Gym', ru: 'Зал' }, max: 5000, min: 2000, weight: 2 },
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

export const salaryConfig = {
  categoryId: catSalary,
  desc: { en: 'Salary', ru: 'Зарплата' } as LocaleString,
  /** After this many months from start, salary gets a raise */
  raiseAfterMonths: 12,
  raisedMax: 200000,
  raisedMin: 170000,
  startMax: 160000,
  startMin: 130000,
  walletId: walletDebitRub,
}

export const incomeRules: DemoIncomeRule[] = [
  { categoryId: catFreelance, max: 60000, min: 10000, weight: 3 },
  { categoryId: catInvestments, desc: { en: 'Dividends', ru: 'Дивиденды' }, max: 30000, min: 5000, walletIds: [walletUsd, walletCrypto], weight: 2 },
  { categoryId: catCashback, max: 3000, min: 100, walletIds: [walletDebitRub, walletCreditRub], weight: 4 },
]

/**
 * Transfer scenarios between wallets.
 */
export type DemoTransferRule = {
  desc?: LocaleString
  expenseWalletId: string
  incomeAmountMax: number
  incomeAmountMin: number
  incomeWalletId: string
  weight: number
}

export const transferRules: DemoTransferRule[] = [
  // Card to cash
  { desc: { en: 'ATM withdrawal', ru: 'Снятие в банкомате' }, expenseWalletId: walletDebitRub, incomeAmountMax: 20000, incomeAmountMin: 3000, incomeWalletId: walletCashRub, weight: 4 },
  // Card to savings
  { desc: { en: 'Monthly savings', ru: 'Ежемесячные накопления' }, expenseWalletId: walletDebitRub, incomeAmountMax: 500, incomeAmountMin: 100, incomeWalletId: walletSavings, weight: 3 },
  // Card to crypto
  { desc: { en: 'Buy crypto', ru: 'Покупка крипто' }, expenseWalletId: walletUsd, incomeAmountMax: 500, incomeAmountMin: 50, incomeWalletId: walletCrypto, weight: 2 },
  // Card to deposit
  { desc: { en: 'Top up deposit', ru: 'Пополнение вклада' }, expenseWalletId: walletUsd, incomeAmountMax: 1000, incomeAmountMin: 200, incomeWalletId: walletDepositEur, weight: 2 },
  // Credit card repayment
  { desc: { en: 'Credit repayment', ru: 'Погашение кредитки' }, expenseWalletId: walletDebitRub, incomeAmountMax: 50000, incomeAmountMin: 10000, incomeWalletId: walletCreditRub, weight: 3 },
]

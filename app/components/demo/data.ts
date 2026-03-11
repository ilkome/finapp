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

export const data: {
  categories: Record<CategoryId, DemoCategoryItem>
  wallets: Record<WalletId, DemoWalletItem>
} = {
  categories: {
    '4b6473ee7324': {
      color: '#d84315',
      icon: 'mdi:pill',
      name: { en: 'Health', ru: 'Здоровье' },
      order: 8,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408887791,
    },
    '06ca25500ef2': {
      color: '#4fc3f7',
      icon: 'mdi:airplane',
      name: { en: 'Travel', ru: 'Путешествия' },
      order: 11,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408861256,
    },
    'd564ed02cf7f': {
      color: '#8bc34a',
      icon: 'mdi:human-male',
      name: { en: 'Freelance', ru: 'Фриланс' },
      order: 9,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408861256,
    },
    'KsNnR1EDBl9tAZTaWUP': {
      color: '#90a4ae',
      icon: 'mdi:car-sports',
      name: { en: 'Auto', ru: 'Авто' },
      order: 0,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408861252,
    },
    'KsNnRB3MqKvAqwo5IEf': {
      color: '#d4e157',
      icon: 'mdi:food',
      name: { en: 'Cafe', ru: 'Кафе' },
      order: 1,
      parentId: 'KxKMi55aCVkJXsiDE',
      showInLastUsed: true,
      showInQuickSelector: true,
      updatedAt: 1585073319837,
    },
    'KsNnREUqdH4nTGEjEhl': {
      color: '#ba68c8',
      icon: 'mdi:account-heart',
      name: { en: 'Family', ru: 'Семья' },
      order: 1,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408861253,
    },
    'KsNnRHjakWM4imFmCpI': {
      color: '#d4e157',
      icon: 'mdi:food-apple',
      name: { en: 'Groceries', ru: 'Продукты' },
      order: 2,
      parentId: 'KxKMi55aCVkJXsiDE',
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1584359067144,
    },
    'KsNnS6QgcjgSVeA3KaM': {
      color: '#90a4ae',
      icon: 'mdi:gas-station',
      name: { en: 'Gas', ru: 'Бензин' },
      parentId: 'KsNnR1EDBl9tAZTaWUP',
      showInLastUsed: true,
      showInQuickSelector: true,
      updatedAt: 1584359067348,
    },
    'KsNnSMR4DtZXFr75V2Y': {
      color: '#8d6e63',
      icon: 'mdi:fire',
      name: { en: 'Gas', ru: 'Газ' },
      parentId: 'KsNnTR_IP7TZ5UQ39MV',
      showInLastUsed: false,
      showInQuickSelector: false,
      updatedAt: 1585078567615,
    },
    'KsNnSzI9bi2L6YtJpFl': {
      color: '#90a4ae',
      icon: 'mdi:cogs',
      name: { en: 'Spare parts', ru: 'Запчасти' },
      parentId: 'KsNnR1EDBl9tAZTaWUP',
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585078593530,
    },
    'KsNnT85ujLHZFMRjqau': {
      color: '#8d6e63',
      icon: 'mdi:microsoft-internet-explorer',
      name: { en: 'Internet', ru: 'Интернет' },
      parentId: 'KsNnTR_IP7TZ5UQ39MV',
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585078530426,
    },
    'KsNnTR_IP7TZ5UQ39MV': {
      color: '#8d6e63',
      icon: 'mdi:home-currency-usd',
      name: { en: 'Home pay', ru: 'Домашние платежи' },
      order: 2,
      parentId: 0,
      showInLastUsed: false,
      showInQuickSelector: false,
      updatedAt: 1585408861254,
    },
    'KsNnUCHgx-3TJVpEOo5': {
      color: '#8d6e63',
      icon: 'mdi:toilet',
      name: { en: 'Water', ru: 'Вода' },
      parentId: 'KsNnTR_IP7TZ5UQ39MV',
      showInLastUsed: false,
      showInQuickSelector: false,
      updatedAt: 1585078546884,
    },
    'KsNnUVvhaCBzUOIce-c': {
      color: '#ff8a65',
      icon: 'mdi:account-tie',
      name: { en: 'Office', ru: 'Офис' },
      order: 10,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408861256,
    },
    'KsNnVKle-reg5skNcxE': {
      color: '#26a69a',
      icon: 'mdi:cellphone-android',
      name: { en: 'Phone', ru: 'Телефон' },
      order: 5,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408861254,
    },
    'KsNnVRQvYywN2OZFrEq': {
      color: '#1b5e20',
      icon: 'mdi:vuejs',
      name: { en: 'Vuejs', ru: 'Vuejs' },
      order: 6,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408861255,
    },
    'KsNnVUo-gQZCYr_Tqjx': {
      color: '#f48fb1',
      icon: 'mdi:badminton',
      name: { en: 'Sport', ru: 'Спорт' },
      order: 7,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408875803,
    },
    'KxKMi55aCVkJXsiDE': {
      color: '#d4e157',
      icon: 'mdi:cupcake',
      name: { en: 'Food', ru: 'Еда' },
      order: 4,
      parentId: 0,
      showInLastUsed: true,
      showInQuickSelector: false,
      updatedAt: 1585408895295,
    },
  },

  wallets: {
    '200921_FltN3F': {
      color: '#1565c0',
      currency: 'RUB',
      desc: { en: '', ru: '' },
      isWithdrawal: true,
      name: { en: 'Rubles Cash', ru: 'Наличные рубли' },
      order: 4,
      type: 'cash',
      updatedAt: 1585408895295,
    },
    '200921_WrAFwe': {
      color: '#ef5350',
      currency: 'USD',
      desc: { en: '', ru: '' },
      isWithdrawal: true,
      name: { en: 'USD', ru: 'Доллары' },
      order: 10,
      type: 'cash',
      updatedAt: 1585408895295,
    },
    '210614_uvi9w8': {
      color: '#ad1457',
      currency: 'USD',
      desc: { en: 'Money for study', ru: 'Деньги на учебу' },
      isWithdrawal: true,
      name: { en: 'Study', ru: 'Учеба' },
      order: 9,
      type: 'cash',
      updatedAt: 1585408895295,
    },
    '220315_p78836': {
      color: '#388e3c',
      currency: 'USD',
      desc: { en: 'Money for party', ru: 'Деньги на вечеринку' },
      isArchived: true,
      isWithdrawal: true,
      name: { en: 'Party', ru: 'Вечеринка' },
      order: 25,
      type: 'cashless',
      updatedAt: 1585408895295,
    },
    '231223_x83sls': {
      color: '#1565c0',
      currency: 'RUB',
      desc: { en: 'Money for auto', ru: 'Деньги на авто' },
      isWithdrawal: true,
      name: { en: 'Auto', ru: 'Авто' },
      order: 3,
      type: 'cash',
      updatedAt: 1585408895295,
    },
    '240324_3zjma5': {
      color: '#d32f2f',
      creditLimit: 160000,
      currency: 'RUB',
      desc: { en: 'Money for office', ru: 'Деньги на офис' },
      name: { en: 'Credit Card', ru: 'Кредитная карта' },
      order: 1,
      type: 'credit',
      updatedAt: 1585408895295,
    },
  },
}

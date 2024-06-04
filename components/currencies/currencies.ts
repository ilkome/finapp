import type { CurrencyCode } from '~/components/currencies/types'

export const currencies: {
  code: CurrencyCode
  name: string
  precision?: number
  symbol?: string
}[] = [{
  code: 'CNH',
  name: 'Chinese Yuan',
}, {
  code: 'AED',
  name: 'UAE Dirham',
}, {
  code: 'AFN',
  name: 'Afghani',
}, {
  code: 'ALL',
  name: 'Lek',
}, {
  code: 'AMD',
  name: 'Armenian Dram',
}, {
  code: 'ANG',
  name: 'Netherlands Antillean Guilder',
}, {
  code: 'AOA',
  name: 'Kwanza',
}, {
  code: 'ARS',
  name: 'Argentine Peso',
}, {
  code: 'AUD',
  name: 'Australian Dollar',
}, {
  code: 'AWG',
  name: 'Aruban Florin',
}, {
  code: 'AZN',
  name: 'Azerbaijan Manat',
}, {
  code: 'BAM',
  name: 'Convertible Mark',
}, {
  code: 'BBD',
  name: 'Barbados Dollar',
}, {
  code: 'BDT',
  name: 'Taka',
}, {
  code: 'BGN',
  name: 'Bulgarian Lev',
}, {
  code: 'BHD',
  name: 'Bahraini Dinar',
}, {
  code: 'BIF',
  name: 'Burundi Franc',
}, {
  code: 'BMD',
  name: 'Bermudian Dollar',
}, {
  code: 'BND',
  name: 'Brunei Dollar',
}, {
  code: 'BOB',
  name: 'Boliviano',
}, {
  code: 'BOV',
  name: 'Mvdol',
}, {
  code: 'BRL',
  name: 'Brazilian Real',
}, {
  code: 'BSD',
  name: 'Bahamian Dollar',
}, {
  code: 'BTC',
  name: 'Bitcoin',
}, {
  code: 'BTN',
  name: 'Ngultrum',
}, {
  code: 'BWP',
  name: 'Pula',
}, {
  code: 'BYN',
  name: 'Belarusian Ruble',
}, {
  code: 'BZD',
  name: 'Belize Dollar',
}, {
  code: 'CAD',
  name: 'Canadian Dollar',
}, {
  code: 'CDF',
  name: 'Congolese Franc',
}, {
  code: 'CHE',
  name: 'WIR Euro',
}, {
  code: 'CHF',
  name: 'Swiss Franc',
}, {
  code: 'CHW',
  name: 'WIR Franc',
}, {
  code: 'CLF',
  name: 'Unidad de Fomento',
}, {
  code: 'CLP',
  name: 'Chilean Peso',
}, {
  code: 'CNY',
  name: 'Yuan Renminbi',
}, {
  code: 'COP',
  name: 'Colombian Peso',
}, {
  code: 'COU',
  name: 'Unidad de Valor Real',
}, {
  code: 'CRC',
  name: 'Costa Rican Colon',
}, {
  code: 'CUC',
  name: 'Peso Convertible',
}, {
  code: 'CUP',
  name: 'Cuban Peso',
}, {
  code: 'CVE',
  name: 'Cabo Verde Escudo',
}, {
  code: 'CZK',
  name: 'Czech Koruna',
}, {
  code: 'DJF',
  name: 'Djibouti Franc',
}, {
  code: 'DKK',
  name: 'Danish Krone',
}, {
  code: 'DOP',
  name: 'Dominican Peso',
}, {
  code: 'DZD',
  name: 'Algerian Dinar',
}, {
  code: 'EGP',
  name: 'Egyptian Pound',
}, {
  code: 'ERN',
  name: 'Nakfa',
}, {
  code: 'ETB',
  name: 'Ethiopian Birr',
}, {
  code: 'EUR',
  name: 'Euro',
  symbol: '€',
}, {
  code: 'FJD',
  name: 'Fiji Dollar',
}, {
  code: 'FKP',
  name: 'Falkland Islands Pound',
}, {
  code: 'GBP',
  name: 'Pound Sterling',
}, {
  code: 'GEL',
  name: 'Lari',
}, {
  code: 'GHS',
  name: 'Ghana Cedi',
}, {
  code: 'GIP',
  name: 'Gibraltar Pound',
}, {
  code: 'GMD',
  name: 'Dalasi',
}, {
  code: 'GNF',
  name: 'Guinean Franc',
}, {
  code: 'GTQ',
  name: 'Quetzal',
}, {
  code: 'GYD',
  name: 'Guyana Dollar',
}, {
  code: 'HKD',
  name: 'Hong Kong Dollar',
}, {
  code: 'HNL',
  name: 'Lempira',
}, {
  code: 'HRK',
  name: 'Kuna',
}, {
  code: 'HTG',
  name: 'Gourde',
}, {
  code: 'HUF',
  name: 'Forint',
}, {
  code: 'IDR',
  name: 'Rupiah',
  precision: 0,
  symbol: 'Rp',
}, {
  code: 'ILS',
  name: 'New Israeli Sheqel',
  precision: 2,
  symbol: '₪',
}, {
  code: 'INR',
  name: 'Indian Rupee',
}, {
  code: 'IQD',
  name: 'Iraqi Dinar',
}, {
  code: 'IRR',
  name: 'Iranian Rial',
}, {
  code: 'ISK',
  name: 'Iceland Krona',
}, {
  code: 'JMD',
  name: 'Jamaican Dollar',
}, {
  code: 'JOD',
  name: 'Jordanian Dinar',
}, {
  code: 'JPY',
  name: 'Yen',
}, {
  code: 'KES',
  name: 'Kenyan Shilling',
}, {
  code: 'KGS',
  name: 'Som',
}, {
  code: 'KHR',
  name: 'Riel',
}, {
  code: 'KMF',
  name: 'Comorian Franc ',
}, {
  code: 'KPW',
  name: 'North Korean Won',
}, {
  code: 'KRW',
  name: 'Won',
}, {
  code: 'KWD',
  name: 'Kuwaiti Dinar',
}, {
  code: 'KYD',
  name: 'Cayman Islands Dollar',
}, {
  code: 'KZT',
  name: 'Tenge',
}, {
  code: 'LAK',
  name: 'Lao Kip',
}, {
  code: 'LBP',
  name: 'Lebanese Pound',
}, {
  code: 'LKR',
  name: 'Sri Lanka Rupee',
}, {
  code: 'LRD',
  name: 'Liberian Dollar',
}, {
  code: 'LSL',
  name: 'Loti',
}, {
  code: 'LYD',
  name: 'Libyan Dinar',
}, {
  code: 'MAD',
  name: 'Moroccan Dirham',
}, {
  code: 'MDL',
  name: 'Moldovan Leu',
}, {
  code: 'MGA',
  name: 'Malagasy Ariary',
}, {
  code: 'MKD',
  name: 'Denar',
}, {
  code: 'MMK',
  name: 'Kyat',
}, {
  code: 'MNT',
  name: 'Tugrik',
}, {
  code: 'MOP',
  name: 'Pataca',
}, {
  code: 'MRU',
  name: 'Ouguiya',
}, {
  code: 'MUR',
  name: 'Mauritius Rupee',
}, {
  code: 'MVR',
  name: 'Rufiyaa',
}, {
  code: 'MWK',
  name: 'Malawi Kwacha',
}, {
  code: 'MXN',
  name: 'Mexican Peso',
}, {
  code: 'MXV',
  name: 'Mexican Unidad de Inversion (UDI)',
}, {
  code: 'MYR',
  name: 'Malaysian Ringgit',
}, {
  code: 'MZN',
  name: 'Mozambique Metical',
}, {
  code: 'NAD',
  name: 'Namibia Dollar',
}, {
  code: 'NGN',
  name: 'Naira',
}, {
  code: 'NIO',
  name: 'Cordoba Oro',
}, {
  code: 'NOK',
  name: 'Norwegian Krone',
}, {
  code: 'NPR',
  name: 'Nepalese Rupee',
}, {
  code: 'NZD',
  name: 'New Zealand Dollar',
}, {
  code: 'OMR',
  name: 'Rial Omani',
}, {
  code: 'PAB',
  name: 'Balboa',
}, {
  code: 'PEN',
  name: 'Sol',
}, {
  code: 'PGK',
  name: 'Kina',
}, {
  code: 'PHP',
  name: 'Philippine Peso',
}, {
  code: 'PKR',
  name: 'Pakistan Rupee',
}, {
  code: 'PLN',
  name: 'Zloty',
}, {
  code: 'PYG',
  name: 'Guarani',
}, {
  code: 'QAR',
  name: 'Qatari Rial',
}, {
  code: 'RON',
  name: 'Romanian Leu',
}, {
  code: 'RSD',
  name: 'Serbian Dinar',
}, {
  code: 'RUB',
  name: 'Russian Ruble',
  precision: 0,
  symbol: '₽',
}, {
  code: 'RWF',
  name: 'Rwanda Franc',
}, {
  code: 'SAR',
  name: 'Saudi Riyal',
}, {
  code: 'SBD',
  name: 'Solomon Islands Dollar',
}, {
  code: 'SCR',
  name: 'Seychelles Rupee',
}, {
  code: 'SDG',
  name: 'Sudanese Pound',
}, {
  code: 'SEK',
  name: 'Swedish Krona',
}, {
  code: 'SGD',
  name: 'Singapore Dollar',
}, {
  code: 'SHP',
  name: 'Saint Helena Pound',
}, {
  code: 'SLL',
  name: 'Leone',
}, {
  code: 'SOS',
  name: 'Somali Shilling',
}, {
  code: 'SRD',
  name: 'Surinam Dollar',
}, {
  code: 'SSP',
  name: 'South Sudanese Pound',
}, {
  code: 'STN',
  name: 'Dobra',
}, {
  code: 'SVC',
  name: 'El Salvador Colon',
}, {
  code: 'SYP',
  name: 'Syrian Pound',
}, {
  code: 'SZL',
  name: 'Lilangeni',
}, {
  code: 'THB',
  name: 'Baht',
  precision: 0,
  symbol: '฿',
}, {
  code: 'TJS',
  name: 'Somoni',
}, {
  code: 'TMT',
  name: 'Turkmenistan New Manat',
}, {
  code: 'TND',
  name: 'Tunisian Dinar',
}, {
  code: 'TOP',
  name: 'Pa’anga',
}, {
  code: 'TRY',
  name: 'Turkish Lira',
  precision: 2,
  symbol: '₺',
}, {
  code: 'TTD',
  name: 'Trinidad and Tobago Dollar',
}, {
  code: 'TWD',
  name: 'New Taiwan Dollar',
}, {
  code: 'TZS',
  name: 'Tanzanian Shilling',
}, {
  code: 'UAH',
  name: 'Hryvnia',
}, {
  code: 'UGX',
  name: 'Uganda Shilling',
}, {
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
}, {
  code: 'USN',
  name: 'US Dollar (Next day)',
}, {
  code: 'UYI',
  name: 'Uruguay Peso en Unidades Indexadas (UI)',
}, {
  code: 'UYU',
  name: 'Peso Uruguayo',
}, {
  code: 'UYW',
  name: 'Unidad Previsional',
}, {
  code: 'UZS',
  name: 'Uzbekistan Sum',
}, {
  code: 'VES',
  name: 'Bolívar Soberano',
}, {
  code: 'VND',
  name: 'Dong',
}, {
  code: 'VUV',
  name: 'Vatu',
}, {
  code: 'WST',
  name: 'Tala',
}, {
  code: 'XAF',
  name: 'CFA Franc BEAC',
}, {
  code: 'XAG',
  name: 'Silver',
}, {
  code: 'XAU',
  name: 'Gold',
}, {
  code: 'XBA',
  name: 'Bond Markets Unit European Composite Unit (EURCO)',
}, {
  code: 'XBB',
  name: 'Bond Markets Unit European Monetary Unit (E.M.U.-6)',
}, {
  code: 'XBC',
  name: 'Bond Markets Unit European Unit of Account 9 (E.U.A.-9)',
}, {
  code: 'XBD',
  name: 'Bond Markets Unit European Unit of Account 17 (E.U.A.-17)',
}, {
  code: 'XCD',
  name: 'East Caribbean Dollar',
}, {
  code: 'XDR',
  name: 'SDR (Special Drawing Right)',
}, {
  code: 'XOF',
  name: 'CFA Franc BCEAO',
}, {
  code: 'XPD',
  name: 'Palladium',
}, {
  code: 'XPF',
  name: 'CFP Franc',
}, {
  code: 'XPT',
  name: 'Platinum',
}, {
  code: 'XSU',
  name: 'Sucre',
}, {
  code: 'XTS',
  name: 'Codes specifically reserved for testing purposes',
}, {
  code: 'XUA',
  name: 'ADB Unit of Account',
}, {
  code: 'XXX',
  name: 'The codes assigned for transactions where no currency is involved',
}, {
  code: 'YER',
  name: 'Yemeni Rial',
}, {
  code: 'ZAR',
  name: 'Rand',
}, {
  code: 'ZMW',
  name: 'Zambian Kwacha',
}, {
  code: 'ZWL',
  name: 'Zimbabwe Dollar',
}]

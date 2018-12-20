import axios from 'axios'

export const getCurrencies = async (baseCurrency) => {
  console.log('api: getCurrencies', baseCurrency)
  if (!baseCurrency) {
    console.error('No base currency')
    return
  }
  const currencies = await axios.get(`https://api.openrates.io/latest?base=${baseCurrency}`)
  // const d = new Date()
  // const today = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('-')
  // const priorUSD2BYN = await axios(`https://www.priorbank.by/currency_exchange?p_p_id=exchangeliferayspringmvcportlet_WAR_exchangeliferayspringmvcportlet_INSTANCE_GACJA0EoQLJN&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=ajaxGetReportForRange&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=3&p_p_col_count=6&fromDate=${today}&toDate=${today}&channelIDs=9&currencies=${baseCurrency}`,
  //   {
  //     method: 'GET',
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       'Content-Type': 'application/json'
  //     },
  //     withCredentials: true
  //   })
  // console.log(priorUSD2BYN.data)
  currencies.data.rates.BYN = 2.0
  return currencies
}

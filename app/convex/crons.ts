import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()

crons.daily(
  'fetch exchange rates',
  { hourUTC: 6, minuteUTC: 0 },
  internal.rates.fetchAndSaveRates,
)

crons.daily(
  'purge old tombstones',
  { hourUTC: 4, minuteUTC: 0 },
  internal.tombstones.purgeOld,
)

export default crons

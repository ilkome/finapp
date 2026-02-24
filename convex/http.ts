import { httpRouter } from 'convex/server'

import { authComponent, createAuth } from './auth'
import { frontendOrigins } from './origins'

const http = httpRouter()

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [
      ...frontendOrigins,
      // Convex deployment origins (needed for CORS on auth HTTP actions)
      'https://frugal-hornet-995.eu-west-1.convex.site',
      'https://frugal-hornet-995.eu-west-1.convex.cloud',
      'https://proficient-elk-135.eu-west-1.convex.site',
      'https://proficient-elk-135.eu-west-1.convex.cloud',
    ],
  },
})

export default http

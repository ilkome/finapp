import { httpRouter } from 'convex/server'

import { authComponent, createAuth } from './auth'

const http = httpRouter()

authComponent.registerRoutes(http, createAuth, {
  cors: {
    allowedOrigins: [
      'https://finapp.ilko.me',
      'https://finapp-git-convex-ilkome2.vercel.app',
      'https://main-git-convex-ilkome2.vercel.app',
      'https://tacit-kingfisher-781.convex.site',
      'https://tacit-kingfisher-781.convex.cloud',
      'https://frugal-hornet-995.eu-west-1.convex.site',
      'https://frugal-hornet-995.eu-west-1.convex.cloud',
      'https://proficient-elk-135.eu-west-1.convex.site',
      'https://proficient-elk-135.eu-west-1.convex.cloud',
      'http://localhost:3050',
    ],
  },
})

export default http

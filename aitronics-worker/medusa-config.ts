import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL
const redisModules = redisUrl
  ? {
      eventBus: {
        resolve: '@medusajs/event-bus-redis',
        options: {
          redisUrl,
        },
      },
      cacheService: {
        resolve: '@medusajs/cache-redis',
        options: {
          redisUrl,
        },
      },
    }
  : undefined

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: redisUrl,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    }
  },
  modules: redisModules,
})

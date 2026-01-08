import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL
const redisModules = redisUrl
  ? [
      {
        resolve: '@medusajs/cache-redis',
        options: {
          redisUrl,
        },
      },
      {
        resolve: '@medusajs/event-bus-redis',
        options: {
          redisUrl,
        },
      },
      {
        resolve: '@medusajs/workflow-engine-redis',
        options: {
          redis: {
            url: redisUrl,
          },
        },
      },
    ]
  : undefined

const workerMode = process.env.MEDUSA_WORKER_MODE as 'shared' | 'worker' | 'server' | undefined
const disableAdmin = process.env.DISABLE_MEDUSA_ADMIN === 'true'

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    workerMode,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  admin: {
    disable: disableAdmin,
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: redisModules,
})

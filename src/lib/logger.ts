/* eslint-disable no-console */

export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.debug(...args)
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.info(...args)
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.warn(...args)
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') console.error(...args)
  }
}

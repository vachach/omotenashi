export const log = {
  info: (msg: string, meta?: unknown) => {
    const base = `[INFO ${new Date().toISOString()}] ${msg}`
    if (meta) console.log(base, meta)
    else console.log(base)
  },
  warn: (msg: string, meta?: unknown) => {
    const base = `[WARN ${new Date().toISOString()}] ${msg}`
    if (meta) console.warn(base, meta)
    else console.warn(base)
  },
  error: (msg: string, meta?: unknown) => {
    const base = `[ERROR ${new Date().toISOString()}] ${msg}`
    if (meta) console.error(base, meta)
    else console.error(base)
  }
}

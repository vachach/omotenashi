export const normalizePhone = (value: string) => value.replace(/\s+/g, '')

export const isValidPhone = (value: string) => /\+?\d{7,15}/.test(normalizePhone(value))

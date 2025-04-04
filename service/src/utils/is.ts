import type { UserRole } from '../storage/model'
import { TextAudioType } from '../storage/model'
import type { TextAuditServiceProvider } from './textAudit'

export function isNumber<T extends number>(value: T | unknown): value is number {
  return Object.prototype.toString.call(value) === '[object Number]'
}

export function isString<T extends string>(value: T | unknown): value is string {
  return Object.prototype.toString.call(value) === '[object String]'
}

export function isNotEmptyString(value: any): boolean {
  return typeof value === 'string' && value.length > 0
}

export function isBoolean<T extends boolean>(value: T | unknown): value is boolean {
  return Object.prototype.toString.call(value) === '[object Boolean]'
}

export function isFunction<T extends (...args: any[]) => any | void | never>(value: T | unknown): value is T {
  return Object.prototype.toString.call(value) === '[object Function]'
}

export function isValidEmail(value: any): boolean {
  const localPart = value.substring(0, value.lastIndexOf('@'))
  const domainPart = value.substring(value.lastIndexOf('@') + 1)
  const localPartRegex = /^([a-zA-Z0-9]+([-]{1}[a-zA-Z0-9]+)?|[a-zA-Z0-9]+([.]{1}[a-zA-Z0-9]+){0,2}|[a-zA-Z0-9]+[_]{1}[a-zA-Z0-9]+)?$/
  const domainPartRegex = /^([a-zA-Z0-9-]+\.){1,3}[a-zA-Z]{2,3}$/ // 3 levels of domain name and 2-3 characters for the top-level domain
  return isNotEmptyString(value) && localPartRegex.test(localPart) && domainPartRegex.test(domainPart)
}

export function isEmail(value: any): boolean {
  return isNotEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isTextAuditServiceProvider(value: any): value is TextAuditServiceProvider {
  return value === 'baidu' // || value === 'ali'
}

export function isTextAudioType(value: any): value is TextAudioType {
  return (
    value === TextAudioType.None
    || value === TextAudioType.Request
    || value === TextAudioType.Response
    || value === TextAudioType.All
  )
}

export function hasAnyRole(userRoles: UserRole[] | undefined, roles: UserRole[]): boolean {
  if (!userRoles || userRoles.length === 0 || !roles || roles.length === 0)
    return false

  const roleNames = roles.map(role => role.toString())
  return roleNames.some(roleName => userRoles.some(userRole => userRole.toString() === roleName))
}

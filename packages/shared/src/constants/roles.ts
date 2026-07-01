export const PRODUCT_VARIANTS = {
  EDPRO: 'edpro',
  CORPORATE: 'corporate'
} as const;

export type ProductVariant = typeof PRODUCT_VARIANTS[keyof typeof PRODUCT_VARIANTS];

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  COMPANY_ADMIN: 'company_admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

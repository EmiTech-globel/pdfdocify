import 'server-only'
// Admins are Clerk user IDs listed in ADMIN_USER_IDS (comma separated). Find yours in Clerk dashboard > Users.
export const isAdmin = (userId?: string | null) =>
  !!userId && (process.env.ADMIN_USER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean).includes(userId)

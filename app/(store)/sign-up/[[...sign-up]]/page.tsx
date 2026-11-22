import {SignUp} from '@clerk/nextjs'
import AuthShell from '@/components/AuthShell'
import {authElements} from '@/lib/clerk-theme'

export const metadata = {title: 'Create account'}
export default function Page() {
  return <AuthShell><SignUp appearance={{elements: authElements}} /></AuthShell>
}

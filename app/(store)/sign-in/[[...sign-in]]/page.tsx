import {SignIn} from '@clerk/nextjs'
import AuthShell from '@/components/AuthShell'
import {authElements} from '@/lib/clerk-theme'

export const metadata = {title: 'Log in'}
export default function Page() {
  return <AuthShell><SignIn appearance={{elements: authElements}} /></AuthShell>
}

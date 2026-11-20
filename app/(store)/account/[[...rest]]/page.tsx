import {UserProfile} from '@clerk/nextjs'
export const metadata = {title: 'Account'}
export default function Account() {
  return <div className="center"><UserProfile path="/account" /></div>
}

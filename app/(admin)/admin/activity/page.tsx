import {activity} from '@/lib/admin-data'
import {PageHead, Table, td, th, when} from '@/components/admin/ui'

export const metadata = {title: 'Activity log'}

export default async function Activity() {
  const rows = await activity()
  return (
    <>
      <PageHead title="Activity log" sub="Every admin action that changes data: access, refunds, review decisions and exports. Newest first, last 100." />
      <Table>
        <thead><tr className="border-b border-line"><th className={th}>When</th><th className={th}>Action</th><th className={th}>Target</th><th className={th}>Details</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0 align-top">
              <td className={`${td} whitespace-nowrap`}>{when(r.created_at)}</td>
              <td className={`${td} font-semibold`}>{String(r.action).replace(/_/g, ' ')}</td>
              <td className={`${td} max-w-[240px] break-all font-mono text-xs`}>{r.target}</td>
              <td className={`${td} max-w-[320px] break-all font-mono text-xs text-mute`}>{r.detail ? JSON.stringify(r.detail) : ''}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td className={`${td} text-mute`} colSpan={4}>Nothing yet.</td></tr>}
        </tbody>
      </Table>
    </>
  )
}

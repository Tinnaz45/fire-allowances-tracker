import { useState } from 'react'
import { useClaims } from '../hooks/useClaims'
import { useAuth } from '../hooks/useAuth'
import { ClaimRow, ClaimDetailSheet, EmptyState, LoadingScreen, fmtAUD } from '../components/UI'

export default function Dashboard() {
  const { profile } = useAuth()
  const { allClaims, stats, loading, markPaid, deleteClaim } = useClaims()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const firstName = profile?.first_name || 'there'
  const initials = ((profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '')).toUpperCase() || '?'

  const filtered = filter === 'all'
    ? allClaims.slice(0, 30)
    : allClaims.filter(c => c.status?.toLowerCase() === filter).slice(0, 30)

  if (loading) return <LoadingScreen />

  return (
    <div className="page">
      {/* greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div className="avatar">{initials}</div>
        <div>
          <h2 style={{ fontSize: '1.125rem' }}>Hey, {firstName}</h2>
          <p style={{ fontSize: '0.8125rem' }}>
            {profile?.station_id
              ? `Station ${profile.station_id} · Platoon ${profile.platoon || '—'}`
              : 'Set up your profile to get started'
            }
          </p>
        </div>
      </div>

      {/* stats */}
      <div className="grid-2" style={{ gap: 10 }}>
        <div className="stat">
          <div className="stat-label">Pending</div>
          <div className="stat-value warning">{stats.pending}</div>
          <div className="stat-sub">claims awaiting payslip</div>
        </div>
        <div className="stat">
          <div className="stat-label">Est. owed</div>
          <div className="stat-value accent">{fmtAUD(stats.pendingAmount)}</div>
          <div className="stat-sub">unpaid total</div>
        </div>
        <div className="stat">
          <div className="stat-label">Paid this year</div>
          <div className="stat-value success">{stats.paid}</div>
          <div className="stat-sub">confirmed on payslip</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total claims</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">across all types</div>
        </div>
      </div>

      {/* filter tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'paid', label: 'Paid' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`btn btn-sm ${filter === key ? 'btn-primary' : ''}`}
            style={{ flexShrink: 0 }}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* claims list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '12px 16px' }}>
          <h3>Recent claims</h3>
        </div>
        {filtered.length > 0
          ? filtered.map(c => (
              <ClaimRow
                key={`${c.type}-${c.id}`}
                claim={c}
                type={c.type}
                onClick={() => setSelected(c)}
              />
            ))
          : <EmptyState
              icon="📋"
              message={filter === 'all' ? 'No claims yet. Tap + to add your first.' : `No ${filter} claims.`}
            />
        }
      </div>

      {/* detail sheet */}
      {selected && (
        <ClaimDetailSheet
          claim={selected}
          type={selected.type}
          table={selected.table}
          onClose={() => setSelected(null)}
          onMarkPaid={markPaid}
          onDelete={deleteClaim}
        />
      )}
    </div>
  )
}

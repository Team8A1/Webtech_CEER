import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from '../utils/api'

const TEAM_COLORS = [
  { bg: 'bg-rose-50',   border: 'border-rose-200',   accent: '#8B1538', pill: 'bg-rose-100 text-rose-800',   hover: 'hover:border-rose-400' },
  { bg: 'bg-blue-50',   border: 'border-blue-200',   accent: '#1d4ed8', pill: 'bg-blue-100 text-blue-800',   hover: 'hover:border-blue-400' },
  { bg: 'bg-emerald-50',border: 'border-emerald-200',accent: '#15803d', pill: 'bg-emerald-100 text-emerald-800',hover:'hover:border-emerald-400'},
  { bg: 'bg-amber-50',  border: 'border-amber-200',  accent: '#b45309', pill: 'bg-amber-100 text-amber-800',  hover: 'hover:border-amber-400'  },
]

function FacultyApprove() {
  const navigate = useNavigate()
  const [boms, setBoms] = useState([])
  const [loading, setLoading] = useState(true)
  const previousPendingRef = useRef(0)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const load = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${BASE_URL}/api/faculty/bom/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) setBoms(res.data.data)
    } catch (e) {
      console.error('Error loading BOMs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Poll every 30 s for new requests
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${BASE_URL}/api/faculty/bom/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          const fetched = res.data.data
          const cur = fetched.filter(b => !b.guideApproved && b.status !== 'rejected').length
          if (cur > previousPendingRef.current && cur > 0) {
            showToast(`🔔 ${cur - previousPendingRef.current} new BOM request(s) pending.`, 'info')
          }
          previousPendingRef.current = cur
          setBoms(fetched)
        }
      } catch (e) { console.error('Poll error', e) }
    }, 30000)
    return () => clearInterval(id)
  }, [])

  // Build unique team list from boms
  const teams = useMemo(() => {
    const map = new Map()
    boms.forEach(b => {
      if (b.teamId?._id && !map.has(b.teamId._id)) {
        map.set(b.teamId._id, b.teamId.problemStatement || 'Unnamed Team')
      }
    })
    return Array.from(map, ([id, label], idx) => ({ id, label, colorIdx: idx % TEAM_COLORS.length }))
  }, [boms])

  // Per-team counts
  const teamStats = useMemo(() => {
    const stats = {}
    boms.forEach(b => {
      const tid = b.teamId?._id
      if (!tid) return
      if (!stats[tid]) stats[tid] = { total: 0, pending: 0, approved: 0, rejected: 0 }
      stats[tid].total++
      if (!b.guideApproved && b.status !== 'rejected') stats[tid].pending++
      else if (b.guideApproved) stats[tid].approved++
      else if (b.status === 'rejected') stats[tid].rejected++
    })
    return stats
  }, [boms])

  const totalPending = boms.filter(b => !b.guideApproved && b.status !== 'rejected').length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl text-white text-sm font-semibold
          ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-stone-900'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/faculty')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            🏠 Home
          </button>
          {totalPending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-red-700">{totalPending} pending across all teams</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">BOM Management</p>
          <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight mb-4"
            style={{ color: 'rgb(139, 21, 56)' }}>
            Guide Approval Queue
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Select a team to review their Bill of Materials requests.
          </p>
        </div>

        {/* Team Cards */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4" />
            <p className="text-gray-500">Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No BOM requests yet</h3>
            <p className="text-gray-500">Once your students submit BOM requests, they will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {teams.map((team) => {
              const c = TEAM_COLORS[team.colorIdx]
              const s = teamStats[team.id] || { total: 0, pending: 0, approved: 0, rejected: 0 }
              const hasPending = s.pending > 0

              return (
                <button
                  key={team.id}
                  onClick={() => navigate(`/faculty/approve/${team.id}`)}
                  className={`w-full text-left bg-white border-2 ${c.border} ${c.hover} rounded-2xl p-6 transition-all duration-200 hover:shadow-lg group relative overflow-hidden`}
                >
                  {/* Colour accent strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: c.accent }} />

                  <div className="pl-4 flex items-center justify-between gap-6">
                    {/* Left: team info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                          {team.label}
                        </h2>
                        {hasPending && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {s.pending} New Request{s.pending > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Mini stats row */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{s.total} total</span>
                        <span className="text-gray-300">•</span>
                        <span className={s.pending > 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
                          {s.pending} pending
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-green-600">{s.approved} approved</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">{s.rejected} rejected</span>
                      </div>
                    </div>

                    {/* Right: arrow + pending badge */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {hasPending && (
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md animate-pulse">
                          <span className="text-white text-sm font-bold">{s.pending}</span>
                        </div>
                      )}
                      {!hasPending && (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-lg">✓</span>
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <svg className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FacultyApprove

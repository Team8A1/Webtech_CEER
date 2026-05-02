import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import BOMForm from '../components/BOMForm'
import { BASE_URL } from '../utils/api'

const TEAM_COLORS = [
  { accent: '#8B1538', badge: 'bg-rose-100 text-rose-800' },
  { accent: '#1d4ed8', badge: 'bg-blue-100 text-blue-800' },
  { accent: '#15803d', badge: 'bg-emerald-100 text-emerald-800' },
  { accent: '#b45309', badge: 'bg-amber-100 text-amber-800' },
]

function FacultyTeamBOMQueue() {
  const { teamId } = useParams()
  const navigate = useNavigate()

  const [boms, setBoms] = useState([])
  const [teamLabel, setTeamLabel] = useState('')
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [editingBOM, setEditingBOM] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [toast, setToast] = useState(null)
  const previousPendingRef = useRef(0)

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
      if (res.data.success) {
        const all = res.data.data
        const forTeam = all.filter(b => b.teamId?._id === teamId)
        setBoms(forTeam)
        if (forTeam.length > 0 && forTeam[0].teamId?.problemStatement) {
          setTeamLabel(forTeam[0].teamId.problemStatement)
        }
      }
    } catch (e) {
      console.error('Error loading BOMs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [teamId])

  // Poll every 30 s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${BASE_URL}/api/faculty/bom/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          const forTeam = res.data.data.filter(b => b.teamId?._id === teamId)
          const cur = forTeam.filter(b => !b.guideApproved && b.status !== 'rejected').length
          if (cur > previousPendingRef.current && cur > 0) {
            showToast(`🔔 ${cur - previousPendingRef.current} new BOM request(s) for this team.`, 'info')
          }
          previousPendingRef.current = cur
          setBoms(forTeam)
        }
      } catch (e) { console.error('Poll error', e) }
    }, 30000)
    return () => clearInterval(id)
  }, [teamId])

  const pendingCount  = boms.filter(b => !b.guideApproved && b.status !== 'rejected').length
  const approvedCount = boms.filter(b => b.guideApproved).length
  const rejectedCount = boms.filter(b => b.status === 'rejected').length

  const filteredBoms = useMemo(() => {
    if (filter === 'pending')  return boms.filter(b => !b.guideApproved && b.status !== 'rejected')
    if (filter === 'approved') return boms.filter(b => b.guideApproved && b.status !== 'rejected')
    if (filter === 'rejected') return boms.filter(b => b.status === 'rejected')
    // 'all' = approved + rejected only (no pending)
    return boms.filter(b => b.guideApproved || b.status === 'rejected')
  }, [boms, filter])

  const approve = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${BASE_URL}/api/faculty/bom/update`, { id, status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      load()
      showToast('✅ BOM Request Approved', 'success')
    } catch {
      showToast('❌ Error approving request', 'error')
    }
  }

  const handleRejectClick = (id) => { setRejectingId(id); setRejectionReason('') }

  const confirmReject = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${BASE_URL}/api/faculty/bom/update`, {
        id: rejectingId, status: 'rejected', reason: rejectionReason
      }, { headers: { Authorization: `Bearer ${token}` } })
      load()
      showToast('BOM Request Rejected', 'error')
      setRejectingId(null)
      setRejectionReason('')
    } catch {
      showToast('❌ Error rejecting request', 'error')
    }
  }

  const handleUpdate = async (bomData) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${BASE_URL}/api/faculty/bom/update`, {
        id: editingBOM._id || editingBOM.id, ...bomData
      }, { headers: { Authorization: `Bearer ${token}` } })
      load()
      setEditingBOM(null)
      showToast('✅ BOM Request Updated', 'success')
    } catch {
      showToast('❌ Error updating request', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl text-white text-sm font-semibold
          ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-stone-900'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Nav Bar */}
        <div className="flex items-center gap-3 mb-12">
          <button
            onClick={() => navigate('/faculty/approve')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate('/faculty')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            🏠 Home
          </button>

          {pendingCount > 0 && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-red-700">{pendingCount} pending</span>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">BOM Approval Queue</p>
          <h1
            className="text-2xl md:text-4xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight mb-8"
            style={{ color: 'rgb(139, 21, 56)' }}
          >
            {loading ? 'Loading...' : teamLabel || 'Team BOM Queue'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl font-light">
            Review, edit, approve or reject Bill of Materials submitted by this team.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total BOMs',     val: boms.length,  cls: 'text-gray-900' },
            { label: 'Pending Review', val: pendingCount,  cls: 'text-[rgb(139,21,56)]' },
            { label: 'Approved',       val: approvedCount, cls: 'text-green-600' },
            { label: 'Rejected',       val: rejectedCount, cls: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className={`text-2xl font-serif font-bold ${s.cls} mb-1`}>{s.val}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { key: 'pending',  label: `Pending (${pendingCount})`,  active: 'bg-blue-600 text-white shadow-lg'    },
            { key: 'approved', label: `Approved (${approvedCount})`, active: 'bg-green-600 text-white shadow-lg'  },
            { key: 'rejected', label: `Rejected (${rejectedCount})`, active: 'bg-red-600 text-white shadow-lg'    },
            { key: 'all',      label: `All (${boms.filter(b => b.guideApproved || b.status === 'rejected').length})`, active: 'bg-indigo-600 text-white shadow-lg' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-7 py-3 rounded-lg text-base font-semibold transition-all
                ${filter === tab.key ? tab.active : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BOM Cards */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : filteredBoms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {filter === 'pending' ? 'All clear — no pending requests!' : `No ${filter} BOMs`}
            </h3>
            <p className="text-gray-500">
              {filter === 'pending' ? 'This team has no pending BOM requests.' : `No ${filter} BOMs to show.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBoms.map((bom) => {
              const isPending = !bom.guideApproved && bom.status !== 'rejected'
              const barColor = bom.guideApproved ? '#16a34a' : bom.status === 'rejected' ? '#dc2626' : '#8B1538'

              return (
                <div
                  key={bom._id || bom.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Left colour bar */}
                    <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: barColor }} />

                    {/* Main content */}
                    <div className="flex-1 p-5 min-w-0">
                      {/* Top row */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-bold font-mono border border-gray-300">
                          {bom.slNo}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">SL</span>

                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Sprint {bom.sprintNo}
                        </span>

                        {isPending && (
                          <span className="flex items-center gap-1.5 ml-auto px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Awaiting Review
                          </span>
                        )}
                      </div>

                      {/* Student info */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3 text-sm">
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Student</span>
                          <p className="text-gray-900 font-medium">{bom.studentId?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">USN / Email</span>
                          <p className="text-blue-600 font-medium break-all">{bom.studentId?.usn || bom.studentId?.email || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 my-3" />

                      {/* Part details */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Part Name</span>
                          <p className="text-gray-900 font-medium">{bom.partName || '—'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Consumable</span>
                          <p className="text-gray-900 font-medium">{bom.consumableName}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Specification</span>
                          <p className="text-gray-900">{bom.specification}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Qty</span>
                          <p className="text-gray-900 font-bold">{bom.qty}</p>
                        </div>
                      </div>

                      {/* Rejection reason */}
                      {bom.status === 'rejected' && bom.rejectionReason && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <span className="text-xs font-bold text-red-600 uppercase tracking-wide block mb-1">Rejection Reason</span>
                          <p className="text-sm text-red-700">{bom.rejectionReason}</p>
                        </div>
                      )}

                      {/* Status badges + timestamp */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-500">Guide:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold
                            ${bom.guideApproved ? 'bg-green-100 text-green-800' : bom.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {bom.guideApproved ? '✓ Approved' : bom.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-500">Lab:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold
                            ${bom.labApproved ? 'bg-green-100 text-green-800' : bom.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {bom.labApproved ? '✓ Approved' : bom.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                          {new Date(bom.createdAt).toLocaleDateString()} {new Date(bom.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Action column */}
                    <div className="flex items-center px-5 py-4 border-l border-gray-100 bg-gray-50 flex-shrink-0">
                      {isPending ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => approve(bom._id || bom.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setEditingBOM(bom)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRejectClick(bom._id || bom.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-center w-16">
                          {bom.status === 'rejected' ? (
                            <>
                              <div className="text-2xl text-red-500 mb-1">✗</div>
                              <span className="text-xs font-semibold text-red-600">Rejected</span>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl text-green-500 mb-1">✓</div>
                              <span className="text-xs font-semibold text-green-600">Approved</span>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(bom.guideApprovedAt).toLocaleDateString()}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBOM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: 'rgb(139, 21, 56)' }}>Edit BOM Request</h2>
              <BOMForm initial={editingBOM} onSave={handleUpdate} onCancel={() => setEditingBOM(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-serif font-bold mb-3" style={{ color: 'rgb(139, 21, 56)' }}>Reject Request</h3>
            <p className="text-gray-600 mb-4">Provide a reason for rejection (optional).</p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              rows="4"
              placeholder="Reason for rejection (Optional)..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={confirmReject} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Reject Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyTeamBOMQueue

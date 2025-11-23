import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminBOMAnalytics() {
  const navigate = useNavigate()
  const [boms, setBoms] = useState([])
  const [analytics, setAnalytics] = useState({
    totalBOMs: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    avgApprovalTime: '0 days'
  })
  const [mostUsedMaterials, setMostUsedMaterials] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    setBoms(stored)
    
    const approved = stored.filter(b => b.guideApproved && b.labApproved).length
    const pending = stored.filter(b => !b.guideApproved || !b.labApproved).length
    const rejected = stored.filter(b => b.status === 'rejected').length
    
    // Calculate most used materials from actual BOMs
    const materialCounts = {}
    stored.forEach(bom => {
      if (bom.partName) {
        materialCounts[bom.partName] = (materialCounts[bom.partName] || 0) + 1
      }
    })
    
    const materials = Object.entries(materialCounts)
      .map(([name, count]) => ({
        material: name,
        count,
        percentage: Math.min((count / Math.max(1, stored.length)) * 100, 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
    
    setMostUsedMaterials(materials)
    setAnalytics({
      totalBOMs: stored.length,
      approved,
      pending,
      rejected,
      avgApprovalTime: stored.length > 0 ? '2 days' : '0 days'
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/admin')}
            className="mb-4 px-4 py-2 bg-white text-green-900 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">BOM Analytics</h1>
          <p className="text-green-200">Track BOMs, approvals, and statistics</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg border-2 border-green-200 p-6">
            <div className="text-3xl font-bold text-green-700">{analytics.totalBOMs}</div>
            <div className="text-sm text-green-600 font-semibold mt-2">Total BOMs</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg border-2 border-blue-200 p-6">
            <div className="text-3xl font-bold text-blue-700">{analytics.approved}</div>
            <div className="text-sm text-blue-600 font-semibold mt-2">Approved</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-lg border-2 border-yellow-200 p-6">
            <div className="text-3xl font-bold text-yellow-700">{analytics.pending}</div>
            <div className="text-sm text-yellow-600 font-semibold mt-2">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-lg border-2 border-red-200 p-6">
            <div className="text-3xl font-bold text-red-700">{analytics.rejected}</div>
            <div className="text-sm text-red-600 font-semibold mt-2">Rejected</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg border-2 border-purple-200 p-6">
            <div className="text-2xl font-bold text-purple-700">{analytics.avgApprovalTime}</div>
            <div className="text-sm text-purple-600 font-semibold mt-2">Avg Approval Time</div>
          </div>
        </div>

        {/* Approval Status Chart */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-green-900 mb-8">BOM Status Distribution</h3>
          <div className="space-y-6">
            {/* Approved */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Approved BOMs</span>
                <span className="font-bold text-green-600">{analytics.approved}/{analytics.totalBOMs}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${analytics.totalBOMs ? (analytics.approved / analytics.totalBOMs) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Pending Approvals</span>
                <span className="font-bold text-yellow-600">{analytics.pending}/{analytics.totalBOMs}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-yellow-500 h-4 rounded-full transition-all"
                  style={{ width: `${analytics.totalBOMs ? (analytics.pending / analytics.totalBOMs) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Rejected BOMs</span>
                <span className="font-bold text-red-600">{analytics.rejected}/{analytics.totalBOMs}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-red-600 h-4 rounded-full transition-all"
                  style={{ width: `${analytics.totalBOMs ? (analytics.rejected / analytics.totalBOMs) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Most Used Materials */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-8">
          <h3 className="text-2xl font-bold text-green-900 mb-8">Most Used Materials</h3>
          <div className="space-y-6">
            {mostUsedMaterials.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{item.material}</span>
                  <span className="font-bold text-green-600">{item.count} BOMs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBOMAnalytics

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function BOMDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bom, setBom] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    const found = stored.find(b => b.id === Number(id) || b.id === id)
    
    const storedResults = JSON.parse(localStorage.getItem('bomResults') || '{}')
    const result = storedResults[id]

    setBom(found || null)
    setResults(result || null)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!bom) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">BOM Not Found</h1>
            <button
              onClick={() => navigate('/student/bom')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to BOMs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{bom.partName || 'BOM Details'}</h1>
            <p className="text-slate-300">View complete Bill of Materials information</p>
          </div>
          <button
            onClick={() => navigate('/student/bom')}
            className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            ← Back to BOMs
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="md:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-8xl mb-4">📦</div>
                    <div className="text-lg font-semibold text-gray-700">{bom.partName}</div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p className="font-semibold text-gray-900 mb-2">Bill of Materials</p>
                    <p>Reference: {bom.id}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created on {new Date(bom.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Basic Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Serial Number</label>
                    <p className="text-lg text-gray-900 mt-1 font-medium">{bom.slNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sprint Number</label>
                    <p className="text-lg text-gray-900 mt-1 font-medium">{bom.sprintNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date</label>
                    <p className="text-lg text-gray-900 mt-1 font-medium">{bom.date}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Part Name / Drawing</label>
                    <p className="text-lg text-gray-900 mt-1 font-medium">{bom.partName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Quantity</label>
                    <p className="text-lg text-gray-900 mt-1 font-medium">{bom.qty} units</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Material Information Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Material Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Consumable Name</label>
                  <p className="text-base text-gray-900 mt-2 leading-relaxed">{bom.consumableName}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Specification</label>
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">{bom.specification}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Status Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Approval Status
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-lg border-2 ${
                  bom.guideApproved 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{bom.guideApproved ? '✓' : '⏳'}</span>
                    <span className="text-sm font-semibold text-gray-600">GUIDE APPROVAL</span>
                  </div>
                  <p className={`text-lg font-bold ${
                    bom.guideApproved 
                      ? 'text-green-700' 
                      : 'text-yellow-700'
                  }`}>
                    {bom.guideApproved ? 'Approved' : 'Pending'}
                  </p>
                </div>

                <div className={`p-6 rounded-lg border-2 ${
                  bom.labApproved 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{bom.labApproved ? '✓' : '⏳'}</span>
                    <span className="text-sm font-semibold text-gray-600">LAB APPROVAL</span>
                  </div>
                  <p className={`text-lg font-bold ${
                    bom.labApproved 
                      ? 'text-green-700' 
                      : 'text-yellow-700'
                  }`}>
                    {bom.labApproved ? 'Approved' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Environmental Impact Card */}
            {results && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  Environmental Impact
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Carbon Footprint</label>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{results.carbonFootprint?.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">kg CO₂ equivalent</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Embodied Energy</label>
                    <p className="text-3xl font-bold text-green-700 mt-2">{results.embodiedEnergy?.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">MJ (Megajoules)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/student/bom?edit=${id}`)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Edit BOM
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this BOM?')) {
                    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
                    const filtered = stored.filter(b => b.id !== bom.id)
                    localStorage.setItem('boms', JSON.stringify(filtered))
                    const results = JSON.parse(localStorage.getItem('bomResults') || '{}')
                    delete results[bom.id]
                    localStorage.setItem('bomResults', JSON.stringify(results))
                    navigate('/student/bom')
                  }
                }}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete BOM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BOMDetailPage

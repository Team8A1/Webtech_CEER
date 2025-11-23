import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function StudentEnergyPage() {
  const navigate = useNavigate()
  const [boms, setBoms] = useState([])
  const [selectedBomId, setSelectedBomId] = useState(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    setBoms(stored)
    if (stored.length > 0) setSelectedBomId(stored[0].id)
  }, [])

  const getResult = (bomId) => {
    const results = JSON.parse(localStorage.getItem('bomResults') || '{}')
    return results[bomId]
  }

  const selectedBom = boms.find(b => b.id === selectedBomId)
  const result = selectedBom ? getResult(selectedBomId) : null

  return (
    <div className="min-h-screen">
      {/* Header Section - Dark half-banner */}
      <section className="relative overflow-hidden" style={{ height: 260 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Embodied Energy</h1>
            <p className="text-slate-300">Analyze embodied energy metrics for your materials</p>
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* BOM Selector */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Select BOM</h3>
              <div className="space-y-2">
                {boms.length === 0 && <p className="text-gray-600 text-sm">No BOMs created yet. Create one in the BOM section.</p>}
                {boms.map(bom => (
                  <button
                    key={bom.id}
                    onClick={() => setSelectedBomId(bom.id)}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      selectedBomId === bom.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <div className="font-semibold">{bom.partName || 'Unnamed'}</div>
                    <div className="text-xs opacity-75">SL: {bom.slNo} | Qty: {bom.qty}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="md:col-span-2">
            {!selectedBom ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 text-lg">No BOM selected</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* BOM Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-2xl font-bold mb-4">{selectedBom.partName}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">SL No</p>
                      <p className="text-lg font-semibold">{selectedBom.slNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sprint No</p>
                      <p className="text-lg font-semibold">{selectedBom.sprintNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="text-lg font-semibold">{selectedBom.qty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="text-lg font-semibold">{selectedBom.date}</p>
                    </div>
                  </div>
                </div>

                {/* Energy Calculation */}
                {result && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg shadow p-8 border-2 border-orange-200">
                    <div className="flex items-center mb-4">
                      <h3 className="text-3xl font-bold text-orange-700">Embodied Energy Analysis</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Estimated Embodied Energy</p>
                        <p className="text-5xl font-bold text-orange-600">{result.embodiedEnergy.toFixed(2)}</p>
                        <p className="text-sm text-gray-600 mt-1">MJ (Megajoules)</p>
                      </div>
                      <div className="bg-white rounded p-4 text-sm text-gray-700">
                        <p>Calculation based on:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Quantity: {selectedBom.qty}</li>
                          <li>Material type: {selectedBom.consumableName}</li>
                          <li>Energy factor: 2.3 MJ per unit</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentEnergyPage

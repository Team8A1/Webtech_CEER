import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentNavbar from '../components/StudentNavbar'
import StudentFooter from '../components/StudentFooter'
import { ArrowLeft, Leaf, Info, BarChart3 } from 'lucide-react'

function StudentCarbonPage() {
  const navigate = useNavigate()
  const [boms, setBoms] = useState([])
  const [selectedBomId, setSelectedBomId] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    setBoms(stored)
    if (stored.length > 0) setSelectedBomId(stored[0].id)

    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
  }, [])

  const getResult = (bomId) => {
    const results = JSON.parse(localStorage.getItem('bomResults') || '{}')
    return results[bomId]
  }

  const selectedBom = boms.find(b => b.id === selectedBomId)
  const result = selectedBom ? getResult(selectedBomId) : null

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-green-100 selection:text-green-900 flex flex-col">
      <StudentNavbar user={user} />

      <main className="flex-grow pt-24 pb-12">
        {/* Header Section */}
        <section className="relative px-6 mb-16">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <div className="inline-block mb-4 px-3 py-1 border border-green-200 rounded-full bg-green-50">
                  <span className="text-xs text-green-700 uppercase tracking-widest font-medium">
                    Environmental Impact
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
                  Carbon <span className="italic text-green-700">Footprint</span>
                </h1>
                <p className="text-stone-500 text-lg max-w-xl font-light">
                  Calculate and analyze the carbon emissions associated with your project materials.
                </p>
              </div>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="group flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full hover:border-green-700 hover:text-green-700 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm tracking-widest font-medium">BACK TO DASHBOARD</span>
              </button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8">

            {/* Sidebar / BOM Selector */}
            <div className="lg:col-span-4">
              <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 h-full max-h-[600px] overflow-y-auto">
                <h3 className="text-xl font-serif text-stone-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-stone-400" />
                  Select Material
                </h3>

                <div className="space-y-3">
                  {boms.length === 0 && (
                    <div className="text-center py-8 text-stone-400">
                      <p className="text-sm">No materials found.</p>
                      <button onClick={() => navigate('/student/bom')} className="text-green-700 text-xs font-bold uppercase mt-2 hover:underline">
                        Add Items in BOM
                      </button>
                    </div>
                  )}

                  {boms.map(bom => (
                    <button
                      key={bom.id}
                      onClick={() => setSelectedBomId(bom.id)}
                      className={`w-full p-4 text-left rounded-2xl transition-all duration-300 border ${selectedBomId === bom.id
                          ? 'bg-white border-green-200 shadow-lg shadow-green-100/50'
                          : 'bg-white/50 border-transparent hover:bg-white hover:border-stone-200'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-serif font-medium ${selectedBomId === bom.id ? 'text-green-800' : 'text-stone-700'}`}>
                          {bom.partName || 'Unnamed Part'}
                        </span>
                        {selectedBomId === bom.id && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span>SL: {bom.slNo}</span>
                        <span>•</span>
                        <span>Qty: {bom.qty}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content / Results */}
            <div className="lg:col-span-8">
              {!selectedBom ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-stone-50 rounded-3xl border border-stone-100 border-dashed">
                  <Leaf className="w-12 h-12 text-stone-300 mb-4" />
                  <p className="text-stone-500 font-serif text-lg">Select a material to view analysis</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Details Card */}
                  <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">Material Details</span>
                        <h2 className="text-3xl font-serif text-stone-900 mt-2">{selectedBom.partName}</h2>
                      </div>
                      <div className="px-4 py-2 bg-stone-50 rounded-full border border-stone-100">
                        <span className="text-sm font-mono text-stone-600">{selectedBom.date}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-4 bg-stone-50 rounded-2xl">
                        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">SL No</p>
                        <p className="text-lg font-medium text-stone-900">{selectedBom.slNo}</p>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl">
                        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Sprint</p>
                        <p className="text-lg font-medium text-stone-900">{selectedBom.sprintNo}</p>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl">
                        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Quantity</p>
                        <p className="text-lg font-medium text-stone-900">{selectedBom.qty}</p>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl">
                        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Type</p>
                        <p className="text-lg font-medium text-stone-900 truncate" title={selectedBom.consumableName}>{selectedBom.consumableName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Card */}
                  {result && (
                    <div className="relative overflow-hidden bg-stone-900 text-white p-8 rounded-3xl shadow-xl">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-green-900/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                            <Leaf className="w-6 h-6 text-green-400" />
                          </div>
                          <h3 className="text-2xl font-serif">Impact Analysis</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 items-end">
                          <div>
                            <p className="text-stone-400 text-sm mb-2">Estimated Carbon Footprint</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-6xl font-serif text-white">{result.carbonFootprint.toFixed(2)}</span>
                              <span className="text-xl text-green-400 font-medium">kg CO₂e</span>
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-stone-400 mt-0.5" />
                              <div className="text-sm text-stone-300 space-y-2">
                                <p className="font-medium text-white">Calculation Methodology</p>
                                <ul className="space-y-1 list-disc list-inside opacity-80">
                                  <li>Base Quantity: {selectedBom.qty} units</li>
                                  <li>Material Factor: 1.5 kg CO₂e/unit</li>
                                  <li>Process Efficiency: Standard</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <StudentFooter />
    </div>
  )
}

export default StudentCarbonPage

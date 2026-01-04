
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentNavbar from '../components/StudentNavbar'
import StudentFooter from '../components/StudentFooter'
import { ArrowLeft, Leaf, FileText } from 'lucide-react'
import api from '../utils/api'

function StudentCarbonPage() {
  const navigate = useNavigate()
  const [analysisData, setAnalysisData] = useState([])
  const [totalCarbon, setTotalCarbon] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get('/carbon/analysis')
        if (response.data.success) {
          setAnalysisData(response.data.data)
          setTotalCarbon(response.data.totalCarbon)
        }
      } catch (error) {
        console.error('Error fetching carbon analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
  }, [])

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-green-100 selection:text-green-900 flex flex-col">
      <StudentNavbar user={user} />

      <main className="flex-grow pt-24 pb-12">
        {/* Header Section */}
        <section className="relative px-6 mb-12">
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
                  Detailed breakdown of carbon emissions for your approved BOM materials.
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
          <div className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden">

            {loading ? (
              <div className="p-12 text-center text-stone-400">Loading analysis...</div>
            ) : analysisData.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <FileText className="w-12 h-12 text-stone-300 mb-4" />
                <p className="text-stone-500 font-serif text-lg">No approved materials found for analysis.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-100">
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider">Part Name</th>
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider">Material</th>
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider">Type</th>
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider">Dims (L/W/T)</th>
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider">Qty</th>
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Volume (m³)</th>
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Weight (kg)</th>
                        <th className="p-6 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Carbon (kgCO₂e)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {analysisData.map((item) => (
                        <tr key={item._id} className="hover:bg-stone-50/50 transition-colors group">
                          <td className="p-6 font-medium text-stone-900">{item.partName}</td>
                          <td className="p-6 text-stone-600">{item.materialName}</td>
                          <td className="p-6">
                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-stone-100 text-stone-600 uppercase">
                              {item.formType}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-stone-500 font-mono">
                            {item.dimensions.length > 0 && <span>L: {item.dimensions.length}m</span>}
                            {item.dimensions.width > 0 && <span>, W: {item.dimensions.width}m</span>}
                            {item.dimensions.thickness > 0 && <span>, T/D: {item.dimensions.thickness}mm</span>}
                            {!item.dimensions.length && !item.dimensions.width && !item.dimensions.thickness && <span className="text-stone-300">-</span>}
                          </td>
                          <td className="p-6 text-stone-900">{item.qty}</td>
                          <td className="p-6 text-right text-stone-600 font-mono">{item.volume > 0 ? item.volume : '-'}</td>
                          <td className="p-6 text-right text-stone-600 font-mono">{item.weight}</td>
                          <td className="p-6 text-right font-bold text-green-700 font-mono">{item.totalCarbon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="bg-stone-900 p-8 text-white">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                        <Leaf className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-stone-400 text-xs uppercase tracking-wider font-bold">Total Carbon Footprint</p>
                        <p className="text-sm text-stone-400">Calculated for all {analysisData.length} items</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-serif font-bold">{totalCarbon.toFixed(3)}</span>
                      <span className="text-xl text-green-400 font-medium">kg CO₂e</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <StudentFooter />
    </div>
  )
}

export default StudentCarbonPage

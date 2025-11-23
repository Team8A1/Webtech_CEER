import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BOMForm from '../components/BOMForm'
import BOMList from '../components/BOMList'

function StudentBOMPage() {
  const navigate = useNavigate()
  const [boms, setBoms] = useState([])
  const [editing, setEditing] = useState(null)

  const load = () => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    setBoms(stored)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = (bom) => {
    load()
    setEditing(null)
  }

  const handleDelete = (id) => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    const filtered = stored.filter(b => b.id !== id)
    localStorage.setItem('boms', JSON.stringify(filtered))
    // remove results too
    const results = JSON.parse(localStorage.getItem('bomResults') || '{}')
    delete results[id]
    localStorage.setItem('bomResults', JSON.stringify(results))
    load()
  }

  return (
    <div className="min-h-screen">
      {/* Header Section - Dark half-banner */}
      <section className="relative overflow-hidden" style={{ height: 260 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bill of Materials</h1>
            <p className="text-slate-300">Add, edit, and manage your project materials</p>
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
          {/* Form Column */}
          <div className="md:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-2xl font-bold mb-4">{editing ? 'Edit BOM' : 'Add New BOM'}</h2>
              <BOMForm onSave={handleSave} initial={editing} onCancel={() => setEditing(null)} />
            </div>
          </div>

          {/* List Column */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Your BOMs</h2>
            <BOMList boms={boms} onEdit={(b) => setEditing(b)} onDelete={handleDelete} onSelect={() => {}} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentBOMPage

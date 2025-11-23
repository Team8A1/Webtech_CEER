import React, { useEffect, useState } from 'react'
import BOMForm from '../components/BOMForm'
import BOMList from '../components/BOMList'
import CarbonCalc from '../components/CarbonCalc'
import EmbodiedEnergy from '../components/EmbodiedEnergy'

function StudentLanding() {
  const [boms, setBoms] = useState([])
  const [selectedBomId, setSelectedBomId] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = () => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    setBoms(stored)
    if (stored.length > 0 && !selectedBomId) setSelectedBomId(stored[stored.length - 1].id)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = (bom) => {
    load()
    setSelectedBomId(bom.id)
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
    if (selectedBomId === id) setSelectedBomId(filtered.length ? filtered[0].id : null)
  }

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <h3 className="font-semibold mb-3">Bill of Materials (BOM)</h3>
          <div className="mb-4">
            <BOMForm onSave={handleSave} initial={editing} onCancel={() => setEditing(null)} />
          </div>

          <BOMList boms={boms} onEdit={(b) => setEditing(b)} onDelete={handleDelete} onSelect={(id) => setSelectedBomId(id)} />
        </div>

        <div className="col-span-1">
          <h3 className="font-semibold mb-3">Carbon Footprinting</h3>
          <CarbonCalc bomId={selectedBomId} />
        </div>

        <div className="col-span-1">
          <h3 className="font-semibold mb-3">Embodied Energy</h3>
          <EmbodiedEnergy bomId={selectedBomId} />
        </div>
      </div>
    </div>
  )
}

export default StudentLanding

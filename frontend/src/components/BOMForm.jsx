import React, { useState, useEffect } from 'react'

function BOMForm({ onSave, initial = null, onCancel }) {
  const [form, setForm] = useState({
    slNo: '',
    sprintNo: '',
    date: '',
    partName: '',
    consumableName: '',
    specification: '',
    qty: ''
  })

  useEffect(() => {
    if (initial) {
      setForm({
        slNo: initial.slNo || '',
        sprintNo: initial.sprintNo || '',
        date: initial.date ? initial.date.split('T')[0] : '',
        partName: initial.partName || '',
        consumableName: initial.consumableName || '',
        specification: initial.specification || '',
        qty: initial.qty || ''
      })
    }
  }, [initial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const bom = {
      id: initial?.id || Date.now(),
      slNo: form.slNo,
      sprintNo: form.sprintNo,
      date: form.date,
      partName: form.partName,
      consumableName: form.consumableName,
      specification: form.specification,
      qty: Number(form.qty) || 0,
      guideApproved: initial?.guideApproved || false,
      labApproved: initial?.labApproved || false,
      createdAt: initial?.createdAt || new Date().toISOString()
    }

    // simple placeholder calculations
    const carbonFootprint = Number(bom.qty) * 1.5
    const embodiedEnergy = Number(bom.qty) * 2.3

    // persist/update
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    const idx = stored.findIndex(x => x.id === bom.id)
    if (idx >= 0) stored[idx] = bom
    else stored.push(bom)
    localStorage.setItem('boms', JSON.stringify(stored))

    const results = JSON.parse(localStorage.getItem('bomResults') || '{}')
    results[bom.id] = { carbonFootprint, embodiedEnergy }
    localStorage.setItem('bomResults', JSON.stringify(results))

    if (onSave) onSave(bom)

    // reset only when creating new
    if (!initial) setForm({ slNo: '', sprintNo: '', date: '', partName: '', consumableName: '', specification: '', qty: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white p-6 rounded shadow">
      <div className="grid grid-cols-2 gap-3">
        <input name="slNo" value={form.slNo} onChange={handleChange} placeholder="SL.No" className="p-3 border rounded" />
        <input name="sprintNo" value={form.sprintNo} onChange={handleChange} placeholder="Sprint No" className="p-3 border rounded" />
        <input name="date" type="date" value={form.date} onChange={handleChange} className="p-3 border rounded" />
        <input name="partName" value={form.partName} onChange={handleChange} placeholder="Part Name / Drawing" className="p-3 border rounded" />
        <input name="consumableName" value={form.consumableName} onChange={handleChange} placeholder="Name of the Consumable" className="p-3 border rounded col-span-2" />
        <input name="specification" value={form.specification} onChange={handleChange} placeholder="Specification" className="p-3 border rounded col-span-2" />
        <input name="qty" type="number" value={form.qty} onChange={handleChange} placeholder="Qty" className="p-3 border rounded" />
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Fields are editable — press Save to apply</div>
        <div className="space-x-2">
          {initial && (<button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>)}
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded">{initial ? 'Save' : 'Add BOM'}</button>
        </div>
      </div>
    </form>
  )
}

export default BOMForm

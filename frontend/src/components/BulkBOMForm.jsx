import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

function BulkBOMForm({ materials, nextSlNo, onSaveAll, onCancel }) {
  const [items, setItems] = useState(
    materials.map((mat, i) => ({
      slNo: String(nextSlNo + i).padStart(2, '0'),
      sprintNo: '1',
      date: new Date().toISOString().split('T')[0],
      partName: '',
      consumableName: mat.name || '',
      specification: mat.dimension || '',
      qty: '1',
      length: '',
      width: '',
      weight: '',
      notifyGuide: true,
    }))
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const canSubmit = items.every(item => item.partName.trim() && Number(item.qty) >= 1)

  const handleSubmitAll = async () => {
    setSubmitting(true)
    const payload = items.map(item => ({
      slNo: item.slNo,
      sprintNo: item.sprintNo,
      date: item.date,
      partName: item.partName,
      consumableName: item.consumableName,
      specification: item.specification,
      qty: Number(item.qty) || 1,
      length: (Number(item.length) || 0) / 1000,
      width: (Number(item.width) || 0) / 1000,
      weight: Number(item.weight) || 0,
      notifyGuide: true,
    }))
    await onSaveAll(payload)
    setSubmitting(false)
  }

  const currentItem = items[activeIndex]

  return (
    <div className="space-y-4">

      {/* Step indicator dots */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`transition-all duration-200 rounded-full ${
              i === activeIndex
                ? 'w-6 h-2.5 bg-red-700'
                : items[i].partName.trim()
                ? 'w-2.5 h-2.5 bg-stone-400'
                : 'w-2.5 h-2.5 bg-stone-200'
            }`}
            title={`Item ${i + 1}: ${items[i].consumableName}`}
          />
        ))}
      </div>

      {/* Active Item Card */}
      <div className="rounded-2xl border border-red-200 bg-white shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border-b border-stone-100">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold font-mono">
            {currentItem.slNo}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-stone-900 truncate">{currentItem.consumableName}</div>
            <div className="text-[10px] text-stone-400">{currentItem.specification}</div>
          </div>
          <span className="text-xs text-stone-400 font-medium">{activeIndex + 1}/{items.length}</span>
        </div>

        {/* Form Fields */}
        <div className="px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                SL. No <span className="normal-case font-normal text-stone-400">(auto)</span>
              </label>
              <input
                value={currentItem.slNo}
                readOnly
                disabled
                className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-400 font-mono text-sm cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Sprint No</label>
              <input
                value={currentItem.sprintNo}
                onChange={e => updateItem(activeIndex, 'sprintNo', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
              Part Name / Drawing <span className="text-red-500">*</span>
            </label>
            <input
              value={currentItem.partName}
              onChange={e => updateItem(activeIndex, 'partName', e.target.value)}
              placeholder="e.g. Robot Arm Base"
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Consumable</label>
              <input
                value={currentItem.consumableName}
                onChange={e => updateItem(activeIndex, 'consumableName', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
                Qty <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={currentItem.qty}
                onChange={e => updateItem(activeIndex, 'qty', e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Specification</label>
            <input
              value={currentItem.specification}
              onChange={e => updateItem(activeIndex, 'specification', e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-1">Date</label>
            <input
              type="date"
              value={currentItem.date}
              onChange={e => updateItem(activeIndex, 'date', e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
            />
          </div>

          {/* Prev / Next Navigation */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => setActiveIndex(i => Math.min(items.length - 1, i + 1))}
              disabled={activeIndex === items.length - 1}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submit All Button */}
      <button
        onClick={handleSubmitAll}
        disabled={!canSubmit || submitting}
        className="w-full py-4 bg-red-700 text-white rounded-2xl text-sm font-bold tracking-widest hover:bg-red-800 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:bg-stone-300 disabled:text-stone-400 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {submitting ? (
          <span className="animate-pulse">Submitting...</span>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            ADD ALL {items.length} ITEMS TO BOM
          </>
        )}
      </button>

      {!canSubmit && (
        <p className="text-center text-xs text-stone-400">
          Fill <strong>Part Name</strong> &amp; <strong>Qty</strong> for all {items.length} items to submit
        </p>
      )}

      <button
        onClick={onCancel}
        className="w-full py-2 text-stone-400 hover:text-stone-700 text-sm transition-colors text-center"
      >
        Cancel
      </button>
    </div>
  )
}

export default BulkBOMForm

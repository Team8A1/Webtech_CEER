import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Search, ChevronDown } from 'lucide-react'

function BOMForm({ onSave, initial = null, onCancel, nextSlNo = 1 }) {
  const [form, setForm] = useState({
    slNo: initial ? initial.slNo : String(nextSlNo).padStart(3, '0'), // Auto-increment or use initial
    sprintNo: '1',
    date: new Date().toISOString().split('T')[0],
    partName: '',
    consumableName: '',
    specification: '',
    qty: '1',
    notifyGuide: true
  })

  // Searchable select state
  const [materials, setMaterials] = useState([]) // Store full material objects
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  // Fetch materials from backend
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/material/list')
        // Assuming response.data.data is the array of materials based on common pattern
        // or response.data if it's direct array. Let's check typical response format.
        // Usually standard is { success: true, data: [...] }
        if (response.data && response.data.data) {
          setMaterials(response.data.data)
        } else if (Array.isArray(response.data)) {
          setMaterials(response.data)
        }
      } catch (error) {
        console.error("Error fetching materials:", error)
      }
    }
    fetchMaterials()
  }, [])

  useEffect(() => {
    if (initial) {
      setForm({
        slNo: initial.slNo || '',
        sprintNo: initial.sprintNo || '',
        date: initial.date ? initial.date.split('T')[0] : new Date().toISOString().split('T')[0],
        partName: initial.partName || '',
        consumableName: initial.consumableName || '',
        specification: initial.specification || '',
        qty: initial.qty || '',
        notifyGuide: true
      })
    } else {
      // If not editing, update slNo when nextSlNo changes
      setForm(prev => ({
        ...prev,
        slNo: String(nextSlNo).padStart(3, '0')
      }))
    }
  }, [initial, nextSlNo])

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))

    if (name === 'consumableName') {
      if (value.length > 0) {
        const filtered = materials.filter(item =>
          item.name.toLowerCase().includes(value.toLowerCase())
        )
        setSuggestions(filtered)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }
  }

  const handleConsumableFocus = () => {
    const value = form.consumableName
    const filtered = value ? materials.filter(item => item.name.toLowerCase().includes(value.toLowerCase())) : materials
    setSuggestions(filtered)
    setShowSuggestions(true)
  }

  const selectConsumable = (item) => {
    setForm(prev => ({
      ...prev,
      consumableName: item.name,
      specification: item.dimension || prev.specification // Auto-populate specification
    }))
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Check if the entered name exists in the materials list
    const isValid = materials.some(m => m.name.toLowerCase() === form.consumableName.toLowerCase())

    if (materials.length > 0 && !isValid) {
      alert("Please select a valid consumable from the available materials list.")
      return
    }

    const bomData = {
      slNo: form.slNo,
      sprintNo: form.sprintNo,
      date: form.date,
      partName: form.partName,
      consumableName: form.consumableName,
      specification: form.specification,
      qty: Number(form.qty) || 0,
      notifyGuide: form.notifyGuide
    }

    if (onSave) {
      onSave(bomData);
    }

    // reset only when creating new
    if (!initial) setForm({
      slNo: String(Number(nextSlNo) + 1).padStart(3, '0'), // Optimistically increment for next interaction until parent updates
      sprintNo: '1',
      date: new Date().toISOString().split('T')[0],
      partName: '',
      consumableName: '',
      specification: '',
      qty: '1',
      notifyGuide: true
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">SL. No</label>
          <input name="slNo" value={form.slNo} onChange={handleChange} placeholder="001" required className="p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sprint No</label>
          <input name="sprintNo" value={form.sprintNo} onChange={handleChange} placeholder="1" required className="p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required className="p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Part Name / Drawing</label>
          <input name="partName" value={form.partName} onChange={handleChange} placeholder="e.g. Robot Arm Base" required className="p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all" />
        </div>

        {/* Searchable Select for Consumable */}
        <div className="col-span-2 relative flex flex-col gap-1" ref={wrapperRef}>
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Consumable Name</label>
          <div className="relative">
            <input
              name="consumableName"
              value={form.consumableName}
              onChange={handleChange}
              onFocus={handleConsumableFocus}
              placeholder="Search or type consumable name..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all pl-10"
              autoComplete="off"
              required
            />
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
            <button type="button" onClick={() => setShowSuggestions(!showSuggestions)} className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {showSuggestions && (
            <div className="absolute z-10 top-full mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => selectConsumable(item)}
                    className="p-3 hover:bg-stone-50 cursor-pointer text-sm text-stone-700 hover:text-red-700 transition-colors border-b border-stone-50 last:border-0"
                  >
                    {item.name}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-stone-400 italic">No matches found.</div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Specification</label>
          <input name="specification" value={form.specification} onChange={handleChange} placeholder="e.g. 10k Ohm, 1/4 Watt" required className="p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Quantity</label>
          <input name="qty" type="number" value={form.qty} onChange={handleChange} placeholder="1" min="1" required className="p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all" />
        </div>

        <div className="flex items-center gap-3 pt-6 h-full">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${form.notifyGuide ? 'bg-red-600 border-red-600' : 'bg-white border-stone-300 group-hover:border-red-400'}`}>
              {form.notifyGuide && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input
              type="checkbox"
              name="notifyGuide"
              checked={form.notifyGuide}
              onChange={handleChange}
              className="hidden"
            />
            <span className="text-sm font-medium text-stone-600 group-hover:text-stone-900">Notify Guide via Email</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-stone-100 mt-4">
        <div className="text-xs font-medium text-stone-400">All fields are required</div>
        <div className="flex gap-3">
          {initial && (
            <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-full text-sm font-bold tracking-wide hover:bg-stone-50 transition-all">
              CANCEL
            </button>
          )}
          <button type="submit" className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-bold tracking-wide hover:bg-red-700 transition-colors shadow-lg shadow-stone-200">
            {initial ? 'SAVE CHANGES' : 'ADD ITEM'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default BOMForm

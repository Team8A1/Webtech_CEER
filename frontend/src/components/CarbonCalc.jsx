import React from 'react'

function CarbonCalc({ bomId }) {
  if (!bomId) return <div className="p-4 bg-white rounded shadow">No BOM selected</div>
  const results = JSON.parse(localStorage.getItem('bomResults') || '{}')
  const r = results[bomId]
  if (!r) return <div className="p-4 bg-white rounded shadow">No calculation available</div>
  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-semibold mb-2">Carbon Footprint</h4>
      <div>Estimated Carbon Footprint: <strong>{r.carbonFootprint.toFixed(2)}</strong> kg CO2e</div>
    </div>
  )
}

export default CarbonCalc

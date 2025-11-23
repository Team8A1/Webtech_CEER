import React from 'react'

function EmbodiedEnergy({ bomId }) {
  if (!bomId) return <div className="p-4 bg-white rounded shadow">No BOM selected</div>
  const results = JSON.parse(localStorage.getItem('bomResults') || '{}')
  const r = results[bomId]
  if (!r) return <div className="p-4 bg-white rounded shadow">No calculation available</div>
  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-semibold mb-2">Embodied Energy</h4>
      <div>Estimated Embodied Energy: <strong>{r.embodiedEnergy.toFixed(2)}</strong> MJ</div>
    </div>
  )
}

export default EmbodiedEnergy

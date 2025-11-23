import React from 'react'

function BOMList({ boms, onEdit, onDelete, onSelect }) {
  return (
    <div className="mt-4 bg-white rounded shadow p-4">
      <h4 className="font-semibold mb-3">Your BOMs</h4>
      {boms.length === 0 && <div className="text-sm text-gray-600">No BOMs yet</div>}
      <div className="space-y-3">
        {boms.map(b => (
          <div key={b.id} className="p-3 border rounded flex justify-between items-start">
            <div className="max-w-xl">
              <div className="font-medium text-lg">{b.partName || 'Unnamed part'}</div>
              <div className="text-xs text-gray-600 mt-1">SL: {b.slNo} | Sprint: {b.sprintNo} | Qty: {b.qty} | Date: {b.date}</div>
              <div className="text-xs mt-2">
                Guide: {b.guideApproved ? (<span className="text-green-600">Approved</span>) : (<span className="text-yellow-600">Pending</span>)}
                {' '}|{' '}
                Lab: {b.labApproved ? (<span className="text-green-600">Approved</span>) : (<span className="text-yellow-600">Pending</span>)}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <div className="space-x-2">
                <button onClick={() => onSelect?.(b.id)} className="text-sm text-gray-700 underline">Select</button>
                <button onClick={() => onEdit(b)} className="text-sm text-gray-700 underline">Edit</button>
              </div>
              <button onClick={() => {
                if (confirm('Delete this BOM?')) onDelete(b.id)
              }} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BOMList

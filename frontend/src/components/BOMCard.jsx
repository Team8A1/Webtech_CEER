import React from 'react'
import { useNavigate } from 'react-router-dom'

function BOMCard({ bom, onEdit, onDelete }) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/student/bom/${bom.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200 overflow-hidden"
    >
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        {/* Image Section */}
        <div className="sm:w-48 sm:h-48 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <div className="text-5xl mb-2">📦</div>
              <div className="text-sm text-gray-500 font-medium">{bom.partName || 'BOM'}</div>
            </div>
          </div>
        </div>

        {/* Description Table */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{bom.partName || 'Unnamed Part'}</h3>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-600 font-semibold">SL No:</span>
                  <span className="text-gray-800 ml-2">{bom.slNo}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Sprint:</span>
                  <span className="text-gray-800 ml-2">{bom.sprintNo}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Quantity:</span>
                  <span className="text-gray-800 ml-2">{bom.qty}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Date:</span>
                  <span className="text-gray-800 ml-2">{bom.date}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="mb-2">
                  <span className="text-gray-600 font-semibold">Consumable:</span>
                  <span className="text-gray-800 ml-2">{bom.consumableName}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Specification:</span>
                  <span className="text-gray-800 ml-2">{bom.specification}</span>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            <div className="mt-4 flex gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                bom.guideApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                Guide: {bom.guideApproved ? '✓ Approved' : '⏳ Pending'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                bom.labApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                Lab: {bom.labApproved ? '✓ Approved' : '⏳ Pending'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick()
              }}
              className="flex-1 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(bom)
              }}
              className="flex-1 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Delete this BOM?')) {
                  onDelete(bom.id)
                }
              }}
              className="flex-1 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Created:</span> {new Date(bom.createdAt).toLocaleDateString()} {new Date(bom.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export default BOMCard

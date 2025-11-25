import React, { useState } from 'react'

function AvailableMaterials() {
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const materials = [
    {
      id: 1,
      name: 'Jumper Wires',
      category: 'Electronics',
      description: 'Flexible wires with connectors for breadboard circuits',
      quantity: '500 pieces',
      usage: 'Circuit connections, prototyping'
    },
    {
      id: 2,
      name: 'DC Motor',
      category: 'Actuators',
      description: 'Direct current motor for mechanical applications',
      quantity: '25 units',
      usage: 'Robotics, automation, motion control'
    },
    {
      id: 3,
      name: 'LED (Red)',
      category: 'Components',
      description: 'Red light-emitting diode for indicator lights',
      quantity: '1000 pieces',
      usage: 'Status indicators, displays'
    },
    {
      id: 4,
      name: 'Resistors (Various)',
      category: 'Components',
      description: 'Assorted resistor values for circuit design',
      quantity: '5000 pieces',
      usage: 'Current limiting, voltage division'
    },
    {
      id: 5,
      name: 'Arduino Microcontroller',
      category: 'Development Boards',
      description: 'Open-source microcontroller board for projects',
      quantity: '30 units',
      usage: 'Programming, embedded systems'
    },
    {
      id: 6,
      name: 'Servo Motor',
      category: 'Actuators',
      description: 'Precision-controlled motor for angular positioning',
      quantity: '20 units',
      usage: 'Robotics, precise movement control'
    },
    {
      id: 7,
      name: 'Breadboard',
      category: 'Tools',
      description: 'Solderless circuit prototyping board',
      quantity: '40 units',
      usage: 'Circuit prototyping without soldering'
    },
    {
      id: 8,
      name: 'Capacitors',
      category: 'Components',
      description: 'Energy storage components for circuits',
      quantity: '2000 pieces',
      usage: 'Filtering, timing, energy storage'
    }
  ]

  if (selectedMaterial) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <button
              onClick={() => setSelectedMaterial(null)}
              className="mb-6 px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              ← Back to Materials
            </button>
            <h1 className="text-4xl font-bold">{selectedMaterial.name}</h1>
            <p className="text-slate-300 mt-2">{selectedMaterial.category}</p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info Section */}
            <div>
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Category</h2>
                <p className="text-blue-600 font-semibold text-lg">{selectedMaterial.category}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability</h2>
                <p className="text-gray-900 font-bold text-lg">{selectedMaterial.quantity}</p>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{selectedMaterial.description}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">Available Quantity:</span>
                    <span className="text-gray-900 font-bold">{selectedMaterial.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">Category:</span>
                    <span className="text-gray-900 font-bold">{selectedMaterial.category}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage & Applications</h2>
                <p className="text-gray-700">{selectedMaterial.usage}</p>
              </div>

              <div className="bg-blue-50 rounded-lg border-l-4 border-blue-600 p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">How to Choose</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Check quantity availability in the lab</li>
                  <li>✓ Verify material specifications match your project needs</li>
                  <li>✓ Confirm with lab instructor before using premium components</li>
                  <li>✓ Return unused materials in good condition</li>
                  <li>✓ Document usage for inventory tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Available Materials</h1>
          <p className="text-slate-300">Browse materials and components available in the lab</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {materials.map(material => (
            <div
              key={material.id}
              onClick={() => setSelectedMaterial(material)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6 cursor-pointer hover:border-blue-400"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{material.name}</h3>
                  <p className="text-sm text-blue-600 font-semibold mt-1">{material.category}</p>
                  <p className="text-sm text-gray-600 mt-2">{material.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Available: {material.quantity}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap ml-4">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AvailableMaterials

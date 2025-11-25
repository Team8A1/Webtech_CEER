import React, { useState } from 'react'

function AvailableMachines() {
  const [selectedMachine, setSelectedMachine] = useState(null)

  const machines = [
    {
      id: 1,
      name: 'Lathe Machine',
      category: 'Machining',
      description: 'Precision machine for cylindrical and conical shaping',
      specs: 'Chuck capacity: 16mm, Speed: 200-2500 RPM',
      usage: 'Turning, threading, facing operations',
      capacity: '3 simultaneous uses'
    },
    {
      id: 2,
      name: 'Drilling Machine',
      category: 'Machining',
      description: 'Vertical drilling machine for precision hole making',
      specs: 'Max spindle speed: 3000 RPM, Table size: 600x400mm',
      usage: 'Drilling, boring, reaming holes'
    },
    {
      id: 3,
      name: '3D Printer',
      category: 'Additive Manufacturing',
      description: 'FDM 3D printer for rapid prototyping',
      specs: 'Build volume: 200x200x200mm, Resolution: 0.1mm',
      usage: 'Prototype creation, custom part manufacturing'
    },
    {
      id: 4,
      name: 'Soldering Iron',
      category: 'Electronics',
      description: 'Temperature-controlled soldering station',
      specs: 'Temperature range: 200-450°C, Tip size: 1.6mm',
      usage: 'PCB assembly, component soldering'
    },
    {
      id: 5,
      name: 'CNC Machine',
      category: 'Machining',
      description: 'Computer numerical control machine for complex cuts',
      specs: 'Work area: 1000x500mm, Speed: 0-3000 RPM',
      usage: 'Precision cutting, engraving, milling'
    },
    {
      id: 6,
      name: 'Oscilloscope',
      category: 'Measurement',
      description: 'Electronic test instrument for signal analysis',
      specs: 'Channels: 2, Bandwidth: 100MHz, Sample rate: 1GSa/s',
      usage: 'Signal measurement, circuit debugging'
    },
    {
      id: 7,
      name: 'Multimeter',
      category: 'Measurement',
      description: 'Digital multimeter for voltage and current measurement',
      specs: 'DC voltage: 0-1000V, Current: 0-10A',
      usage: 'Circuit testing, troubleshooting'
    },
    {
      id: 8,
      name: 'Hand Tools Kit',
      category: 'Tools',
      description: 'Complete set of hand tools for assembly and disassembly',
      specs: '50+ pieces including wrenches, screwdrivers, pliers',
      usage: 'General assembly, maintenance, repairs'
    }
  ]

  if (selectedMachine) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <button
              onClick={() => setSelectedMachine(null)}
              className="mb-6 px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              ← Back to Machines
            </button>
            <h1 className="text-4xl font-bold">{selectedMachine.name}</h1>
            <p className="text-slate-300 mt-2">{selectedMachine.category}</p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info Section */}
            <div>
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Category</h2>
                <p className="text-blue-600 font-semibold text-lg">{selectedMachine.category}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Status</h2>
                <p className="text-green-600 font-bold text-lg">✓ Available</p>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{selectedMachine.description}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 font-semibold">Technical Details:</span>
                    <p className="text-gray-900 mt-1">{selectedMachine.specs}</p>
                  </div>
                  {selectedMachine.capacity && (
                    <div>
                      <span className="text-gray-600 font-semibold">Capacity:</span>
                      <p className="text-gray-900 mt-1">{selectedMachine.capacity}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage & Applications</h2>
                <p className="text-gray-700">{selectedMachine.usage}</p>
              </div>

              <div className="bg-blue-50 rounded-lg border-l-4 border-blue-600 p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Safety Guidelines & Selection</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Ensure proper training before using any machine</li>
                  <li>✓ Always wear appropriate safety equipment (goggles, gloves)</li>
                  <li>✓ Check machine condition and cleanliness before use</li>
                  <li>✓ Verify machine availability in the booking system</li>
                  <li>✓ Get lab instructor approval before operation</li>
                  <li>✓ Clean and return machine in proper condition</li>
                  <li>✓ Report any issues immediately to lab staff</li>
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
          <h1 className="text-4xl font-bold mb-2">Available Machines</h1>
          <p className="text-slate-300">Browse equipment and machines available in the laboratory</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {machines.map(machine => (
            <div
              key={machine.id}
              onClick={() => setSelectedMachine(machine)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6 cursor-pointer hover:border-blue-400"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{machine.name}</h3>
                  <p className="text-sm text-blue-600 font-semibold mt-1">{machine.category}</p>
                  <p className="text-sm text-gray-600 mt-2">{machine.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Status: Available</p>
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

export default AvailableMachines

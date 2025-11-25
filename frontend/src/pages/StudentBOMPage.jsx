import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BOMForm from '../components/BOMForm'

function StudentBOMPage() {
  const navigate = useNavigate()
  const [boms, setBoms] = useState([])
  const [editing, setEditing] = useState(null)

  const load = () => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    setBoms(stored)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = (bom) => {
    load()
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
  }

  const handleEdit = (bom) => {
    setEditing(bom)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const downloadPDF = () => {
    const element = document.getElementById('bom-table-pdf')
    const printWindow = window.open('', '', 'height=600,width=1200')
    
    const htmlContent = element.outerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BOMs Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: white;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            color: #1e293b;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #64748b;
            margin: 5px 0 0 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .table-title {
            background-color: #4b5563;
            color: white;
            padding: 10px;
            font-weight: bold;
            text-align: center;
            font-size: 14px;
          }
          thead tr {
            background-color: #2563eb;
          }
          thead th {
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            color: white;
            font-size: 12px;
            border: 1px solid #cbd5e1;
          }
          tbody tr:nth-child(odd) {
            background-color: #eff6ff;
          }
          tbody tr:nth-child(even) {
            background-color: #e0e7ff;
          }
          tbody td {
            padding: 10px 8px;
            border: 1px solid #cbd5e1;
            font-size: 11px;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }
          .badge-approved {
            background-color: #bfdbfe;
            color: #1e40af;
          }
          .badge-pending {
            background-color: #e5e7eb;
            color: #374151;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bill of Materials Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="table-title">BOMs TABLE</div>
        
        <table>
          <thead>
            <tr>
              <th>SL No</th>
              <th>Sprint</th>
              <th>Date</th>
              <th>Part Name</th>
              <th>Consumable</th>
              <th>Specification</th>
              <th>Qty</th>
              <th>Guide</th>
              <th>Lab</th>
            </tr>
          </thead>
          <tbody>
            ${boms.map(bom => `
              <tr>
                <td>${bom.slNo}</td>
                <td>${bom.sprintNo}</td>
                <td>${bom.date}</td>
                <td>${bom.partName}</td>
                <td>${bom.consumableName}</td>
                <td>${bom.specification}</td>
                <td style="text-align: center; font-weight: bold;">${bom.qty}</td>
                <td><span class="badge ${bom.guideApproved ? 'badge-approved' : 'badge-pending'}">${bom.guideApproved ? '✓ Approved' : '⏳ Pending'}</span></td>
                <td><span class="badge ${bom.labApproved ? 'badge-approved' : 'badge-pending'}">${bom.labApproved ? '✓ Approved' : '⏳ Pending'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is an auto-generated report. Total Records: ${boms.length}</p>
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Dark banner */}
      <section className="relative overflow-hidden" style={{ height: 260 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bill of Materials</h1>
            <p className="text-slate-300">Add, edit, and manage your project materials</p>
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Form Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">{editing ? 'Edit BOM' : 'Add New BOM'}</h2>
          <BOMForm onSave={handleSave} initial={editing} onCancel={() => setEditing(null)} />
        </div>

        {/* Table Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Your BOMs</h2>
            {boms.length > 0 && (
              <button
                onClick={downloadPDF}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>📄</span> Download PDF
              </button>
            )}
          </div>
          
          {boms.length === 0 ? (
            <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-lg shadow p-12 text-center border border-blue-200">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg text-gray-600">No BOMs yet</p>
              <p className="text-sm text-gray-500 mt-2">Create your first BOM using the form above</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto" id="bom-table-pdf">
              <div className="bg-gray-300 text-gray-800 px-6 py-3 font-bold text-center text-lg">
                BOMs TABLE
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">SL No</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Sprint</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Part Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Consumable</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Specification</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Qty</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Guide</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-blue-300 border-r-2 border-black">Lab</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-blue-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {boms.map((bom, idx) => (
                    <tr key={bom.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold bg-blue-50 border-r-2 border-black">{bom.slNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 bg-blue-50 border-r-2 border-black">{bom.sprintNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 bg-blue-50 border-r-2 border-black">{bom.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium bg-blue-50 border-r-2 border-black">{bom.partName}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 bg-blue-50 border-r-2 border-black">{bom.consumableName}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate bg-blue-50 border-r-2 border-black">{bom.specification}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-bold text-center bg-blue-50 border-r-2 border-black">{bom.qty}</td>
                      <td className="px-6 py-4 text-sm bg-blue-50 border-r-2 border-black">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          bom.guideApproved 
                            ? 'bg-blue-300 text-blue-900' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {bom.guideApproved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center bg-blue-50 border-r-2 border-black">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          bom.labApproved 
                            ? 'bg-blue-300 text-blue-900' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {bom.labApproved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm bg-blue-50">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(bom)}
                            className="px-3 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded font-semibold text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this BOM?')) {
                                handleDelete(bom.id)
                              }
                            }}
                            className="px-3 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded font-semibold text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentBOMPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BOMForm from '../components/BOMForm'
import axios from 'axios'
import StudentNavbar from '../components/StudentNavbar'
import StudentFooter from '../components/StudentFooter'
import { ArrowLeft, FileText, Download, Trash2, Edit2 } from 'lucide-react'

function StudentBOMPage() {
  const navigate = useNavigate()
  const [boms, setBoms] = useState([])
  const [editing, setEditing] = useState(null)
  const [user, setUser] = useState(null)
  const [filter, setFilter] = useState('pending')

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/student/request/bom', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBoms(response.data.data);
      }
    } catch (error) {
      console.error('Error loading BOMs:', error);
    }
  }

  useEffect(() => {
    load()
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
  }, [])

  const handleSave = async (bomData) => {
    try {
      const token = localStorage.getItem('token');
      if (editing) {
        // Update existing BOM
        await axios.put(`http://localhost:8000/api/student/request/bom/${editing._id || editing.id}`, bomData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('BOM Request updated successfully!');
      } else {
        // Create new BOM
        await axios.post('http://localhost:8000/api/student/request/bom', bomData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('BOM Request sent successfully!');
      }
      load();
      setEditing(null);
    } catch (error) {
      console.error('Error saving BOM:', error);
      alert(error.response?.data?.message || 'Error saving BOM request');
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/student/request/bom/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('BOM Request deleted successfully');
      load();
    } catch (error) {
      console.error('Error deleting BOM:', error);
      alert(error.response?.data?.message || 'Error deleting BOM request');
    }
  }

  const handleEdit = (bom) => {
    if (bom.guideApproved) {
      alert("Cannot edit request after guide approval.");
      return;
    }
    setEditing(bom);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          body { font-family: 'Inter', sans-serif; margin: 40px; color: #1c1917; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #b91c1c; padding-bottom: 20px; }
          .header h1 { font-family: 'Playfair Display', serif; color: #1c1917; margin: 0; font-size: 32px; }
          .header p { color: #78716c; margin: 10px 0 0 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          thead th { background-color: #f5f5f4; color: #1c1917; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e7e5e4; }
          tbody td { padding: 12px; border-bottom: 1px solid #e7e5e4; color: #44403c; }
          .badge { padding: 4px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .badge-approved { background-color: #dcfce7; color: #14532d; }
          .badge-pending { background-color: #f5f5f4; color: #78716c; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #a8a29e; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bill of Materials Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
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
              <th>Guide Status</th>
              <th>Lab Status</th>
            </tr>
          </thead>
          <tbody>
            ${boms.map(bom => `
              <tr>
                <td>${bom.slNo}</td>
                <td>${bom.sprintNo}</td>
                <td>${bom.date}</td>
                <td><strong>${bom.partName}</strong></td>
                <td>${bom.consumableName}</td>
                <td>${bom.specification}</td>
                <td style="text-align: center;">${bom.qty}</td>
                <td>
                  ${bom.status === 'rejected'
        ? '<span class="badge" style="background-color: #fee2e2; color: #991b1b;">Rejected</span>'
        : `<span class="badge ${bom.guideApproved ? 'badge-approved' : 'badge-pending'}">${bom.guideApproved ? 'Approved' : 'Pending'}</span>`
      }
                </td>
                <td><span class="badge ${bom.labApproved ? 'badge-approved' : 'badge-pending'}">${bom.labApproved ? 'Approved' : 'Pending'}</span></td>
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
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const getFilteredBOMs = () => {
    if (filter === 'pending') return boms.filter(b => !b.guideApproved && b.status !== 'rejected')
    if (filter === 'approved') return boms.filter(b => b.guideApproved)
    if (filter === 'rejected') return boms.filter(b => b.status === 'rejected')
    return boms
  }

  const filteredBoms = getFilteredBOMs()

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-red-100 selection:text-red-900 flex flex-col">
      <StudentNavbar user={user} />

      <main className="flex-grow pt-24 pb-12">
        {/* Header Section */}
        <section className="relative px-6 mb-16">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <div className="inline-block mb-4 px-3 py-1 border border-stone-200 rounded-full bg-stone-50">
                  <span className="text-xs text-stone-500 uppercase tracking-widest font-medium">
                    Project Management
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
                  Bill of <span className="italic text-red-700">Materials</span>
                </h1>
                <p className="text-stone-500 text-lg max-w-xl font-light">
                  Manage your project inventory, track specifications, and monitor approval statuses in real-time.
                </p>
              </div>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="group flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full hover:border-red-700 hover:text-red-700 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm tracking-widest font-medium">BACK TO DASHBOARD</span>
              </button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12">

            {/* Form Section */}
            <div className="lg:col-span-4">
              <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100 sticky top-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-700 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif text-stone-900">
                    {editing ? 'Edit Item' : 'Add Item'}
                  </h2>
                </div>
                <BOMForm
                  onSave={handleSave}
                  initial={editing}
                  onCancel={() => setEditing(null)}
                  nextSlNo={boms.length + 1}
                />
              </div>
            </div>

            {/* Table Section */}
            <div className="lg:col-span-8">
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif text-stone-900">Inventory List</h2>
                  {boms.length > 0 && (
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm tracking-wide hover:bg-red-700 transition-colors duration-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>EXPORT PDF</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 p-1 bg-stone-100 rounded-xl w-fit">
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'pending'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                      }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'approved'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                      }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setFilter('rejected')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'rejected'
                      ? 'bg-white text-red-700 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                      }`}
                  >
                    Rejected
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filter === 'all'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                      }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {filteredBoms.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif text-stone-900 mb-2">No Items Found</h3>
                  <p className="text-stone-500 font-light">
                    {filter === 'pending' ? 'No pending items.' :
                      filter === 'approved' ? 'No approved items.' :
                        filter === 'rejected' ? 'No rejected items.' :
                          'Start by adding materials to your bill of materials list.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm" id="bom-table-pdf">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-100">
                          <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Details</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Specs</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredBoms.map((bom) => (
                          <tr key={bom._id || bom.id} className="group hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="font-serif text-lg text-stone-900 font-medium">{bom.partName}</span>
                                <span className="text-xs text-stone-400 uppercase tracking-wider mt-1">
                                  {bom.slNo} • Sprint {bom.sprintNo} • {bom.date}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm text-stone-600 font-medium">{bom.consumableName}</span>
                                <span className="text-xs text-stone-500">{bom.specification}</span>
                                <span className="text-xs font-mono text-stone-400 mt-1">QTY: {bom.qty}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2 items-center">
                                {bom.status === 'rejected' ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-red-50 text-red-700 border-red-100">
                                    Rejected
                                  </span>
                                ) : (
                                  <>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${bom.guideApproved
                                      ? 'bg-green-50 text-green-700 border-green-100'
                                      : 'bg-stone-100 text-stone-500 border-stone-200'
                                      }`}>
                                      Guide: {bom.guideApproved ? 'Approved' : 'Pending'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${bom.labApproved
                                      ? 'bg-green-50 text-green-700 border-green-100'
                                      : 'bg-stone-100 text-stone-500 border-stone-200'
                                      }`}>
                                      Lab: {bom.labApproved ? 'Approved' : 'Pending'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!bom.guideApproved && bom.status !== 'rejected' && (
                                  <>
                                    <button
                                      onClick={() => handleEdit(bom)}
                                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-white rounded-full transition-all"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('Delete this BOM?')) {
                                          handleDelete(bom._id || bom.id)
                                        }
                                      }}
                                      className="p-2 text-stone-400 hover:text-red-700 hover:bg-white rounded-full transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <StudentFooter />
    </div>
  )
}

export default StudentBOMPage

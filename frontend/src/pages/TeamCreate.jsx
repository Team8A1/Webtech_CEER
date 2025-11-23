import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function TeamCreate() {
  const navigate = useNavigate()
  const [memberName, setMemberName] = useState('')
  const [usn, setUsn] = useState('')
  const [divv, setDivv] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [guideName, setGuideName] = useState('')
  const [members, setMembers] = useState([])

  const addMember = () => {
    if (!memberName) return
    setMembers(prev => [...prev, { name: memberName, usn, div: divv }])
    setMemberName('')
    setUsn('')
    setDivv('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!projectTitle || !guideName || members.length === 0) return alert('Please provide project title, guide name and at least one member.')

    const stored = JSON.parse(localStorage.getItem('teams') || '[]')
    const team = {
      id: Date.now().toString(),
      projectTitle,
      guideName,
      members,
      guideApproved: false,
      createdAt: new Date().toISOString()
    }
    stored.push(team)
    localStorage.setItem('teams', JSON.stringify(stored))
    // navigate back to guide landing or dashboard
    navigate('/student/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Create Team</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Title</label>
            <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Guide Name</label>
            <input value={guideName} onChange={e => setGuideName(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Add Member</h3>
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Name" value={memberName} onChange={e => setMemberName(e.target.value)} className="border rounded px-2 py-1" />
              <input placeholder="USN" value={usn} onChange={e => setUsn(e.target.value)} className="border rounded px-2 py-1" />
              <input placeholder="DIV" value={divv} onChange={e => setDivv(e.target.value)} className="border rounded px-2 py-1" />
            </div>
            <div className="mt-2">
              <button type="button" onClick={addMember} className="px-3 py-1 bg-gray-900 text-white rounded">Add Member</button>
            </div>
            <div className="mt-4 space-y-2">
              {members.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-100 p-2 rounded">
                  <div>{m.name} — {m.usn} — {m.div}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create Team</button>
            <button type="button" onClick={() => navigate('/faculty')} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeamCreate

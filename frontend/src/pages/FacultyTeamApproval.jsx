import React, { useEffect, useState } from 'react'

function FacultyTeamApproval() {
  const [teams, setTeams] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('teams') || '[]')
    setTeams(stored)
  }, [])

  const approve = (id) => {
    const updated = teams.map(t => t.id === id ? { ...t, guideApproved: true, approvedAt: new Date().toISOString() } : t)
    setTeams(updated)
    localStorage.setItem('teams', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Team Approval Queue</h1>

        {teams.length === 0 && <p className="text-gray-600">No teams created yet.</p>}

        <div className="space-y-4">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{team.projectTitle}</h3>
                  <p className="text-sm text-gray-600">Guide: {team.guideName}</p>
                  <p className="text-sm text-gray-600">Members: {team.members.map(m => m.name).join(', ')}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm">Status: {team.guideApproved ? <span className="text-green-600">Approved</span> : <span className="text-yellow-600">Pending</span>}</div>
                  {!team.guideApproved && (
                    <button onClick={() => approve(team.id)} className="mt-3 px-3 py-1 bg-gray-900 text-white rounded">Approve</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FacultyTeamApproval

import React from 'react'
const FACULTY = [
  { name: 'Prof. Rajesh Kumar', dept: 'CSE', subjects: 'Data Structures, Algorithms', students: 142, email: 'r.kumar@edu.in' },
  { name: 'Prof. Anjali Desai', dept: 'ECE', subjects: 'Digital Electronics, VLSI', students: 118, email: 'a.desai@edu.in' },
  { name: 'Prof. Vinod Nair', dept: 'MECH', subjects: 'Thermodynamics, Fluid Mechanics', students: 98, email: 'v.nair@edu.in' },
  { name: 'Dr. Meena Iyer', dept: 'CIVIL', subjects: 'Structural Engineering, Surveying', students: 87, email: 'm.iyer@edu.in' },
]
export default function AdminFaculty() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-extrabold text-navy-900">Faculty Management</h1><p className="text-sm text-text-secondary mt-1">View and manage faculty members</p></div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border-default"><p className="text-sm font-bold text-navy-900">{FACULTY.length} Faculty Members</p></div>
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Department</th><th>Subjects</th><th>Students</th><th>Email</th></tr></thead>
            <tbody>{FACULTY.map((f, i) => (
              <tr key={i}>
                <td><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-700">{f.name.split(' ').slice(-1)[0][0]}</div><span className="font-semibold text-navy-900">{f.name}</span></div></td>
                <td>{f.dept}</td><td className="text-text-secondary text-xs">{f.subjects}</td>
                <td>{f.students}</td><td className="text-text-secondary text-xs">{f.email}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

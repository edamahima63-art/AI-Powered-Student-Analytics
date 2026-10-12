import React, { useState } from 'react'
import { Upload, CheckCircle2, AlertCircle, Download } from 'lucide-react'
export default function AdminImport() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null) // null | 'validating' | 'success' | 'error'
  const handleFile = (f) => {
    if (!f || !f.name.endsWith('.csv')) { setStatus('error'); return }
    setFile(f)
    setStatus('validating')
    setTimeout(() => setStatus('success'), 1500)
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-extrabold text-navy-900">Import Data</h1><p className="text-sm text-text-secondary mt-1">Upload student records via CSV</p></div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-navy-900">Upload CSV File</h3>
          <button className="btn btn-sm btn-ghost"><Download size={14} />Download Template</button>
        </div>
        <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragging ? 'border-royal-400 bg-royal-50' : 'border-border-default hover:border-navy-300'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}>
          <Upload size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm font-semibold text-navy-900 mb-1">Drag & drop your CSV file here</p>
          <p className="text-xs text-text-tertiary mb-4">or click to browse — .csv files only, max 10MB</p>
          <input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={e => handleFile(e.target.files[0])} />
          <label htmlFor="csv-upload" className="btn btn-secondary btn-sm cursor-pointer">Browse File</label>
        </div>
        {status === 'validating' && <div className="mt-4 flex items-center gap-2 p-3 bg-royal-50 rounded-lg"><div className="w-4 h-4 border-2 border-royal-400 border-t-transparent rounded-full animate-spin"></div><p className="text-sm text-royal-700">Validating {file?.name}...</p></div>}
        {status === 'success' && <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg animate-fade-in"><div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-teal-500" /><p className="text-sm font-bold text-teal-800">File validated successfully</p></div><p className="text-xs text-teal-600">Found 156 records · 0 errors · Ready to import</p><button className="btn btn-sm bg-teal-500 text-white mt-3">Confirm Import</button></div>}
        {status === 'error' && <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in"><AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" /><p className="text-sm text-red-700">Only CSV files are supported. Please upload a valid .csv file.</p></div>}
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-bold text-navy-900 mb-3">Required CSV Columns</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          {['student_id*','name*','department*','semester*','attendance_pct*','gpa','marks_avg','email','gender'].map(col => (
            <div key={col} className={`text-xs font-mono px-3 py-1.5 rounded-lg ${col.includes('*') ? 'bg-royal-50 text-royal-700' : 'bg-surface-secondary text-text-secondary'}`}>{col}</div>
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-3">* Required columns</p>
      </div>
    </div>
  )
}

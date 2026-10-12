import React from 'react'
import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <Outlet />
    </div>
  )
}

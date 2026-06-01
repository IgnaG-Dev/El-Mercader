import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../admin/AdminSidebar'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}

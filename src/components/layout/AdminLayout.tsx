import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../admin/AdminSidebar'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-surface-container-highest border-b border-outline-variant flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
          </button>
          <span className="font-headline text-lg font-bold text-primary">El Mercader</span>
          <span className="text-label-sm text-on-surface-variant hidden sm:inline">— Admin</span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

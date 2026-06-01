import { Outlet } from 'react-router-dom'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import ScrollToTop from '../../router/ScrollToTop'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

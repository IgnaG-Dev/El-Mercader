import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import AdminLayout from '../components/layout/AdminLayout'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'

// Public pages
import HomePage from '../pages/public/HomePage'
import StorePage from '../pages/public/StorePage'
import ProductDetailPage from '../pages/public/ProductDetailPage'
import SearchPage from '../pages/public/SearchPage'
import CommunityPage from '../pages/public/CommunityPage'
import ReglasDeJuegoPage from '../pages/public/ReglasDeJuegoPage'
import PreguntasFrecuentesPage from '../pages/public/PreguntasFrecuentesPage'
import ContactoPage from '../pages/public/ContactoPage'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// User pages
import CartPage from '../pages/user/CartPage'
import CheckoutPage from '../pages/user/CheckoutPage'
import OrderConfirmationPage from '../pages/user/OrderConfirmationPage'
import PaymentInstructionsPage from '../pages/user/PaymentInstructionsPage'
import MercadoPagoPage from '../pages/user/MercadoPagoPage'
import OrderHistoryPage from '../pages/user/OrderHistoryPage'
import ProfilePage from '../pages/user/ProfilePage'
import AddressesPage from '../pages/user/AddressesPage'
import PreferencesPage from '../pages/user/PreferencesPage'
import PrivacyPage from '../pages/user/PrivacyPage'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProducts from '../pages/admin/AdminProducts'
import AdminOrders from '../pages/admin/AdminOrders'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminReports from '../pages/admin/AdminReports'
import AdminMerchandise from '../pages/admin/AdminMerchandise'
import AdminFinance from '../pages/admin/AdminFinance'
import AdminCategories from '../pages/admin/AdminCategories'

export const router = createBrowserRouter([
  // ── Public layout ─────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tienda', element: <StorePage /> },
      { path: '/producto/:slug', element: <ProductDetailPage /> },
      { path: '/busqueda', element: <SearchPage /> },
      { path: '/comunidad', element: <CommunityPage /> },
      { path: '/reglas-de-juego', element: <ReglasDeJuegoPage /> },
      { path: '/preguntas-frecuentes', element: <PreguntasFrecuentesPage /> },
      { path: '/contacto', element: <ContactoPage /> },

      // Auth (no redirect needed — unauthenticated only but keep in public layout)
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },

      // Cart and checkout — no login required
      { path: '/carrito', element: <CartPage /> },
      { path: '/finalizar-compra', element: <CheckoutPage /> },
      { path: '/confirmacion-compra', element: <OrderConfirmationPage /> },
      { path: '/instrucciones-pago', element: <PaymentInstructionsPage /> },
      { path: '/pago-mercadopago', element: <MercadoPagoPage /> },
      {
        path: '/historial-pedidos',
        element: <ProtectedRoute><OrderHistoryPage /></ProtectedRoute>,
      },
      {
        path: '/perfil',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: '/direcciones',
        element: <ProtectedRoute><AddressesPage /></ProtectedRoute>,
      },
      {
        path: '/preferencias',
        element: <ProtectedRoute><PreferencesPage /></ProtectedRoute>,
      },
      {
        path: '/privacidad',
        element: <ProtectedRoute><PrivacyPage /></ProtectedRoute>,
      },
    ],
  },

  // ── Admin layout (no public nav/footer) ───────────────────────────
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'productos', element: <AdminProducts /> },
      { path: 'pedidos', element: <AdminOrders /> },
      { path: 'usuarios', element: <AdminUsers /> },
      { path: 'informes', element: <AdminReports /> },
      { path: 'mercancias', element: <AdminMerchandise /> },
      { path: 'finanzas', element: <AdminFinance /> },
      { path: 'categorias', element: <AdminCategories /> },
    ],
  },
])

import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { LanguageProvider } from './contexts/LanguageContext'
import { supabase } from './utils/supabase'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PropertyDetails from './pages/PropertyDetails'
import UserProfile from './pages/UserProfile'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import OwnerRoute from './components/OwnerRoute'

// Create a client for React Query
const queryClient = new QueryClient()

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
      
      // Listen for changes on auth state
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null)
        }
      )
      
      return () => subscription.unsubscribe()
    }
    
    getSession()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pglife-theme">
        <LanguageProvider>
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute user={user}>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <OwnerRoute user={user}>
                <OwnerDashboard />
              </OwnerRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <AdminRoute user={user}>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

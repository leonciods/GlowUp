
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Agendamento from './pages/Agendamento'
import Calendario from './pages/Calendario'
import Clientes from './pages/Clientes'
import Relatorios from './pages/Relatorios'
import Lembretes from './pages/Lembretes'
import Configuracoes from './pages/Configuracoes'
import {User, Scissors} from 'lucide-react'

function App() {
  const { isAuthenticated, signIn } = useAuth()
  const { colors } = useTheme()

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
        <Toaster position="top-right" />
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Scissors className={`h-12 w-12 ${colors.primaryText}`} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">GlowUp</h1>
                <p className={`${colors.primaryText} text-sm`}>A beleza nas suas mãos</p>
              </div>
            </div>
            <p className="text-gray-600">Sistema completo de gestão para salão de beleza</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={signIn}
              className={`w-full flex items-center justify-center space-x-2 ${colors.primary} text-white py-4 rounded-lg transition-colors font-medium text-lg`}
            >
              <User className="h-5 w-5" />
              <span>Entrar no Sistema</span>
            </button>
            
            <div className="text-center text-sm text-gray-500">
              <p>Faça login para acessar todas as funcionalidades:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Dashboard com visão geral</li>
                <li>• Agendamento de clientes</li>
                <li>• Calendário simplificado</li>
                <li>• Gestão de clientes</li>
                <li>• Relatórios financeiros</li>
                <li>• Central de lembretes</li>
                <li>• Configurações personalizadas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      <Router>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/agendamento" element={<Agendamento />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/lembretes" element={<Lembretes />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </>
  )
}

export default App

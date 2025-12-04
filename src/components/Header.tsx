import React from 'react'
import { useAuth } from '../hooks/useAuth'
import {LogOut, User} from 'lucide-react'

const Header: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <header className="bg-[#fffbf7] border-b border-[#e3bbb1] px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#8e413a]">Sistema GlowUp</h2>
          <p className="text-[#aa6a62]">Gestão completa do seu salão</p>
        </div>
        
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-[#ffe4d8] px-4 py-2 rounded-lg border border-[#e3bbb1]">
              <User className="h-5 w-5 text-[#8e413a]" />
              <span className="text-[#8e413a] font-medium">{user.userName}</span>
            </div>
            
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 bg-[#8e413a] text-white rounded-lg hover:bg-[#7a3730] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        ) : (
          <div className="text-[#aa6a62]">Carregando...</div>
        )}
      </div>
    </header>
  )
}

export default Header

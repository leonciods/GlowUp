
import React, { useState } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {Plus, Edit, Trash2, Search, Phone, Mail, Calendar, User, Scissors} from 'lucide-react'

const Clientes: React.FC = () => {
  const { 
    clients, 
    appointments,
    loading, 
    createClient, 
    updateClient, 
    deleteClient 
  } = useSalonData()

  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    birthday: '',
    notes: ''
  })

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.whatsapp.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const clientData = {
        ...formData,
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : ''
      }

      if (editingClient) {
        await updateClient(editingClient._id, clientData)
      } else {
        await createClient(clientData)
      }

      setShowForm(false)
      setEditingClient(null)
      setFormData({
        name: '',
        whatsapp: '',
        email: '',
        birthday: '',
        notes: ''
      })
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    }
  }

  const handleEdit = (client: any) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      whatsapp: client.whatsapp,
      email: client.email || '',
      birthday: client.birthday ? format(new Date(client.birthday), 'yyyy-MM-dd') : '',
      notes: client.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteClient(clientId)
    }
  }

  const getClientAppointments = (clientId: string) => {
    return appointments
      .filter(apt => apt.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getClientStats = (client: any) => {
    const clientAppointments = getClientAppointments(client._id)
    const completedAppointments = clientAppointments.filter(apt => apt.status === 'realizado')
    
    const serviceCount = completedAppointments.length > 0 ? 
      completedAppointments.reduce((acc, apt) => {
        acc[apt.service] = (acc[apt.service] || 0) + 1
        return acc
      }, {} as any) : {}
    
    // Encontrar o serviço mais frequente e sua contagem
    const topService = Object.entries(serviceCount).length > 0 ?
      Object.entries(serviceCount).sort(([,a], [,b]) => (b as number) - (a as number))[0] : null
    
    return {
      totalAppointments: clientAppointments.length,
      completedAppointments: completedAppointments.length,
      lastVisit: completedAppointments[0]?.date,
      favoriteService: serviceCount,
      topServiceName: topService ? topService[0] : 'Nenhum',
      topServiceCount: topService ? topService[1] : 0
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8e413a]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center space-x-2 bg-[#8e413a] text-white px-6 py-2 rounded-lg hover:bg-[#7a3730] transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Clients List - Formato Horizontal */}
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const stats = getClientStats(client)
          const totalVisits = client.visitCount || 0

          return (
            <div key={client._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="p-5 flex items-center justify-between">
                {/* Informações do Cliente */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-14 h-14 bg-[#ffe4d8] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-7 w-7 text-[#8e413a]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{client.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{client.whatsapp}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span className="truncate max-w-[200px]">{client.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Serviço Preferido */}
                <div className="flex items-center space-x-3 px-6 border-l border-r border-gray-200">
                  <Scissors className="h-5 w-5 text-[#8e413a]" />
                  <div className="text-center min-w-[150px]">
                    <p className="text-sm font-semibold text-[#8e413a]">{stats.topServiceName}</p>
                    <p className="text-xs text-gray-500">Serviço preferido</p>
                  </div>
                </div>

                {/* Total de Visitas */}
                <div className="flex items-center space-x-3 px-6 border-r border-gray-200">
                  <Calendar className="h-5 w-5 text-[#8e413a]" />
                  <div className="text-center min-w-[100px]">
                    <p className="text-lg font-bold text-[#8e413a]">{totalVisits}</p>
                    <p className="text-xs text-gray-500">Visitas</p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 bg-[#ffe4d8] text-[#8e413a] rounded-lg hover:bg-[#f5d5c8] transition-colors"
                    title="Editar cliente"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Excluir cliente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
        </div>
      )}

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp (com DDD) *</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (opcional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Aniversário (opcional)</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#8e413a] text-white py-3 rounded-lg hover:bg-[#7a3730] transition-colors font-medium"
                  >
                    {editingClient ? 'Atualizar' : 'Cadastrar'} Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingClient(null)
                      setFormData({
                        name: '',
                        whatsapp: '',
                        email: '',
                        birthday: '',
                        notes: ''
                      })
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default Clientes

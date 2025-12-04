
    
import React, { useState } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {Send, Plus, Calendar, MessageCircleDashed as MessageCircle, Gift, Clock, CheckCircle, XCircle, User} from 'lucide-react'

const Lembretes: React.FC = () => {
  const { 
    clients,
    reminders, 
    loading, 
    sendReminder, 
    createReminder 
  } = useSalonData()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'manutencao',
    scheduledDate: '',
    message: '',
    lastService: ''
  })

  const reminderTypes = {
    manutencao: { label: 'Manutenção', icon: Calendar, color: 'blue' },
    aniversario: { label: 'Aniversário', icon: Gift, color: 'pink' },
    promocao: { label: 'Promoção', icon: MessageCircle, color: 'green' }
  }

  const defaultMessages = {
    manutencao: 'Olá {nome}! Que tal agendar uma manutenção? Já faz um tempo desde seu último atendimento. Entre em contato para agendar! 💇‍♀️✨',
    aniversario: '🎉 Parabéns {nome}! Hoje é seu dia especial! Que tal comemorar com um cuidado especial para você? Temos uma promoção especial para aniversariantes! 🎂💄',
    promocao: '✨ Promoção especial para você {nome}! Não perca essa oportunidade incrível. Aproveite para cuidar da sua beleza! 💇‍♀️'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const selectedClient = clients.find(c => c._id === formData.clientId)
      if (!selectedClient) return

      const message = formData.message.replace('{nome}', selectedClient.name)

      await createReminder({
        clientId: formData.clientId,
        clientName: selectedClient.name,
        type: formData.type,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        message,
        lastService: formData.lastService
      })

      setShowForm(false)
      setFormData({
        clientId: '',
        type: 'manutencao',
        scheduledDate: '',
        message: '',
        lastService: ''
      })
    } catch (error) {
      console.error('Erro ao criar lembrete:', error)
    }
  }

  const handleSendReminder = async (reminderId: string) => {
    await sendReminder(reminderId)
  }

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type,
      message: defaultMessages[type as keyof typeof defaultMessages] || ''
    }))
  }

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c._id === clientId)
    setFormData(prev => ({
      ...prev,
      clientId,
      message: prev.message.replace(/{nome}/g, selectedClient?.name || '{nome}')
    }))
  }

  const pendingReminders = reminders.filter(r => r.status === 'pendente')
  const sentReminders = reminders.filter(r => r.status === 'enviado')

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8e413a]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Central de Lembretes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-[#8e413a] text-white px-6 py-3 rounded-lg hover:bg-[#7a3730] transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Lembrete</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#ffffce] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#bfa866] text-sm font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-[#bfa866]">{pendingReminders.length}</p>
            </div>
            <Clock className="h-8 w-8 text-[#bfa866]" />
          </div>
        </div>

        <div className="bg-[#ffe4d8] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8e413a] text-sm font-medium">Enviados</p>
              <p className="text-2xl font-bold text-[#8e413a]">{sentReminders.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-[#8e413a]" />
          </div>
        </div>

        <div className="bg-[#f5d5c8] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#aa6a62] text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-[#aa6a62]">{reminders.length}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-[#aa6a62]" />
          </div>
        </div>
      </div>

      {/* Pending Reminders */}
      {pendingReminders.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lembretes Pendentes</h2>
          <div className="space-y-4">
            {pendingReminders.map((reminder) => {
              const typeInfo = reminderTypes[reminder.type as keyof typeof reminderTypes] || reminderTypes.manutencao
              const TypeIcon = typeInfo.icon

              return (
                <div key={reminder._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-${typeInfo.color}-100`}>
                        <TypeIcon className={`h-6 w-6 text-${typeInfo.color}-600`} />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800">{reminder.clientName}</h3>
                        <p className="text-sm text-gray-600">{typeInfo.label}</p>
                        <p className="text-xs text-gray-500">
                          Programado para: {format(new Date(reminder.scheduledDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSendReminder(reminder._id)}
                      className="flex items-center space-x-2 bg-[#8e413a] text-white px-4 py-2 rounded-lg hover:bg-[#7a3730] transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>Enviar via WhatsApp</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{reminder.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sent Reminders History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Lembretes Enviados</h2>
        {sentReminders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum lembrete enviado ainda</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sentReminders
              .sort((a, b) => new Date(b.sentDate || 0).getTime() - new Date(a.sentDate || 0).getTime())
              .map((reminder) => {
                const typeInfo = reminderTypes[reminder.type as keyof typeof reminderTypes] || reminderTypes.manutencao
                const TypeIcon = typeInfo.icon

                return (
                  <div key={reminder._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded bg-${typeInfo.color}-100`}>
                        <TypeIcon className={`h-4 w-4 text-${typeInfo.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{reminder.clientName}</p>
                        <p className="text-sm text-gray-600">{typeInfo.label}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-[#8e413a] font-medium">Enviado</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(reminder.sentDate || ''), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Lembrete</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => handleClientChange(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                    >
                      <option value="">Selecione um cliente</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lembrete</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                    >
                      {Object.entries(reminderTypes).map(([key, type]) => (
                        <option key={key} value={key}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora do Envio</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Último Serviço (opcional)</label>
                    <input
                      type="text"
                      value={formData.lastService}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastService: e.target.value }))}
                      placeholder="Ex: Coloração Completa"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Use {nome} para inserir automaticamente o nome do cliente"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dica: Use {'{nome}'} para inserir automaticamente o nome do cliente na mensagem
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#8e413a] text-white py-3 rounded-lg hover:bg-[#7a3730] transition-colors font-medium"
                  >
                    Criar Lembrete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({
                        clientId: '',
                        type: 'manutencao',
                        scheduledDate: '',
                        message: '',
                        lastService: ''
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

export default Lembretes

    
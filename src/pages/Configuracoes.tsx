
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme, ThemeColor } from '../hooks/useTheme'
import { useSalonData } from '../hooks/useSalonData'
import {User, Palette, Clock, Bell, MessageCircleDashed as MessageCircle, Save, Camera, Scissors, Plus, Edit2, Trash2, X} from 'lucide-react'
import toast from 'react-hot-toast'

const Configuracoes: React.FC = () => {
  const { user } = useAuth()
  const { theme, setTheme, colors } = useTheme()
  const { services, createService, updateService, deleteService } = useSalonData()
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Profissional',
    email: user?.email || '',
    phone: '',
    salon: 'GlowUp Studio',
    photo: ''
  })

  const [systemPreferences, setSystemPreferences] = useState({
    defaultDuration: 60,
    workStartTime: '08:00',
    workEndTime: '18:00',
    intervalBetweenClients: 0,
    enableNotifications: true,
    enableBirthdayReminders: true,
    enableMaintenanceReminders: true,
    maintenanceReminderDays: 60
  })

  const [messageTemplates, setMessageTemplates] = useState({
    appointmentReminder: 'Olá {cliente}! Lembrando do seu agendamento amanhã às {horario} para {servico}. Nos vemos lá! 💇‍♀️',
    birthdayMessage: '🎉 Parabéns {cliente}! Hoje é seu dia especial! Que tal comemorar com um cuidado especial para você? Temos uma promoção especial para aniversariantes! 🎂💄',
    maintenanceReminder: 'Olá {cliente}! Que tal agendar uma manutenção? Já faz {dias} dias desde seu último {servico}. Entre em contato para agendar! 💇‍♀️✨'
  })

  // Estados para gerenciamento de serviços
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: 60,
    category: 'outros' as const
  })

  const themeColors = [
    { name: 'Marrom', value: 'brown' as ThemeColor, color: 'bg-[#8e413a]' },
    { name: 'Terracotta', value: 'terracotta' as ThemeColor, color: 'bg-[#e3bbb1]' },
    { name: 'Dourado', value: 'gold' as ThemeColor, color: 'bg-[#bfa866]' }
  ]

  const handleSaveProfile = () => {
    // Aqui você salvaria no banco de dados
    toast.success('Perfil atualizado com sucesso!')
  }

  const handleSavePreferences = () => {
    // Aqui você salvaria as preferências no banco de dados
    toast.success('Preferências salvas com sucesso!')
  }

  const handleSaveMessages = () => {
    // Aqui você salvaria os templates no banco de dados
    toast.success('Templates de mensagens atualizados!')
  }

  const handleThemeChange = (newTheme: ThemeColor) => {
    setTheme(newTheme)
    toast.success(`Tema ${themeColors.find(t => t.value === newTheme)?.name} aplicado!`)
  }

  // Funções para gerenciamento de serviços
  const openServiceModal = (service?: any) => {
    if (service) {
      setEditingService(service)
      setServiceForm({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration,
        category: service.category
      })
    } else {
      setEditingService(null)
      setServiceForm({
        name: '',
        price: '',
        duration: 60,
        category: 'outros'
      })
    }
    setShowServiceModal(true)
  }

  const closeServiceModal = () => {
    setShowServiceModal(false)
    setEditingService(null)
    setServiceForm({
      name: '',
      price: '',
      duration: 60,
      category: 'outros'
    })
  }

  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.price) {
      toast.error('Preencha o nome e o preço do serviço!')
      return
    }

    try {
      if (editingService) {
        await updateService(editingService._id, {
          name: serviceForm.name,
          price: parseFloat(serviceForm.price),
          duration: serviceForm.duration,
          category: serviceForm.category
        })
      } else {
        await createService({
          name: serviceForm.name,
          price: parseFloat(serviceForm.price),
          duration: serviceForm.duration,
          category: serviceForm.category
        })
      }
      closeServiceModal()
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteService(serviceId)
      } catch (error) {
        console.error('Erro ao excluir serviço:', error)
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>

      {/* Perfil da Profissional */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <User className={`h-5 w-5 mr-2 ${colors.primaryText}`} />
          Perfil da Profissional
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Foto de perfil */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className={`w-32 h-32 ${colors.primaryBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {profileData.photo ? (
                  <img src={profileData.photo} alt="Perfil" className="w-32 h-32 rounded-full object-cover" />
                ) : (
                  <User className={`h-16 w-16 ${colors.primaryText}`} />
                )}
              </div>
              <button className={`absolute bottom-4 right-4 ${colors.primary} text-white p-2 rounded-full transition-colors`}>
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">Clique no ícone para alterar a foto</p>
          </div>

          {/* Dados pessoais */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Salão</label>
                <input
                  type="text"
                  value={profileData.salon}
                  onChange={(e) => setProfileData(prev => ({ ...prev, salon: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className={`flex items-center space-x-2 ${colors.primary} text-white px-6 py-3 rounded-lg transition-colors`}
            >
              <Save className="h-4 w-4" />
              <span>Salvar Perfil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personalização Visual */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Palette className={`h-5 w-5 mr-2 ${colors.primaryText}`} />
          Personalização Visual
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Cor do Tema</label>
          <div className="grid grid-cols-3 gap-4">
            {themeColors.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === themeOption.value 
                    ? 'border-[#8e413a] shadow-lg transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 ${themeOption.color} rounded-full mx-auto mb-2 ${
                  theme === themeOption.value ? 'ring-4 ring-[#8e413a] ring-opacity-30' : ''
                }`}></div>
                <p className={`text-sm font-medium ${
                  theme === themeOption.value ? 'text-[#8e413a]' : 'text-gray-600'
                }`}>
                  {themeOption.name}
                </p>
                {theme === themeOption.value && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-[#8e413a] rounded-full mx-auto"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✨ As cores se aplicam automaticamente em todo o sistema
          </p>
        </div>
      </div>

      {/* Preferências do Sistema */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className={`h-5 w-5 mr-2 ${colors.primaryText}`} />
          Preferências do Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duração padrão do atendimento (min)</label>
              <input
                type="number"
                value={systemPreferences.defaultDuration}
                onChange={(e) => setSystemPreferences(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horário de início</label>
              <input
                type="time"
                value={systemPreferences.workStartTime}
                onChange={(e) => setSystemPreferences(prev => ({ ...prev, workStartTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horário de término</label>
              <input
                type="time"
                value={systemPreferences.workEndTime}
                onChange={(e) => setSystemPreferences(prev => ({ ...prev, workEndTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo entre clientes (min)</label>
              <input
                type="number"
                value={systemPreferences.intervalBetweenClients}
                onChange={(e) => setSystemPreferences(prev => ({ ...prev, intervalBetweenClients: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lembrete de manutenção (dias)</label>
              <input
                type="number"
                value={systemPreferences.maintenanceReminderDays}
                onChange={(e) => setSystemPreferences(prev => ({ ...prev, maintenanceReminderDays: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Ativar notificações</label>
                <button
                  onClick={() => setSystemPreferences(prev => ({ ...prev, enableNotifications: !prev.enableNotifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    systemPreferences.enableNotifications ? colors.primary.split(' ')[0] : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemPreferences.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Lembretes de aniversário</label>
                <button
                  onClick={() => setSystemPreferences(prev => ({ ...prev, enableBirthdayReminders: !prev.enableBirthdayReminders }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    systemPreferences.enableBirthdayReminders ? colors.primary.split(' ')[0] : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemPreferences.enableBirthdayReminders ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Lembretes de manutenção</label>
                <button
                  onClick={() => setSystemPreferences(prev => ({ ...prev, enableMaintenanceReminders: !prev.enableMaintenanceReminders }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    systemPreferences.enableMaintenanceReminders ? colors.primary.split(' ')[0] : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemPreferences.enableMaintenanceReminders ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSavePreferences}
          className={`mt-6 flex items-center space-x-2 ${colors.primary} text-white px-6 py-3 rounded-lg transition-colors`}
        >
          <Save className="h-4 w-4" />
          <span>Salvar Preferências</span>
        </button>
      </div>

      {/* Gerenciamento de Serviços */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Scissors className={`h-5 w-5 mr-2 ${colors.primaryText}`} />
            Serviços
          </h2>
          <button
            onClick={() => openServiceModal()}
            className={`flex items-center space-x-2 ${colors.primary} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all`}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Serviço</span>
          </button>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Scissors className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum serviço cadastrado</p>
            <button
              onClick={() => openServiceModal()}
              className={`${colors.primary} text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all`}
            >
              Cadastrar Primeiro Serviço
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{service.name}</h3>
                    <p className={`text-2xl font-bold ${colors.primaryText}`}>
                      R$ {service.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {service.duration} min • {service.category}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openServiceModal(service)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar serviço"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir serviço"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates de Mensagens */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <MessageCircle className={`h-5 w-5 mr-2 ${colors.primaryText}`} />
          Configurações de Mensagens Automáticas
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lembrete de agendamento
            </label>
            <textarea
              value={messageTemplates.appointmentReminder}
              onChange={(e) => setMessageTemplates(prev => ({ ...prev, appointmentReminder: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Variáveis: {'{cliente}'}, {'{horario}'}, {'{servico}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem de aniversário
            </label>
            <textarea
              value={messageTemplates.birthdayMessage}
              onChange={(e) => setMessageTemplates(prev => ({ ...prev, birthdayMessage: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Variáveis: {'{cliente}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lembrete de manutenção
            </label>
            <textarea
              value={messageTemplates.maintenanceReminder}
              onChange={(e) => setMessageTemplates(prev => ({ ...prev, maintenanceReminder: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Variáveis: {'{cliente}'}, {'{dias}'}, {'{servico}'}
            </p>
          </div>

          <button
            onClick={handleSaveMessages}
            className={`flex items-center space-x-2 ${colors.primary} text-white px-6 py-3 rounded-lg transition-colors`}
          >
            <Save className="h-4 w-4" />
            <span>Salvar Templates</span>
          </button>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Serviço */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Scissors className={`h-5 w-5 mr-2 ${colors.primaryText}`} />
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button
                onClick={closeServiceModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Corte feminino, Escova modeladora..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  placeholder="60"
                  min="15"
                  step="15"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e413a] focus:border-transparent"
                >
                  <option value="corte">Corte</option>
                  <option value="coloracao">Coloração</option>
                  <option value="tratamento">Tratamento</option>
                  <option value="penteado">Penteado</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeServiceModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveService}
                className={`flex-1 px-4 py-3 ${colors.primary} text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2`}
              >
                <Save className="h-4 w-4" />
                <span>{editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Configuracoes

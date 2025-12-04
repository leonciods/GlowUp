
import React, { useState } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { useTheme } from '../hooks/useTheme'
import {Package, Plus, Edit2, Percent, Clock, DollarSign, MessageCircleDashed as MessageCircle} from 'lucide-react'
import toast from 'react-hot-toast'

const Combos: React.FC = () => {
  const { combos, services, createCombo, updateCombo, loading } = useSalonData()
  const { colors } = useTheme()
  
  const [showForm, setShowForm] = useState(false)
  const [editingCombo, setEditingCombo] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    services: [] as string[],
    discount: 15
  })

  // Número fake do WhatsApp de suporte
  const SUPPORT_WHATSAPP = '5511999999999'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.services.length < 2) {
      alert('Selecione pelo menos 2 serviços para o combo')
      return
    }

    // Calcular preços
    const selectedServices = services.filter(s => formData.services.includes(s._id))
    const originalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
    const price = originalPrice * (1 - formData.discount / 100)
    const duration = selectedServices.reduce((sum, s) => sum + s.duration, 0)

    try {
      if (editingCombo) {
        await updateCombo(editingCombo._id, {
          ...formData,
          price,
          originalPrice,
          duration
        })
      } else {
        await createCombo({
          ...formData,
          price,
          originalPrice,
          duration
        })
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        services: [],
        discount: 15
      })
      setEditingCombo(null)
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao salvar combo:', error)
    }
  }

  const handleEdit = (combo: any) => {
    setEditingCombo(combo)
    setFormData({
      name: combo.name,
      description: combo.description || '',
      services: combo.services,
      discount: combo.discount
    })
    setShowForm(true)
  }

  const sendWhatsAppMessage = (combo: any) => {
    const message = `🎁 *COMBO ESPECIAL* 🎁\n\n*${combo.name}*\n\n${combo.description}\n\n✨ Inclui:\n${combo.services.map((sId: string) => {
      const service = services.find(s => s._id === sId)
      return `• ${service?.name}`
    }).join('\n')}\n\n💰 De R$ ${combo.originalPrice.toFixed(2)} por R$ ${combo.price.toFixed(2)}\n🎉 ${combo.discount}% de desconto!\n\nAgende já! 💅`
    
    const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('Abrindo WhatsApp...')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Package className="h-8 w-8 mr-3 text-purple-600" />
          Combos de Serviços
        </h1>
        
        <button
          onClick={() => {
            setEditingCombo(null)
            setFormData({
              name: '',
              description: '',
              services: [],
              discount: 15
            })
            setShowForm(true)
          }}
          className={`${colors.primary} text-white px-6 py-3 rounded-lg transition-colors flex items-center`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Criar Combo
        </button>
      </div>

      {/* Lista de Combos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum combo criado ainda</p>
            <p className="text-sm text-gray-400 mt-2">Crie combos para oferecer descontos especiais!</p>
          </div>
        ) : (
          combos.map((combo) => (
            <div key={combo._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              {/* Badge de desconto */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{combo.name}</h3>
                  {combo.description && (
                    <p className="text-sm text-gray-600 mb-3">{combo.description}</p>
                  )}
                </div>
                <div className={`${colors.primaryBg} ${colors.primaryText} px-3 py-1 rounded-full text-sm font-bold flex items-center`}>
                  <Percent className="h-4 w-4 mr-1" />
                  {combo.discount}%
                </div>
              </div>

              {/* Serviços incluídos */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Inclui:</p>
                <ul className="space-y-1">
                  {combo.services.map((serviceId: string) => {
                    const service = services.find(s => s._id === serviceId)
                    return service ? (
                      <li key={serviceId} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                        {service.name}
                      </li>
                    ) : null
                  })}
                </ul>
              </div>

              {/* Informações */}
              <div className="space-y-2 mb-4 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {combo.duration} minutos
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 line-through">R$ {combo.originalPrice.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-green-600">R$ {combo.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(combo)}
                  className="flex-1 px-4 py-2 border-2 border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => sendWhatsAppMessage(combo)}
                  className={`flex-1 px-4 py-2 ${colors.primary} text-white rounded-lg transition-colors flex items-center justify-center`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {editingCombo ? 'Editar Combo' : 'Criar Novo Combo'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Combo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Combo Beleza Completa"
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Descreva o combo..."
                  />
                </div>

                {/* Serviços */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serviços Incluídos * (mínimo 2)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {services.map((service) => (
                      <label key={service._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, services: [...formData.services, service._id] })
                            } else {
                              setFormData({ ...formData, services: formData.services.filter(id => id !== service._id) })
                            }
                          }}
                          className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="flex-1 text-sm text-gray-700">{service.name}</span>
                        <span className="text-sm text-gray-500">R$ {service.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Desconto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desconto (%) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Entre 5% e 50%</p>
                </div>

                {/* Preview de preços */}
                {formData.services.length >= 2 && (
                  <div className={`${colors.primaryBg} rounded-lg p-4`}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Resumo:</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Preço original:</p>
                        <p className="text-lg font-bold text-gray-800 line-through">
                          R$ {services.filter(s => formData.services.includes(s._id)).reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Preço do combo:</p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {(services.filter(s => formData.services.includes(s._id)).reduce((sum, s) => sum + s.price, 0) * (1 - formData.discount / 100)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCombo(null)
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-3 ${colors.primary} text-white rounded-lg transition-colors`}
                  >
                    {editingCombo ? 'Atualizar' : 'Criar'} Combo
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

export default Combos

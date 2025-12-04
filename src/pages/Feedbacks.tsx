
import React, { useState } from 'react'
import { useSalonData } from '../hooks/useSalonData'
import { useTheme } from '../hooks/useTheme'
import {Star, MessageSquare, ThumbsUp, Calendar, User, TrendingUp} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Feedbacks: React.FC = () => {
  const { feedbacks, appointments, clients, createFeedback, loading } = useSalonData()
  const { colors } = useTheme()
  
  const [showForm, setShowForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState('')
  const [rating, setRating] = useState(5)
  const [serviceQuality, setServiceQuality] = useState(5)
  const [attendance, setAttendance] = useState(5)
  const [scheduling, setScheduling] = useState(5)
  const [comment, setComment] = useState('')

  // Filtrar agendamentos realizados sem feedback
  const completedAppointments = appointments.filter(apt => 
    apt.status === 'realizado' && 
    !feedbacks.some(fb => fb.appointmentId === apt._id)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAppointment) {
      alert('Selecione um agendamento')
      return
    }

    const appointment = appointments.find(a => a._id === selectedAppointment)
    if (!appointment) return

    try {
      await createFeedback({
        clientId: appointment.clientId,
        clientName: appointment.clientName,
        appointmentId: selectedAppointment,
        rating,
        serviceQuality,
        attendance,
        scheduling,
        comment
      })

      // Reset form
      setSelectedAppointment('')
      setRating(5)
      setServiceQuality(5)
      setAttendance(5)
      setScheduling(5)
      setComment('')
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
    }
  }

  // Calcular médias
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0'
  
  const averageService = feedbacks.length > 0
    ? (feedbacks.reduce((sum, fb) => sum + (fb.serviceQuality || 0), 0) / feedbacks.length).toFixed(1)
    : '0.0'
    
  const averageAttendance = feedbacks.length > 0
    ? (feedbacks.reduce((sum, fb) => sum + (fb.attendance || 0), 0) / feedbacks.length).toFixed(1)
    : '0.0'

  const renderStars = (value: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={`transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } ${onChange ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    )
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
          <MessageSquare className="h-8 w-8 mr-3 text-purple-600" />
          Feedbacks & Avaliações
        </h1>
        
        <button
          onClick={() => setShowForm(true)}
          className={`${colors.primary} text-white px-6 py-3 rounded-lg transition-colors flex items-center`}
        >
          <Star className="h-5 w-5 mr-2" />
          Adicionar Feedback
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-8 w-8 text-yellow-400" />
            <span className="text-3xl font-bold text-gray-800">{averageRating}</span>
          </div>
          <p className="text-gray-600 text-sm">Avaliação Geral</p>
          <div className="mt-2">{renderStars(Math.round(parseFloat(averageRating)))}</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <ThumbsUp className="h-8 w-8 text-blue-500" />
            <span className="text-3xl font-bold text-gray-800">{averageService}</span>
          </div>
          <p className="text-gray-600 text-sm">Qualidade do Serviço</p>
          <div className="mt-2">{renderStars(Math.round(parseFloat(averageService)))}</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <User className="h-8 w-8 text-green-500" />
            <span className="text-3xl font-bold text-gray-800">{averageAttendance}</span>
          </div>
          <p className="text-gray-600 text-sm">Atendimento</p>
          <div className="mt-2">{renderStars(Math.round(parseFloat(averageAttendance)))}</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <span className="text-3xl font-bold text-gray-800">{feedbacks.length}</span>
          </div>
          <p className="text-gray-600 text-sm">Total de Feedbacks</p>
          <p className="text-xs text-gray-500 mt-2">Últimos 30 dias</p>
        </div>
      </div>

      {/* Lista de Feedbacks */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Feedbacks Recentes</h2>
        
        {feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum feedback ainda</p>
            <p className="text-sm text-gray-400 mt-2">Comece solicitando avaliações dos seus clientes!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <User className="h-10 w-10 text-purple-600 bg-purple-100 rounded-full p-2 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">{feedback.clientName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(feedback.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    <span className="text-lg font-bold text-gray-800">{feedback.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Serviço</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= (feedback.serviceQuality || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Atendimento</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= (feedback.attendance || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Agendamento</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= (feedback.scheduling || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {feedback.comment && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <p className="text-sm text-gray-700 italic">"{feedback.comment}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Adicionar Feedback</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleção de agendamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atendimento *
                  </label>
                  <select
                    value={selectedAppointment}
                    onChange={(e) => setSelectedAppointment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um atendimento</option>
                    {completedAppointments.map((apt) => (
                      <option key={apt._id} value={apt._id}>
                        {apt.clientName} - {apt.service} - {format(new Date(apt.date), 'dd/MM/yyyy')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Avaliação Geral */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação Geral *
                  </label>
                  {renderStars(rating, setRating)}
                </div>

                {/* Avaliações específicas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualidade do Serviço
                    </label>
                    {renderStars(serviceQuality, setServiceQuality)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atendimento
                    </label>
                    {renderStars(attendance, setAttendance)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agendamento
                    </label>
                    {renderStars(scheduling, setScheduling)}
                  </div>
                </div>

                {/* Comentários */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentários e Sugestões
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Compartilhe sua experiência e sugestões..."
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-3 ${colors.primary} text-white rounded-lg transition-colors`}
                  >
                    Enviar Feedback
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

export default Feedbacks

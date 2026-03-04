import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, MessageSquare, QrCode, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const WeddingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    coupleMessage: '',
    pixKey: '',
    qrCodeUrl: ''
  });

  useEffect(() => {
    fetchWeddingInfo();
  }, []);

  const fetchWeddingInfo = async () => {
    try {
      const response = await axios.get(`${API}/wedding-info`);
      setFormData({
        date: response.data.date || '',
        time: response.data.time || '',
        location: response.data.location || '',
        coupleMessage: response.data.coupleMessage || '',
        pixKey: response.data.pixKey || '',
        qrCodeUrl: response.data.qrCodeUrl || ''
      });
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
      toast.error('Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API}/wedding-info`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Informações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar informações:', error);
      toast.error('Erro ao salvar informações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-wedding-blue mb-2">Configurações do Casamento</h1>
        <p className="text-slate-600">Gerencie as informações que aparecerão no convite</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data do Casamento
            </label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              placeholder="Ex: 15 de Março de 2025"
              data-testid="wedding-date-input"
              className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-3 focus:outline-none"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Horário
            </label>
            <input
              type="text"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              placeholder="Ex: 18:00"
              data-testid="wedding-time-input"
              className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-3 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Local da Cerimônia
            </label>
            <textarea
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: Igreja Santa Maria, Rua das Flores, 123"
              data-testid="wedding-location-input"
              rows={3}
              className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-3 focus:outline-none resize-none"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mensagem do Casal
            </label>
            <textarea
              value={formData.coupleMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, coupleMessage: e.target.value }))}
              placeholder="Uma mensagem especial para os convidados..."
              data-testid="wedding-message-input"
              rows={4}
              className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-3 focus:outline-none resize-none"
            />
          </div>

          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="font-serif text-xl text-wedding-blue mb-4">Informações de Doação</h3>
            <p className="text-sm text-slate-600 mb-6">
              Configure o PIX para doações gerais (além das vaquinhas específicas)
            </p>

            {/* PIX Key */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                placeholder="email@exemplo.com ou telefone"
                data-testid="wedding-pix-input"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-3 focus:outline-none"
              />
            </div>

            {/* QR Code URL */}
            <div>
              <ImageUpload
                value={formData.qrCodeUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, qrCodeUrl: url }))}
                label="QR Code PIX"
              />
              <p className="text-xs text-slate-500 mt-2">
                Cole (Ctrl+V), arraste ou selecione a imagem do QR Code
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              data-testid="save-settings-button"
              className="w-full bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-lg py-4 font-serif text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeddingSettings;
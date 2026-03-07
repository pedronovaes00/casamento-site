import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import ImageUpload from './ImageUpload';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const VaquinhasManagement = () => {
  const [vaquinhas, setVaquinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingVaquinha, setEditingVaquinha] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    pixKey: '',
    qrCodeUrl: ''
  });

  useEffect(() => {
    fetchVaquinhas();
  }, []);

  const fetchVaquinhas = async () => {
    try {
      const response = await axios.get(`${API}/vaquinhas`);
      setVaquinhas(response.data);
    } catch (error) {
      console.error('Erro ao carregar vaquinhas:', error);
      toast.error('Erro ao carregar vaquinhas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vaquinha = null) => {
    if (vaquinha) {
      setEditingVaquinha(vaquinha);
      setFormData({
        title: vaquinha.title,
        description: vaquinha.description || '',
        goal: vaquinha.goal.toString(),
        currentAmount: vaquinha.currentAmount || 0,
        pixKey: vaquinha.pixKey || '',
        qrCodeUrl: vaquinha.qrCodeUrl || ''
      });
    } else {
      setEditingVaquinha(null);
      setFormData({ title: '', description: '', goal: '', currentAmount: 0, pixKey: '', qrCodeUrl: '' });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.goal) {
      toast.error('Título e meta são obrigatórios');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const data = {
        ...formData,
        goal: parseFloat(formData.goal)
      };

      if (editingVaquinha) {
        await axios.put(`${API}/vaquinhas/${editingVaquinha.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Vaquinha atualizada com sucesso!');
      } else {
        await axios.post(`${API}/vaquinhas`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Vaquinha criada com sucesso!');
      }

      setShowDialog(false);
      fetchVaquinhas();
    } catch (error) {
      console.error('Erro ao salvar vaquinha:', error);
      toast.error('Erro ao salvar vaquinha');
    }
  };

  const handleDelete = async (vaquinhaId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta vaquinha?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/vaquinhas/${vaquinhaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vaquinha deletada com sucesso!');
      fetchVaquinhas();
    } catch (error) {
      console.error('Erro ao deletar vaquinha:', error);
      toast.error('Erro ao deletar vaquinha');
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-wedding-blue mb-2">Gestão de Vaquinhas</h1>
          <p className="text-slate-600">{vaquinhas.length} vaquinhas criadas</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          data-testid="add-vaquinha-button"
          className="bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-lg px-6 py-3 font-serif transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Vaquinha
        </button>
      </div>

      {vaquinhas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma vaquinha criada ainda</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {vaquinhas.map((vaquinha, index) => (
            <motion.div
              key={vaquinha.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg p-6"
              data-testid={`admin-vaquinha-card-${vaquinha.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-serif text-2xl text-wedding-blue mb-2">{vaquinha.title}</h3>
                  {vaquinha.description && (
                    <p className="text-slate-600 mb-4">{vaquinha.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDialog(vaquinha)}
                    data-testid={`edit-vaquinha-button-${vaquinha.id}`}
                    className="p-2 text-wedding-blue hover:bg-wedding-cream rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(vaquinha.id)}
                    data-testid={`delete-vaquinha-button-${vaquinha.id}`}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Arrecadado: R$ {vaquinha.currentAmount.toFixed(2)}</span>
                  <span className="text-slate-500">Meta: R$ {vaquinha.goal.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((vaquinha.currentAmount / vaquinha.goal) * 100, 100)}%`,
                      background: 'linear-gradient(135deg, #C5A065 0%, #E5D4B3 50%, #C5A065 100%)'
                    }}
                  />
                </div>
                <p className="text-right text-sm text-wedding-blue font-semibold mt-1">
                  {((vaquinha.currentAmount / vaquinha.goal) * 100).toFixed(0)}%
                </p>
              </div>

              {/* PIX Info */}
              {(vaquinha.pixKey || vaquinha.qrCodeUrl) && (
                <div className="bg-wedding-cream rounded-lg p-4 text-sm">
                  {vaquinha.pixKey && (
                    <p className="text-slate-700 mb-2">
                      <span className="font-semibold">Chave PIX:</span> {vaquinha.pixKey}
                    </p>
                  )}
                  {vaquinha.qrCodeUrl && (
                    <p className="text-slate-700">
                      <span className="font-semibold">QR Code:</span> {vaquinha.qrCodeUrl}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-wedding-blue">
              {editingVaquinha ? 'Editar Vaquinha' : 'Nova Vaquinha'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Vaquinha para o Sofá"
                data-testid="vaquinha-title-input"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da vaquinha"
                data-testid="vaquinha-description-input"
                rows={3}
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Meta (R$) *
              </label>
              <input
                type="number"
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="5000.00"
                data-testid="vaquinha-goal-input"
                step="0.01"
                min="0"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Valor Arrecadado (R$)
              </label>
              <input
                type="number"
                value={formData.currentAmount || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                data-testid="vaquinha-current-amount-input"
                step="0.01"
                min="0"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Atualize manualmente conforme receber doações via PIX
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                placeholder="email@exemplo.com ou telefone"
                data-testid="vaquinha-pix-input"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>
            <div>
              <ImageUpload
                value={formData.qrCodeUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, qrCodeUrl: url }))}
                label="QR Code PIX"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="flex-1"
                data-testid="cancel-vaquinha-button"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-wedding-blue hover:bg-wedding-blueDark"
                data-testid="save-vaquinha-button"
              >
                {editingVaquinha ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VaquinhasManagement;
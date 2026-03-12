import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Plus, Trash2, CheckCircle, Edit2, Unlock, QrCode, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import ImageUpload from './ImageUpload';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const GiftsManagement = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [newGift, setNewGift] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: ''
  });

  useEffect(() => { fetchGifts(); }, []);

  const fetchGifts = async () => {
    try {
      const response = await axios.get(`${API}/gifts`);
      setGifts(response.data);
    } catch (error) {
      toast.error('Erro ao carregar presentes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGift = async () => {
    if (!newGift.name.trim()) {
      toast.error('O nome do presente é obrigatório');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      if (editingGift) {
        await axios.put(`${API}/gifts/${editingGift.id}`, newGift, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Presente atualizado com sucesso!');
      } else {
        await axios.post(`${API}/gifts`, newGift, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Presente adicionado com sucesso!');
      }
      setShowAddDialog(false);
      setEditingGift(null);
      setNewGift({ name: '', description: '', imageUrl: '', price: '' });
      fetchGifts();
    } catch (error) {
      toast.error('Erro ao salvar presente');
    }
  };

  const handleEditGift = (gift) => {
    setEditingGift(gift);
    setNewGift({
      name: gift.name,
      description: gift.description || '',
      imageUrl: gift.imageUrl || '',
      price: gift.price || ''
    });
    setShowAddDialog(true);
  };

  const handleDeleteGift = async (giftId) => {
    if (!window.confirm('Tem certeza que deseja deletar este presente?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/gifts/${giftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Presente deletado com sucesso!');
      fetchGifts();
    } catch (error) {
      toast.error('Erro ao deletar presente');
    }
  };

  const handleUnclaimGift = async (giftId) => {
    if (!window.confirm('Deseja liberar este presente novamente?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/gifts/${giftId}/claim`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Presente liberado com sucesso!');
      fetchGifts();
    } catch (error) {
      toast.error('Erro ao liberar presente');
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
          <h1 className="font-serif text-3xl text-wedding-blue mb-2">Gestão de Presentes</h1>
          <p className="text-slate-600">{gifts.length} presentes cadastrados</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          data-testid="add-gift-button"
          className="bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-lg px-6 py-3 font-serif transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar Presente
        </button>
      </div>

      {gifts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum presente cadastrado ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              data-testid={`admin-gift-card-${gift.id}`}
            >
              {gift.imageUrl && (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-serif text-xl text-wedding-blue">{gift.name}</h3>
                  {gift.isTaken && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                {gift.description && (
                  <a
                    href={gift.description}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-wedding-blue hover:underline mb-3"
                  >
                    🔗 Ver produto
                  </a>
                )}
                {gift.price && (
                  <p className="text-wedding-gold font-semibold mb-3">{gift.price}</p>
                )}

                {/* Tipo de reserva */}
                {gift.isTaken && gift.takenByName && (
                  <div className="mb-3">
                    <p className="text-xs text-green-700 mb-1">
                      Reservado por: {gift.takenByName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {gift.claimType === 'pix' ? (
                        <><QrCode className="w-3 h-3" /> Pagamento via PIX</>
                      ) : (
                        <><ShoppingBag className="w-3 h-3" /> Presente físico</>
                      )}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEditGift(gift)}
                    data-testid={`edit-gift-button-${gift.id}`}
                    className="flex-1 bg-wedding-blue/10 text-wedding-blue hover:bg-wedding-blue/20 rounded-lg py-2 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  {gift.isTaken && (
                    <button
                      onClick={() => handleUnclaimGift(gift.id)}
                      className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg py-2 transition-all inline-flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-4 h-4" />
                      Liberar
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteGift(gift.id)}
                    data-testid={`delete-gift-button-${gift.id}`}
                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Gift Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingGift(null);
          setNewGift({ name: '', description: '', imageUrl: '', price: '' });
        }
      }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-wedding-blue">
              {editingGift ? 'Editar Presente' : 'Adicionar Presente'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Presente *</label>
              <input
                type="text"
                value={newGift.name}
                onChange={(e) => setNewGift(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Jogo de Panelas"
                data-testid="new-gift-name-input"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Link do Produto</label>
              <input
                type="url"
                value={newGift.description}
                onChange={(e) => setNewGift(prev => ({ ...prev, description: e.target.value }))}
                placeholder="https://www.amazon.com.br/..."
                data-testid="new-gift-description-input"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>
            <div>
              <ImageUpload
                value={newGift.imageUrl}
                onChange={(url) => setNewGift(prev => ({ ...prev, imageUrl: url }))}
                label="Imagem do Presente"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Preço</label>
              <input
                type="text"
                value={newGift.price}
                onChange={(e) => setNewGift(prev => ({ ...prev, price: e.target.value }))}
                placeholder="R$ 150,00"
                data-testid="new-gift-price-input"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setShowAddDialog(false)} variant="outline" className="flex-1" data-testid="cancel-add-gift-button">
                Cancelar
              </Button>
              <Button onClick={handleAddGift} className="flex-1 bg-wedding-blue hover:bg-wedding-blueDark" data-testid="confirm-add-gift-button">
                {editingGift ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
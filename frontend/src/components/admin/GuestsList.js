import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, MessageSquare, Trash2, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const GuestsList = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/guests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuests(response.data);
    } catch (error) {
      toast.error('Erro ao carregar convidados');
    } finally {
      setLoading(false);
    }
  };

  

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelected(selected.length === guests.length ? [] : guests.map(g => g.id));

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Excluir ${selected.length} convidado(s)?`)) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await Promise.all(selected.map(id => axios.delete(`${API}/guests/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      toast.success(`${selected.length} convidado(s) excluído(s)!`);
      setSelected([]);
      fetchGuests();
    } catch (error) {
      toast.error('Erro ao excluir convidados');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm('Excluir este convidado?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/guests/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Convidado excluído!');
      fetchGuests();
    } catch (error) {
      toast.error('Erro ao excluir convidado');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-blue"></div></div>;

  const totalGuests = guests.reduce((sum, guest) => sum + 1 + guest.companions.length, 0);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-wedding-blue mb-2">Convidados Confirmados</h1>
          <p className="text-slate-600">Total de {guests.length} confirmações ({totalGuests} pessoas)</p>
        </div>
      </div>

      {guests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum convidado confirmou presença ainda</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center justify-between">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-slate-600 hover:text-wedding-blue transition-colors">
              {selected.length === guests.length ? <CheckSquare className="w-5 h-5 text-wedding-blue" /> : <Square className="w-5 h-5" />}
              {selected.length === guests.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
            {selected.length > 0 && (
              <button onClick={handleDeleteSelected} disabled={deleting} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50">
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Excluindo...' : `Excluir ${selected.length} selecionado(s)`}
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {guests.map((guest, index) => (
              <motion.div key={guest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-colors ${selected.includes(guest.id) ? 'border-wedding-blue' : 'border-transparent'}`}
                data-testid={`guest-item-${guest.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleSelect(guest.id)} className="mt-1">
                      {selected.includes(guest.id) ? <CheckSquare className="w-5 h-5 text-wedding-blue" /> : <Square className="w-5 h-5 text-slate-300 hover:text-wedding-blue transition-colors" />}
                    </button>
                    <div>
                      <h3 className="font-serif text-xl text-wedding-blue mb-1">{guest.name}</h3>
                      <span className="text-xs bg-wedding-blue/10 text-wedding-blue px-2 py-1 rounded-full inline-block">{guest.guestType}</span>
                      <div className="space-y-1 mt-2">
                        {guest.email && <p className="text-sm text-slate-600 flex items-center gap-2"><Mail className="w-4 h-4" />{guest.email}</p>}
                        {guest.phone && <p className="text-sm text-slate-600 flex items-center gap-2"><Phone className="w-4 h-4" />{guest.phone}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-wedding-sageLight text-wedding-sage px-3 py-1 rounded-full">{1 + guest.companions.length} pessoa{guest.companions.length > 0 ? 's' : ''}</span>
                    <button onClick={() => handleDeleteOne(guest.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {guest.companions.length > 0 && (
                  <div className="mb-4 pl-8 border-l-2 border-wedding-goldLight">
                    <p className="text-sm font-semibold text-slate-500 mb-2">Acompanhantes:</p>
                    <ul className="space-y-1">
                      {guest.companions.map((companion, idx) => (
                        <li key={idx} className="text-sm text-slate-600">{companion.name}{companion.ageGroup && ` (${companion.ageGroup})`}{companion.relation && ` - ${companion.relation}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {guest.message && (
                  <div className="bg-wedding-cream rounded-lg p-4 ml-8">
                    <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2"><MessageSquare className="w-4 h-4" />Mensagem:</p>
                    <p className="text-sm text-slate-700 italic">"{guest.message}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GuestsList;

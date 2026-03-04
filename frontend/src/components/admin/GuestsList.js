import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const GuestsList = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/guests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuests(response.data);
    } catch (error) {
      console.error('Erro ao carregar convidados:', error);
      toast.error('Erro ao carregar convidados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-blue"></div>
      </div>
    );
  }

  const totalGuests = guests.reduce((sum, guest) => sum + 1 + guest.companions.length, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-wedding-blue mb-2">Convidados Confirmados</h1>
        <p className="text-slate-600">
          Total de {guests.length} confirmações ({totalGuests} pessoas)
        </p>
      </div>

      {guests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum convidado confirmou presença ainda</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {guests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg p-6"
              data-testid={`guest-item-${guest.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl text-wedding-blue mb-2">{guest.name}</h3>
                  <div className="space-y-1">
                    {guest.email && (
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {guest.email}
                      </p>
                    )}
                    {guest.phone && (
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {guest.phone}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs bg-wedding-sageLight text-wedding-sage px-3 py-1 rounded-full">
                  {1 + guest.companions.length} pessoa{guest.companions.length > 0 ? 's' : ''}
                </span>
              </div>

              {guest.companions.length > 0 && (
                <div className="mb-4 pl-6 border-l-2 border-wedding-goldLight">
                  <p className="text-sm font-semibold text-slate-500 mb-2">Acompanhantes:</p>
                  <ul className="space-y-1">
                    {guest.companions.map((companion, idx) => (
                      <li key={idx} className="text-sm text-slate-600">
                        {companion.name}
                        {companion.age && ` (${companion.age} anos)`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {guest.message && (
                <div className="bg-wedding-cream rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mensagem:
                  </p>
                  <p className="text-sm text-slate-700 italic">"{guest.message}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestsList;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Edit2, Check, X, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const GuestsList = ({ onNotifCount }) => {
  const [grupos, setGrupos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('grupos'); // 'grupos' | 'notificacoes'
  const [expandido, setExpandido] = useState(null);

  // Dialog de criar/editar
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nomeGrupo: '', membros: [''] });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      const [gruposRes, notifRes] = await Promise.all([
        axios.get(`${API}/grupos`, { headers }),
        axios.get(`${API}/admin/notificacoes`, { headers })
      ]);
      setGrupos(gruposRes.data);
      setNotificacoes(notifRes.data);
      onNotifCount?.(notifRes.data.length);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // ---- Grupos ----
  const abrirCriar = () => {
    setEditando(null);
    setForm({ nomeGrupo: '', membros: [''] });
    setShowDialog(true);
  };

  const abrirEditar = (grupo) => {
    setEditando(grupo);
    setForm({ nomeGrupo: grupo.nomeGrupo, membros: grupo.membros.map(m => m.nome) });
    setShowDialog(true);
  };

  const addMembroField = () => setForm(prev => ({ ...prev, membros: [...prev.membros, ''] }));
  const removeMembroField = (i) => setForm(prev => ({ ...prev, membros: prev.membros.filter((_, idx) => idx !== i) }));
  const updateMembro = (i, val) => setForm(prev => {
    const m = [...prev.membros];
    m[i] = val;
    return { ...prev, membros: m };
  });

  const handleSalvar = async () => {
    if (!form.nomeGrupo.trim()) { toast.error('Informe o nome do grupo'); return; }
    const membrosValidos = form.membros.filter(m => m.trim());
    if (membrosValidos.length === 0) { toast.error('Adicione pelo menos um membro'); return; }

    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { nomeGrupo: form.nomeGrupo, membros: membrosValidos };

      if (editando) {
        await axios.put(`${API}/grupos/${editando.id}`, payload, { headers });
        toast.success('Grupo atualizado!');
      } else {
        await axios.post(`${API}/grupos`, payload, { headers });
        toast.success('Grupo criado!');
      }
      setShowDialog(false);
      fetchAll();
    } catch {
      toast.error('Erro ao salvar grupo');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este grupo?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/grupos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Grupo excluído!');
      fetchAll();
    } catch {
      toast.error('Erro ao excluir grupo');
    }
  };

  // ---- Notificações ----
  const handleResolverNotif = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/admin/notificacoes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Notificação resolvida!');
      fetchAll();
    } catch {
      toast.error('Erro ao resolver notificação');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-blue" />
    </div>
  );

  const totalConfirmados = grupos.reduce((sum, g) => sum + g.membros.filter(m => m.confirmado).length, 0);
  const totalConvidados = grupos.reduce((sum, g) => sum + g.membros.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-wedding-blue mb-1">Convidados</h1>
          <p className="text-slate-600">
            {totalConfirmados} confirmados de {totalConvidados} convidados em {grupos.length} grupos
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-lg px-5 py-3 font-serif transition-all shadow-lg inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Grupo
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setAbaAtiva('grupos')}
          className={`px-5 py-2.5 rounded-full font-serif transition-all ${abaAtiva === 'grupos' ? 'bg-wedding-blue text-white shadow' : 'bg-white text-wedding-blue hover:bg-slate-50'}`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Grupos
        </button>
        <button
          onClick={() => setAbaAtiva('notificacoes')}
          className={`px-5 py-2.5 rounded-full font-serif transition-all relative ${abaAtiva === 'notificacoes' ? 'bg-wedding-blue text-white shadow' : 'bg-white text-wedding-blue hover:bg-slate-50'}`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Não encontrados
          {notificacoes.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {notificacoes.length}
            </span>
          )}
        </button>
      </div>

      {/* Aba Grupos */}
      {abaAtiva === 'grupos' && (
        <div className="space-y-4">
          {grupos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Nenhum grupo cadastrado ainda</p>
              <button onClick={abrirCriar} className="bg-wedding-blue text-white rounded-lg px-5 py-2 font-serif">
                Criar primeiro grupo
              </button>
            </div>
          ) : (
            grupos.map((grupo, index) => {
              const confirmados = grupo.membros.filter(m => m.confirmado);
              const pendentes = grupo.membros.filter(m => !m.confirmado);
              const aberto = expandido === grupo.id;

              return (
                <motion.div
                  key={grupo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-5 flex items-center justify-between">
                    <button
                      onClick={() => setExpandido(aberto ? null : grupo.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className="w-10 h-10 bg-wedding-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-wedding-blue" />
                      </div>
                      <div>
                        <p className="font-serif text-lg text-wedding-blue">{grupo.nomeGrupo}</p>
                        <p className="text-sm text-slate-500">
                          {grupo.membros.length} membro{grupo.membros.length !== 1 ? 's' : ''}
                          {confirmados.length > 0 && (
                            <span className="ml-2 text-green-600 font-semibold">
                              · {confirmados.length} confirmado{confirmados.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                      </div>
                      {aberto ? <ChevronUp className="w-4 h-4 text-slate-400 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />}
                    </button>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => abrirEditar(grupo)}
                        className="p-2 text-wedding-blue hover:bg-wedding-blue/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletar(grupo.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {aberto && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 px-5 py-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {grupo.membros.map((membro) => (
                            <div
                              key={membro.nome}
                              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${
                                membro.confirmado ? 'bg-green-50' : 'bg-slate-50'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                membro.confirmado ? 'bg-green-500' : 'bg-slate-200'
                              }`}>
                                {membro.confirmado && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`font-sans text-sm ${membro.confirmado ? 'text-green-700 font-semibold' : 'text-slate-600'}`}>
                                {membro.nome}
                              </span>
                              {membro.confirmado && (
                                <span className="ml-auto text-xs text-green-500">Confirmado</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {pendentes.length > 0 && (
                          <p className="text-xs text-slate-400 mt-3">
                            {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}: {pendentes.map(m => m.nome).join(', ')}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Aba Notificações */}
      {abaAtiva === 'notificacoes' && (
        <div className="space-y-3">
          {notificacoes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma notificação pendente</p>
            </div>
          ) : (
            notificacoes.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow p-5 flex items-center justify-between border-l-4 border-amber-400"
              >
                <div>
                  <p className="font-serif text-lg text-slate-800">
                    "<span className="text-wedding-blue">{notif.nomeDigitado}</span>" não encontrado
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => handleResolverNotif(notif.id)}
                  className="ml-4 p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Marcar como resolvido"
                >
                  <Check className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Dialog Criar/Editar Grupo */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) setEditando(null); }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-wedding-blue">
              {editando ? 'Editar Grupo' : 'Novo Grupo Familiar'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Nome do Grupo</label>
              <input
                type="text"
                value={form.nomeGrupo}
                onChange={(e) => setForm(prev => ({ ...prev, nomeGrupo: e.target.value }))}
                placeholder="Ex: Família Silva"
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Membros</label>
              <div className="space-y-2">
                {form.membros.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => updateMembro(i, e.target.value)}
                      placeholder={`Nome do membro ${i + 1}`}
                      className="flex-1 border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
                    />
                    {form.membros.length > 1 && (
                      <button
                        onClick={() => removeMembroField(i)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addMembroField}
                className="mt-2 text-sm text-wedding-blue hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Adicionar membro
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">Cancelar</Button>
              <Button onClick={handleSalvar} className="flex-1 bg-wedding-blue hover:bg-wedding-blueDark">
                {editando ? 'Salvar' : 'Criar Grupo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestsList;
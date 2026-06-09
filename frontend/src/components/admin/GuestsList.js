import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Edit2, Check, X, Bell, ChevronDown, ChevronUp, GripVertical, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const normalizarMembros = (membros) =>
  Array.isArray(membros)
    ? membros
      .map((membro) => {
        if (typeof membro === 'string') {
          return { nome: membro, confirmado: false };
        }
        return {
          nome: membro?.nome || '',
          confirmado: Boolean(membro?.confirmado)
        };
      })
      .filter((membro) => membro.nome)
    : [];

const SortableMembro = ({ id, value, index, onChange, onRemove, canRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex gap-2 items-center ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-300 hover:text-slate-500">
        <GripVertical className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Nome do membro ${index + 1}`}
        className="flex-1 border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
      />
      {canRemove && (
        <button onClick={() => onRemove(index)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const SortableGrupo = ({ grupo, expandido, onToggle, onEditar, onDeletar }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: grupo.id });
  const membros = normalizarMembros(grupo?.membros);
  const confirmados = membros.filter(m => m.confirmado);
  const pendentes = membros.filter(m => !m.confirmado);
  const aberto = expandido === grupo.id;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${isDragging ? 'opacity-60 shadow-2xl' : ''}`}
    >
      <div className="p-5 flex items-center justify-between">
        <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-300 hover:text-slate-400 mr-1 flex-shrink-0">
          <GripVertical className="w-5 h-5" />
        </div>

        <button
          onClick={() => onToggle(grupo.id)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div className="w-10 h-10 bg-wedding-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-wedding-blue" />
          </div>
          <div>
            <p className="font-serif text-lg text-wedding-blue">{grupo.nomeGrupo}</p>
            <p className="text-sm text-slate-500">
              {membros.length} membro{membros.length !== 1 ? 's' : ''}
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
          <button onClick={() => onEditar(grupo)} className="p-2 text-wedding-blue hover:bg-wedding-blue/10 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDeletar(grupo.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
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
              {membros.map((membro) => (
                <div
                  key={membro.nome}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${membro.confirmado ? 'bg-green-50' : 'bg-slate-50'}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${membro.confirmado ? 'bg-green-500' : 'bg-slate-200'}`}>
                    {membro.confirmado && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`font-sans text-sm ${membro.confirmado ? 'text-green-700 font-semibold' : 'text-slate-600'}`}>
                    {membro.nome}
                  </span>
                  {membro.confirmado && <span className="ml-auto text-xs text-green-500">Confirmado</span>}
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
    </div>
  );
};

export const GuestsList = ({ onNotifCount, onUnauthorized }) => {
  const [grupos, setGrupos] = useState([]);
  const [listas, setListas] = useState([]);
  const [listaAtiva, setListaAtiva] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('grupos');
  const [expandido, setExpandido] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nomeGrupo: '', membros: [''] });
  const [membroIds, setMembroIds] = useState(['membro-0']);
  const [showListaDialog, setShowListaDialog] = useState(false);
  const [editandoLista, setEditandoLista] = useState(null);
  const [formLista, setFormLista] = useState({ nome: '' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { onUnauthorized?.(); return; }
      const headers = { Authorization: `Bearer ${token}` };

      const [gruposRes, notifRes, listasRes] = await Promise.all([
        axios.get(`${API}/grupos`, { headers }),
        axios.get(`${API}/admin/notificacoes`, { headers }),
        axios.get(`${API}/listas`, { headers }).catch(() => ({ data: [] }))
      ]);

      const gruposNormalizados = Array.isArray(gruposRes.data)
        ? gruposRes.data.map(g => ({ ...g, membros: normalizarMembros(g?.membros) }))
        : [];
      const notificacoesNormalizadas = Array.isArray(notifRes.data) ? notifRes.data : [];
      const listasData = Array.isArray(listasRes.data) ? listasRes.data : [];

      setGrupos(gruposNormalizados);
      setNotificacoes(notificacoesNormalizadas);
      setListas(listasData);

      if (listasData.length > 0 && !listaAtiva) {
        setListaAtiva(listasData[0].id);
      }

      onNotifCount?.(notificacoesNormalizadas.length);
    } catch (error) {
      if (error.response?.status === 401) { onUnauthorized?.(); return; }
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const gruposFiltrados = listaAtiva
    ? grupos.filter(g => g.listaId === listaAtiva)
    : grupos;

  const listaNome = listaAtiva
    ? (listas.find(l => l.id === listaAtiva)?.nome || 'Convidados')
    : 'Todas as listas';

  const handleDragEndGrupos = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setGrupos(prev => {
      const oldIndex = prev.findIndex(g => g.id === active.id);
      const newIndex = prev.findIndex(g => g.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleDragEndMembros = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = membroIds.indexOf(active.id);
    const newIndex = membroIds.indexOf(over.id);
    setMembroIds(arrayMove(membroIds, oldIndex, newIndex));
    setForm(prev => ({ ...prev, membros: arrayMove(prev.membros, oldIndex, newIndex) }));
  };

  const abrirCriar = () => {
    setEditando(null);
    setForm({ nomeGrupo: '', membros: [''] });
    setMembroIds(['membro-0']);
    setShowDialog(true);
  };

  const abrirEditar = (grupo) => {
    setEditando(grupo);
    const membros = normalizarMembros(grupo?.membros).map(m => m.nome);
    setForm({ nomeGrupo: grupo.nomeGrupo, membros });
    setMembroIds(membros.map((_, i) => `membro-${i}`));
    setShowDialog(true);
  };

  const addMembroField = () => {
    setForm(prev => ({ ...prev, membros: [...prev.membros, ''] }));
    setMembroIds(prev => [...prev, `membro-${Date.now()}`]);
  };

  const removeMembroField = (i) => {
    setForm(prev => ({ ...prev, membros: prev.membros.filter((_, idx) => idx !== i) }));
    setMembroIds(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateMembro = (i, val) => {
    setForm(prev => {
      const m = [...prev.membros];
      m[i] = val;
      return { ...prev, membros: m };
    });
  };

  const handleSalvar = async () => {
    if (!form.nomeGrupo.trim()) { toast.error('Informe o nome do grupo'); return; }
    const membrosValidos = form.membros.filter(m => m.trim());
    if (membrosValidos.length === 0) { toast.error('Adicione pelo menos um membro'); return; }
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { nomeGrupo: form.nomeGrupo, membros: membrosValidos, listaId: listaAtiva };
      if (editando) {
        await axios.put(`${API}/grupos/${editando.id}`, payload, { headers });
        toast.success('Grupo atualizado!');
      } else {
        await axios.post(`${API}/grupos`, payload, { headers });
        toast.success('Grupo criado!');
      }
      setShowDialog(false);
      fetchAll();
    } catch (error) {
      if (error.response?.status === 401) { onUnauthorized?.(); return; }
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
    } catch (error) {
      if (error.response?.status === 401) { onUnauthorized?.(); return; }
      toast.error('Erro ao excluir grupo');
    }
  };

  const handleResolverNotif = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/admin/notificacoes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Notificação resolvida!');
      fetchAll();
    } catch (error) {
      if (error.response?.status === 401) { onUnauthorized?.(); return; }
      toast.error('Erro ao resolver notificação');
    }
  };

  const abrirCriarLista = () => {
    setEditandoLista(null);
    setFormLista({ nome: '' });
    setShowListaDialog(true);
  };

  const abrirRenomearLista = () => {
    const lista = listas.find(l => l.id === listaAtiva);
    if (!lista) return;
    setEditandoLista(lista);
    setFormLista({ nome: lista.nome });
    setShowListaDialog(true);
  };

  const handleSalvarLista = async () => {
    if (!formLista.nome.trim()) { toast.error('Informe o nome da lista'); return; }
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { nome: formLista.nome.trim() };
      if (editandoLista) {
        await axios.put(`${API}/listas/${editandoLista.id}`, payload, { headers });
        toast.success('Lista renomeada!');
      } else {
        await axios.post(`${API}/listas`, payload, { headers });
        toast.success('Lista criada!');
      }
      setShowListaDialog(false);
      fetchAll();
    } catch (error) {
      if (error.response?.status === 401) { onUnauthorized?.(); return; }
      toast.error('Erro ao salvar lista');
    }
  };

  const handleDeletarLista = async () => {
    if (!listaAtiva) return;
    if (!window.confirm(`Excluir a lista "${listaNome}" e todos os seus grupos?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/listas/${listaAtiva}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Lista excluída!');
      setListaAtiva(null);
      fetchAll();
    } catch (error) {
      if (error.response?.status === 401) { onUnauthorized?.(); return; }
      toast.error('Erro ao excluir lista');
    }
  };

  const handleExportPdf = async () => {
    if (!listaAtiva) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/grupos/exportar-pdf`, {
        params: { listaId: listaAtiva },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `convidados-${listaNome.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exportado!');
    } catch (error) {
      if (error.response?.status === 401) { onUnauthorized?.(); return; }
      toast.error('Erro ao exportar PDF');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-blue" />
    </div>
  );

  const totalNaLista = gruposFiltrados.reduce((sum, g) => sum + normalizarMembros(g?.membros).length, 0);
  const totalConfirmados = gruposFiltrados.reduce((sum, g) => sum + normalizarMembros(g?.membros).filter(m => m.confirmado).length, 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h1 className="font-serif text-3xl text-wedding-blue">Convidados</h1>
      </div>

      {/* List Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {listas.map(lista => (
          <button
            key={lista.id}
            onClick={() => { setListaAtiva(lista.id); setAbaAtiva('grupos'); }}
            className={`px-4 py-2 rounded-full font-serif text-sm transition-all ${
              listaAtiva === lista.id
                ? 'bg-wedding-blue text-white shadow'
                : 'bg-white text-wedding-blue hover:bg-slate-50 border border-wedding-blue/20'
            }`}
          >
            {lista.nome}
          </button>
        ))}
        <button
          onClick={abrirCriarLista}
          className="px-3 py-2 rounded-full font-serif text-sm bg-white text-slate-400 hover:text-wedding-blue border border-dashed border-slate-300 hover:border-wedding-blue transition-all"
          title="Nova lista"
        >
          <Plus className="w-4 h-4 inline" /> Lista
        </button>

        {listaAtiva && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={abrirRenomearLista}
              className="p-2 text-slate-400 hover:text-wedding-blue hover:bg-slate-100 rounded-lg transition-colors"
              title="Renomear lista"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeletarLista}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir lista"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-serif text-sm transition-all shadow"
              title="Exportar PDF"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setAbaAtiva('grupos')}
            className={`px-5 py-2.5 rounded-full font-serif transition-all ${
              abaAtiva === 'grupos' ? 'bg-wedding-blue text-white shadow' : 'bg-white text-wedding-blue hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />Grupos
          </button>
          <button
            onClick={() => setAbaAtiva('notificacoes')}
            className={`px-5 py-2.5 rounded-full font-serif transition-all relative ${
              abaAtiva === 'notificacoes' ? 'bg-wedding-blue text-white shadow' : 'bg-white text-wedding-blue hover:bg-slate-50'
            }`}
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

        {abaAtiva === 'grupos' && listaAtiva && (
          <button
            onClick={abrirCriar}
            className="bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-lg px-5 py-3 font-serif transition-all shadow-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Grupo
          </button>
        )}
      </div>

      {/* Summary */}
      {abaAtiva === 'grupos' && (
        <p className="text-slate-600 mb-4 text-sm">
          {totalConfirmados} confirmados de {totalNaLista} convidados em {gruposFiltrados.length} grupos
          {listaAtiva && (
            <span> — <span className="font-semibold text-wedding-blue">{listaNome}</span></span>
          )}
        </p>
      )}

      {/* Content */}
      {abaAtiva === 'grupos' && (
        <>
          {!listaAtiva && gruposFiltrados.length > 0 ? (
            <div className="space-y-8">
              {listas.map(lista => {
                const gruposDaLista = grupos.filter(g => g.listaId === lista.id);
                if (gruposDaLista.length === 0) return null;
                return (
                  <div key={lista.id}>
                    <h3 className="font-serif text-xl text-wedding-blue mb-3 border-b border-slate-200 pb-2">
                      {lista.nome}
                    </h3>
                    <div className="space-y-4">
                      {gruposDaLista.map(grupo => (
                        <SortableGrupo
                          key={grupo.id}
                          grupo={grupo}
                          expandido={expandido}
                          onToggle={(id) => setExpandido(expandido === id ? null : id)}
                          onEditar={abrirEditar}
                          onDeletar={handleDeletar}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : listaAtiva && gruposFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Nenhum grupo nesta lista</p>
              <button onClick={abrirCriar} className="bg-wedding-blue text-white rounded-lg px-5 py-2 font-serif">
                Criar primeiro grupo
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndGrupos}>
              <SortableContext items={gruposFiltrados.map(g => g.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {gruposFiltrados.map(grupo => (
                    <SortableGrupo
                      key={grupo.id}
                      grupo={grupo}
                      expandido={expandido}
                      onToggle={(id) => setExpandido(expandido === id ? null : id)}
                      onEditar={abrirEditar}
                      onDeletar={handleDeletar}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      {/* Notifications */}
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
                  <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <button
                  onClick={() => handleResolverNotif(notif.id)}
                  className="ml-4 p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Dialog Group */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) setEditando(null); }}>
        <DialogContent className="bg-white max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-wedding-blue">
              {editando ? 'Editar Grupo' : 'Novo Grupo Familiar'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 overflow-hidden">
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

            <div className="flex flex-col overflow-hidden">
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Membros <span className="text-slate-400 font-normal">(segure e arraste para reordenar)</span>
              </label>
              <div className="overflow-y-auto max-h-64 pr-1">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMembros}>
                  <SortableContext items={membroIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {form.membros.map((m, i) => (
                        <SortableMembro
                          key={membroIds[i]}
                          id={membroIds[i]}
                          value={m}
                          index={i}
                          onChange={updateMembro}
                          onRemove={removeMembroField}
                          canRemove={form.membros.length > 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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

      {/* Dialog List */}
      <Dialog open={showListaDialog} onOpenChange={(open) => { setShowListaDialog(open); if (!open) setEditandoLista(null); }}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-wedding-blue">
              {editandoLista ? 'Renomear Lista' : 'Nova Lista'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Nome da Lista</label>
              <input
                type="text"
                value={formLista.nome}
                onChange={(e) => setFormLista(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Staff, Convidados..."
                className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2.5 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setShowListaDialog(false)} variant="outline" className="flex-1">Cancelar</Button>
              <Button onClick={handleSalvarLista} className="flex-1 bg-wedding-blue hover:bg-wedding-blueDark">
                {editandoLista ? 'Renomear' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestsList;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Send, Check, X, Users, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const RSVPForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [semResultado, setSemResultado] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [membrosSelecionados, setMembrosSelecionados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (busca.trim().length < 2) {
      setResultados([]);
      setSemResultado(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(normalizar(busca)(/\s+/g, " ")), 400);
  }, [busca]);

  const normalizar = (str) => str.trim().replace(/\s+/g, " ");

  const buscar = async (termo) => {
    setBuscando(true);
    setSemResultado(false);
    try {
      const res = await axios.get(`${API}/grupos/buscar?nome=${encodeURIComponent(termo)}`);
      setResultados(res.data);
      if (res.data.length === 0) setSemResultado(true);
    } catch {
      toast.error('Erro ao buscar. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const handleNaoEncontrado = async () => {
    try {
      await axios.post(`${API}/grupos/nao-encontrado`, { nomeDigitado: busca });
      toast.success('Avisamos os noivos! Aguarde a confirmação 💛');
      setSemResultado(false);
      setBusca('');
    } catch {
      toast.error('Erro ao enviar. Tente novamente.');
    }
  };

  const selecionarGrupo = (grupo) => {
    setGrupoSelecionado(grupo);
    // Pré-seleciona quem já confirmou
    const jaConfirmados = grupo.membros.filter(m => m.confirmado).map(m => m.nome);
    setMembrosSelecionados(jaConfirmados.length > 0 ? jaConfirmados : []);
    setStep(2);
  };

  const toggleMembro = (nome) => {
    setMembrosSelecionados(prev =>
      prev.includes(nome) ? prev.filter(n => n !== nome) : [...prev, nome]
    );
  };

  const jaTemConfirmados = grupoSelecionado?.membros.some(m => m.confirmado);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // PUT atualiza (substitui), POST adiciona
      const method = jaTemConfirmados ? 'put' : 'post';
      const res = await axios[method](`${API}/grupos/${grupoSelecionado.id}/confirmar`, {
        membrosConfirmados: membrosSelecionados,
        mensagem: mensagem || null
      });
      toast.success(jaTemConfirmados ? 'Presença atualizada! 🎉' : 'Presença confirmada! 🎉');
      onComplete({
        id: grupoSelecionado.id,
        name: membrosSelecionados[0] || grupoSelecionado.nomeGrupo,
        nomeGrupo: grupoSelecionado.nomeGrupo,
        confirmados: res.data.confirmados
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao confirmar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-16 px-6 relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10">

        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-center items-center mb-3 max-w-xs mx-auto">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-semibold transition-all duration-300 ${
                  step >= s ? 'bg-wedding-blue text-white' : 'bg-wedding-stone text-slate-400'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 2 && (
                  <div className={`w-32 h-1 mx-4 rounded transition-all duration-300 ${
                    step > s ? 'bg-wedding-blue' : 'bg-wedding-stone'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center font-serif text-sm text-slate-500 uppercase tracking-widest">
            {step === 1 ? 'Buscar meu nome' : 'Confirmar presença'}
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1 — Busca */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-3 text-center">
                Confirme sua presença
              </h2>
              <p className="text-center text-slate-500 mb-10">
                Digite seu nome para encontrar seu convite
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Digite seu nome..."
                  autoFocus
                  className="w-full bg-white border-2 border-wedding-goldLight focus:border-wedding-gold rounded-xl pl-12 pr-4 py-4 font-serif text-xl placeholder:text-slate-300 focus:outline-none transition-colors"
                />
                {buscando && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin w-5 h-5 border-2 border-wedding-blue border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {resultados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 mt-4"
                  >
                    <p className="text-sm text-slate-400 font-serif uppercase tracking-wider mb-2">
                      {resultados.length} resultado{resultados.length > 1 ? 's' : ''} encontrado{resultados.length > 1 ? 's' : ''}:
                    </p>
                    {resultados.map((grupo) => {
                      const confirmados = grupo.membros.filter(m => m.confirmado);
                      return (
                        <motion.button
                          key={grupo.id}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => selecionarGrupo(grupo)}
                          className="w-full bg-wedding-cream hover:bg-wedding-goldLight/30 border-2 border-wedding-goldLight hover:border-wedding-gold rounded-xl p-5 text-left transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-serif text-lg text-wedding-blue font-semibold">
                                {grupo.nomeGrupo}
                              </p>
                              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {grupo.membros.map(m => m.nome).join(', ')}
                              </p>
                              {confirmados.length > 0 && (
                                <p className="text-xs text-green-600 mt-1 font-semibold">
                                  ✓ {confirmados.map(m => m.nome).join(', ')} já confirmado{confirmados.length > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="w-5 h-5 text-wedding-gold group-hover:translate-x-1 transition-transform ml-3" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {semResultado && !buscando && busca.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-6 text-center"
                  >
                    <X className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="font-serif text-lg text-slate-700 mb-1">
                      Não encontramos "<strong>{busca}</strong>"
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      Tente um nome diferente ou avise os noivos.
                    </p>
                    <button
                      onClick={handleNaoEncontrado}
                      className="bg-rose-500 text-white hover:bg-rose-600 rounded-full px-6 py-2 font-serif text-sm transition-all"
                    >
                      Avisar os noivos 💌
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 2 — Seleciona membros */}
          {step === 2 && grupoSelecionado && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-2 text-center">
                {grupoSelecionado.nomeGrupo}
              </h2>
              <p className="text-center text-slate-500 mb-2">
                {jaTemConfirmados ? 'Atualize quem vai comparecer' : 'Selecione quem vai comparecer'}
              </p>
              {jaTemConfirmados && (
                <p className="text-center text-xs text-green-600 mb-6 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Você já confirmou presença anteriormente
                </p>
              )}
              {!jaTemConfirmados && <div className="mb-6" />}

              <div className="space-y-3 mb-8">
                {grupoSelecionado.membros.map((membro) => {
                  const selecionado = membrosSelecionados.includes(membro.nome);
                  const jaConfirmado = membro.confirmado;
                  return (
                    <button
                      key={membro.nome}
                      onClick={() => toggleMembro(membro.nome)}
                      className={`w-full flex items-center justify-between rounded-xl px-5 py-4 border-2 transition-all ${
                        selecionado
                          ? 'bg-wedding-blue/10 border-wedding-blue text-wedding-blue'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-wedding-goldLight'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg">{membro.nome}</span>
                        {jaConfirmado && !selecionado && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                            Desconfirmando...
                          </span>
                        )}
                        {jaConfirmado && selecionado && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            Já confirmado
                          </span>
                        )}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selecionado ? 'bg-wedding-blue border-wedding-blue' : 'border-slate-300'
                      }`}>
                        {selecionado && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mensagem opcional */}
              <div className="mb-8">
                <label className="block font-serif text-sm uppercase tracking-wider text-slate-400 mb-2">
                  Mensagem para os noivos (opcional)
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Deixe um recadinho carinhoso..."
                  rows={3}
                  className="w-full bg-wedding-cream border-2 border-wedding-goldLight focus:border-wedding-gold rounded-xl px-4 py-3 font-sans text-slate-700 placeholder:text-slate-300 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => { setStep(1); setGrupoSelecionado(null); }}
                  disabled={isSubmitting}
                  className="border border-wedding-gold text-wedding-goldDim hover:bg-wedding-cream rounded-full px-8 py-3 font-serif transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full px-8 py-3 font-serif transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Salvando...' : jaTemConfirmados ? 'Atualizar Presença' : 'Confirmar Presença'}
                  {jaTemConfirmados ? <RefreshCw className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RSVPForm;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, ArrowRight, ArrowLeft, Send, Flower2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const RSVPForm = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guestType: 'Amigo(a)',
    companions: []
  });
  const [companionName, setCompanionName] = useState('');
  const [companionAgeGroup, setCompanionAgeGroup] = useState('Adulto');
  const [companionRelation, setCompanionRelation] = useState('Parente');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCompanion = () => {
    if (companionName.trim()) {
      setFormData(prev => ({
        ...prev,
        companions: [...prev.companions, { 
          name: companionName, 
          ageGroup: companionAgeGroup,
          relation: companionRelation
        }]
      }));
      setCompanionName('');
      setCompanionAgeGroup('Adulto');
      setCompanionRelation('Parente');
    }
  };

  const removeCompanion = (index) => {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Por favor, informe seu nome');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/guests`, formData);
      toast.success('Presença confirmada com sucesso!');
      onComplete(response.data);
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      toast.error('Erro ao confirmar presença. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-16 px-6 relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-center items-center mb-3 max-w-md mx-auto">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-semibold transition-all duration-300 ${
                    step >= s ? 'bg-wedding-blue text-white' : 'bg-wedding-stone text-slate-400'
                  }`}
                  data-testid={`step-indicator-${s}`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div className={`w-64 h-1 mx-4 rounded transition-all duration-300 ${
                    step > s ? 'bg-wedding-blue' : 'bg-wedding-stone'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="font-serif text-sm text-slate-500 uppercase tracking-widest">
              {step === 1 && 'Suas Informações'}
              {step === 2 && ''}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12 relative"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-8 text-center">
                Confirme sua presença
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block font-serif text-sm uppercase tracking-wider text-slate-500 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome"
                    data-testid="guest-name-input"
                    className="w-full bg-transparent border-b-2 border-wedding-goldLight focus:border-wedding-gold px-0 py-3 font-serif text-xl placeholder:text-slate-300 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-serif text-sm uppercase tracking-wider text-slate-500 mb-2">
                    Você é *
                  </label>
                  <select
                    value={formData.guestType}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestType: e.target.value }))}
                    data-testid="guest-type-select"
                    className="w-full bg-white border-b-2 border-wedding-goldLight focus:border-wedding-gold px-0 py-3 font-serif text-lg focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Amigo(a)">Amigo(a)</option>
                    <option value="Parente">Parente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-serif text-sm uppercase tracking-wider text-slate-500 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    data-testid="guest-email-input"
                    className="w-full bg-transparent border-b-2 border-wedding-goldLight focus:border-wedding-gold px-0 py-3 font-sans text-lg placeholder:text-slate-300 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-serif text-sm uppercase tracking-wider text-slate-500 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    data-testid="guest-phone-input"
                    className="w-full bg-transparent border-b-2 border-wedding-goldLight focus:border-wedding-gold px-0 py-3 font-sans text-lg placeholder:text-slate-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={() => formData.name.trim() ? setStep(2) : toast.error('Por favor, informe seu nome')}
                  data-testid="rsvp-next-step-1"
                  className="bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full px-8 py-3 font-serif transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Companions */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12 relative"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-slate-800 mb-4 text-center">
                Acompanhantes
              </h2>
              <p className="text-center text-slate-600 mb-8">
                Você vai levar algum acompanhante?
              </p>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCompanion()}
                    placeholder="Nome"
                    data-testid="companion-name-input"
                    className="bg-white/50 border border-wedding-goldLight focus:border-wedding-gold rounded-lg px-4 py-3 font-sans placeholder:text-slate-300 focus:outline-none transition-colors"
                  />
                  <select
                    value={companionAgeGroup}
                    onChange={(e) => setCompanionAgeGroup(e.target.value)}
                    data-testid="companion-age-group-select"
                    className="bg-white/50 border border-wedding-goldLight focus:border-wedding-gold rounded-lg px-4 py-3 font-sans focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Adulto">Adulto</option>
                    <option value="Criança">Criança</option>
                  </select>
                  <select
                    value={companionRelation}
                    onChange={(e) => setCompanionRelation(e.target.value)}
                    data-testid="companion-relation-select"
                    className="bg-white/50 border border-wedding-goldLight focus:border-wedding-gold rounded-lg px-4 py-3 font-sans focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Parente">Parente</option>
                    <option value="Filho(a)">Filho(a)</option>
                    <option value="Parceiro(a)">Parceiro(a)</option>
                  </select>
                </div>
                <button
                  onClick={addCompanion}
                  data-testid="add-companion-button"
                  className="w-full bg-wedding-sage text-white hover:bg-wedding-sage/80 rounded-lg px-4 py-3 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Adicionar Acompanhante
                </button>
              </div>

              {formData.companions.length > 0 && (
                <div className="space-y-2 mb-8" data-testid="companions-list">
                  {formData.companions.map((companion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-wedding-sageLight rounded-lg px-4 py-3"
                    >
                      <span className="font-sans text-slate-700">
                        {companion.name}
                        {companion.ageGroup && ` (${companion.ageGroup})`}
                        {companion.relation && ` - ${companion.relation}`}
                      </span>
                      <button
                        onClick={() => removeCompanion(index)}
                        data-testid={`remove-companion-${index}`}
                        className="text-wedding-roseDust hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-10 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  data-testid="rsvp-back-step-2"
                  className="border border-wedding-gold text-wedding-goldDim hover:bg-wedding-cream rounded-full px-8 py-3 font-serif transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  data-testid="rsvp-submit-button"
                  className="bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full px-8 py-3 font-serif transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Presença'}
                  <Send className="w-5 h-5" />
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
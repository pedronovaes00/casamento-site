import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, ArrowRight, Flower2, Gift, Sparkles } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const InvitationLanding = ({ guest, onContinue }) => {
  const [weddingInfo, setWeddingInfo] = useState(null);

  useEffect(() => {
    const fetchWeddingInfo = async () => {
      try {
        const response = await axios.get(`${API}/wedding-info`);
        setWeddingInfo(response.data);
      } catch (error) {
        console.error('Erro ao carregar informações do casamento:', error);
      }
    };
    fetchWeddingInfo();
  }, []);

  const firstName = guest.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-skyBlue via-wedding-blueLight to-wedding-blue relative overflow-hidden">
      {/* Decorative Flowers - Minimalistas */}
      <Flower2 className="absolute top-10 left-5 w-20 h-20 text-wedding-gold/15 rotate-12 animate-pulse" />
      <Flower2 className="absolute top-32 right-10 w-16 h-16 text-wedding-sage/20 -rotate-45" />
      <Flower2 className="absolute top-1/3 left-20 w-12 h-12 text-wedding-roseDust/25 rotate-90" />
      <Flower2 className="absolute bottom-40 right-1/4 w-14 h-14 text-wedding-goldLight/30 -rotate-12" />
      <Flower2 className="absolute bottom-20 left-1/3 w-16 h-16 text-wedding-sage/25 rotate-45 animate-pulse" />
      <Flower2 className="absolute top-1/2 right-10 w-10 h-10 text-wedding-gold/20 -rotate-90" />
      
      {/* Decorative Abstract Blue */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.06, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/hjorioag_Screenshot_35.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'left top',
          filter: 'blur(3px)'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header with personalized message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6 relative"
          >
            <Heart className="w-16 h-16 text-wedding-roseDust fill-wedding-roseDust" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-wedding-gold animate-pulse" />
          </motion.div>
          
          <h1 className="font-script text-5xl md:text-7xl text-slate-800 mb-6 drop-shadow-md">
            Você está convidado!
          </h1>
          
          <div className="w-24 h-0.5 bg-wedding-gold mx-auto mb-6"></div>
          
          <p className="font-serif text-2xl md:text-3xl text-slate-700 mb-4 font-semibold">
            {firstName}, sua presença é muito importante!
          </p>
          
          <p className="font-sans text-lg text-slate-600 max-w-2xl mx-auto">
            Estamos muito felizes em compartilhar este momento especial com você
          </p>
        </motion.div>

        {/* Action Button - MOVED UP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={onContinue}
            data-testid="view-gifts-button"
            className="group bg-wedding-green hover:bg-[#527653] text-white rounded-full px-10 py-4 font-serif text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center justify-center gap-3"
          >
            <Gift className="w-5 h-5" />
            Ver Presentes e Vaquinhas
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Wedding Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 mb-12 relative"
        >
          {/* Small flower decorations */}
          <Flower2 className="absolute -top-4 -right-4 w-12 h-12 text-wedding-goldLight" />
          <Flower2 className="absolute -bottom-4 -left-4 w-10 h-10 text-wedding-sage/60" />
          
          {weddingInfo?.coupleMessage && (
            <p className="font-serif text-lg text-slate-600 text-center leading-relaxed mb-8 italic">
              "{weddingInfo.coupleMessage}"
            </p>
          )}

          <div className="space-y-6">
            {weddingInfo?.date && (
              <div className="flex items-start gap-4" data-testid="wedding-date-info">
                <Calendar className="w-6 h-6 text-wedding-gold flex-shrink-0 mt-1" />
                <div>
                  <p className="font-serif text-sm uppercase tracking-widest text-slate-400 mb-1">Data</p>
                  <p className="font-sans text-lg text-slate-700">
                    {weddingInfo.date}
                    {weddingInfo.time && ` às ${weddingInfo.time}`}
                  </p>
                </div>
              </div>
            )}

            {weddingInfo?.location && (
              <div className="flex items-start gap-4" data-testid="wedding-location-info">
                <MapPin className="w-6 h-6 text-wedding-gold flex-shrink-0 mt-1" />
                <div>
                  <p className="font-serif text-sm uppercase tracking-widest text-slate-400 mb-1">Local</p>
                  <p className="font-sans text-lg text-slate-700">{weddingInfo.location}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Guest info summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500">
            Confirmado como <span className="font-semibold text-wedding-blue">{guest.guestType}</span>
            {guest.companions.length > 0 && (
              <span> com {guest.companions.length} acompanhante{guest.companions.length > 1 ? 's' : ''}</span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationLanding;

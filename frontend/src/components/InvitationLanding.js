import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, Sparkles, ChevronDown } from 'lucide-react';
import axios from 'axios';
import GiftsAndVaquinhas from './GiftsAndVaquinhas';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const InvitationLanding = ({ guest }) => {
  const [weddingInfo, setWeddingInfo] = useState(null);
  const giftsRef = useRef(null);

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

  const scrollToGifts = () => {
    giftsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const firstName = guest.name.split(' ')[0];

  return (
    <div className="relative">
      {/* Seção de confirmação */}
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6 relative"
            >
              <Heart className="w-16 h-16 text-wedding-roseDust fill-wedding-roseDust" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-white animate-pulse" />
            </motion.div>

            <h1 className="font-script text-4xl md:text-7xl text-slate-800 mb-6 drop-shadow-md">
              Presença Confirmada!
            </h1>

            <div className="w-24 h-0.5 bg-wedding-gold mx-auto mb-6"></div>

            <p className="font-serif text-2xl md:text-3xl text-slate-700 mb-4 font-semibold">
              {firstName}, que alegria ter você com a gente! 🎉
            </p>

            <p className="font-sans text-lg text-slate-600 max-w-2xl mx-auto">
              Estamos muito felizes em compartilhar este momento especial com você
            </p>
          </motion.div>

{/* Botão scroll para presentes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={scrollToGifts}
          >
            <p className="font-serif text-white text-base uppercase tracking-widest">
              Ver presentes & vaquinhas
            </p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>

          {/* Card com info do casamento */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 mb-8 relative"
          >
            {weddingInfo?.coupleMessage && (
              <p className="font-serif text-lg text-slate-600 text-center leading-relaxed mb-8 italic">
                "{weddingInfo.coupleMessage}"
              </p>
            )}

            <div className="space-y-6">
              {weddingInfo?.date && (
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-serif text-sm uppercase tracking-widest text-slate-400 mb-1">Data</p>
                    <p className="font-sans text-lg text-slate-700">
                      {weddingInfo.date}{weddingInfo.time && ` às ${weddingInfo.time}`}
                    </p>
                  </div>
                </div>
              )}
              {weddingInfo?.location && (
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-serif text-sm uppercase tracking-widest text-slate-400 mb-1">Local</p>
                    <p className="font-sans text-lg text-slate-700">{weddingInfo.location}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Confirmados */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-8"
          >
            <p className="text-sm text-slate-500">
              Confirmado: <span className="font-semibold text-wedding-blue">
                {guest.confirmados ? guest.confirmados.join(', ') : guest.name}
              </span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Seção de presentes e vaquinhas */}
      <div ref={giftsRef}>
        <GiftsAndVaquinhas guest={guest} />
      </div>
    </div>
  );
};

export default InvitationLanding;

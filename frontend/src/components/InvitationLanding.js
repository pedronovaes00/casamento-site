import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, ArrowRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const InvitationLanding = ({ onContinueToRSVP }) => {
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

  return (
    <div className="min-h-screen bg-wedding-paper relative overflow-hidden">
      {/* Decorative Abstract Blue */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_casamento-presentes-1/artifacts/hjorioag_Screenshot_35.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'left top',
          filter: 'blur(2px)'
        }}
      />

      {/* Floral Decoration */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 0.12, x: 0 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1762805088436-ffa7b89779a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHx3YXRlcmNvbG9yJTIwZmxvcmFsJTIwd2VkZGluZyUyMGJvcmRlcnxlbnwwfHx8fDE3NzI2MDc5MzN8MA&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'right bottom',
          filter: 'blur(2px)'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
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
            className="inline-block mb-6"
          >
            <Heart className="w-12 h-12 text-wedding-roseDust fill-wedding-roseDust" />
          </motion.div>
          
          <h1 className="font-script text-6xl md:text-8xl text-wedding-blue mb-4">
            Você está convidado
          </h1>
          
          <div className="w-24 h-0.5 bg-wedding-gold mx-auto mb-6"></div>
          
          <p className="font-serif text-xl md:text-2xl text-wedding-blueDark font-light italic">
            Para celebrar o nosso casamento
          </p>
        </motion.div>

        {/* Wedding Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 mb-12"
        >
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

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={onContinueToRSVP}
            data-testid="continue-to-rsvp-button"
            className="group bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full px-10 py-4 font-serif text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-3"
          >
            Confirmar Presença
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationLanding;
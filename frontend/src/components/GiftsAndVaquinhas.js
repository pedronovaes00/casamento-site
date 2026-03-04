import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, QrCode, CheckCircle, Flower2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const GiftsAndVaquinhas = ({ guest }) => {
  const [gifts, setGifts] = useState([]);
  const [vaquinhas, setVaquinhas] = useState([]);
  const [weddingInfo, setWeddingInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('gifts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [giftsRes, vaquinhasRes, infoRes] = await Promise.all([
        axios.get(`${API}/gifts`),
        axios.get(`${API}/vaquinhas`),
        axios.get(`${API}/wedding-info`)
      ]);
      setGifts(giftsRes.data);
      setVaquinhas(vaquinhasRes.data);
      setWeddingInfo(infoRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleClaimGift = async (giftId) => {
    try {
      await axios.put(`${API}/gifts/${giftId}/claim?guest_id=${guest.id}&guest_name=${encodeURIComponent(guest.name)}`);
      toast.success('Presente reservado com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao reservar presente:', error);
      toast.error(error.response?.data?.detail || 'Erro ao reservar presente');
    }
  };

  const availableGifts = gifts.filter(g => !g.isTaken);

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-skyBlue via-wedding-blueLight to-wedding-blue py-16 px-6 relative overflow-hidden">
      {/* Decorative Flowers */}
      <Flower2 className="absolute top-10 right-10 w-20 h-20 text-wedding-gold/15 -rotate-12 animate-pulse" />
      <Flower2 className="absolute top-1/4 left-10 w-14 h-14 text-wedding-sage/20 rotate-45" />
      <Flower2 className="absolute bottom-20 right-1/4 w-16 h-16 text-wedding-roseDust/25 -rotate-90" />
      <Flower2 className="absolute bottom-40 left-1/3 w-12 h-12 text-wedding-goldLight/30 rotate-12" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Heart className="w-12 h-12 text-wedding-roseDust fill-wedding-roseDust mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl text-wedding-blue mb-4">
            Obrigado por confirmar, {guest.name.split(' ')[0]}!
          </h1>
          <p className="font-sans text-lg text-slate-600 max-w-2xl mx-auto">
            Se desejar, você pode nos presentear com um dos itens abaixo ou contribuir com nossas vaquinhas
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('gifts')}
            data-testid="gifts-tab-button"
            className={`px-6 py-3 rounded-full font-serif transition-all ${
              activeTab === 'gifts'
                ? 'bg-wedding-blue text-white shadow-lg'
                : 'bg-white/80 text-wedding-blue hover:bg-white'
            }`}
          >
            <Gift className="w-5 h-5 inline mr-2" />
            Presentes
          </button>
          <button
            onClick={() => setActiveTab('vaquinhas')}
            data-testid="vaquinhas-tab-button"
            className={`px-6 py-3 rounded-full font-serif transition-all ${
              activeTab === 'vaquinhas'
                ? 'bg-wedding-blue text-white shadow-lg'
                : 'bg-white/80 text-wedding-blue hover:bg-white'
            }`}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Vaquinhas
          </button>
        </div>

        {/* Gifts Tab */}
        {activeTab === 'gifts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {availableGifts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500 font-sans">Nenhum presente disponível no momento</p>
              </div>
            ) : (
              availableGifts.map((gift) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                  data-testid={`gift-card-${gift.id}`}
                >
                  {gift.imageUrl && (
                    <div className="aspect-video bg-wedding-stone overflow-hidden">
                      <img
                        src={gift.imageUrl}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-wedding-blue mb-2">{gift.name}</h3>
                    {gift.description && (
                      <p className="text-sm text-slate-600 mb-4">{gift.description}</p>
                    )}
                    {gift.price && (
                      <p className="text-wedding-gold font-semibold mb-4">{gift.price}</p>
                    )}
                    <button
                      onClick={() => handleClaimGift(gift.id)}
                      data-testid={`claim-gift-button-${gift.id}`}
                      className="w-full bg-wedding-sage text-white hover:bg-wedding-sage/80 rounded-lg py-3 font-serif transition-all"
                    >
                      Presentear
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Vaquinhas Tab */}
        {activeTab === 'vaquinhas' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {vaquinhas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 font-sans">Nenhuma vaquinha disponível no momento</p>
              </div>
            ) : (
              vaquinhas.map((vaquinha) => (
                <motion.div
                  key={vaquinha.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8"
                  data-testid={`vaquinha-card-${vaquinha.id}`}
                >
                  <h3 className="font-serif text-2xl text-wedding-blue mb-2">{vaquinha.title}</h3>
                  {vaquinha.description && (
                    <p className="text-slate-600 mb-6">{vaquinha.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Meta: R$ {vaquinha.goal.toFixed(2)}</span>
                      <span className="text-wedding-blue font-semibold">
                        {((vaquinha.currentAmount / vaquinha.goal) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((vaquinha.currentAmount / vaquinha.goal) * 100, 100)}%`,
                          background: 'linear-gradient(135deg, #C5A065 0%, #E5D4B3 50%, #C5A065 100%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* PIX Info */}
                  {(vaquinha.pixKey || vaquinha.qrCodeUrl) && (
                    <div className="bg-wedding-cream rounded-lg p-4">
                      {vaquinha.qrCodeUrl && (
                        <div className="text-center mb-4">
                          <img
                            src={vaquinha.qrCodeUrl}
                            alt="QR Code PIX"
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                      )}
                      {vaquinha.pixKey && (
                        <div>
                          <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                            <QrCode className="w-4 h-4" />
                            Chave PIX:
                          </p>
                          <p className="font-mono text-wedding-blue bg-white px-3 py-2 rounded">
                            {vaquinha.pixKey}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* General Donation */}
            {weddingInfo?.pixKey && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border-2 border-wedding-gold"
                data-testid="general-donation-card"
              >
                <h3 className="font-serif text-2xl text-wedding-blue mb-4">
                  Doação Geral para o Casal
                </h3>
                <p className="text-slate-600 mb-6">
                  Você também pode fazer uma doação geral para nos ajudar!
                </p>

                <div className="bg-wedding-cream rounded-lg p-4">
                  {weddingInfo.qrCodeUrl && (
                    <div className="text-center mb-4">
                      <img
                        src={weddingInfo.qrCodeUrl}
                        alt="QR Code PIX"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      Chave PIX:
                    </p>
                    <p className="font-mono text-wedding-blue bg-white px-3 py-2 rounded">
                      {weddingInfo.pixKey}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GiftsAndVaquinhas;
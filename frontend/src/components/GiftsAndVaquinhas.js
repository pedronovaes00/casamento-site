import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Heart, QrCode, Search, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import DonationModal from './DonationModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Modal de confirmação bonitinho
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, icon }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 z-10 text-center"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-wedding-cream rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
          <h2 className="font-serif text-2xl text-slate-800 mb-2">{title}</h2>
          <p className="text-slate-500 mb-8">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full py-3 font-serif transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full py-3 font-serif transition-all shadow-lg"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const GiftsAndVaquinhas = ({ guest }) => {
  const [gifts, setGifts] = useState([]);
  const [vaquinhas, setVaquinhas] = useState([]);
  const [weddingInfo, setWeddingInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('gifts');
  const [donationVaquinha, setDonationVaquinha] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    giftId: null,
    type: null,
  });

  const [pixModal, setPixModal] = useState(false);
  const [identifyModal, setIdentifyModal] = useState({ isOpen: false, giftId: null, type: 'physical' });
  const [donorQuery, setDonorQuery] = useState('');
  const [donorResults, setDonorResults] = useState([]);
  const [isSearchingDonor, setIsSearchingDonor] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const donorDebounceRef = useRef(null);
  const isReadOnly = !guest?.id;

  useEffect(() => { fetchData(); }, []);

  const normalizar = (str = '') =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const buscarDoador = useCallback(async (termo) => {
    setIsSearchingDonor(true);
    try {
      const res = await axios.get(`${API}/grupos/buscar?nome=${encodeURIComponent(termo)}`);
      const termoNormalizado = normalizar(termo);
      const encontrados = res.data.flatMap((grupo) =>
        grupo.membros
          .filter((membro) => normalizar(membro.nome).includes(termoNormalizado))
          .map((membro) => ({
            id: grupo.id,
            nomeGrupo: grupo.nomeGrupo,
            name: membro.nome
          }))
      );
      setDonorResults(encontrados);
    } catch {
      toast.error('Erro ao buscar convidado. Tente novamente.');
    } finally {
      setIsSearchingDonor(false);
    }
  }, []);

  useEffect(() => {
    if (!identifyModal.isOpen) return;
    if (donorQuery.trim().length < 2) {
      setDonorResults([]);
      setSelectedDonor(null);
      return;
    }
    clearTimeout(donorDebounceRef.current);
    donorDebounceRef.current = setTimeout(() => buscarDoador(donorQuery.trim()), 350);
  }, [donorQuery, identifyModal.isOpen, buscarDoador]);

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

  const handleClaimGift = async (giftId, claimType, guestData = guest) => {
    const claimant = guestData || guest;
    if (!claimant?.id || !claimant?.name) {
      toast.info('Confirme sua presença para reservar um presente 💛');
      return;
    }
    try {
      await axios.put(`${API}/gifts/${giftId}/claim?guest_id=${claimant.id}&guest_name=${encodeURIComponent(claimant.name)}&claim_type=${claimType}`);
      toast.success(claimType === 'pix' ? 'Presente reservado! Agora faça o PIX 💛' : 'Presente reservado com sucesso!');
      fetchData();
      if (claimType === 'pix') {
        setPixModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao reservar presente');
    }
  };

  const handleConfirm = () => {
    const { giftId, type } = confirmModal;
    setConfirmModal({ isOpen: false, giftId: null, type: null });
    handleClaimGift(giftId, type);
  };

  const openIdentifyModal = (giftId, type) => {
    setIdentifyModal({ isOpen: true, giftId, type });
    setDonorQuery('');
    setDonorResults([]);
    setSelectedDonor(null);
  };

  const confirmReadOnlyGiftClaim = async () => {
    if (!selectedDonor) {
      toast.error('Selecione seu nome para confirmar o presente.');
      return;
    }
    const { giftId, type } = identifyModal;
    setIdentifyModal({ isOpen: false, giftId: null, type: 'physical' });
    await handleClaimGift(giftId, type, selectedDonor);
  };

  const availableGifts = gifts.filter(g => !g.isTaken);

  return (
    <div className="min-h-screen bg-transparent py-16 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Heart className="w-12 h-12 text-wedding-roseDust fill-wedding-roseDust mx-auto mb-4" />
          {isReadOnly ? (
            <>
              <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-4 drop-shadow-sm">
                Presentes & Vaquinhas
              </h1>
              <p className="font-sans text-lg text-slate-700 max-w-2xl mx-auto">
                Quer nos presentear? Veja os itens disponíveis e as vaquinhas.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-4 drop-shadow-sm">
                Obrigado por confirmar, {guest.name.split(' ')[0]}!
              </h1>
              <p className="font-sans text-lg text-slate-700 max-w-2xl mx-auto">
                Se desejar, você pode nos presentear com um dos itens abaixo ou contribuir com nossas vaquinhas, qualquer valor já ajuda e muito o casal!
              </p>
            </>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('gifts')}
            data-testid="gifts-tab-button"
            className={`px-6 py-3 rounded-full font-serif transition-all ${activeTab === 'gifts' ? 'bg-wedding-blue text-white shadow-lg' : 'bg-white/80 text-wedding-blue hover:bg-white'}`}
          >
            <Gift className="w-5 h-5 inline mr-2" />Presentes
          </button>
          <button
            onClick={() => setActiveTab('vaquinhas')}
            data-testid="vaquinhas-tab-button"
            className={`px-6 py-3 rounded-full font-serif transition-all ${activeTab === 'vaquinhas' ? 'bg-wedding-blue text-white shadow-lg' : 'bg-white/80 text-wedding-blue hover:bg-white'}`}
          >
            <Heart className="w-5 h-5 inline mr-2" />Vaquinhas
          </button>
        </div>

        {/* Gifts Tab */}
        {activeTab === 'gifts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-wedding-blue mb-2">{gift.name}</h3>
                    {gift.description && (
                      <a
                        href={gift.description}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-wedding-blue hover:underline mb-4"
                      >
                        🔗 Ver produto
                      </a>
                    )}
                    {gift.price && <p className="text-wedding-gold font-semibold mb-4">{gift.price}</p>}
                    {isReadOnly ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openIdentifyModal(gift.id, 'physical')}
                          className="flex-1 min-h-[52px] bg-wedding-sage text-white hover:bg-wedding-sage/80 rounded-lg py-3 px-2 font-serif text-lg leading-none transition-all"
                        >
                          Reservar
                        </button>
                        <button
                          onClick={() => openIdentifyModal(gift.id, 'pix')}
                          className="flex-1 min-h-[52px] bg-wedding-gold/80 text-white hover:bg-wedding-gold rounded-lg py-3 px-2 font-serif text-lg leading-none transition-all"
                        >
                          PIX
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, giftId: gift.id, type: 'physical' })}
                          data-testid={`claim-gift-button-${gift.id}`}
                          className="flex-1 min-h-[52px] bg-wedding-sage text-white hover:bg-wedding-sage/80 rounded-lg py-3 px-2 font-serif text-lg leading-none transition-all"
                        >
                          Reservar
                        </button>
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, giftId: gift.id, type: 'pix' })}
                          className="flex-1 min-h-[52px] bg-wedding-gold/80 text-white hover:bg-wedding-gold rounded-lg py-3 px-2 font-serif text-lg leading-none transition-all"
                        >
                          PIX
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Vaquinhas Tab */}
        {activeTab === 'vaquinhas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
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
                  {vaquinha.description && <p className="text-slate-600 mb-6">{vaquinha.description}</p>}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Meta: <span className="font-semibold text-slate-700">R$ {vaquinha.goal.toFixed(2)}</span></span>
                      <span className="text-wedding-blue font-semibold">{((vaquinha.currentAmount / vaquinha.goal) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((vaquinha.currentAmount / vaquinha.goal) * 100, 100)}%`, background: 'linear-gradient(135deg, #E5D4B3 0%, #E5D4B3 50%, rgb(255, 235, 146) 100%)' }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Arrecadado:</span>
                      <span className="font-semibold text-wedding-gold">R$ {vaquinha.currentAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDonationVaquinha(vaquinha)}
                    className="w-full bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-lg py-3 font-serif transition-all shadow-lg mb-4"
                  >
                    <Heart className="w-4 h-4 inline mr-2" />Contribuir
                  </button>
                  {(vaquinha.pixKey || vaquinha.qrCodeUrl) && (
                    <div className="bg-wedding-cream rounded-lg p-4">
                      {vaquinha.qrCodeUrl && (
                        <div className="text-center mb-4">
                          <img src={vaquinha.qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                        </div>
                      )}
                      {vaquinha.pixKey && (
                        <div>
                          <p className="text-sm text-slate-500 mb-1 flex items-center gap-2"><QrCode className="w-4 h-4" />Chave PIX:</p>
                          <p className="font-mono text-wedding-blue bg-white px-3 py-2 rounded">{vaquinha.pixKey}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {weddingInfo?.pixKey && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 border-2 border-wedding-gold"
                data-testid="general-donation-card"
              >
                <h3 className="font-serif text-2xl text-wedding-blue mb-4">Doação Geral para o Casal</h3>
                <p className="text-slate-600 mb-6">Você também pode fazer uma doação geral para nos ajudar, com o valor que puder!</p>
                <div className="bg-wedding-cream rounded-lg p-4">
                  {weddingInfo.qrCodeUrl && (
                    <div className="text-center mb-4">
                      <img src={weddingInfo.qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-2"><QrCode className="w-4 h-4" />Chave PIX:</p>
                    <p className="font-mono text-wedding-blue bg-white px-3 py-2 rounded">{weddingInfo.pixKey}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal de confirmação - Presentear */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'physical'}
        onClose={() => setConfirmModal({ isOpen: false, giftId: null, type: null })}
        onConfirm={handleConfirm}
        title="Confirmar Presente"
        message="Você quer reservar este presente para dar ao casal?"
        confirmLabel="Sim, tenho certeza, vou presentear!"
        icon={<Gift className="w-8 h-8 text-wedding-sage" />}
      />

      {/* Modal de confirmação - PIX */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'pix'}
        onClose={() => setConfirmModal({ isOpen: false, giftId: null, type: null })}
        onConfirm={handleConfirm}
        title="Confirmar Doação via PIX"
        message="Você quer realizar a doação via PIX para este presente?"
        confirmLabel="Sim, vou fazer o PIX!"
        icon={<QrCode className="w-8 h-8 text-wedding-gold" />}
      />

      {/* Modal PIX - abre após confirmar doação via pix */}
      {pixModal && weddingInfo && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPixModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 z-10 text-center"
            >
              <button onClick={() => setPixModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
              <QrCode className="w-12 h-12 text-wedding-blue mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-slate-800 mb-2">Faça o PIX</h2>
              <p className="text-slate-500 mb-6">Use a chave ou QR code abaixo para realizar a doação</p>
              <div className="bg-wedding-cream rounded-lg p-4">
                {weddingInfo.qrCodeUrl && (
                  <div className="text-center mb-4">
                    <img src={weddingInfo.qrCodeUrl} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                  </div>
                )}
                {weddingInfo.pixKey && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center justify-center gap-2"><QrCode className="w-4 h-4" />Chave PIX:</p>
                    <p className="font-mono text-wedding-blue bg-white px-3 py-2 rounded text-sm break-all">{weddingInfo.pixKey}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setPixModal(false)}
                className="w-full mt-6 bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full py-3 font-serif transition-all shadow-lg"
              >
                Feito!
              </button>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Modal de identificação para etapa pública */}
      {identifyModal.isOpen && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIdentifyModal({ isOpen: false, giftId: null, type: 'physical' })}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 z-10"
            >
              <button
                onClick={() => setIdentifyModal({ isOpen: false, giftId: null, type: 'physical' })}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-serif text-2xl text-slate-800 mb-2">Quem vai presentear?</h2>
              <p className="text-slate-500 mb-5">
                Digite seu nome, selecione na lista e confirme o presente.
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={donorQuery}
                  onChange={(e) => setDonorQuery(e.target.value)}
                  placeholder="Digite seu nome..."
                  className="w-full border-2 border-wedding-goldLight focus:border-wedding-gold rounded-lg pl-10 pr-4 py-3 focus:outline-none"
                  autoFocus
                />
              </div>

              {isSearchingDonor && <p className="text-sm text-slate-400 mb-3">Buscando...</p>}

              {!isSearchingDonor && donorQuery.trim().length >= 2 && donorResults.length === 0 && (
                <p className="text-sm text-rose-500 mb-4">Nenhum nome encontrado. Tente novamente.</p>
              )}

              <div className="max-h-56 overflow-y-auto space-y-2 mb-6">
                {donorResults.map((donor) => {
                  const isSelected = selectedDonor?.id === donor.id && selectedDonor?.name === donor.name;
                  return (
                    <button
                      key={`${donor.id}-${donor.name}`}
                      onClick={() => setSelectedDonor({ id: donor.id, name: donor.name })}
                      className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                        isSelected
                          ? 'border-wedding-blue bg-wedding-blue/10'
                          : 'border-slate-200 hover:border-wedding-goldLight'
                      }`}
                    >
                      <p className="font-semibold text-wedding-blue">{donor.name}</p>
                      <p className="text-xs text-slate-500">{donor.nomeGrupo}</p>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={confirmReadOnlyGiftClaim}
                disabled={!selectedDonor}
                className="w-full bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full py-3 font-serif transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar presente
              </button>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Donation Modal */}
      <DonationModal
        vaquinha={donationVaquinha}
        isOpen={!!donationVaquinha}
        onClose={() => setDonationVaquinha(null)}
        onDonationComplete={fetchData}
        guest={guest}
      />
    </div>
  );
};

export default GiftsAndVaquinhas;

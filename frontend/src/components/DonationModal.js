import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, QrCode } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const DonationModal = ({ vaquinha, isOpen, onClose, onDonationComplete }) => {
  const [step, setStep] = useState(1); // 1: amount input, 2: qr code, 3: confirmation
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Por favor, digite um valor válido');
      return;
    }

    setIsProcessing(true);
    try {
      // For simplicity, just show the existing QR code and move to step 2
      // In a real app with dynamic PIX, you'd generate here
      setStep(2);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDonation = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`${API}/vaquinhas/${vaquinha.id}/donate`, {
        vaquinha_id: vaquinha.id,
        amount: parseFloat(amount),
        donor_name: donorName || 'Anônimo'
      });
      
      toast.success(`Doação de R$ ${parseFloat(amount).toFixed(2)} registrada!`);
      setStep(3);
      
      // Call parent callback to refresh data
      if (onDonationComplete) {
        onDonationComplete();
      }
      
      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      toast.error('Erro ao registrar doação');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    setDonorName('');
    setQrCodeData('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-10"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Step 1: Amount Input */}
          {step === 1 && (
            <div className="text-center">
              <Heart className="w-12 h-12 text-wedding-roseDust fill-wedding-roseDust mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-slate-800 mb-2">{vaquinha.title}</h2>
              <p className="text-slate-600 mb-6">Quanto você deseja doar?</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  autoFocus
                  className="w-full text-center text-3xl font-bold text-wedding-blue border-2 border-wedding-goldLight focus:border-wedding-gold rounded-lg px-4 py-4 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Seu Nome (opcional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Anônimo"
                  className="w-full border border-slate-300 focus:border-wedding-blue rounded-lg px-4 py-2 focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={isProcessing}
                className="w-full bg-wedding-green hover:bg-wedding-greenDark text-white rounded-full py-3 font-serif text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isProcessing ? 'Processando...' : 'Continuar'}
              </button>
            </div>
          )}

          {/* Step 2: QR Code */}
          {step === 2 && (
            <div className="text-center">
              <QrCode className="w-12 h-12 text-wedding-blue mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-slate-800 mb-2">Escaneie o QR Code</h2>
              <p className="text-slate-600 mb-4">
                Valor: <span className="font-bold text-wedding-green text-xl">R$ {parseFloat(amount).toFixed(2)}</span>
              </p>

              {/* QR Code Display */}
              <div className="bg-white p-4 rounded-lg mb-6 border-2 border-wedding-goldLight">
                {vaquinha.qrCodeUrl ? (
                  <img src={vaquinha.qrCodeUrl} alt="QR Code PIX" className="w-64 h-64 mx-auto" />
                ) : (
                  <div className="w-64 h-64 mx-auto flex items-center justify-center bg-slate-100 rounded">
                    <p className="text-slate-400">QR Code não disponível</p>
                  </div>
                )}
              </div>

              {vaquinha.pixKey && (
                <div className="mb-6 text-left">
                  <p className="text-sm text-slate-500 mb-1">Chave PIX:</p>
                  <p className="font-mono text-sm bg-slate-100 px-3 py-2 rounded">{vaquinha.pixKey}</p>
                </div>
              )}

              <p className="text-sm text-slate-500 mb-6">
                ⚠️ Lembre-se de enviar exatamente <span className="font-bold">R$ {parseFloat(amount).toFixed(2)}</span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full py-3 font-serif transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmDonation}
                  disabled={isProcessing}
                  className="flex-1 bg-wedding-green hover:bg-wedding-greenDark text-white rounded-full py-3 font-serif transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isProcessing ? 'Confirmando...' : 'Confirmei o Pagamento'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Heart className="w-10 h-10 text-green-600 fill-green-600" />
              </motion.div>
              <h2 className="font-serif text-2xl text-slate-800 mb-2">Doação Registrada!</h2>
              <p className="text-slate-600 mb-2">
                R$ {parseFloat(amount).toFixed(2)} foi adicionado à vaquinha
              </p>
              <p className="text-sm text-slate-500">Muito obrigado! ❤️</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonationModal;

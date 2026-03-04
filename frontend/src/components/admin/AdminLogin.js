import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Lock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminLogin = ({ onLoginSuccess }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!adminId || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/admin/login`, {
        adminId,
        password
      });
      
      localStorage.setItem('adminToken', response.data.token);
      toast.success('Login realizado com sucesso!');
      onLoginSuccess(response.data.token);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error(error.response?.data?.detail || 'Credenciais inválidas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-skyBlue via-wedding-blueLight to-wedding-blue flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-wedding-roseDust fill-wedding-roseDust mx-auto mb-4" />
            <h1 className="font-serif text-3xl text-wedding-blue mb-2">
              Painel Administrativo
            </h1>
            <p className="text-slate-600 text-sm">Acesso restrito aos noivos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-serif text-sm uppercase tracking-wider text-slate-500 mb-2">
                ID do Administrador
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Digite seu ID"
                data-testid="admin-id-input"
                className="w-full bg-white/50 border border-wedding-goldLight focus:border-wedding-gold rounded-lg px-4 py-3 font-sans placeholder:text-slate-300 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-serif text-sm uppercase tracking-wider text-slate-500 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                data-testid="admin-password-input"
                className="w-full bg-white/50 border border-wedding-goldLight focus:border-wedding-gold rounded-lg px-4 py-3 font-sans placeholder:text-slate-300 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="admin-login-button"
              className="w-full bg-wedding-blue text-white hover:bg-wedding-blueDark rounded-full py-3 font-serif transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>ID padrão: noivos2024</p>
            <p>Senha padrão: casamento123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
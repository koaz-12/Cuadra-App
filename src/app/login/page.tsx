'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('¡Registro exitoso! Ya puedes iniciar sesión.');
                setIsSignUp(false); // Switch to login
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/'); // Redirect to dashboard
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Cuadra</h1>
                    <p className="text-slate-500">
                        {isSignUp ? 'Crea tu cuenta para empezar' : 'Inicia sesión para continuar'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail size={20} />
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock size={20} />
                            </span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            isSignUp ? 'Crear Cuenta' : 'Entrar'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Entrar' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    );
}

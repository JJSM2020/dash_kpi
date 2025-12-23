import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../lib/supabase';

interface AuthProps {
    onSuccess: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // BYPASS TEMPORÁRIO DE VALIDAÇÃO
            // if (isSignUp) { ... } else { ... }
            showToast('Login bypass ativo: Acesso permitido!', 'success');
            onSuccess();
            return;

            /* CÓDIGO ORIGINAL DESABILITADO
            if (isSignUp) {
                const { error } = await signUpWithEmail(email, password);
                if (error) {
                    if (error.message.includes('already registered')) {
                        showToast('Este email já está cadastrado.', 'error');
                    } else {
                        showToast('Falha no cadastro. Verifique seus dados.', 'error');
                    }
                } else {
                    showToast('Cadastro realizado! Verifique seu email.', 'success');
                }
            } else {
                const { error } = await signInWithEmail(email, password);
                if (error) {
                    if (error.message.includes('Invalid login')) {
                        showToast('Senha inválida. Tente novamente.', 'error');
                    } else {
                        showToast('Falha no login. Verifique seus dados.', 'error');
                    }
                } else {
                    showToast('Login realizado com sucesso!', 'success');
                    onSuccess();
                }
            }
            */
        } catch (err) {
            showToast('Ocorreu um erro ao se comunicar com o servidor.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
            // O redirecionamento é automático pelo Supabase
        } catch (error) {
            showToast('Falha no login com Google.', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#1f2937]">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#ffffff]">
                        {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {isSignUp ? 'Preencha os dados para começar' : 'Entre com suas credenciais'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="relative block w-full rounded-md border-0 bg-gray-700 py-3 px-3 text-[#ffffff] shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#3b82f6] sm:text-sm sm:leading-6"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full rounded-md border-0 bg-gray-700 py-3 px-3 text-[#ffffff] shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#3b82f6] sm:text-sm sm:leading-6"
                                placeholder="Senha"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-[#3b82f6] px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6] hover:ring-2 hover:ring-[#3b82f6] hover:ring-offset-2 hover:ring-offset-[#1f2937] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                {loading && !isSignUp /* Spinner simples apenas illustrative se for login email */ ? (
                                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <span className="material-symbols-outlined h-5 w-5 text-blue-200 group-hover:text-blue-100" aria-hidden="true">lock</span>
                                )}
                            </span>
                            {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#1f2937] px-2 text-gray-400">Ou continue com</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-white px-3 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white hover:ring-2 hover:ring-[#3b82f6] hover:ring-offset-2 hover:ring-offset-[#1f2937] transition-all duration-300 ease-in-out"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                            </span>
                            Entrar com Google
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm font-medium text-[#3b82f6] hover:text-blue-400 transition-colors"
                    >
                        {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ease-in-out transform translate-y-0 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ClientLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/app/patents');
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <div className="layout-container flex h-full grow flex-col">
                <div className="flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col w-full flex-1">
                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                            {/* Left Side: Form Section */}
                            <div className="flex flex-col justify-center items-center bg-white dark:bg-[#121520] p-8 sm:p-12 md:p-16">
                                <div className="w-full max-w-md">
                                    <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
                                        <span className="material-symbols-outlined text-[#1e40af] text-4xl">hexagon</span>
                                        <h2 className="text-2xl font-bold text-[#111827] dark:text-white">{t('appName')}</h2>
                                    </div>
                                    <h1 className="text-[#111827] dark:text-white tracking-tight text-[32px] font-bold leading-tight text-left pb-3 pt-6">{t('login.welcomeBack')}</h1>
                                    <form className="flex flex-col gap-4 mt-6" onSubmit={handleLogin}>
                                        <div className="flex flex-wrap items-end gap-4">
                                            <label className="flex flex-col w-full flex-1">
                                                <p className="text-[#111827] dark:text-gray-300 text-base font-medium leading-normal pb-2">{t('login.emailLabel')}</p>
                                                <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111827] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#1e40af]/50 border border-[#d1d5db] dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-[#1e40af] h-14 placeholder:text-[#656d86] p-[15px] text-base font-normal leading-normal" placeholder={t('login.emailPlaceholder')} type="email" />
                                            </label>
                                        </div>
                                        <div className="flex flex-wrap items-end gap-4">
                                            <label className="flex flex-col w-full flex-1">
                                                <div className="flex justify-between items-baseline">
                                                    <p className="text-[#111827] dark:text-gray-300 text-base font-medium leading-normal pb-2">{t('login.passwordLabel')}</p>
                                                    <p className="text-[#1e40af] text-sm font-normal leading-normal pb-3 pt-1 underline cursor-pointer hover:text-[#1e40af]/80">{t('login.forgotPassword')}</p>
                                                </div>
                                                <div className="flex w-full flex-1 items-stretch rounded-lg">
                                                    <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111827] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#1e40af]/50 border border-[#d1d5db] dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-[#1e40af] h-14 placeholder:text-[#656d86] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal" placeholder={t('login.passwordPlaceholder')} type="password" />
                                                    <div className="text-[#656d86] dark:text-gray-400 flex border border-[#d1d5db] dark:border-gray-600 bg-white dark:bg-gray-800 items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                                                        <span className="material-symbols-outlined cursor-pointer">visibility_off</span>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                        <button type="submit" className="flex items-center justify-center gap-2 px-6 py-4 h-14 rounded-lg bg-[#1e40af] text-white text-base font-semibold leading-normal mt-4 hover:bg-[#1e40af]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e40af]">
                                            {t('login.signIn')}
                                        </button>
                                    </form>
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <p className="text-[#656d86] dark:text-gray-400 text-sm font-normal leading-normal">{t('login.dontHaveAccount')}</p>
                                        <a className="text-[#1e40af] text-sm font-semibold leading-normal underline" href="#">{t('login.createAccount')}</a>
                                    </div>
                                </div>
                            </div>
                            {/* Right Side: Visual Section */}
                            <div className="hidden lg:flex flex-col items-center justify-center bg-[#1e40af] text-white p-12 lg:p-16">
                                <div className="flex flex-col max-w-lg text-center items-center">
                                    <div className="flex w-full grow bg-white @container p-0">
                                        <div className="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-square rounded-lg flex">
                                            <div className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-lg flex-1" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC5O3dcmoMGr3VcSOA1cSC24yOdwo5jDr_YSHeKmmdc1FhUSejKOI0mjg64siJs8wS2Uv7yG6fD-jbIwdGABaJZE1YE7A13Zstdski5CPZSQFrvmm6X9TYpfEYXakevx_uPbdjauaVCgxMk4MxjRUhozItKPRf4oj1Wi54p4yu9IK15paflIn9exZCKP8B0nQfoGfUGbmlLHz1nsQvCEi74j9nvrccs4KPmn8P9Y-hkm04i3_r6aGLlw6mIL_0spKGuZr5f7Au6ew")' }}></div>
                                        </div>
                                    </div>
                                    <h3 className="text-white tracking-tight text-[28px] font-bold leading-tight mt-10">{t('login.protectMatters')}</h3>
                                    <p className="text-white/80 text-lg font-normal leading-relaxed mt-4">{t('login.protectDesc')}</p>
                                    <div className="flex justify-center items-center gap-2 mt-10">
                                        <div className="h-2 w-2 rounded-full bg-white/50"></div>
                                        <div className="h-2 w-4 rounded-full bg-white"></div>
                                        <div className="h-2 w-2 rounded-full bg-white/50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientLoginPage;

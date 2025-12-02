import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-[#f6f6f8] dark:bg-[#111621]">
            <div className="layout-container flex h-full grow flex-col">
                {/* TopNavBar */}
                <div className="w-full bg-[#0F172A]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-white/10 h-20">
                            <div className="flex items-center gap-4 text-white cursor-pointer" onClick={() => navigate('/')}>
                                <div className="size-6">
                                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fillRule="evenodd"></path>
                                        <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">{t('appName')}</h2>
                            </div>
                            <div className="flex flex-1 justify-end items-center gap-8">
                                <div className="hidden md:flex items-center gap-9">
                                    <a className="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">{t('landing.nav.features')}</a>
                                    <a className="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">{t('landing.nav.pricing')}</a>
                                    <a className="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">{t('landing.nav.about')}</a>
                                    <a className="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors cursor-pointer" onClick={() => navigate('/staff-login')}>{t('login.staffPortal')}</a>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent border border-white text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-colors"
                                >
                                    <span className="truncate">{t('login.clientLogin')}</span>
                                </button>
                            </div>
                        </header>
                    </div>
                </div>

                {/* HeroSection */}
                <div className="w-full bg-[#0F172A]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div
                            className="flex min-h-[560px] flex-col items-center justify-center gap-8 py-20 text-center bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDi8_yYRiWDvv5lzBqLJjuctgvl0JHgzd76pswZhyAMvRzBjbMtSTc10vWvEFLaJRdVM7wxP5HPaCGcOPFgQxnvro6JA-Jdw2xIqbkHMIyzqvJvP8eW8ZyPHoB8TnPnZS_1SEhDeqs8NmU3N0LRnJMC4lI8mAYA-6ExM4uxQ-zn-70b_eGghWz444MmeABus00LUs4V48WJxsFa755-GnGYfZx4ZCwh7LG12k4Z_DP7jmpsZFWCzFL_mgExWcshWPSDxiNSHkBBDQ")'
                            }}
                        >
                            <div className="flex flex-col gap-4 max-w-4xl">
                                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl">
                                    {t('landing.heroTitle')}
                                </h1>
                                <p className="text-white/80 text-base font-normal leading-normal md:text-xl">
                                    {t('landing.heroSubtitle')}
                                </p>
                            </div>
                            <div className="flex-wrap gap-4 flex">
                                <button
                                    onClick={() => navigate('/app/patents')}
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#4169E1] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors"
                                >
                                    <span className="truncate">{t('landing.requestDemo')}</span>
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-transparent border border-white text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-colors"
                                >
                                    <span className="truncate">{t('login.clientLogin')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="w-full bg-[#F8F9FA] dark:bg-gray-800 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h4 className="text-center text-sm font-bold uppercase tracking-widest text-[#6C757D] dark:text-gray-400 mb-8">{t('landing.trustedBy')}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
                            {[
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuDCRiRm4mf4qttLxVKu709NKFePtxCn2OTpMKc9oLf4nwlqZjy95PLQ-dtLhQnvg64yoH6evlfN5tf6AzMxzh08lVqEFXrL66iyMq3SAdjT3eu5SPfyDkCOjFDRDojS10dw1OiXy-WgqYKP2MdPEV21bfYhjtw6N22YQ8uaCPweSv1iq5dNBC8cf2ooWnO5b9Mul_UF0iLXTIUGTZ1lYtEX4g3bSBzx5kgCYKStyU7FPyAtH_ftbt3Ichx2R7ep-VJxIKJeQBzrMg",
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuAJnulM0hhc9iE47gNYAWRu7XP4LY3EpYxrm2XR0HjmbA1dQW2p-KyFl0VTvLeGk4AI9Tu9XPmo2lFYadoWkfErJ5PxrTufsaDl0U1kJUBPFmK1DXKYezi9wqAJMkuCR4pHvr2gFwTqhd20uylQUV12XsNlYxk3Z_X0O6NZjvNgbwp-whhKXz1itc2EZuhwYUksZJDYFNPs35QCn_RKF6WyHkTGt7YOZFfKPqZObOPUMwVMKIwvxWdelneCzyr8_DvJ7i_PaXvfPg",
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuCJMI5Xxb_nTILWL2HL7wBbgaf2TthhS5yqeIE9Bx9xy1hNcE853ZcywcLwtLwtPxoPkzIU5zoFtPJX7sZP5lkJLMv4ytgFSqYmQha_T8HGgTnFpGnSwzbtfppggBC4BlXmVNGg-Hn8xlM6AxWJ1kIzOpUUXTMnn3m2lBiOGZagtnC4TqjSESfhSN6gYN8VZdTjWn42-EzDBSZOTEcoElOAQDaXOoF2bRNHn6hZr1ssjMqDtopCMpF6O6oBbo8SBgr5MGmPXkFGMA",
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuDF1NLrAIoKaNV-B4E4hEop7DqAAvboe90wD2Qi8pu1Mx2ORyr4Bimsve2R8y5LuZORqTiuW_-z2I99EfjTTRii3gvuDCwhDx_p5y7fnhFoqd9g7CnmP80PgfJIOKzCvV-5FyRd3HvPZ3fWwpac6BTMm-3_JzYsi0eQsOj0G2Pq0RCukMyjZKFqIlGEC0U_vcwPzeR5YNkw9TNaHLSfbQypUx6uzxVHMy_aLLvr_UBXNGW1KfTfSrgfHNUdKmDmgK6kgwrPosBNeA",
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuBXzlL2uqZnO65-rWHRkjYDVKZ2lvtq8zZHvpB5ZH6DO3Uork4i8PkG6lnP_Ju-YG7c1Emv4FMXxkDsq4D7_Wp-WCp1UCRPQSQXS8827QexCGXBK5Xu7QZpJZxVcYQh6-px0dsWfy59_VOCOIjI-_d7WtjQJaXIJIVVacAI2UycOZAVU00ZeYJ-p-KGSIgCz6K39SuN9L13O5-wN0tEU-uF_rRJdW--zAJRsOcCS9DCtT4vAOPC7E8eAOjs_YDgSaOyfJabZQ_xWg",
                                "https://lh3.googleusercontent.com/aida-public/AB6AXuDbkUIHOi9294l0BRxWsx1Ct22o3cclWRzMubPAP6TpaAtnjWk2FVLYrUcta9cfm14Wbt8CAAKFi19cWAjC0-l7wg75aVxqbiFTghXE5XleZMWGiv34lWqh2AVnQvDMSU-pjIZw6gHqJOOVvT_6LFGoaP01LviPsk-PkotF1cg8zM2udQO4lnN0X9_gfB50t0N-rs80xaRz6FkFR5d8Jw1zd6GXdlsg1NVxoSuApQZnuWJcDlfT61fQi1T_JVcJwoQsT1weno-Y2Q"
                            ].map((src, i) => (
                                <img key={i} className="mx-auto filter grayscale opacity-60 hover:opacity-100 transition-opacity" src={src} alt="Company Logo" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* FeatureSection */}
                <div className="w-full bg-white dark:bg-background-dark py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-12">
                            <div className="flex flex-col gap-4 text-center">
                                <h1 className="text-[#343A40] dark:text-white tracking-tight text-3xl font-black md:text-4xl max-w-3xl mx-auto">
                                    {t('landing.whyChoose', { appName: t('appName') })}
                                </h1>
                                <p className="text-[#6C757D] dark:text-gray-400 text-base font-normal leading-normal max-w-3xl mx-auto md:text-lg">
                                    {t('landing.heroSubtitle')}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex flex-col gap-4 rounded-lg border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center items-center">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#4169E1]/10 mb-4">
                                        <span className="material-symbols-outlined text-[#4169E1] text-4xl">security</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-[#343A40] dark:text-white text-xl font-bold leading-tight">{t('landing.features.security.title')}</h2>
                                        <p className="text-[#6C757D] dark:text-gray-400 text-base font-normal leading-normal">
                                            {t('landing.features.security.desc')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 rounded-lg border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center items-center">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#4169E1]/10 mb-4">
                                        <span className="material-symbols-outlined text-[#4169E1] text-4xl">schedule</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-[#343A40] dark:text-white text-xl font-bold leading-tight">{t('landing.features.deadline.title')}</h2>
                                        <p className="text-[#6C757D] dark:text-gray-400 text-base font-normal leading-normal">
                                            {t('landing.features.deadline.desc')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 rounded-lg border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center items-center">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#4169E1]/10 mb-4">
                                        <span className="material-symbols-outlined text-[#4169E1] text-4xl">language</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-[#343A40] dark:text-white text-xl font-bold leading-tight">{t('landing.features.global.title')}</h2>
                                        <p className="text-[#6C757D] dark:text-gray-400 text-base font-normal leading-normal">
                                            {t('landing.features.global.desc')}
                                        </p>
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

export default LandingPage;

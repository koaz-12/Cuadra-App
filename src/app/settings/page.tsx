'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    ProfileSettings,
    SecuritySettings,
    PersonalizationSettings,
    NotificationSettings,
    BudgetSettings,
    CloudSyncSettings,
    DataManagementSettings
} from '@/components/organisms/settings';

export default function SettingsPage() {
    const { user } = useAuth();
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setOpenSection(prev => prev === section ? null : section);
    };

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 font-sans pb-24">
            <header className="mb-6 md:mb-8 max-w-5xl mx-auto flex items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Ajustes</h1>
                    <p className="text-sm md:text-base text-slate-500">Gestión de datos y configuración</p>
                </div>
            </header>

            <div className="max-w-5xl mx-auto space-y-6">

                <div className="pt-2"></div>
                <ProfileSettings
                    isOpen={openSection === 'profile'}
                    onToggle={() => toggleSection('profile')}
                />

                {user && (
                    <SecuritySettings
                        isOpen={openSection === 'security'}
                        onToggle={() => toggleSection('security')}
                    />
                )}

                <PersonalizationSettings
                    isOpen={openSection === 'personalization'}
                    onToggle={() => toggleSection('personalization')}
                />

                <div className="pt-2"></div>
                <NotificationSettings
                    isOpen={openSection === 'notifications'}
                    onToggle={() => toggleSection('notifications')}
                />

                {user && (
                    <>
                        <div className="pt-2"></div>
                        <BudgetSettings
                            isOpen={openSection === 'budget'}
                            onToggle={() => toggleSection('budget')}
                        />
                    </>
                )}

                <div className="pt-2"></div>
                <CloudSyncSettings
                    isOpen={openSection === 'cloud'}
                    onToggle={() => toggleSection('cloud')}
                />

                <div className="pt-2"></div>
                <DataManagementSettings
                    isOpen={openSection === 'local_data'}
                    onToggle={() => toggleSection('local_data')}
                />

            </div>
        </main>
    );
}

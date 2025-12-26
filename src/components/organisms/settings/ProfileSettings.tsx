import React, { useState, useRef, useEffect } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, uploadAvatar } from '@/services/userService';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const ProfileSettings = ({ isOpen, onToggle }: Props) => {
    const { user, refreshUser } = useAuth();
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await updateProfile({ fullName });
            await refreshUser();
            alert('Perfil actualizado correctamente.');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setLoading(true);
        try {
            const publicUrl = await uploadAvatar(file, user.id);
            setAvatarUrl(publicUrl);
            await updateProfile({ avatarUrl: publicUrl });
            await refreshUser();
        } catch (error) {
            console.error(error);
            alert('Error al subir la imagen. Asegúrate de que pese menos de 2MB.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <CollapsibleSection
            title="Perfil de Usuario"
            description="Información personal"
            icon={User}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-blue-600 bg-blue-50"
        >
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                                <User className="w-12 h-12 text-slate-300" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button onClick={() => avatarInputRef.current?.click()} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                        Cambiar Foto
                    </button>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all font-bold disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={16} />}
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};

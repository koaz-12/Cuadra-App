import { supabase } from '@/lib/supabase';

export const updateProfile = async (updates: { fullName?: string, avatarUrl?: string }) => {
    const { data, error } = await supabase.auth.updateUser({
        data: {
            full_name: updates.fullName,
            avatar_url: updates.avatarUrl,
        }
    });

    if (error) throw error;
    return data;
};

export const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) throw error;
    return data;
};

export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
    // 1. Upload to 'avatars' bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

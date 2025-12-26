'use client';

import { useEffect } from 'react';

export const ThemeManager = () => {
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return null;
};

import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
    value?: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    name?: string;
    currency?: 'DOP' | 'USD';
    required?: boolean;
    autoFocus?: boolean;
    onBlur?: () => void;
}

export const CurrencyInput = ({ value, onChange, placeholder, className, name, currency = 'DOP', required, autoFocus, onBlur }: CurrencyInputProps) => {
    // Internal state for display
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value === undefined || value === null || value === '') {
            setDisplayValue('');
            return;
        }

        // Format initialization
        const numVal = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numVal)) {
            // Check if user is typing (don't override strict formatting if focus? 
            // Actually, we usually want to format on blur or controlled.
            // For "automatic as you type", we need to format the raw input string.
            // But doing full locale format on every keystroke can be annoying (jumps cursor).
            // Let's use simple comma separation.
            const parts = value.toString().split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            setDisplayValue(parts.join('.'));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 1. Get raw input
        let val = e.target.value;

        // 2. Remove non-numeric chars (allow dot)
        const rawValue = val.replace(/,/g, '');

        // Validation: is it a valid number?
        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            // 3. Update Parent with RAW value
            onChange(rawValue);

            // 4. Update Local Display with Commas
            if (rawValue === '') {
                setDisplayValue('');
            } else {
                const parts = rawValue.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                setDisplayValue(parts.join('.'));
            }
        }
    };

    // To properly support "Format as you type" without cursor jumping, we need a ref to the input.
    // Simplifying: Just formatting.
    // Actually, usually users are okay with cursor jumping to end if they are just typing digits straight.
    // Issues arise when editing middle.

    return (
        <input
            type="text"
            inputMode="decimal"
            name={name}
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            required={required}
            autoFocus={autoFocus}
            onBlur={onBlur}
        />
    );
};

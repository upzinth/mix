import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ className, variant = 'primary', ...props }) {
    const variants = {
        primary: 'bg-amber-500 hover:bg-amber-600 text-black font-semibold',
        secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white',
        outline: 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300',
        ghost: 'hover:bg-zinc-800 text-zinc-400 hover:text-white',
    };

    return (
        <button
            className={twMerge(
                'px-4 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

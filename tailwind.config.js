/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'eurokeys-dark': '#0a0a0f',
                'eurokeys-card': 'rgba(20, 20, 30, 0.8)',
                'eurokeys-purple': '#8b5cf6',
                'eurokeys-purple-light': '#a78bfa',
                'eurokeys-border': 'rgba(139, 92, 246, 0.3)',
                'eurokeys-glow': 'rgba(139, 92, 246, 0.6)',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};

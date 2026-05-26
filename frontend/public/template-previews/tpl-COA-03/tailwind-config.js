tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#312E81', // Deep Indigo
                    light: '#4F46E5',
                    dark: '#1E1B4B',
                },
                accent: {
                    DEFAULT: '#FF7F50', // Bright Coral / Pêche
                    light: '#FF9B73',   
                    dark: '#E86638',
                },
                surface: {
                    DEFAULT: '#FAF9FE', // Very soft violet-tinted white
                    white: '#FFFFFF',
                    alt: '#F3F0FF',    // Slightly deeper violet cream
                },
                slate: {
                    900: '#0F172A', 
                    800: '#1E293B',
                    600: '#475569',
                    400: '#94A3B8',
                }
            },
            fontFamily: {
                serif: ['Cormorant Garamond', 'serif'],
                sans: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 20px 40px -15px rgba(49, 46, 129, 0.08)',
                'soft-hover': '0 30px 60px -12px rgba(49, 46, 129, 0.12)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '3rem',
                'full': '9999px',
            }
        }
    }
}

tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1B4332', // Forest Green
                    light: '#2D6A4F',
                    dark: '#081C15',
                },
                accent: {
                    DEFAULT: '#E9C46A', // Ochre / Jaune Moutarde
                    light: '#F4A261',   // Terre cuite light
                    dark: '#D6892A',
                },
                surface: {
                    DEFAULT: '#FCFBF4', // Warm Ivory
                    white: '#FFFFFF',
                    alt: '#F0EFEB',    // Slightly deeper cream
                },
                earth: {
                    900: '#262626', // Charcoal text
                    800: '#3D3D3D',
                    600: '#525252',
                    100: '#EDE0D4', // Warm beige border
                }
            },
            fontFamily: {
                serif: ['Fraunces', 'serif'],
                sans: ['Manrope', 'sans-serif'],
            },
            boxShadow: {
                'warm': '0 20px 40px -15px rgba(27, 67, 50, 0.1)',
                'warm-hover': '0 30px 60px -12px rgba(27, 67, 50, 0.15)',
            },
            borderRadius: {
                '4xl': '2.5rem',
            }
        }
    }
}

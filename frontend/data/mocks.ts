export const SECTORS = [
    {
        id: '1',
        name: 'Restaurants & Traiteurs',
        slug: 'restaurants',
        description: 'Mettez en appétit vos clients avec un menu interactif et des photos alléchantes.',
        icon: 'Utensils',
        gradient: 'from-orange-400 to-red-500'
    },
    {
        id: '2',
        name: 'BTP & Artisanat',
        slug: 'btp',
        description: 'Présentez vos réalisations et rassurez vos futurs clients.',
        icon: 'Hammer',
        gradient: 'from-blue-500 to-cyan-400'
    },
    {
        id: '3',
        name: 'Santé & Bien-être',
        slug: 'sante',
        description: 'Inspirez confiance et facilitez la prise de rendez-vous.',
        icon: 'Heart',
        gradient: 'from-green-400 to-emerald-600'
    },
    {
        id: '4',
        name: 'Avocats & Juridique',
        slug: 'avocats',
        description: 'Une image professionnelle pour votre cabinet.',
        icon: 'Scale',
        gradient: 'from-slate-600 to-slate-800'
    },
    {
        id: '5',
        name: 'Coaching & Consulting',
        slug: 'coaching',
        description: 'Vendez vos expertises et formations en ligne.',
        icon: 'Users',
        gradient: 'from-purple-500 to-indigo-600'
    },
    {
        id: '6',
        name: 'Immobilier',
        slug: 'immobilier',
        description: 'Mettez en valeur vos biens avec des galeries immersives.',
        icon: 'Home',
        gradient: 'from-indigo-400 to-blue-600'
    }
];

export const TEMPLATES = [
    {
        id: '1',
        name: 'Le Gourmet',
        sectorId: '1',
        price: 50000,
        image: '/images/templates/resto-1.jpg', // Placeholder
        features: ['Menu digital', 'Réservation', 'Galerie photos'],
        popular: true
    },
    {
        id: '2',
        name: 'BatiPro',
        sectorId: '2',
        price: 50000,
        image: '/images/templates/btp-1.jpg',
        features: ['Devis en ligne', 'Portfolio chantiers', 'Avis clients'],
        popular: true
    },
    {
        id: '3',
        name: 'ZenClick',
        sectorId: '3',
        price: 50000,
        image: '/images/templates/sante-1.jpg',
        features: ['Prise de RDV', 'Blog conseils', 'Présentation équipe'],
        popular: false
    },
    {
        id: '4',
        name: 'LegalExpert',
        sectorId: '4',
        price: 50000,
        image: '/images/templates/avocat-1.jpg',
        features: ['Espace client', 'Articles juridiques', 'Contact sécurisé'],
        popular: false
    }
];

export const TESTIMONIALS = [
    {
        name: 'Jean Dupont',
        role: 'Restaurateur',
        content: 'Mon site a été livré en 24h, c\'est incroyable. J\'ai déjà 30% de réservations en plus.',
        rating: 5
    },
    {
        name: 'Sophie Martin',
        role: 'Avocate',
        content: 'Très professionnel. Le design est propre et correspond parfaitement à l\'image de mon cabinet.',
        rating: 5
    },
    {
        name: 'Marc Lemoine',
        role: 'Artisan',
        content: 'Simple, efficace et pas cher. Je recommande FRILO à tous mes collègues.',
        rating: 4
    }
];

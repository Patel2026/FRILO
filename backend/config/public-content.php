<?php

use App\Rules\SafePublicUrl;

return [
    'pages' => [
        'home' => [
            'route_pattern' => '/',
            'name' => 'Accueil',
        ],
    ],

    'sections' => [
        'home.hero' => [
            'page' => 'home',
            'name' => 'Hero',
            'position' => 10,
            'hideable' => false,
            'renderer' => 'home.hero',
            'defaults' => [
                'eyebrow' => 'Pas besoin de savoir créer un site',
                'headline' => 'Envoyez vos infos. FRILO prépare votre site.',
                'description' => 'Vous choisissez un modèle, vous ajoutez votre activité, vos photos et vos contacts. Vous payez simplement, puis vous recevez votre site prêt à partager.',
                'primary_cta' => [
                    'label' => 'Commencer avec un modèle',
                    'url' => '/templates',
                ],
                'secondary_cta' => [
                    'label' => 'Voir les étapes',
                    'url' => '/#how-it-works',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'description' => ['required', 'string', 'max:500'],
                'primary_cta' => ['required', 'array:label,url'],
                'primary_cta.label' => ['required', 'string', 'max:80'],
                'primary_cta.url' => ['required', SafePublicUrl::class],
                'secondary_cta' => ['required', 'array:label,url'],
                'secondary_cta.label' => ['required', 'string', 'max:80'],
                'secondary_cta.url' => ['required', SafePublicUrl::class],
            ],
        ],

        'home.models_intro' => [
            'page' => 'home',
            'name' => 'Introduction modèles',
            'position' => 20,
            'hideable' => true,
            'renderer' => 'home.models-intro',
            'defaults' => [
                'eyebrow' => 'Choisissez votre activité',
                'headline' => 'Un modèle proche de votre métier, FRILO adapte le reste.',
                'description' => 'Restaurant, BTP, immobilier, service, école ou commerce : partez d’une base claire, ajoutez vos informations, puis notre équipe prépare votre site.',
                'cta' => [
                    'label' => 'Voir les modèles par activité',
                    'url' => '/templates',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'description' => ['required', 'string', 'max:500'],
                'cta' => ['required', 'array:label,url'],
                'cta.label' => ['required', 'string', 'max:80'],
                'cta.url' => ['required', SafePublicUrl::class],
            ],
        ],

        'home.benefits' => [
            'page' => 'home',
            'name' => 'Avantages',
            'position' => 30,
            'hideable' => true,
            'renderer' => 'home.benefits',
            'defaults' => [
                'eyebrow' => 'Avantages',
                'headline' => 'Ce que FRILO vous fait gagner.',
                'description' => 'Choisissez un modèle. FRILO ajoute vos informations et prépare un site prêt à partager.',
                'items' => [
                    [
                        'title' => 'Moins de temps perdu',
                        'description' => 'Vous donnez l’essentiel. FRILO organise le reste.',
                    ],
                    [
                        'title' => 'Plus clair pour vos clients',
                        'description' => 'Ils voient vos services, vos photos et vos contacts sans chercher.',
                    ],
                    [
                        'title' => 'Un contact plus facile',
                        'description' => 'WhatsApp, téléphone, adresse ou demande de devis sont au bon endroit.',
                    ],
                    [
                        'title' => 'Un suivi après livraison',
                        'description' => 'Vous suivez votre commande, votre paiement et vos retouches au même endroit.',
                    ],
                ],
                'closing_copy' => 'Votre site sert à quelque chose : présenter votre activité et recevoir des demandes.',
                'cta' => [
                    'label' => 'Commencer avec un modèle',
                    'url' => '/templates',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'description' => ['required', 'string', 'max:500'],
                'items' => ['required', 'array', 'min:1', 'max:8'],
                'items.*' => ['required', 'array:title,description'],
                'items.*.title' => ['required', 'string', 'max:120'],
                'items.*.description' => ['required', 'string', 'max:300'],
                'closing_copy' => ['required', 'string', 'max:300'],
                'cta' => ['required', 'array:label,url'],
                'cta.label' => ['required', 'string', 'max:80'],
                'cta.url' => ['required', SafePublicUrl::class],
            ],
        ],

        'home.process' => [
            'page' => 'home',
            'name' => 'Processus',
            'position' => 40,
            'hideable' => true,
            'renderer' => 'home.process',
            'defaults' => [
                'eyebrow' => 'Comment ça se passe',
                'headline' => 'De vos infos au site livré.',
                'description' => 'Vous n’avez pas besoin de tout préparer avant de commencer. FRILO vous guide étape par étape.',
                'customer_steps' => [
                    [
                        'title' => 'Vous choisissez un modèle',
                        'description' => 'Une base proche de votre activité.',
                    ],
                    [
                        'title' => 'Vous envoyez vos infos',
                        'description' => 'Nom, services, photos et contacts.',
                    ],
                    [
                        'title' => 'Vous payez simplement',
                        'description' => 'Mobile Money ou carte, en FCFA.',
                    ],
                ],
                'frilo_steps' => [
                    [
                        'title' => 'FRILO adapte le site',
                        'description' => 'Vos contenus remplacent les exemples.',
                    ],
                    [
                        'title' => 'FRILO vérifie le rendu',
                        'description' => 'Pages, mobile, liens et contacts.',
                    ],
                    [
                        'title' => 'FRILO vous livre le lien',
                        'description' => 'Votre site est prêt à partager.',
                    ],
                ],
                'result_copy' => 'Résultat : votre site montre clairement ce que vos clients ont besoin de savoir.',
                'cta' => [
                    'label' => 'Commencer',
                    'url' => '/templates',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'description' => ['required', 'string', 'max:500'],
                'customer_steps' => ['required', 'array', 'min:1', 'max:8'],
                'customer_steps.*' => ['required', 'array:title,description'],
                'customer_steps.*.title' => ['required', 'string', 'max:120'],
                'customer_steps.*.description' => ['required', 'string', 'max:300'],
                'frilo_steps' => ['required', 'array', 'min:1', 'max:8'],
                'frilo_steps.*' => ['required', 'array:title,description'],
                'frilo_steps.*.title' => ['required', 'string', 'max:120'],
                'frilo_steps.*.description' => ['required', 'string', 'max:300'],
                'result_copy' => ['required', 'string', 'max:300'],
                'cta' => ['required', 'array:label,url'],
                'cta.label' => ['required', 'string', 'max:80'],
                'cta.url' => ['required', SafePublicUrl::class],
            ],
        ],

        'home.pricing' => [
            'page' => 'home',
            'name' => 'Tarifs',
            'position' => 50,
            'hideable' => true,
            'renderer' => 'home.pricing',
            'defaults' => [
                'eyebrow' => 'Tarifs',
                'headline' => 'Commencez avec un site essentiel. Ajoutez seulement ce qui vous sert.',
                'description' => 'Le site essentiel est compris dans le prix de départ. Pendant la commande, vous choisissez les fonctions utiles à votre activité et voyez le total avant de payer.',
                'included_items' => [
                    'Domaine 1 an',
                    'Hébergement 1 an',
                    'SSL',
                    'Version mobile',
                    'Mise en ligne',
                    'Retouches',
                ],
                'package_eyebrow' => 'Le site essentiel',
                'package_description' => 'Tout le nécessaire pour présenter clairement votre activité en ligne.',
                'options_eyebrow' => 'Selon vos besoins',
                'options_headline' => 'Des options au choix pendant la commande.',
                'options_description' => 'D’autres options sont proposées selon votre projet : page supplémentaire, réservation ou devis, aide à la rédaction et SEO local.',
                'payment_note' => 'Paiement en FCFA par Mobile Money ou carte. Le prix final est confirmé avant paiement.',
                'primary_cta' => [
                    'label' => 'Choisir mon modèle',
                    'url' => '/templates',
                ],
                'secondary_cta' => [
                    'label' => 'Contactez-nous',
                    'url' => '/contact',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'description' => ['required', 'string', 'max:500'],
                'included_items' => ['required', 'array', 'min:1', 'max:12'],
                'included_items.*' => ['required', 'string', 'max:120'],
                'package_eyebrow' => ['required', 'string', 'max:120'],
                'package_description' => ['required', 'string', 'max:500'],
                'options_eyebrow' => ['required', 'string', 'max:120'],
                'options_headline' => ['required', 'string', 'max:180'],
                'options_description' => ['required', 'string', 'max:500'],
                'payment_note' => ['required', 'string', 'max:300'],
                'primary_cta' => ['required', 'array:label,url'],
                'primary_cta.label' => ['required', 'string', 'max:80'],
                'primary_cta.url' => ['required', SafePublicUrl::class],
                'secondary_cta' => ['required', 'array:label,url'],
                'secondary_cta.label' => ['required', 'string', 'max:80'],
                'secondary_cta.url' => ['required', SafePublicUrl::class],
            ],
        ],

        'home.testimonials_intro' => [
            'page' => 'home',
            'name' => 'Introduction témoignages',
            'position' => 60,
            'hideable' => true,
            'renderer' => 'home.testimonials-intro',
            'defaults' => [
                'eyebrow' => 'Avis',
                'headline' => 'La confiance se joue dans les détails.',
                'empty_state' => 'Les premiers retours clients seront affichés ici après validation. L’espace reste volontairement sobre pour ne pas inventer de preuve.',
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'empty_state' => ['required', 'string', 'max:500'],
            ],
        ],

        'home.sectors_intro' => [
            'page' => 'home',
            'name' => 'Introduction secteurs',
            'position' => 70,
            'hideable' => true,
            'renderer' => 'home.sectors-intro',
            'defaults' => [
                'eyebrow' => 'Secteurs',
                'headline' => 'Trouvez le modèle adapté à votre activité.',
                'cta' => [
                    'label' => 'Tous les secteurs',
                    'url' => '/secteurs',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'cta' => ['required', 'array:label,url'],
                'cta.label' => ['required', 'string', 'max:80'],
                'cta.url' => ['required', SafePublicUrl::class],
            ],
        ],

        'home.faq_intro' => [
            'page' => 'home',
            'name' => 'Introduction FAQ',
            'position' => 80,
            'hideable' => true,
            'renderer' => 'home.faq-intro',
            'defaults' => [
                'eyebrow' => 'Questions',
                'headline' => 'Les réponses avant de commander.',
                'description' => 'Délais, prix, contenu, propriété du site : les points sensibles doivent être clairs avant paiement.',
                'cta' => [
                    'label' => 'Poser une question',
                    'url' => '/contact',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'description' => ['required', 'string', 'max:500'],
                'cta' => ['required', 'array:label,url'],
                'cta.label' => ['required', 'string', 'max:80'],
                'cta.url' => ['required', SafePublicUrl::class],
            ],
        ],

        'home.closing_cta' => [
            'page' => 'home',
            'name' => 'Appel à l’action final',
            'position' => 90,
            'hideable' => true,
            'renderer' => 'home.closing-cta',
            'defaults' => [
                'eyebrow' => 'Prêt quand vous l’êtes',
                'headline' => 'Donnez à votre entreprise le site qu’elle mérite.',
                'description' => 'Parcourez les modèles, choisissez celui qui ressemble à votre ambition, puis laissez FRILO l’adapter.',
                'primary_cta' => [
                    'label' => 'Voir les modèles',
                    'url' => '/templates',
                ],
                'secondary_cta' => [
                    'label' => 'Parler à un expert',
                    'url' => '/contact',
                ],
            ],
            'rules' => [
                'eyebrow' => ['required', 'string', 'max:120'],
                'headline' => ['required', 'string', 'max:180'],
                'description' => ['required', 'string', 'max:500'],
                'primary_cta' => ['required', 'array:label,url'],
                'primary_cta.label' => ['required', 'string', 'max:80'],
                'primary_cta.url' => ['required', SafePublicUrl::class],
                'secondary_cta' => ['required', 'array:label,url'],
                'secondary_cta.label' => ['required', 'string', 'max:80'],
                'secondary_cta.url' => ['required', SafePublicUrl::class],
            ],
        ],
    ],
];

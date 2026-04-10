<?php

namespace Database\Seeders;

use App\Models\FaqItem;
use Illuminate\Database\Seeder;

class FaqItemSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Combien de temps faut-il pour recevoir mon site ?',
                'answer' => 'Nous nous engageons à livrer votre site en 48h ouvrées après réception de tous vos éléments (textes, logos, images). Si vous n\'avez pas encore tous les éléments, nous pouvons commencer avec des contenus génériques.',
                'sort_order' => 10,
            ],
            [
                'question' => 'Puis-je modifier mon site moi-même après la livraison ?',
                'answer' => 'Absolument. Nos sites sont construits sur des technologies standards. Nous pouvons vous donner un accès administrateur si vous souhaitez faire des modifications mineures, ou vous pouvez nous contacter pour toute mise à jour.',
                'sort_order' => 20,
            ],
            [
                'question' => 'Le site m\'appartient-il vraiment ?',
                'answer' => 'Oui, à 100%. Contrairement aux plateformes par abonnement, une fois payé, le site est entièrement à vous. Vous êtes libre de changer d\'hébergeur quand vous le souhaitez.',
                'sort_order' => 30,
            ],
            [
                'question' => 'Que se passe-t-il si je ne suis pas satisfait ?',
                'answer' => 'Nous fonctionnons avec une garantie satisfaction. Si le premier rendu ne vous convient pas, nous effectuons une passe de corrections incluse. Si cela ne vous convient toujours pas, nous vous remboursons intégralement.',
                'sort_order' => 40,
            ],
            [
                'question' => 'L\'hébergement est-il inclus dans le prix ?',
                'answer' => 'Oui. Le prix affiché inclut la création du site, la mise en ligne et l\'hébergement pour la première année. À partir de la deuxième année, un forfait d\'hébergement annuel vous sera proposé à tarif préférentiel.',
                'sort_order' => 50,
            ],
            [
                'question' => 'Comment puis-je vous transmettre mes contenus ?',
                'answer' => 'Après votre commande, vous recevrez un formulaire détaillé pour nous transmettre tous vos éléments : textes, logo, couleurs, photos. Vous pouvez également nous envoyer tout par e-mail à contact@frilo.com.',
                'sort_order' => 60,
            ],
            [
                'question' => 'Mon site sera-t-il visible sur mobile ?',
                'answer' => 'Tous nos modèles sont intégralement responsive. Votre site s\'adapte automatiquement à tous les écrans : ordinateur, tablette et smartphone.',
                'sort_order' => 70,
            ],
            [
                'question' => 'Puis-je commander un site personnalisé ?',
                'answer' => 'Nos modèles sont conçus pour être adaptés à votre identité (couleurs, logo, textes, photos). Pour une création sur mesure complète, contactez-nous afin que nous puissions établir un devis personnalisé.',
                'sort_order' => 80,
            ],
        ];

        foreach ($faqs as $faq) {
            FaqItem::updateOrCreate(
                ['question' => $faq['question']],
                [
                    'answer' => $faq['answer'],
                    'sort_order' => $faq['sort_order'],
                    'is_published' => true,
                ]
            );
        }
    }
}

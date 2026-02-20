import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contactez-nous - FRILO',
};

export default function ContactPage() {
    return (
        <div className="pt-20">
            <Section className="bg-dark-frilo text-white py-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                    Un projet ? Une question ? Nous sommes là pour vous.
                </p>
            </Section>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations</h2>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-frilo-blue flex-shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900">Téléphone</h3>
                                    <p className="text-gray-600">+229 00 00 00 00 00</p>
                                    <p className="text-gray-500 text-sm">Du Lundi au Vendredi, 9h-18h</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-frilo-purple flex-shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900">Email</h3>
                                    <p className="text-gray-600">contact@frilo.com</p>
                                    <p className="text-gray-500 text-sm">Réponse sous 24h</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 flex-shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900">Bureaux</h3>
                                    <p className="text-gray-600">Cotonou, Bénin</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input type="text" id="name" className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent" placeholder="Votre nom" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" id="email" className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent" placeholder="votre@email.com" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                                <input type="text" id="subject" className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent" placeholder="J'ai une question sur..." />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea id="message" rows={4} className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent" placeholder="Votre message..."></textarea>
                            </div>

                            <Button type="submit" variant="gradient" className="w-full">
                                Envoyer le message
                            </Button>
                        </form>
                    </div>
                </div>
            </Section>
        </div>
    );
}

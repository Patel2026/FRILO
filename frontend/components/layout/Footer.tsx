import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-bold tracking-tighter">
                            <span className="text-white">FRI</span>
                            <span className="text-frilo-purple">LO</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            La plateforme de référence pour commander votre site vitrine clé en main. Livraison express en 48h.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-gray-200">Navigation</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
                            <li><Link href="/secteurs" className="hover:text-white transition-colors">Secteurs</Link></li>
                            <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                            <li><Link href="/expertises" className="hover:text-white transition-colors">Expertises</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4 text-gray-200">Support</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                            <li><Link href="/cgu" className="hover:text-white transition-colors">CGU / CGV</Link></li>
                        </ul>
                    </div>

                    {/* Trust */}
                    <div>
                        <h3 className="font-semibold mb-4 text-gray-200">Pourquoi nous ?</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>🚀 Livraison 48h chrono</li>
                            <li>💎 Designs Premium</li>
                            <li>🤝 Support local 7j/7</li>
                            <li>✅ Satisfait ou remboursé</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} FRILO. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}

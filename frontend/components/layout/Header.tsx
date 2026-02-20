"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'Secteurs', href: '/secteurs' },
        { name: 'Templates', href: '/templates' }, // Assuming general templates page or handled via sectors
        { name: 'FAQ', href: '/faq' },
        { name: 'Expertises', href: '/expertises' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 w-full z-50 transition-all duration-300',
                isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    <span className="text-frilo-blue">FRI</span>
                    <span className="text-frilo-purple">LO</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-frilo-purple",
                                pathname === link.href ? "text-frilo-purple font-semibold" : "text-gray-600"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-frilo-blue">
                        Connexion
                    </Link>
                    <Button variant="gradient" size="sm" asChild>
                        <Link href="/register">S'inscrire</Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-base font-medium text-gray-700 hover:text-frilo-purple py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-2 mt-4 border-t pt-4">
                        <Link
                            href="/login"
                            className="text-center py-2 text-gray-600 font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Connexion
                        </Link>
                        <Button variant="gradient" className="w-full" asChild>
                            <Link href="/register">S'inscrire</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}

import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    variant?: 'default' | 'muted' | 'dark' | 'gradient';
    container?: boolean;
    title?: string;
    subtitle?: string;
}

export function Section({
    children,
    className,
    variant = 'default',
    container = true,
    title,
    subtitle,
    ...props
}: SectionProps) {
    const variants = {
        default: "bg-white text-gray-900",
        muted: "bg-gray-50 text-gray-900",
        dark: "bg-slate-900 text-white",
        gradient: "bg-dark-frilo text-white",
    };

    return (
        <section
            className={cn(
                "py-16 md:py-24 relative overflow-hidden",
                variants[variant],
                className
            )}
            {...props}
        >
            {container ? (
                <div className="container mx-auto px-4">
                    {(title || subtitle) && (
                        <div className="text-center mb-12">
                            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
                            {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </div>
            ) : children}
        </section>
    );
}

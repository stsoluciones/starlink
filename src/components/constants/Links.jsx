import { useSearchParams } from 'next/navigation';

const useLinks = () => {
    const searchParams = useSearchParams();
    const perfil = searchParams.get('perfil');

    const pedidosHref =
        perfil === 'perfil'
            ? '/Dashboard?perfil=pedidos'
            : '/Dashboard';

    return [
        { name: 'Home', href: '#home' },
        { name: 'Tutoriales', href: '/tutoriales' },
        { name: 'Productos', href: '#productos' },
        { name: 'Nosotros', href: '#nosotros' },
        { name: 'Contacto', href: '#contacto' },
        { name: 'Mis Pedidos', href: pedidosHref }
    ];
};

export default useLinks;

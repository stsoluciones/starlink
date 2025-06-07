import { useSearchParams } from 'next/navigation';

const useLinks = () => {
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();

    return [
        {name: 'Home', href: queryString? '?' + queryString + '#home':'#home'},
        {name: 'Productos', href: queryString? '?' + queryString +'#productos':'#productos'},
        {name: 'Nosotros', href: queryString? '?' + queryString +'#nosotros':'#nosotros'},
        {name: 'Contacto', href: queryString? '?' + queryString +'#contacto':'#contacto'},
        {name: 'Perfil', href: queryString? '?' + queryString +'/Dashboard':'/Dashboard'}
    ];
};

export default useLinks;

import React from 'react'
import { FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const UserMenu = ({ user, toggleDropdown, isDropdownOpen, handleLogOut }) => {
    const router = useRouter();
    //console.log('user:',user);
    
    const handleAdminRedirect = () => {
        router.push('/Dashboard?perfil=perfil');
        toggleDropdown();
    };

    const handleGoToLogin = () => {
        router.push('/user/Login');
    };

    const handleGoToRegister = () => {
        router.push('/user/Register');
    };

    return (
        <>
            {user ? (
                <div className="flex relative z-50 items-center align-middle justify-center">
                    <button 
                        className="inline-flex items-center w-8 h-8 justify-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl" 
                        onClick={toggleDropdown} 
                        title={user.displayName} 
                        aria-label="menu usuario"
                    >
                        {user.photoURL ? (
                            <Image 
                                src={user.photoURL} 
                                alt={user.displayName} 
                                className="rounded-full w-8 h-8" 
                                width={32} 
                                height={32} 
                                title={user.displayName} 
                                loading='lazy'
                                unoptimized={true}
                                aria-label={user.displayName}
                            />
                        ) : (
                            <FaUser />
                        )}
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-28 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
                            <button className="block w-full px-4 py-2 text-left text-primary hover:text-primary-hover" onClick={()=>handleAdminRedirect('perfil')} aria-label="Perfil">Mi Perfil</button>
                            <button className="block w-full px-4 py-2 text-left text-primary hover:text-primary-hover" onClick={handleLogOut} aria-label="cerrar sesion">Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative z-50 gap-2">
                    <button 
                        className="hidden items-center justify-center text-normal uppercase md:inline-flex text-primary hover:text-primary-hover md:text-base px-2" 
                        onClick={handleGoToLogin} 
                        title="Login usuario" 
                        aria-label="Login usuario"
                    >
                        Ingresar
                    </button>
                    <button 
                        className="hidden items-center justify-center text-normal uppercase text-primary hover:text-primary-hover md:inline-flex md:text-base px-2" 
                        onClick={handleGoToRegister} 
                        title="registrar usuario" 
                        aria-label="registrar usuario"
                    >
                        Registrate
                    </button>
                </div>
            )}
        </>
    );
};

export default UserMenu;
import React from "react";
import { FiActivity, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from '../../context/AuthContext';

const Nav = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="#" className="flex items-center">
                    <FiActivity className="text-2xl text-blue-500" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        Monitor Recursos
                    </span>
                </a>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <FiUser className="text-gray-600 text-xl mr-2" />
                        <span className="text-gray-300">{user?.username}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800"
                    >
                        <FiLogOut className="mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Nav;
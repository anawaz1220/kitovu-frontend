// src/components/layout/UserMenu.jsx
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserMenu = () => {
  const { user, logout } = useAuth();

  // Return null if no user is logged in
  if (!user) return null;

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-kitovu-purple focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <div className="h-8 w-8 rounded-full bg-kitovu-purple text-white flex items-center justify-center">
            {user.username ? user.username[0].toUpperCase() : 'U'}
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <div className="font-medium">{user.username}</div>
            <div className="text-gray-500">{user.role}</div>
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={logout}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full px-4 py-2 text-left text-sm text-gray-700`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;
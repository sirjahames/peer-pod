'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isFreelancer = user.role === 'freelancer';

  const links = isFreelancer
    ? [
        { href: '/freelancer', label: 'Home' },
        { href: '/freelancer/discover', label: 'Discover' },
        { href: '/freelancer/groups', label: 'Groups' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/create', label: 'New Project' },
      ];

  return (
    <nav className="bg-black text-white px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={isFreelancer ? '/freelancer' : '/dashboard'} className="font-bold text-xl">
            PeerPod
          </Link>
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 rounded transition ${
                  pathname === link.href
                    ? 'bg-white text-black'
                    : 'hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{user.name}</span>
          <button
            onClick={logout}
            className="text-sm px-3 py-1 border border-white rounded hover:bg-white hover:text-black transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

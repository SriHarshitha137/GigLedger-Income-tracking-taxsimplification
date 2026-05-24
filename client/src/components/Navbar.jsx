import { BarChart3, Calculator, FileText, Home, IndianRupee, LogOut, Moon, ReceiptText, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Income', path: '/income', icon: IndianRupee },
  { label: 'Expenses', path: '/expenses', icon: ReceiptText },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Tax', path: '/tax', icon: Calculator },
  { label: 'Certificate', path: '/certificate', icon: FileText }
];

const linkClass = ({ isActive }) =>
  `relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
    isActive ? 'bg-blue-50 font-semibold text-blue-700 shadow-sm' : 'text-slate-600 hover:-translate-y-px hover:bg-slate-100'
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('gigledger_theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('gigledger_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'));

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r p-5 backdrop-blur md:flex md:flex-col" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="mb-8 rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xl font-bold">GigLedger</p>
          <p className="mt-1 text-xs text-blue-100">Performance, tax, loan readiness</p>
        </div>
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">Workspace</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={toggleTheme} className="btn-secondary mt-4 flex w-full items-center justify-center gap-2">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
        <div className="mt-auto rounded-2xl border p-4" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
          <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.phone}</p>
          <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-px">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <button onClick={toggleTheme} className="fixed bottom-16 right-3 z-30 rounded-full px-3 py-2 text-xs font-bold shadow-lg md:hidden" style={{ background: 'var(--primary)', color: '#fff' }}>
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t backdrop-blur md:hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {navItems.slice(0, 5).map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `relative flex flex-col items-center gap-1 px-1 py-2 text-[11px] ${isActive ? 'font-semibold text-blue-700' : 'text-slate-500'}`}>
            <item.icon size={18} />
            <span>{item.label}</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-70" />
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Navbar;

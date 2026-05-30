import { NavLink } from 'react-router-dom';

const CocineroSidebar = () => {
  const navItems = [
    { to: '/cocinero/comandas', label: 'Comandas de cocina', icon: '🍳' },
    { to: '/cocinero/perfil', label: 'Mi perfil', icon: '👤' },
  ];

  return (
    <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-600">Cocinero</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Menú de cocina</h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default CocineroSidebar;

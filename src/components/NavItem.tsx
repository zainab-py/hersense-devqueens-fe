import { NavLink as RouterNavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-all ${
        isActive
          ? 'text-primary glow-text'
          : 'text-muted-foreground hover:text-foreground'
      }`
    }
  >
    <Icon size={20} />
    <span>{label}</span>
  </RouterNavLink>
);

export default NavItem;

import { useNavigate, useLocation } from 'react-router-dom';
import './NavLinks.css';
import { routeConfig } from '../../../routes/routeConfig';
import { useAppSelector } from '../../store/hooks';

export function NavLinks() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRacing = useAppSelector((s) => s.race.isRacing);

  return (
    <nav className="nav-links" aria-label="Main navigation">
      {routeConfig.map((route) => {
        const active =
          location.pathname === route.path || (location.pathname === '/' && route.key === 'garage');
        return (
          <button
            type="button"
            key={route.key}
            onClick={() => {
              void navigate(route.path);
            }}
            disabled={isRacing}
            className={active ? 'nav-button active' : 'nav-button'}
            data-nav={route.key}
          >
            {route.label}
          </button>
        );
      })}
    </nav>
  );
}

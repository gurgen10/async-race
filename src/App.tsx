import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import './App.css';
import { routeConfig } from './routes/routeConfig';
import { LoadingScreen } from './components/LoadingScreen';

const BOOT_DELAY_MS = 2000;

const BRAND_LINE_1 = ['A', 's', 'y', 'n', 'c'];
const BRAND_LINE_2 = ['R', 'a', 'c', 'e'];

function BrandLetter({ char }: { char: string }) {
  return (
    <span className="brand-letter">
      <span className="brand-lights" aria-hidden="true">
        <span className="brand-light brand-light-red" />
        <span className="brand-light brand-light-blue" />
        <span className="brand-light brand-light-orange" />
      </span>
      <span className="brand-text">{char}</span>
    </span>
  );
}

function NavLinks() {
  const navigate = useNavigate();
  const location = useLocation();

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

function AppHeader() {
  return (
    <Box component="header" className="app-header">
      <Box className="brand-frame" role="img" aria-label="Async Race logo">
        <Typography component="h1" className="brand-title">
          <span className="brand-word">
            {BRAND_LINE_1.map((char) => (
              <BrandLetter key={char} char={char} />
            ))}
          </span>
          <span className="brand-word">
            {BRAND_LINE_2.map((char) => (
              <BrandLetter key={char} char={char} />
            ))}
          </span>
        </Typography>
      </Box>
      <NavLinks />
    </Box>
  );
}

function App() {
  const [isBooting, setIsBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setIsBooting(false);
    }, BOOT_DELAY_MS);
    return () => {
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      {isBooting && <LoadingScreen />}
      <Box className="app-shell">
        <AppHeader />
        <Box component="main">
          <Routes>
            <Route path="/" element={<Navigate to="/garage" replace />} />
            {routeConfig.map((route) => (
              <Route key={route.key} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Box>
      </Box>
    </>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import { routeConfig } from './routes/routeConfig';
import { AppHeader } from './shared/components/AppHeader';
import { LoadingScreen } from './shared/components/LoadingScreen';
import { BOOT_DELAY_MS } from './shared/constants';
import './App.css';

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

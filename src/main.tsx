import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import './shared/styles/global.css';
import App from './App';
import { store } from './shared/store/store';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in document');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);

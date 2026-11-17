import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/600.css';
import './styles/base.css';
import App from './App.jsx';
import { prepareIsolation } from './lib/isolation.js';

const root = createRoot(document.getElementById('root'));
root.render(<p role="status">Vim 실행 환경을 준비하고 있습니다…</p>);
prepareIsolation(`${import.meta.env.BASE_URL}coi-serviceworker.js`).then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

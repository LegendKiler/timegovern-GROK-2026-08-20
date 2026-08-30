import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './themeForce.css';
import './fontLock.css'; // F1: IBM Plex only (after themeForce)

const params = new URLSearchParams(window.location.search);
const isEmbed = Boolean(params.get('embed'));

async function boot() {
  const root = createRoot(document.getElementById('root')!);
  if (isEmbed) {
    const { EmbedApp } = await import('./components/EmbedApp');
    root.render(
      <StrictMode>
        <EmbedApp />
      </StrictMode>
    );
    return;
  }
  const { default: App } = await import('./App.tsx');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot();

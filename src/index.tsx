import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, WagmiProvider } from 'wagmi';
import { optimismSepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

import 'primereact/resources/themes/lara-dark-purple/theme.css'; // Choose your theme
import 'primereact/resources/primereact.min.css'; // Core styles
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // Optional for utility classes

export const config = getDefaultConfig({
  appName: 'louder-king',
  projectId: '80e8b829247f039f10be37ff70db6481',
  chains: [optimismSepolia],
  transports: {
    [optimismSepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <div className="flex justify-content-center align-items-center h-screen">
            <App />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

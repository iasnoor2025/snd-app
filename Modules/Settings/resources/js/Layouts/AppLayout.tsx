import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => (
  <div className="app-layout-placeholder" style={{ padding: 24, background: '#f4f4f4', minHeight: '100vh' }}>
    {children}
  </div>
);

export default AppLayout;

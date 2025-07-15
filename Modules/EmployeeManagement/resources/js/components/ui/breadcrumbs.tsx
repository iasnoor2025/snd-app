import React from 'react';
export const Breadcrumbs: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <nav className="text-sm text-gray-500 mb-2">{children}</nav>
);
export default Breadcrumbs;

import React from 'react';
export const Breadcrumbs: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <nav className="mb-2 text-sm text-gray-500">{children}</nav>;
export default Breadcrumbs;

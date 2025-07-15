import React from 'react';
export const Badge: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
    <span className="inline-block rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">{children}</span>
);
export default Badge;

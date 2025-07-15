import React from 'react';
export const Card: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div className="rounded-lg border bg-white p-4 shadow-sm">{children}</div>
);
export default Card;

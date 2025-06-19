import React from 'react';

export function ScrollArea({ children, style, ...props }: React.PropsWithChildren<{ style?: React.CSSProperties }>) {
  return (
    <div style={{ overflow: 'auto', ...style }} {...props}>
      {children}
    </div>
  );
}

export default ScrollArea;























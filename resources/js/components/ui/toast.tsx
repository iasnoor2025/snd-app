import * as React from 'react';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const ToastViewport: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => <div {...props} />;

export const ToastTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} style={{ fontWeight: 'bold', ...props.style }}>{children}</div>
);

export const ToastDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props} style={{ opacity: 0.8, ...props.style }}>{children}</div>
);

export const ToastClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button {...props} style={{ marginLeft: 8, ...props.style }}>×</button>
);

export const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
));

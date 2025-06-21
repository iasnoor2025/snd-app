import React from 'react';

interface ErrorAlertProps {
  message?: string;
  children?: React.ReactNode;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, children }) => (
  <div className="error-alert-placeholder" style={{ color: 'red', padding: 8, border: '1px solid red', borderRadius: 4 }}>
    {children || message || 'An error occurred.'}
  </div>
);

export { ErrorAlert };
export default ErrorAlert;























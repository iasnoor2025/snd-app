import React from 'react';

interface ModalProps {
  open?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open = true, children }) => {
  if (!open) return null;
  return <div className="modal-placeholder">{children}</div>;
};

export default Modal;

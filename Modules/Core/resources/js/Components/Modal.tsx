import { PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{ show: boolean; maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; closeable?: boolean; onClose?: CallableFunction }>) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return mounted
        ? createPortal(
              <div
                  className={`fixed inset-0 z-50 flex transform items-center justify-center overflow-y-auto px-4 py-6 transition-all sm:px-0 ${show ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
                  style={{ display: show ? 'block' : 'none' }}
              >
                  <div className="fixed inset-0 bg-gray-500/75" onClick={close}></div>

                  <div className={`mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full ${maxWidthClass}`}>
                      {children}
                  </div>
              </div>,
              document.body,
          )
        : null;
}

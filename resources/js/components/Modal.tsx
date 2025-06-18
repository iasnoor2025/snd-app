import { PropsWithChildren, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ children, show = false, maxWidth = '2xl', closeable = true, onClose = () => { } }: PropsWithChildren<{ show: boolean, maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl', closeable?: boolean, onClose?: CallableFunction }>) {
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
        'sm': 'sm:max-w-sm',
        'md': 'sm:max-w-md',
        'lg': 'sm:max-w-lg',
        'xl': 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return mounted ? createPortal(
        <div
            className={`fixed inset-0 z-50 px-4 py-6 overflow-y-auto sm:px-0 flex items-center justify-center transform transition-all ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            style={{ display: show ? 'block' : 'none' }}
        >
            <div className="fixed inset-0 bg-gray-500/75" onClick={close}></div>

            <div className={`mb-6 bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full ${maxWidthClass}`}>
                {children}
            </div>
        </div>,
        document.body
    ) : null;
}
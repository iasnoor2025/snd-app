import { useState, createContext, useContext, PropsWithChildren, Dispatch, SetStateAction } from 'react';
import { Link, InertiaLinkProps } from '@inertiajs/react';

const DropdownContext = createContext<{ open: boolean; setOpen: Dispatch<SetStateAction<boolean>>; toggleOpen: () => void } | null>(null);

export default function Dropdown({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropdownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropdownContext.Provider>
    );
}

function Trigger({ children }: PropsWithChildren) {
    const { toggleOpen } = useContext(DropdownContext)!;

    return (
        <div onClick={toggleOpen}>{children}</div>
    );
}

function Content({ align = 'right', width = '48', contentClasses = 'py-1 bg-white', children }: PropsWithChildren<{ align?: 'left' | 'right' | 'top'; width?: '48'; contentClasses?: string }>) {
    const { open, setOpen } = useContext(DropdownContext)!;

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'origin-top-left left-0';
    } else if (align === 'right') {
        alignmentClasses = 'origin-top-right right-0';
    } else if (align === 'top') {
        alignmentClasses = 'origin-bottom';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            {open && (
                <div
                    className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div className={`rounded-md ring-1 ring-black ring-opacity-5 ` + contentClasses}>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}

function Link({ className = '', children, ...props }: InertiaLinkProps) {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out ' +
                className
            }
        >
            {children}
        </Link>
    );
}

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = Link;
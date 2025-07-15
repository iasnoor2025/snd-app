import * as React from 'react';

export const NavigationMenu: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <nav {...props}>{children}</nav>;

export const NavigationMenuList: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({ children, ...props }) => <ul {...props}>{children}</ul>;

export const NavigationMenuItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({ children, ...props }) => <li {...props}>{children}</li>;

export function navigationMenuTriggerStyle() {
    return 'px-4 py-2 rounded hover:bg-gray-100 focus:outline-none';
}

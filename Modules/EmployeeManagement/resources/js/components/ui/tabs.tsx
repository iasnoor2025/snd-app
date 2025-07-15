import React, { createContext, useContext, useState } from 'react';

interface TabsContextProps {
    value: string;
    setValue: (val: string) => void;
}
const TabsContext = createContext<TabsContextProps | undefined>(undefined);

interface TabsProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (val: string) => void;
    className?: string;
    children: React.ReactNode;
}
export const Tabs: React.FC<TabsProps> = ({ value, defaultValue, onValueChange, className, children }) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const activeValue = value !== undefined ? value : internalValue;
    const setValue = (val: string) => {
        if (onValueChange) onValueChange(val);
        if (value === undefined) setInternalValue(val);
    };
    return (
        <TabsContext.Provider value={{ value: activeValue, setValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div className="mb-2 flex gap-2">{children}</div>;

interface TabsTriggerProps extends React.PropsWithChildren<{}> {
    value: string;
    className?: string;
}
export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, className, children }) => {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error('TabsTrigger must be used within Tabs');
    const isActive = ctx.value === value;
    return (
        <button
            className={className + (isActive ? ' data-[state=active]' : '')}
            onClick={() => ctx.setValue(value)}
            data-state={isActive ? 'active' : undefined}
            type="button"
        >
            {children}
        </button>
    );
};

interface TabsContentProps extends React.PropsWithChildren<{}> {
    value: string;
    className?: string;
}
export const TabsContent: React.FC<TabsContentProps> = ({ value, className, children }) => {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error('TabsContent must be used within Tabs');
    if (ctx.value !== value) return null;
    return <div className={className}>{children}</div>;
};

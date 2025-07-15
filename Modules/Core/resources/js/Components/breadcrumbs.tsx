import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from "../lib/utils";

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItem[];
}

export function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
    const { t, i18n } = useTranslation(['common']);
    const isRTL = i18n.dir() === 'rtl';

    return (
        <Breadcrumb>
            <BreadcrumbList className={cn(isRTL && "flex-row-reverse")}>
                {breadcrumbs.map((breadcrumb, index) => (
                    <Fragment key={index}>
                        {index > 0 && (
                            <BreadcrumbSeparator>
                                {isRTL ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </BreadcrumbSeparator>
                        )}
                        <BreadcrumbItem>
                            {breadcrumb.href ? (
                                <Link href={breadcrumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                    {breadcrumb.title}
                                </Link>
                            ) : (
                                <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

// Default export for compatibility with index.ts
export default Breadcrumbs;























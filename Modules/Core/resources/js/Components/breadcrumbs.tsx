import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItem[];
}

export function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
    const { t } = useTranslation(['common']);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                    <Fragment key={index}>
                        <BreadcrumbItem>
                            {breadcrumb.href ? (
                                <BreadcrumbLink asChild>
                                    <Link href={breadcrumb.href}>{breadcrumb.title}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator>
                                <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                        )}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

// Default export for compatibility with index.ts
export default Breadcrumbs;























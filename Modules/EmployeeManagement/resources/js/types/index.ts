import { useTranslation } from 'react-i18next';
export interface PageProps {
  auth: {
    user: any;
  };
  errors: Record<string, string>;
  flash?: {
    message?: string;
    [key: string]: any;
  };
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

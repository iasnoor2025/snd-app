import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Permission from '@/components/Permission';
import { useTranslation } from 'react-i18next';

interface CreateButtonProps {
  resourceType: string;
  buttonVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  text?: string;
  permission?: string;
  className?: string;
  href?: string;
}

const CreateButton: React.FC<CreateButtonProps> = ({
  resourceType,
  buttonVariant = 'default',
  buttonSize = 'default',
  text,
  permission,
  className = '',
  href,
}) => {
  const { t } = useTranslation(['common']);
  const defaultText = text || t('common:actions.add', { resource: resourceType.charAt(0).toUpperCase() + resourceType.slice(1).replace(/s$/, '') });
  const defaultHref = `/${resourceType}/create`;

  const button = (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      className={className}
      asChild
    >
      <Link href={href || defaultHref}>
        <Plus className="mr-2 h-4 w-4" />
        {defaultText}
      </Link>
    </Button>
  );

  if (permission) {
    return (
      <Permission permission={permission}>
        {button}
      </Permission>
    );
  }

  return button;
};

export default CreateButton;



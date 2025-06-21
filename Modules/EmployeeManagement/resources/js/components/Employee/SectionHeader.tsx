import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from "@/Core";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Separator className="my-4" />
    </div>
  );
}; 

















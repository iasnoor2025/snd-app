/**
 * Translatable Field Component
 * Provides UI for editing translatable fields across multiple locales
 */

import React, { useState, useEffect } from 'react';
import { Globe, AlertCircle, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '../lib/utils';
import useTranslation from '../hooks/useTranslation';

interface TranslatableFieldProps {
  name: string;
  label: string;
  value?: Record<string, string> | string;
  onChange: (value: Record<string, string>) => void;
  type?: 'input' | 'textarea';
  placeholder?: string;
  required?: boolean;
  requiredLocales?: string[];
  description?: string;
  error?: string | Record<string, string>;
  disabled?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
}

function getFlagEmoji(locale: string): string {
  const flags: Record<string, string> = {
    'en': '🇺🇸',
    'ar': '🇸🇦',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'de': '🇩🇪',
    'it': '🇮🇹',
    'pt': '🇵🇹',
    'ru': '🇷🇺',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷'
  };

  return flags[locale] || '🌐';
}

export function TranslatableField({
  name,
  label,
  value = {},
  onChange,
  type = 'input',
  placeholder,
  required = false,
  requiredLocales = ['en'],
  description,
  error,
  disabled = false,
  className,
  rows = 3,
  maxLength
}: TranslatableFieldProps) {
  const {
    locale: currentLocale,
    availableLocales,
    getDisplayName,
    isRTL,
    formatForForm,
    validateRequired
  } = useTranslation();

  const [activeTab, setActiveTab] = useState(currentLocale);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize local values
  useEffect(() => {
    const formattedValue = formatForForm(value);
    setLocalValues(formattedValue);
  }, [value, formatForForm]);

  // Validate required translations
  useEffect(() => {
    if (required && requiredLocales.length > 0) {
      const missing = validateRequired(localValues, requiredLocales);
      setValidationErrors(missing);
    }
  }, [localValues, required, requiredLocales, validateRequired]);

  const handleValueChange = (locale: string, newValue: string) => {
    const updatedValues = {
      ...localValues,
      [locale]: newValue
    };

    setLocalValues(updatedValues);
    onChange(updatedValues);
  };

  const getLocaleStatus = (locale: string) => {
    const hasValue = Boolean(localValues[locale]?.trim());
    const isRequired = requiredLocales.includes(locale);
    const isMissing = isRequired && !hasValue;

    return {
      hasValue,
      isRequired,
      isMissing,
      isComplete: hasValue
    };
  };

  const getTabIndicator = (locale: string) => {
    const status = getLocaleStatus(locale);

    if (status.isMissing) {
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    }

    if (status.isComplete) {
      return <Check className="h-3 w-3 text-green-500" />;
    }

    return null;
  };

  const renderField = (locale: string) => {
    const fieldValue = localValues[locale] || '';
    const direction = isRTL(locale) ? 'rtl' : 'ltr';
    const status = getLocaleStatus(locale);
    const fieldError = typeof error === 'object' ? error[locale] : undefined;

    const commonProps = {
      value: fieldValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleValueChange(locale, e.target.value),
      placeholder: placeholder || `Enter ${label.toLowerCase()} in ${getDisplayName(locale)}`,
      disabled,
      dir: direction,
      className: cn(
        status.isMissing && "border-destructive focus:border-destructive",
        fieldError && "border-destructive focus:border-destructive"
      ),
      maxLength
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getFlagEmoji(locale)}</span>
            <span className="font-medium">{getDisplayName(locale)}</span>
            <span className="text-xs text-muted-foreground uppercase">{locale}</span>
            {status.isRequired && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                Required
              </Badge>
            )}
            {isRTL(locale) && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                RTL
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {status.isComplete && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {status.isMissing && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>

        {type === 'textarea' ? (
          <Textarea
            {...commonProps}
            rows={rows}
          />
        ) : (
          <Input {...commonProps} />
        )}

        {fieldError && (
          <p className="text-sm text-destructive">{fieldError}</p>
        )}

        {maxLength && (
          <div className="flex justify-end">
            <span className={cn(
              "text-xs text-muted-foreground",
              fieldValue.length > maxLength * 0.9 && "text-orange-500",
              fieldValue.length >= maxLength && "text-destructive"
            )}>
              {fieldValue.length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label className="text-base font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {validationErrors.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>
              Missing required translations: {validationErrors.map(getDisplayName).join(', ')}
            </span>
          </div>
        )}

        {typeof error === 'string' && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-3">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableLocales.length}, 1fr)` }}>
                {availableLocales.map((locale) => (
                  <TabsTrigger
                    key={locale}
                    value={locale}
                    className="flex items-center space-x-2"
                  >
                    <span>{getFlagEmoji(locale)}</span>
                    <span className="hidden sm:inline">{getDisplayName(locale)}</span>
                    <span className="sm:hidden uppercase">{locale}</span>
                    {getTabIndicator(locale)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>

            {availableLocales.map((locale) => (
              <TabsContent key={locale} value={locale} className="px-6 pb-6">
                {renderField(locale)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default TranslatableField;






















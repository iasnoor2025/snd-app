import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../resources/js/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../../../../resources/js/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', dir: 'rtl' },
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'default', showLabel = true }) => {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const storeLanguagePreference = (languageCode: string) => {
    // Store in localStorage
    localStorage.setItem('i18nextLng', languageCode);

    // Store in sessionStorage
    sessionStorage.setItem('i18nextLng', languageCode);

    // Store in cookie (expires in 1 year)
    document.cookie = `i18next=${languageCode}; path=/; max-age=${365 * 24 * 60 * 60}`;
  };

  const changeLanguage = (languageCode: string) => {
    const selectedLanguage = languages.find(lang => lang.code === languageCode);
    if (selectedLanguage) {
      // Change language in i18next
      i18n.changeLanguage(languageCode);

      // Update document direction for RTL support
      document.documentElement.dir = selectedLanguage.dir;
      document.documentElement.lang = languageCode;

      // Add or remove RTL class
      if (selectedLanguage.dir === 'rtl') {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }

      // Store language preference
      storeLanguagePreference(languageCode);

      // Force reload the page to ensure all components update properly
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={variant === 'compact' ? 'icon' : 'sm'} className={variant === 'default' ? 'gap-2' : ''}>
          <Globe className="h-4 w-4" />
          {showLabel && variant !== 'compact' && (
            <>
              <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
              <span className="sm:hidden">{currentLanguage.flag}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${i18n.language === language.code ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;






















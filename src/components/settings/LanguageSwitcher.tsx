
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/contexts/FirebaseContext';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const { userSettings, updateSettings } = useFirebase();
  
  const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'he', name: 'עברית', dir: 'rtl' }
  ];

  const handleLanguageChange = async (langCode: string) => {
    const selectedLang = languages.find(lang => lang.code === langCode);
    if (!selectedLang) return;
    
    i18n.changeLanguage(langCode);
    document.documentElement.dir = selectedLang.dir;
    document.documentElement.lang = langCode;
    
    // Update user settings if logged in
    if (userSettings) {
      await updateSettings({ 
        rtlLayout: selectedLang.dir === 'rtl'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span className="ml-2">{t('settings.language')}</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleLanguageChange(language.code)}
          >
            <span>{language.name}</span>
            {i18n.language === language.code && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

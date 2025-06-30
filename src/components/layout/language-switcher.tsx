'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/contexts/language-context';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  const onSelectChange = (value: string) => {
    if (value === 'en' || value === 'km') {
        setLocale(value);
    }
  };

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder={t('header.language', 'Language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="km">ភាសាខ្មែរ</SelectItem>
      </SelectContent>
    </Select>
  );
}

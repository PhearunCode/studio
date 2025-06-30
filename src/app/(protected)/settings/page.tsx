'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { useTranslation } from "@/contexts/language-context";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('settingsPage.title')}</h2>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('settingsPage.profile')}</CardTitle>
          <CardDescription>
            {t('settingsPage.profileDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}

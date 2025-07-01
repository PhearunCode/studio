'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { UserManagement } from "@/components/settings/user-management";
import { useTranslation } from "@/contexts/language-context";
import { User, Users } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t('settingsPage.title')}</h2>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            {t('settingsPage.profileTab', 'Profile')}
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            {t('settingsPage.usersTab', 'Users')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-6 max-w-2xl">
            <Card>
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
        </TabsContent>

        <TabsContent value="users">
            <Card>
                <CardHeader>
                    <CardTitle>{t('settingsPage.userManagementTitle', 'User Management')}</CardTitle>
                    <CardDescription>
                        {t('settingsPage.userManagementDesc', 'View and manage users with access to the admin panel.')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserManagement />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

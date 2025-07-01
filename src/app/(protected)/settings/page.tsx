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
import { Button } from "@/components/ui/button";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useRouter } from 'next/navigation';
import { LifeBuoy, LogOut, User, Users } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('settingsPage.title')}</h2>

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

            <Card>
              <CardHeader>
                <CardTitle>{t('header.myAccount')}</CardTitle>
                <CardDescription>
                  {t('settingsPage.accountDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://example.com/support" target="_blank" rel="noopener noreferrer">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    {t('header.support')}
                  </a>
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.logout')}
                </Button>
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

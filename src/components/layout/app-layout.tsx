'use client';
import { ReactNode, useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase-client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Landmark, LayoutDashboard, Users, UserCircle, Banknote, CreditCard, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';
import { useTranslation } from '@/contexts/language-context';
import { LanguageSwitcher } from './language-switcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { CambodiaClock } from './cambodia-clock';

function BottomNavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { href: '/loans', label: t('sidebar.loans'), icon: Banknote },
    { href: '/payments', label: t('sidebar.payments'), icon: CreditCard },
    { href: '/borrowers', label: t('sidebar.borrowers'), icon: Users },
    { href: '/settings', label: t('sidebar.settings'), icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mt-auto border-t bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="mx-auto flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-xs font-medium',
              isActive(item.href)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}


interface Profile {
  name: string;
  avatar: string;
}

const STORAGE_KEY = 'user-profile';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => pathname === path;
  
  const [displayProfile, setDisplayProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Sync display profile from auth state or fallback to localStorage
    if (user) {
        setDisplayProfile({
            name: user.displayName || user.email || 'Admin User',
            avatar: user.photoURL || '',
        });
    } else {
        try {
            const storedProfile = localStorage.getItem(STORAGE_KEY);
            if (storedProfile) {
                setDisplayProfile(JSON.parse(storedProfile));
            } else {
                setDisplayProfile({ name: 'Admin User', avatar: '' });
            }
        } catch (error) {
            console.error("Failed to parse user profile from localStorage", error);
            setDisplayProfile({ name: 'Admin User', avatar: '' });
        }
    }
    
    // Listen for manual profile updates (e.g., from settings page)
    const handleProfileUpdate = () => {
        const storedProfile = localStorage.getItem(STORAGE_KEY);
        if (storedProfile) setDisplayProfile(JSON.parse(storedProfile));
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);

  }, [user]);

  const handleLogout = async () => {
    if (app) {
        const auth = getAuth(app);
        await signOut(auth);
    }
    router.push('/login');
  };

  const MobileHeader = () => (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
        <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Landmark className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold font-headline">LendEasy PH</h1>
        </div>

        <div className="flex-1" />
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={displayProfile?.avatar || `https://avatar.vercel.sh/${displayProfile?.name}.png`} alt={displayProfile?.name ?? 'User'} />
              <AvatarFallback>
                {displayProfile ? getInitials(displayProfile.name) : <UserCircle className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{displayProfile?.name ?? t('header.myAccount')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">{t('header.settings')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="https://example.com/support" target="_blank" rel="noopener noreferrer">{t('header.support')}</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('header.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );

  const DesktopHeader = () => (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex-1" />
      <CambodiaClock />
      <LanguageSwitcher />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={displayProfile?.avatar || `https://avatar.vercel.sh/${displayProfile?.name}.png`} alt={displayProfile?.name ?? 'User'} />
              <AvatarFallback>
                {displayProfile ? getInitials(displayProfile.name) : <UserCircle className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{displayProfile?.name ?? t('header.myAccount')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">{t('header.settings')}</Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <a href="https://example.com/support" target="_blank" rel="noopener noreferrer">{t('header.support')}</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('header.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );

  if (isMobile) {
    return (
      <>
        <MobileHeader />
        <main className="flex-1 pb-20">
          {children}
        </main>
        <BottomNavBar />
      </>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="floating" title="Main Menu">
        <SidebarHeader>
          <div className="flex items-center gap-2 py-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Landmark className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold font-headline group-data-[collapsible=icon]:hidden">LendEasy PH</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={t('sidebar.dashboard')} isActive={isActive('/')} asChild>
                  <Link href="/">
                    <LayoutDashboard />
                    <span>{t('sidebar.dashboard')}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={t('sidebar.loans')} isActive={isActive('/loans')} asChild>
                  <Link href="/loans">
                    <Banknote />
                    <span>{t('sidebar.loans')}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={t('sidebar.payments')} isActive={isActive('/payments')} asChild>
                  <Link href="/payments">
                    <CreditCard />
                    <span>{t('sidebar.payments')}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={t('sidebar.borrowers')} isActive={isActive('/borrowers')} asChild>
                  <Link href="/borrowers">
                    <Users />
                    <span>{t('sidebar.borrowers')}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip={t('sidebar.settings')} isActive={isActive('/settings')} asChild>
                    <Link href="/settings">
                        <Settings />
                        <span>{t('sidebar.settings')}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <DesktopHeader />
        <main>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

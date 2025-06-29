
'use client';
import { ReactNode, useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Landmark, LayoutDashboard, Users, UserCircle, Banknote, CreditCard, Send } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

interface Profile {
  name: string;
  avatar: string;
}

const STORAGE_KEY = 'user-profile';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [isClient, setIsClient] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const loadProfile = () => {
    try {
       const storedProfile = localStorage.getItem(STORAGE_KEY);
       if (storedProfile) {
         setProfile(JSON.parse(storedProfile));
       } else {
         const defaultProfile = { name: 'Admin User', email: 'admin@lendeasy.ph', avatar: '' };
         setProfile(defaultProfile);
         localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
       }
    } catch (error) {
       console.error("Failed to parse user profile from localStorage", error);
       setProfile({ name: 'Admin User', avatar: '' });
    }
 };

  useEffect(() => {
    if (!isClient) return;
    
    loadProfile();

    window.addEventListener('profile-updated', loadProfile);
    
    return () => {
      window.removeEventListener('profile-updated', loadProfile);
    };
  }, [isClient]);

  if (!isClient) {
    return null;
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
                <SidebarMenuButton tooltip="Dashboard" isActive={isActive('/')} asChild>
                  <Link href="/">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Loans" isActive={isActive('/loans')} asChild>
                  <Link href="/loans">
                    <Banknote />
                    <span>Loans</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Payments" isActive={isActive('/payments')} asChild>
                  <Link href="/payments">
                    <CreditCard />
                    <span>Payments</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Customers" isActive={isActive('/customers')} asChild>
                  <Link href="/customers">
                    <Users />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Telegram" isActive={isActive('/telegram')} asChild>
                    <Link href="/telegram">
                        <Send />
                        <span>Telegram</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar || `https://avatar.vercel.sh/${profile?.name}.png`} alt={profile?.name ?? 'User'} />
                  <AvatarFallback>
                    {profile ? getInitials(profile.name) : <UserCircle className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{profile?.name ?? 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

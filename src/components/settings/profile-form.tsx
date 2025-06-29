
'use client';

import { useState, useEffect, type FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Profile {
  name: string;
  email: string;
  avatar: string;
}

const STORAGE_KEY = 'user-profile';

export function ProfileForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', avatar: '' });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
      const defaultProfile = { name: 'Admin User', email: 'admin@lendeasy.ph', avatar: '' };
      setProfile(defaultProfile);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
        className: 'bg-accent text-accent-foreground',
      });
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const avatarSrc = profile.avatar || `https://avatar.vercel.sh/${profile.name}.png`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarSrc} alt={profile.name} />
          <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
            <Label htmlFor="avatar">Avatar URL or Upload</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="avatar"
                    name="avatar"
                    placeholder="https://example.com/avatar.png"
                    value={profile.avatar}
                    onChange={handleInputChange}
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          required
          value={profile.name}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={profile.email}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}

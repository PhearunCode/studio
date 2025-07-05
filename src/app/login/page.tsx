'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app, auth as firebaseAuth } from '@/lib/firebase-client';
import { useAuth } from '@/components/auth/auth-provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Landmark, AlertTriangle, LogIn } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/google-icon';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function FirebaseClientSetupInstructions() {
    return (
        <div className="flex h-screen items-center justify-center p-4">
            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle>Firebase Not Connected</CardTitle>
                    <CardDescription>
                        Client-side Firebase configuration is missing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        Please ensure you have set up your client-side Firebase credentials in the 
                        <code>.env</code> file. The following variables are required:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm bg-muted p-4 rounded-md">
                        <li><code>NEXT_PUBLIC_FIREBASE_API_KEY</code></li>
                        <li><code>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code></li>
                        <li><code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code></li>
                        <li><code>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</code></li>
                        <li><code>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</code></li>
                        <li><code>NEXT_PUBLIC_FIREBASE_APP_ID</code></li>
                    </ul>
                     <p className="mt-4">
                        After updating the <code>.env</code> file, you must restart your development server.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function GoogleSignInButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    if (!app) {
        setError("Firebase is not configured. Please check your environment variables.");
        setIsSigningIn(false);
        return;
    }
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsSigningIn(false);
    }
  };

  return (
    <>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Sign-in Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn}>
            {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Sign in with Google
        </Button>
    </>
  );
}


function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="admin@lendeasy.ph" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
            Or continue with
            </span>
        </div>
      </div>
      <GoogleSignInButton />
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setError(null);
    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.name });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  }
  
  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Registration Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Juan dela Cruz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="admin@lendeasy.ph" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
            Or continue with
            </span>
        </div>
      </div>
      <GoogleSignInButton />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // If the user came here via the logout button, ensure they are logged out.
    if (searchParams.get('logout') === 'true' && user) {
        const auth = getAuth(app);
        signOut(auth);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);
  
  if (!firebaseAuth) {
    return <FirebaseClientSetupInstructions />;
  }

  if (loading || (!loading && user)) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex h-dvh min-h-[550px] items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                  <Landmark className="h-6 w-6" />
                </div>
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">LendEasy PH</h1>
            <p className="text-muted-foreground">Admin Access Portal</p>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Enter your details to create a new admin account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}

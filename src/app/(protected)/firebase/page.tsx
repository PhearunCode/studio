
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function FirebasePage() {
  const envExample = `
# Firebase Client SDK (for Browser)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Firebase Admin SDK (for Server)
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_CLIENT_EMAIL=YOUR_CLIENT_EMAIL
# Make sure to wrap the private key in quotes if it contains special characters
FIREBASE_PRIVATE_KEY="YOUR_PRIVATE_KEY"
  `.trim();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Firebase Connection</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to connect your application to your Firebase project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Create or Select a Firebase Project</h3>
            <p className="text-muted-foreground">
              Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a> and create a new project, or select an existing one.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Get Client-Side (Web App) Credentials</h3>
            <p className="text-muted-foreground">
              In your Firebase project, go to <span className="font-semibold">Project Settings</span> (click the gear icon). Under the <span className="font-semibold">General</span> tab, scroll down to "Your apps". If you don't have a web app, click the web icon (<code>&lt;/&gt;</code>) to create one.
            </p>
             <p className="text-muted-foreground">
              Once you have a web app, find the <span className="font-semibold">SDK setup and configuration</span> section and select the "Config" option. This will show you the configuration object with keys like `apiKey`, `authDomain`, etc.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">3. Get Server-Side (Admin SDK) Credentials</h3>
            <p className="text-muted-foreground">
              In your Firebase project, go to <span className="font-semibold">Project Settings</span> and click on the <span className="font-semibold">Service accounts</span> tab.
            </p>
             <p className="text-muted-foreground">
              Click the "Generate new private key" button. This will download a JSON file. Open this file and find the `project_id`, `client_email`, and `private_key` values.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">4. Update Environment Variables</h3>
            <p className="text-muted-foreground">
              Open the <code>.env</code> file in your project and add the values you collected in the previous steps.
            </p>
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>File: .env</AlertTitle>
                <AlertDescription>
                    <pre className="mt-2 rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                        <code>
                            {envExample}
                        </code>
                    </pre>
                </AlertDescription>
            </Alert>
          </div>

           <div className="space-y-2">
            <h3 className="font-semibold">5. Restart Your Server</h3>
            <p className="text-muted-foreground">
              After updating the <code>.env</code> file, you must restart the application server for the changes to take effect.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

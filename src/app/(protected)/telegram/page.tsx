'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { sendTestNotificationAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Send, Loader2 } from "lucide-react";
import type { FormState } from '@/lib/types';


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Test Notification
        </Button>
    );
}


export default function TelegramPage() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(sendTestNotificationAction, null);

  const envExample = `
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
  `.trim();

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: state.message,
        className: 'bg-accent text-accent-foreground',
      });
    }
  }, [state, toast]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Telegram Notifications</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to enable Telegram notifications for new loan applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Create a Telegram Bot</h3>
            <p className="text-muted-foreground">
              Open Telegram and search for the <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary underline">@BotFather</a>. Start a chat and send the <code>/newbot</code> command. Follow the instructions to create a new bot and obtain your bot token.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Find Your Chat ID</h3>
            <p className="text-muted-foreground">
              Search for the <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-primary underline">@userinfobot</a> on Telegram, start a chat, and it will reply with your user ID. This will be your chat ID.
            </p>
             <p className="text-muted-foreground">
              After getting your chat ID, you must send a <code>/start</code> message to the bot you created in step 1. The bot cannot initiate a conversation with you.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Update Environment Variables</h3>
            <p className="text-muted-foreground">
              Open the <code>.env</code> file in your project and add the following lines, replacing the placeholder values with your actual bot token and chat ID.
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
            <h3 className="font-semibold">4. Restart Your Server</h3>
            <p className="text-muted-foreground">
              After updating the <code>.env</code> file, you must restart the application server for the changes to take effect.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">5. Test Your Connection</h3>
            <p className="text-muted-foreground">
                Once you have completed the steps above, click the button below to send a test message to your Telegram chat.
            </p>
          </div>
        </CardContent>
        <CardFooter>
            <form action={formAction}>
                <SubmitButton />
            </form>
        </CardFooter>
      </Card>
    </div>
  );
}

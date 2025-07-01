'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { getUsersAction } from '@/lib/actions';
import { type AppUser } from '@/lib/types';
import { getInitials } from '@/lib/utils';

function UserManagementSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[100px]" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                             <Skeleton className="h-4 w-[200px]" />
                        </TableCell>
                        <TableCell>
                             <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export function UserManagement() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            const userList = await getUsersAction();
            setUsers(userList);
            setLoading(false);
        }
        fetchUsers();
    }, []);

    if (loading) {
        return <UserManagementSkeleton />;
    }
    
    if (users.length === 0) {
        return (
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Admin Users Found</AlertTitle>
                <AlertDescription>
                    <p>There are no users configured in your Firestore `users` collection.</p>
                    <p className="mt-2">To add an admin, go to your Firebase Console, create a `users` collection, add a document with the user's Authentication UID, and add a field `role` with the value `admin`.</p>
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.uid}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.displayName || user.email}.png`} alt={user.displayName || user.email} />
                                        <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-0.5">
                                        <p className="font-medium">{user.displayName || 'Unnamed User'}</p>
                                        <p className="text-xs text-muted-foreground hidden sm:block">{user.uid}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

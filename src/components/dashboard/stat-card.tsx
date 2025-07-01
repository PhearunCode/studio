import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  description?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, icon, description, className, onClick }: StatCardProps) {
  return (
    <Card className={cn(className, onClick && "cursor-pointer transition-opacity hover:opacity-90")} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold sm:text-xl xl:text-2xl">{value}</div>
        {description && <p className="text-xs opacity-80">{description}</p>}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function CambodiaClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = time.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="hidden items-center gap-2 rounded-md border bg-background px-3 py-1.5 lg:flex">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="text-sm">
        <span className="font-medium text-foreground">{formattedTime}</span>
        <span className="text-muted-foreground"> ({formattedDate})</span>
      </div>
    </div>
  );
}

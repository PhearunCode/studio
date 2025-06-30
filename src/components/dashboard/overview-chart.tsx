'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

interface OverviewChartProps {
  data: { name: string; KHR: number; USD: number }[];
}

const chartConfig = {
  KHR: {
    label: 'KHR',
    color: 'hsl(var(--chart-1))',
  },
  USD: {
    label: 'USD',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;


export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
                if (value >= 1000000) return `${value / 1000000}M`;
                if (value >= 1000) return `${value / 1000}K`;
                return `${value}`;
            }}
            label={{ value: 'Total Amount', angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fontSize: '12px', fill: 'hsl(var(--muted-foreground))' } }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent
                formatter={(value, name) => formatCurrency(value as number, name as 'KHR' | 'USD')}
                labelClassName="font-bold"
                indicator="dot"
             />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="KHR" fill="var(--color-KHR)" radius={4} />
          <Bar dataKey="USD" fill="var(--color-USD)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

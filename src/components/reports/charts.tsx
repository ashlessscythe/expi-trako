"use client";

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";

const statusChartConfig = {
  status: {
    label: "Status",
    color: "hsl(var(--chart-1))"
  }
} satisfies ChartConfig;

const volumeChartConfig = {
  count: {
    label: "Requests",
    color: "hsl(var(--chart-1))"
  }
} satisfies ChartConfig;

const transloadChartConfig = {
  count: {
    label: "Trailers",
    color: "hsl(var(--chart-2))"
  }
} satisfies ChartConfig;

interface StatusChartProps {
  data: { name: string; value: number }[];
}

export function StatusChart({ data }: StatusChartProps) {
  return (
    <ChartContainer config={statusChartConfig} className="h-full">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}

interface VolumeChartProps {
  data: { date: string; count: number }[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <ChartContainer config={volumeChartConfig} className="h-full">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => value.slice(5)} 
          tickLine={false}
        />
        <YAxis tickLine={false} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </LineChart>
    </ChartContainer>
  );
}

interface TransloadChartProps {
  data: { period: string; count: number }[];
}

export function TransloadChart({ data }: TransloadChartProps) {
  return (
    <ChartContainer config={transloadChartConfig} className="h-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="period"
          tickLine={false}
        />
        <YAxis tickLine={false} />
        <Bar 
          dataKey="count" 
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
}

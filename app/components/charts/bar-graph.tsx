'use client';
import clsx from 'clsx';
import { format as formatDate, startOfWeek } from 'date-fns';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import type { QuerySuccessResult, Transaction } from '../../dsl/service';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface BarGraphProps {
  data?: QuerySuccessResult;
  className?: string;
}

const TIME_INTERVALS = ['daily', 'weekly', 'monthly', 'yearly', 'all'] as const;
type TimeInterval = (typeof TIME_INTERVALS)[number];
interface TimeIntervalFormat {
  key: string;
  format: (date: Date) => string;
}
const TIME_INTERVAL_FORMATS: Record<
  Exclude<TimeInterval, 'all'>,
  TimeIntervalFormat
> = {
  daily: {
    key: 'dd/MM/yy',
    format: (date: Date) => formatDate(date, 'dd/MM/yy'),
  },
  weekly: {
    key: 'wo,MM/yy',
    format: (date: Date) =>
      formatDate(startOfWeek(date, { weekStartsOn: 1 }), 'dd/MM/yy'),
  },
  monthly: {
    key: 'MM/yy',
    format: (date: Date) => formatDate(date, 'MMMM yy'),
  },
  yearly: {
    key: 'yyyy',
    format: (date: Date) => formatDate(date, 'yyyy'),
  },
};
type AggregationKey = Exclude<keyof Transaction, 'createdAt' | 'id'>;
const AGGREGATION_KEYS: AggregationKey[] = [
  'accountId',
  'amount',
  'categoryId',
  'description',
  'parentCategoryId',
  'status',
  'type',
];
const AGGREGATION_OPERATIONS = ['sum', 'avg', 'min', 'max'];
type AggregationOperation = 'sum' | 'avg' | 'min' | 'max';
const AGGREGATORS: Record<
  AggregationOperation,
  (transactions: Transaction[], key: AggregationKey) => number
> = {
  sum: (transactions, key) =>
    transactions.reduce((sum, t) => {
      const value = t[key];
      if (typeof value !== 'number') {
        return 0;
      }
      return sum + value;
    }, 0),
  avg: (transactions, key) =>
    transactions.reduce((sum, t) => {
      const value = t[key];
      if (typeof value !== 'number') {
        return 0;
      }
      return sum + value;
    }, 0) / transactions.length,
  min: (transactions, key) => {
    const numericValues = transactions
      .map(t => t[key])
      .filter((value): value is number => typeof value === 'number');
    
    if (numericValues.length === 0) return 0;
    
    return numericValues.reduce((min, current) => 
      Math.abs(min) > Math.abs(current) ? current : min
    );
  },
  max: (transactions, key) => {
    const numericValues = transactions
      .map(t => t[key])
      .filter((value): value is number => typeof value === 'number');
    
    if (numericValues.length === 0) return 0;
    
    return numericValues.reduce((max, current) => 
      Math.abs(max) < Math.abs(current) ? current : max
    );
  },
};

export function BarGraph({ data, className }: BarGraphProps) {
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('daily');
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [aggKey, setAggKey] = useState<AggregationKey>('amount');
  const [aggOp, setAggOp] = useState<AggregationOperation>('sum');

  const transactions = data?.success ? data.transactions : [];
  const grouped = Object.groupBy(transactions, ({ createdAt }) =>
    timeInterval === 'all'
      ? 'all'
      : TIME_INTERVAL_FORMATS[timeInterval].format(createdAt),
  );
  const aggregated = Object.entries(grouped).map(
    ([createdAt, transactions]) => ({
      createdAt,
      aggregated: AGGREGATORS[aggOp](transactions || [], aggKey),
    }),
  );

  useEffect(() => {
    setChartConfig({
      aggregated: {
        label: aggKey,
      },
    });
  }, [aggKey]);

  return (
    <div className="bg-neutral-800 border p-2 rounded-md">
      <ChartContainer
        config={chartConfig}
        className={clsx('max-h-[350px] w-full', className)}
      >
        <BarChart accessibilityLayer data={aggregated}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="createdAt"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis reversed tickFormatter={(value) => `$${value}`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="aggregated" fill="white" radius={4} />
        </BarChart>
      </ChartContainer>
      <div className="flex flex-row gap-2">
        <Select
          value={timeInterval}
          onValueChange={(value: TimeInterval) => setTimeInterval(value)}
        >
          <SelectTrigger className="h-7!">
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {TIME_INTERVALS.map((interval) => (
                <SelectItem key={interval} value={interval}>
                  {interval}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={aggKey}
          onValueChange={(value: AggregationKey) => setAggKey(value)}
        >
          <SelectTrigger className="h-7!">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {AGGREGATION_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={aggOp}
          onValueChange={(value: AggregationOperation) => setAggOp(value)}
        >
          <SelectTrigger className="h-7!">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {AGGREGATION_OPERATIONS.map((op) => (
                <SelectItem key={op} value={op}>
                  {op}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

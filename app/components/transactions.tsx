import type { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Loader2Icon } from 'lucide-react';
import type { Transaction } from '../api/types';
import type { QueryResult } from '../dsl/service';
import { toTitleCase } from '../lib/utils';
import { Button } from './ui/button';
import { DataTable } from './ui/data-table';

interface SortableHeaderProps {
  column: Column<any>;
  title: string;
}

function SortableHeader({ column, title }: SortableHeaderProps) {
  return (
    <Button
      variant="ghost"
      className="px-0!"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'attributes.createdAt',
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
    cell: ({ cell }) => {
      const date = new Date(cell.getValue() as string);
      const formattedDate = date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString();
      return (
        <div className="whitespace-nowrap max-w-[100px]">
          <span>{formattedDate}</span>{' '}
          <span className="text-neutral-400">{formattedTime}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'attributes.description',
    header: ({ column }) => (
      <SortableHeader column={column} title="Description" />
    ),
    cell: ({ cell }) => (
      <div className="truncate" title={cell.getValue() as string}>
        {cell.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: 'relationships.category.data.id',
    header: ({ column }) => <SortableHeader column={column} title="Category" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      const formatted = value ? toTitleCase(value, '-') : 'None';
      return (
        <div
          className={`truncate ${!value ? 'text-neutral-400' : ''}`}
          title={value}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: 'attributes.amount.valueInBaseUnits',
    header: ({ column }) => <SortableHeader column={column} title="Amount" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      const isDebit = value < 0;
      const amount = Math.abs(value) / 100;
      const formatted = `${isDebit ? '-' : '+'}$${amount}`;
      return (
        <div
          className={`whitespace-nowrap ${isDebit ? 'text-red-500' : 'text-green-500'}`}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: 'attributes.transactionType',
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <div className={!value ? 'text-neutral-400' : ''}>
          {value || 'Unknown'}
        </div>
      );
    },
  },
];

interface TransactionTableProps {
  data: QueryResult | null;
  isExecuting?: boolean;
}

export function TransactionTable({
  data,
  isExecuting = false,
}: TransactionTableProps) {
  const transactions = data?.success ? data.transactions : [];

  return (
    <div className="relative">
      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isExecuting}
      />
      {isExecuting && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/10 pointer-events-none">
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

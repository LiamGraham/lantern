import type { Cell, Column, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowUpDown, Loader2Icon } from 'lucide-react';
import { CATEGORY_LOOKUP, type RawTransaction } from '../api/types';
import type { QueryResult, QuerySuccessResult, Transaction } from '../dsl/service';
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

interface CategoryCellProps {
  cell: Cell<Transaction, unknown>;
}

function CategoryCell({ cell }: CategoryCellProps) {
  const value = cell.getValue() as keyof typeof CATEGORY_LOOKUP;
  const category = CATEGORY_LOOKUP[value];
  const formatted = value ? category : 'None';
  return (
    <div
      className={`truncate ${!value ? 'text-neutral-400' : ''}`}
      title={value}
    >
      {formatted}
    </div>
  );
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
    cell: ({ cell }) => {
      const date = cell.getValue<Date>()
      const formattedDate = date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString();
      const fullText = `${formattedDate} ${formattedTime}`;
      return (
        <div className="" title={fullText}>
          <span>{formattedDate}</span>{' '}
          <span className="text-neutral-400">{formattedTime}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'description',
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
    accessorKey: 'categoryId',
    header: ({ column }) => (
      <SortableHeader column={column} title="Category" />
    ),
    cell: ({ cell }) => <CategoryCell cell={cell} />,
  },
  // {
  //   accessorKey: 'relationships.parentCategory.data.id',
  //   header: ({ column }) => <SortableHeader column={column} title="Category" />,
  //   cell: ({ cell }) => <CategoryCell cell={cell} />,
  // },
  {
    accessorKey: 'amount',
    header: ({ column }) => <SortableHeader column={column} title="Amount" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      const isDebit = value < 0;
      const amount = Math.abs(value);
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
    accessorKey: 'type',
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
  className?: string;
  data?: QuerySuccessResult;
  isExecuting?: boolean;
}

export function TransactionTable({
  data,
  isExecuting = false,
  className,
}: TransactionTableProps) {
  const transactions = data?.transactions || [];

  return (
    <div className={clsx('relative', className)}>
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

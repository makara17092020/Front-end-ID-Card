"use client";

import React, { useState } from "react";
import { requestCards } from "@/lib/api/cards-api";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/lib/pagination";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Badge } from "@/components/ui/badge";
import type { ICard } from "@/types/cards-type";
import { Toaster, toast } from "sonner";
import type { AxiosResponse } from "axios";

dayjs.extend(utc);
dayjs.extend(timezone);

const CardsTable: React.FC = () => {
  const { CARDS, DELETE_CARD } = requestCards();
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null);

  const sortField = sorting[0]?.id ?? "created_at";
  const sortOrder = sorting.length === 0 ? "DESC" : sorting[0].desc ? "DESC" : "ASC";

  const { data, isLoading } = useQuery({
    queryKey: ["cards", pagination.pageIndex, pagination.pageSize, sortField, sortOrder],
    queryFn: () =>
      CARDS({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortBy: sortField,
        sortOrder,
      }),
  });

  const deleteCardMutation = useMutation<AxiosResponse<any>, Error, string>({
    mutationFn: (id: string) => DELETE_CARD(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card deleted successfully!");
      setCardIdToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete card.");
    },
  });

  const ConfirmDeleteDialog = () => {
    if (!cardIdToDelete) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        onClick={() => setCardIdToDelete(null)}
      >
        <div
          className="bg-white p-6 rounded shadow-lg w-96"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
          <p className="mb-6">Are you sure you want to delete this card?</p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setCardIdToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteCardMutation.mutate(cardIdToDelete)}
              disabled={deleteCardMutation.isPending}
            >
              {deleteCardMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const columns: ColumnDef<ICard>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "no",
      header: "No.",
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        return <div>{pageIndex * pageSize + row.index + 1}</div>;
      },
    },
    {
      id: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Full Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        typeof row.original.user === "object" && "full_name" in row.original.user
          ? row.original.user.full_name
          : "",
    },
    {
      id: "user_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Username <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        typeof row.original.user === "object" && "user_name" in row.original.user
          ? row.original.user.user_name
          : "",
    },
    {
      accessorKey: "card_type",
      header: "Type",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const rawDate = row.getValue("created_at") as string;
        return (
          <div>{dayjs(rawDate).add(7, "hour").format("YYYY-MM-DD hh:mm A")}</div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Badge
            variant="destructive"
            className="cursor-pointer"
            onClick={() => setCardIdToDelete(row.original.id)}
          >
            <Trash className="w-3 h-3 mr-1" /> Delete
          </Badge>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    pageCount: data?.meta ? Math.ceil(data.meta.total / data.meta.limit) : -1,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
  });

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Cards Table</h2>
          <Input
            placeholder="Filter card name..."
            value={
              (table.getColumn("full_name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("full_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {table.getAllColumns().map((column) =>
              column.getCanHide() ? (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ) : null
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
        <span className="text-sm text-muted-foreground">
          Page {data?.meta?.page || 1} of {table.getPageCount()}
        </span>
      </div>

      {cardIdToDelete && <ConfirmDeleteDialog />}
    </div>
  );
};

export default CardsTable;

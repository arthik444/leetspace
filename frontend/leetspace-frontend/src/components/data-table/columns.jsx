import { MoreHorizontal, Edit, Trash2,ArrowUpDown,Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const colorMap = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

export const columns = (onEdit, onDelete) => [
  {
    id: "select",
    header: ({ table }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      headerClass: "hidden sm:table-cell",
      cellClass: "hidden sm:table-cell",
    },
  },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "difficulty",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
          >
            Difficulty
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        const aValue = difficultyOrder[rowA.getValue(columnId)] || 0;
        const bValue = difficultyOrder[rowB.getValue(columnId)] || 0;
        return aValue - bValue;
      },
      cell: ({ row }) => <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorMap[row.original.difficulty]}`}>
      {row.original.difficulty}
    </span>
    },
    {
      accessorKey: "tags",
      header: "Tags",
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        const rowTags = row.getValue(id);
        if (!rowTags || !Array.isArray(rowTags)) return false;
        // Check if any of the selected tags are present in the row's tags (OR condition)
        return value.some(selectedTag => rowTags.includes(selectedTag));
      },
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        const displayTags = tags.slice(0, 5);
        const hasMoreTags = tags.length > 5;
        const allTagsText = tags.join(", ");
        
        return (
          <div 
            className="relative group"
          >
            <div className="max-w-xs">
              {displayTags.join(", ")}
              {hasMoreTags && "..."}
            </div>
            
            {/* Tooltip */}
            {hasMoreTags && (
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 max-w-sm">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded py-2 px-3 shadow-lg">
                  <div className="whitespace-pre-wrap break-words">
                    {allTagsText}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </div>
              </div>
            )}
          </div>
        );
      },
      meta: {
        headerClass: "hidden md:table-cell",
        cellClass: "hidden md:table-cell",
      },
    },
    {
      accessorKey: "retry_later",
      id: "revisit",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
          >
            Revisit
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        if (value === undefined) return true;
        const rowValue = row.getValue(id);
        const normalizedRowValue = rowValue === true || rowValue === "true" || rowValue === "Yes";
        const normalizedFilterValue = value === true;
        return normalizedRowValue === normalizedFilterValue;
      },
      cell: ({ row }) => {
        const retryLater = row.original.retry_later;
        const shouldShowCheck = retryLater === true || retryLater === "true" || retryLater === "Yes";
        return (
          <div className="flex items-center justify-center w-full h-10">
            {shouldShowCheck && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>
        );
      },
      meta: {
        headerClass: "hidden sm:table-cell",
        cellClass: "hidden sm:table-cell text-center align-middle w-24",
      }
    },
    {
      accessorKey: "Action",
      header: "",
      id: "actions",
      cell: ({ row }) => {
        const problem = row.original

        const handleEdit = (e) => {
          e.stopPropagation(); // Prevent row click navigation
          if (onEdit) {
            onEdit(problem);
          }
        };

        const handleDelete = (e) => {
          e.stopPropagation(); // Prevent row click navigation
          if (onDelete) {
            onDelete(problem);
          }
        };
   
        return (
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="cursor-pointer h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
              onClick={(e) => e.stopPropagation()} // Prevent row click when opening menu
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-md rounded-md text-sm text-gray-800 dark:text-gray-200"
          >
            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem 
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 border-gray-200 dark:border-zinc-700" />
            <DropdownMenuItem 
              className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )
      },
    },
  ];
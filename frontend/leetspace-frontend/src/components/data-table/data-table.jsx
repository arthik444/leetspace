import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { problemsAPI } from "@/lib/api";
import { Filter, X, Search, Tag, Trash2  } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable({ data, columns,onDataChange }) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({
    select: false, // Hide selection column by default
  });
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [revisitOnly, setRevisitOnly] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const cn = (...classes) => classes.filter(Boolean).join(" ");

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
  
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  
    return () => observer.disconnect();
  }, []);

   // Effect to handle selection mode changes
   React.useEffect(() => {
    if (!selectionMode) {
      setRowSelection({}); // Clear selection when disabling selection mode
    }
    // Control select column visibility
    setColumnVisibility(prev => ({
      ...prev,
      select: selectionMode
    }));
  }, [selectionMode]);

  // Get all unique tags from the data
  const allTags = React.useMemo(() => {
    const tagSet = new Set();
    data.forEach(problem => {
      if (problem.tags && Array.isArray(problem.tags)) {
        problem.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [data]);

  // Filter tags based on search
  const filteredTags = React.useMemo(() => {
    if (!tagSearch) return allTags;
    return allTags.filter(tag => 
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [allTags, tagSearch]);

  const table = useReactTable({
    data,
    columns,
    state: { 
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection 
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selectionMode,
    getRowId: (row) => row.id,
  });

 // Handle difficulty filter
 React.useEffect(() => {
  if (difficultyFilter) {
    table.getColumn("difficulty")?.setFilterValue(difficultyFilter);
  } else {
    table.getColumn("difficulty")?.setFilterValue(undefined);
  }
}, [difficultyFilter, table]);

  // Handle tags filter
  React.useEffect(() => {
    if (selectedTags.length > 0) {
      table.getColumn("tags")?.setFilterValue(selectedTags);
    } else {
      table.getColumn("tags")?.setFilterValue(undefined);
    }
  }, [selectedTags, table]);

  // Handle revisit filter
  React.useEffect(() => {
    if (revisitOnly) {
      table.getColumn("revisit")?.setFilterValue(true);
    } else {
      table.getColumn("revisit")?.setFilterValue(undefined);
    }
  }, [revisitOnly, table]);

  // Helper functions for tag management
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setDifficultyFilter("");
    setSelectedTags([]);
    setTagSearch("");
    setRevisitOnly(false);
  };

  const hasActiveFilters = difficultyFilter || selectedTags.length > 0;
  const filteredCount = table.getFilteredRowModel().rows.length;

    // Get selected row count and IDs
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedCount = selectedRows.length;
    const selectedIds = selectedRows.map(row => row.original.id);
  
   // Mass delete function
   const handleMassDelete = async () => {
    if (selectedCount === 0) return;

    try {
      // Delete all selected problems
      await Promise.all(
        selectedIds.map(id => 
          problemsAPI.deleteProblem(id)
        )
      );

      // Clear selection first
      setRowSelection({});
      
      // Show success toast
      toast.success(`Successfully deleted ${selectedCount} problem${selectedCount > 1 ? 's' : ''}!`,{
        style: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        }
      });
      
      // If parent provides callback, use it; otherwise refresh after a delay
      if (onDataChange) {
        // Update local state by filtering out deleted problems
        const updatedData = data.filter(problem => !selectedIds.includes(problem.id));
        onDataChange(updatedData);
      } else {
        // Delay refresh to allow toast to be seen
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
    } catch (error) {
      console.error("Error deleting problems:", error);
      toast.error("Failed to delete some problems. Please try again.",{
        style: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          border: '1px solid #e53e3e',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      });
    }
  };

  return (
    <div>
     <div className="py-4 border-b border-gray-200 dark:border-zinc-700 space-y-3">
       {/* Mobile toolbar: search + mobile filters button */}
       <div className="flex items-center gap-2 sm:hidden">
         <div className="relative w-full">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
           <Input
             placeholder="Search Problems"
             value={table.getColumn("title")?.getFilterValue() ?? ""}
             onChange={(event) =>
               table.getColumn("title")?.setFilterValue(event.target.value)
             }
             className="pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
         </div>
         <Button
           variant="outline"
           className="whitespace-nowrap"
           onClick={() => setMobileFiltersOpen(true)}
         >
           <Filter className="mr-2 h-4 w-4" /> Filters
         </Button>
       </div>

       {/* Desktop toolbar: single line with search, select, revisit, count, filters, columns */}
       <div className="hidden sm:flex items-center gap-3">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
           <Input
             placeholder="Search Problems"
             value={table.getColumn("title")?.getFilterValue() ?? ""}
             onChange={(event) =>
               table.getColumn("title")?.setFilterValue(event.target.value)
             }
             className="pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
         </div>

         {/* Selection & Revisit */}
         <div className="flex items-center gap-4 shrink-0">
           <div className="flex items-center gap-2">
             <Checkbox
               checked={selectionMode}
               onCheckedChange={setSelectionMode}
             />
             <span className="text-sm text-gray-700 dark:text-gray-300">Select</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-sm text-gray-700 dark:text-gray-300">Revisit</span>
             <button
               role="switch"
               aria-checked={revisitOnly}
               onClick={() => setRevisitOnly(!revisitOnly)}
               className={`
                 relative inline-flex h-6 w-11 items-center rounded-full
                 ${revisitOnly ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'}
                 transition-colors
               `}
             >
               <span
                 className={`
                   inline-block h-4 w-4 transform rounded-full bg-white shadow transition
                   ${revisitOnly ? 'translate-x-6' : 'translate-x-1'}
                 `}
               />
             </button>
           </div>
         </div>

         <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
           {filteredCount} problems
         </div>

         {/* Filters dropdown */}
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button
               variant="outline"
               className="text-sm cursor-pointer text-gray-800 dark:text-white bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-md"
             >
               <Filter className="mr-2 h-4 w-4" />
               Filters
               {hasActiveFilters && (
                 <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                   {(difficultyFilter ? 1 : 0) + selectedTags.length}
                 </span>
               )}
             </Button>
           </DropdownMenuTrigger>

           <DropdownMenuContent
             align="end"
             className="w-80 bg-white dark:bg-zinc-900 text-sm border border-gray-200 dark:border-zinc-700 shadow-md rounded-md"
           >
             {/* Difficulty Section */}
             <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
               Difficulty
             </DropdownMenuLabel>
             <div className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
               <Select value={difficultyFilter || "all"} onValueChange={(value) => {
                 setDifficultyFilter(value === "all" ? "" : value);
               }}>
                 <SelectTrigger className="w-full h-8 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-gray-400 rounded-md">
                   <SelectValue placeholder="Select difficulty" />
                 </SelectTrigger>
                 <SelectContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-white">
                   <SelectItem value="all" className="text-gray-800 dark:text-white">
                     All Difficulties
                   </SelectItem>
                   <SelectItem value="Easy" className="text-gray-800 dark:text-white">
                     <div className="flex items-center">
                       <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                         Easy
                       </span>
                     </div>
                   </SelectItem>
                   <SelectItem value="Medium" className="text-gray-800 dark:text-white">
                     <div className="flex items-center">
                       <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">
                         Medium
                       </span>
                     </div>
                   </SelectItem>
                   <SelectItem value="Hard" className="text-gray-800 dark:text-white">
                     <div className="flex items-center">
                       <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 mr-2">
                         Hard
                       </span>
                     </div>
                   </SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <DropdownMenuSeparator className="my-2 border-gray-200 dark:border-zinc-700" />

             {/* Tags Section */}
             <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
               Tags ({selectedTags.length} selected)
             </DropdownMenuLabel>

             {/* Tag Search */}
             <div className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
               <div className="relative">
                 <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Search tags..."
                   value={tagSearch}
                   onChange={(e) => setTagSearch(e.target.value)}
                   className="pl-8 h-8 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-zinc-600 rounded-md"
                   onClick={(e) => e.stopPropagation()}
                   onFocus={(e) => e.stopPropagation()}
                   onKeyDown={(e) => e.stopPropagation()}
                   onKeyUp={(e) => e.stopPropagation()}
                   onMouseDown={(e) => e.stopPropagation()}
                   autoComplete="off"
                 />
               </div>
             </div>

             {/* Selected Tags Display */}
             {selectedTags.length > 0 && (
               <div className="px-3 py-2 max-h-20 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                 <div className="flex flex-wrap gap-1">
                   {selectedTags.map(tag => (
                     <span
                       key={tag}
                       className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                     >
                       <Tag className="w-3 h-3 mr-1" />
                       {tag}
                       <X
                         className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-600"
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleTag(tag);
                         }}
                       />
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {/* Available Tags */}
             <div className="max-h-40 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
               {filteredTags.length > 0 ? (
                 filteredTags.map(tag => (
                   <div
                     key={tag}
                     className="flex items-center px-3 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                     onClick={(e) => {
                       e.stopPropagation();
                       e.preventDefault();
                       toggleTag(tag);
                     }}
                   >
                     <div className="flex items-center space-x-2 w-full">
                       <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                         selectedTags.includes(tag) 
                           ? 'bg-blue-500 border-blue-500' 
                           : 'border-gray-300 dark:border-zinc-600'
                       }`}>
                         {selectedTags.includes(tag) && (
                           <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         )}
                       </div>
                       <Tag className="w-4 h-4" />
                       <span className="flex-1">{tag}</span>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                   {tagSearch ? 'No tags found' : 'No tags available'}
                 </div>
               )}
             </div>

             {/* Clear All Button */}
             {hasActiveFilters && (
               <>
                 <DropdownMenuSeparator className="my-2 border-gray-200 dark:border-zinc-700" />
                 <DropdownMenuItem
                   className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                   onClick={clearAllFilters}
                 >
                   <X className="w-4 h-4 mr-2" />
                   Clear All Filters
                 </DropdownMenuItem>
               </>
             )}
           </DropdownMenuContent>
         </DropdownMenu>

         {/* Column toggle dropdown */}
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button
               variant="outline"
               className="text-sm cursor-pointer text-gray-800 dark:text-white bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-md"
             >
               Columns
             </Button>
           </DropdownMenuTrigger>

           <DropdownMenuContent
             align="end"
             className="bg-white dark:bg-zinc-900 text-sm border border-gray-200 dark:border-zinc-700 shadow-md rounded-md"
           >
             {table
               .getAllColumns()
               .filter((column) => column.getCanHide())
               .map((column) => (
                 <DropdownMenuCheckboxItem
                   key={column.id}
                   className="capitalize pl-8 pr-3 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                   checked={column.getIsVisible()}
                   onCheckedChange={(value) => column.toggleVisibility(!!value)}
                 >
                   {column.id}
                 </DropdownMenuCheckboxItem>
               ))}
           </DropdownMenuContent>
         </DropdownMenu>
       </div>

       {/* Selection & revisit - mobile only */}
       <div className="flex items-center gap-4 sm:hidden">
         <div className="flex items-center gap-2">
           <Checkbox
             checked={selectionMode}
             onCheckedChange={setSelectionMode}
           />
           <span className="text-sm text-gray-700 dark:text-gray-300">Select</span>
         </div>
         <div className="flex items-center gap-2">
           <span className="text-sm text-gray-700 dark:text-gray-300">Revisit</span>
           <button
             role="switch"
             aria-checked={revisitOnly}
             onClick={() => setRevisitOnly(!revisitOnly)}
             className={`
               relative inline-flex h-6 w-11 items-center rounded-full
               ${revisitOnly ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'}
               transition-colors
             `}
           >
             <span
               className={`
                 inline-block h-4 w-4 transform rounded-full bg-white shadow transition
                 ${revisitOnly ? 'translate-x-6' : 'translate-x-1'}
               `}
             />
           </button>
         </div>
       </div>
     </div>

     <div className="rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm">
       <Table>
         <TableHeader className="bg-gray-100 dark:bg-zinc-800">
           {table.getHeaderGroups().map((headerGroup) => (
             <TableRow key={headerGroup.id}>
               {headerGroup.headers.map((header) => (
                 <TableHead
                   key={header.id}
                   className={cn(
                     "text-xs font-medium uppercase text-gray-500 dark:text-gray-400 px-4 py-2",
                     header.column.columnDef.meta?.headerClass
                   )}
                 >
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
           {table.getRowModel().rows?.length ? (
             table.getRowModel().rows.map((row) => (
               <TableRow
                 key={row.id}
                 onClick={() => navigate(`/problems/${row.original.id}`)}
                 className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
               >
                 {row.getVisibleCells().map((cell) => (
                   <TableCell key={cell.id} className={cn("px-4 py-2", cell.column.columnDef.meta?.cellClass)}>
                     {flexRender(
                       cell.column.columnDef.cell,
                       cell.getContext()
                     )}
                   </TableCell>
                 ))}
               </TableRow>
             ))
           ) : (
             <TableRow>
               <TableCell
                 colSpan={columns.length}
                 className="h-24 text-center text-gray-500 dark:text-gray-400"
               >
                 No results.
               </TableCell>
             </TableRow>
           )}
         </TableBody>
       </Table>
     </div>

     {/* Mass delete button - only show when items are selected */}
     {selectionMode && selectedCount > 0 && (
       <AlertDialog>
         <AlertDialogTrigger asChild>
           <Button
             variant="destructive"
             size="sm"
             className="w-full sm:w-auto relative flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 font-medium"
           >
             <Trash2 className="h-4 w-4" />
             Delete ({selectedCount})
             <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-md blur-sm"></div>
           </Button>
         </AlertDialogTrigger>
         <AlertDialogContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
           <AlertDialogHeader>
             <AlertDialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
               <Trash2 className="h-5 w-5 text-red-500" />
               Confirm Deletion
             </AlertDialogTitle>
             <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
               Are you sure you want to delete {selectedCount} problem{selectedCount > 1 ? 's' : ''}? 
               This action cannot be undone and will permanently remove the selected problems from your collection.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800">
               Cancel
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={handleMassDelete}
               className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
             >
               Delete {selectedCount} Problem{selectedCount > 1 ? 's' : ''}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     )}

     {/* Mobile Filters Dialog */}
     <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
       <DialogContent className="sm:max-w-lg">
         <DialogHeader>
           <DialogTitle>Filters</DialogTitle>
         </DialogHeader>
         <div className="space-y-4">
           {/* Difficulty */}
           <div>
             <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Difficulty</div>
             <Select value={difficultyFilter || "all"} onValueChange={(value) => {
               setDifficultyFilter(value === "all" ? "" : value);
             }}>
               <SelectTrigger className="w-full h-9 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-300 dark:border-zinc-600">
                 <SelectValue placeholder="Select difficulty" />
               </SelectTrigger>
               <SelectContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-white">
                 <SelectItem value="all">All Difficulties</SelectItem>
                 <SelectItem value="Easy">Easy</SelectItem>
                 <SelectItem value="Medium">Medium</SelectItem>
                 <SelectItem value="Hard">Hard</SelectItem>
               </SelectContent>
             </Select>
           </div>

           {/* Revisit Toggle */}
           <div className="flex items-center justify-between">
             <div className="text-sm text-gray-700 dark:text-gray-300">Revisit only</div>
             <button
               role="switch"
               aria-checked={revisitOnly}
               onClick={() => setRevisitOnly(!revisitOnly)}
               className={`${revisitOnly ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
             >
               <span className={`${revisitOnly ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white shadow transition`} />
             </button>
           </div>

           {/* Tag Search */}
           <div>
             <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Tags</div>
             <div className="relative">
               <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 placeholder="Search tags..."
                 value={tagSearch}
                 onChange={(e) => setTagSearch(e.target.value)}
                 className="pl-8 h-9 text-sm bg-white dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-300 dark:border-zinc-600"
                 autoComplete="off"
               />
             </div>

             {selectedTags.length > 0 && (
               <div className="mt-3 flex flex-wrap gap-1">
                 {selectedTags.map(tag => (
                   <span
                     key={tag}
                     className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                   >
                     <Tag className="w-3 h-3 mr-1" />
                     {tag}
                     <X
                       className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-600"
                       onClick={() => toggleTag(tag)}
                     />
                   </span>
                 ))}
               </div>
             )}

             <div className="mt-2 max-h-48 overflow-y-auto rounded border border-gray-200 dark:border-zinc-700">
               {filteredTags.length > 0 ? (
                 filteredTags.map(tag => (
                   <button
                     key={tag}
                     type="button"
                     className="w-full text-left flex items-center gap-2 px-3 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                     onClick={() => toggleTag(tag)}
                   >
                     <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${selectedTags.includes(tag) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-zinc-600'}`}></div>
                     <Tag className="w-4 h-4" />
                     <span>{tag}</span>
                   </button>
                 ))
               ) : (
                 <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">{tagSearch ? 'No tags found' : 'No tags available'}</div>
               )}
             </div>
           </div>
         </div>
         <DialogFooter className="mt-4">
           {hasActiveFilters && (
             <Button variant="ghost" className="text-red-600 dark:text-red-400" onClick={clearAllFilters}>
               Clear all
             </Button>
           )}
           <DialogClose asChild>
             <Button onClick={() => setMobileFiltersOpen(false)}>Apply</Button>
           </DialogClose>
         </DialogFooter>
       </DialogContent>
     </Dialog>
     </div>
  );
}
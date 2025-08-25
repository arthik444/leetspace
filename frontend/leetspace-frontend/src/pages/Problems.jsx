import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/context/DemoContext";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/columns";
import { DeleteProblemDialog } from "@/components/DeleteProblemDialog";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { problemsAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, AlertTriangle } from "lucide-react";

// import { problems } from "@/components/data-table/types"; // or from Firebase later

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  const { isDemo } = useDemo();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get filter parameters from URL
  const tagFilter = searchParams.get('tag');
  const filterType = searchParams.get('filter');

  // const user = "abc123";
  const fetchProblems = async () => {
    try {
      const res = await problemsAPI.getProblems({
        sort_by: "date_solved",
        order: "desc",
      });
      const fetchedProblems = res.data.problems || res.data;
      setProblems(fetchedProblems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      toast.error("Failed to load problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when problems or URL params change
  useEffect(() => {
    let filtered = [...problems];

    // Apply tag filter
    if (tagFilter) {
      filtered = filtered.filter(problem => 
        problem.tags && problem.tags.includes(tagFilter)
      );
    }

    // Apply filter type
    if (filterType === 'retry') {
      filtered = filtered.filter(problem => problem.retry_later === "Yes");
    } else if (filterType === 'weakness' && tagFilter) {
      // For weakness, we already have the tag filter, but we can add additional logic
      // like showing problems with higher retry rates for that tag
      filtered = filtered.filter(problem => 
        problem.tags && problem.tags.includes(tagFilter)
      );
    }

    setFilteredProblems(filtered);
  }, [problems, tagFilter, filterType]);

  useEffect(() => {
    if (user || isDemo) {
      fetchProblems();
    }
  }, [user, isDemo]);

  // Keep theme in sync for toast styling
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const clearFilters = () => {
    navigate('/problems');
  };

  const getFilterDescription = () => {
    if (filterType === 'retry') {
      return 'Problems marked for retry';
    } else if (filterType === 'weakness' && tagFilter) {
      return `Weakness area: ${tagFilter}`;
    } else if (tagFilter) {
      return `Tag: ${tagFilter}`;
    }
    return null;
  };

  const getFilterIcon = () => {
    if (filterType === 'retry') {
      return <RotateCcw className="h-4 w-4" />;
    } else if (filterType === 'weakness') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return null;
  };
  const handleEdit = (problem) => {
    if (isDemo) {
      toast.info("Demo mode: editing disabled.");
      return;
    }
    // Ensure sessionStorage is set before navigation
    sessionStorage.setItem(`editProblemIntent-${problem.id}`, "fresh");
    // Use setTimeout to ensure sessionStorage is committed
    setTimeout(() => {
      navigate(`/edit-problem/${problem.id}`);
    }, 0);
  };

  const handleDelete = (problem) => {
    if (isDemo) {
      toast.info("Demo mode: delete disabled.");
      return;
    }
    setSelectedProblem(problem);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async (problemId) => {
    try {
      await problemsAPI.deleteProblem(problemId);
      
      // Remove the problem from the local state
      setProblems(problems.filter(p => p.id !== problemId));
      toast.success("Problem deleted successfully", {
        style: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        }
      });
    } catch (error) {
      console.error("Error deleting problem:", error);
      toast.error("Failed to delete problem. Please try again.", {
        style: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          border: '1px solid #e53e3e',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      });
    }
  };

  const updateProblem = async (problemId, updateData) => {
    try {
      await problemsAPI.updateProblem(problemId, updateData);
      
      // Refresh the problems list
      await fetchProblems();
      toast.success("Problem updated successfully!");
    } catch (error) {
      console.error("Error updating problem:", error);
      toast.error("Failed to update problem. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg shadow-sm">
        <div className="text-center">Loading problems...</div>
      </div>
    );
  }

  const filterDescription = getFilterDescription();
  const filterIcon = getFilterIcon();

  if (!filteredProblems.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-zinc-900 rounded-lg">
        <div className="text-center">
          <div className="text-base text-gray-700 dark:text-gray-300">No problems yet</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Add your first problem to get started.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg shadow-sm">
      {/* Filter Header */}
      {filterDescription && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {filterIcon && (
                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                  {filterIcon}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {filterDescription}
                </h2>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Showing {filteredProblems.length} of {problems.length} problems
                </p>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Problems Table */}
      <DataTable 
        data={filteredProblems} 
        columns={columns(handleEdit, handleDelete)} 
        onDataChange={setProblems}
      />

      <DeleteProblemDialog
        problem={selectedProblem}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
  
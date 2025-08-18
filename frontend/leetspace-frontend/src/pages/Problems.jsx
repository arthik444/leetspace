import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDemo } from "@/context/DemoContext";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/columns";
import { DeleteProblemDialog } from "@/components/DeleteProblemDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { problemsAPI } from "@/lib/api";

// import { problems } from "@/components/data-table/types"; // or from Firebase later

export default function Problems() {
  const [problems, setProblems] = useState([]);
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
  // const user = "abc123";
  const fetchProblems = async () => {
    try {
      const res = await problemsAPI.getProblems({
        sort_by: "date_solved",
        order: "desc",
      });
      setProblems(res.data.problems || res.data); // debug endpoint returns {count, problems}
    } catch (error) {
      console.error("Error fetching problems:", error);
      toast.error("Failed to load problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user || isDemo) {
      fetchProblems();
    }
  }, [user, isDemo]);
  const handleEdit = (problem) => {
    if (isDemo) {
      toast.info("Demo mode: editing disabled.");
      return;
    }
    sessionStorage.setItem(`editProblemIntent-${problem.id}`, "fresh");
    navigate(`/edit-problem/${problem.id}`);
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
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg shadow-sm">
    {/* <h2 className="text-2xl font-semibold text-center mb-6">
      🧠 All Problems
    </h2> */}
    {/* <DataTable data={problems} columns={columns} />
     */}
    <DataTable 
      data={problems} 
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
  
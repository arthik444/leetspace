import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { problemsAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2,ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MDEditor from "@uiw/react-md-editor";
import CodeViewer from "@/components/CodeViewer";
import { useNavigate } from "react-router-dom";
import { DeleteProblemDialog } from "@/components/DeleteProblemDialog";
import { toast } from "sonner";

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const navigate = useNavigate();

   // Helper function to format date properly without timezone issues
   const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    // Parse as YYYY-MM-DD and format for display
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  useEffect(() => {
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

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await problemsAPI.getProblem(id);
        setProblem(res.data);
      } catch (err) {
        console.error("Failed to fetch problem", err);
        if (err.response?.status === 401) {
          toast.error("Authentication failed. Please sign in again.");
        } else if (err.response?.status === 404) {
          toast.error("Problem not found.");
        } else {
          toast.error("Failed to load problem details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleDelete = (problem) => {
    console.log("Deleting problem:", problem.title);
    setSelectedProblem(problem);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async (problemId) => {
    try {
      await problemsAPI.deleteProblem(problemId);
      toast.success("Problem deleted successfully", {
        style: {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        }
      });
      navigate("/problems");
    } catch (error) {
      console.error("Error deleting problem:", error);
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please sign in again.", {
          style: {
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            border: '1px solid #e53e3e',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          },
        });
      } else {
        toast.error("Failed to delete problem. Please try again.", {
          style: {
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            border: '1px solid #e53e3e',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          },
        });
      }
    }
  };

  if (loading) {
    return <Skeleton className="w-full h-64 rounded-xl" />;
  }

  if (!problem) {
    return <div className="text-center text-muted-foreground dark:text-gray-400">Problem not found.</div>;
  }

  const difficultyColor = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }[problem.difficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 text-black dark:text-white bg-white dark:bg-zinc-900">
      <div className="space-y-1">
      <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Problem"
              className="text-muted-foreground hover:text-blue-600"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              sessionStorage.setItem(`editProblemIntent-${problem.id}`, "fresh");
              navigate(`/edit-problem/${problem.id}`);
            }}
            title="Edit"
            className="hover:bg-muted cursor-pointer"
          >
            <Edit3 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(problem)}
            // onClick={async () => {
            //   const confirmDelete = window.confirm("Are you sure you want to delete this problem?");
            //   if (!confirmDelete) return;
            //   try {
            //     await axios.delete(`/api/problems/${problem.id}`, {
            //       baseURL: "http://localhost:8000",
            //     });
            //     navigate("/problems");
            //   } catch (err) {
            //     console.error("❌ Failed to delete problem:", err);
            //   }
            // }}
            title="Delete"
            className="hover:bg-muted cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-destructive hover:text-red-600" />
          </Button>
          </div>
          </div>

        {problem.retry_later === "Yes" && (
          <div className="text-sm text-orange-600 dark:text-orange-300 italic">
            You marked this problem to revisit later.
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor}`}>{problem.difficulty}</span>
          <span className="text-muted-foreground dark:text-gray-400">•</span>
          <span className="text-muted-foreground dark:text-gray-400">{formatDateDisplay(problem.date_solved)}</span>
        </div>
      </div>

      {problem.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-md text-xs bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {problem.notes && (
        <div
          data-color-mode={theme}
          className="prose dark:prose-invert max-w-none !bg-white dark:!bg-zinc-900"
        >
          <MDEditor.Markdown
            source={problem.notes}
            className="!bg-white dark:!bg-zinc-900 p-4 rounded-md"
            style={{
              backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', // match Tailwind's zinc-900
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          />
        </div>
      )}

<div className="space-y-6">
  {Array.isArray(problem.solutions) &&
    problem.solutions.map((sol, idx) => (
      <div key={idx} className="rounded-xl border border-border bg-muted/40 dark:bg-zinc-900 shadow-sm p-4">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          Solution {idx + 1} ({sol.language})
        </div>
        <div className="overflow-x-auto rounded-md bg-background dark:bg-zinc-800">
          
          <CodeViewer language={sol.language} code={sol.code} theme={theme} />
          {/* <MDEditor.Markdown
            source={`\`\`\`\n${sol.code}\n\`\`\``}
            className="!bg-white dark:!bg-zinc-900 p-4 rounded-md"
            style={{
              backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          /> */}

        </div>
      </div>
    ))}
</div>
    <DeleteProblemDialog
      problem={selectedProblem}
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={confirmDelete}
    />
    </div>
  );
}

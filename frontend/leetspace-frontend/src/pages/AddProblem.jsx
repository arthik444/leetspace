import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DateSolvedInput from "@/components/dateSelector.jsx";
import { useState,useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import CodeEditor from "@/components/CodeEditor";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AlertCircle,Plus,ExternalLink } from "lucide-react";


export default function AddProblem() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const getTodayAsYYYYMMDD = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
    
  const [dateSolved, setDateSolved] = useState(getTodayAsYYYYMMDD());
  const [retryLater, setRetryLater] = useState("");
  const isDark = document.documentElement.classList.contains("dark");
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [formError, setFormError] = useState("");
  const [missingFields, setMissingFields] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [solutions, setSolutions] = useState([
    { code: "// write your solution here", language: "javascript" },
  ]);
  const isValidUrl = (value) => {
    try {
      new URL(value);
      return /^(https?):\/\/[\w.-]+\.[a-z]{2,}.*$/i.test(value);
    } catch {
      return false;
    }
  };
  // Load draft from sessionStorage on initial render
  useEffect(() => {
    const isFresh = sessionStorage.getItem("addProblemIntent") === "fresh";
    if (isFresh) {
      // Fresh visit (via nav bar or link), clear draft
      sessionStorage.removeItem("addProblemIntent");
      sessionStorage.removeItem("addProblemDraft");
      setTitle("");
      setUrl("");
      setDifficulty("");
      setTags("");
      setNotes("");
      setDateSolved(getTodayAsYYYYMMDD());
      setRetryLater("");
      setSolutions([{ code: "// write your solution here", language: "javascript" }]);
    } else {
      // Refresh/back — restore draft if available
      const saved = sessionStorage.getItem("addProblemDraft");
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setTitle(draft.title || "");
          setUrl(draft.url || "");
          setDifficulty(draft.difficulty || "");
          setTags(draft.tags || "");
          setNotes(draft.notes || "");
          setDateSolved(draft.dateSolved || getTodayAsYYYYMMDD());
          setRetryLater(draft.retryLater || "");
          setSolutions(draft.solutions || [{ code: "", language: "javascript" }]);
        } catch (err) {
          console.error("Failed to parse saved draft:", err);
        }
      }
    }
  }, []);
// save draft to sessionStorage every 500ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      const draft = {
        title,
        url,
        difficulty,
        tags,
        notes,
        dateSolved,
        retryLater,
        solutions
      };
      sessionStorage.setItem("addProblemDraft", JSON.stringify(draft));
    }, 500); // debounce
  
    return () => clearTimeout(timeout);
  }, [title, url, difficulty, tags, notes, dateSolved, retryLater, solutions]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      setTheme(dark ? "dark" : "light");
    });
  
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  
    return () => observer.disconnect();
  }, []);

  const handleSolutionChange = (index, value) => {
    const updated = [...solutions];
    updated[index].code = value;
    setSolutions(updated);
  };

  const handleLanguageChange = (index, value) => {
    const updated = [...solutions];
    updated[index].language = value;
    setSolutions(updated);
  };

  const addSolutionEditor = () => {
    setSolutions([...solutions, { code: "", language: "javascript" }]);
  };

  const deleteSolutionEditor = (index) => {
    if (solutions.length === 1) return;
    const updated = solutions.filter((_, i) => i !== index);
    setSolutions(updated);
  };
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMissingFields = {
      title: !title.trim(),
      url: !url.trim() || !isValidUrl(url),
      difficulty: !difficulty,
      retryLater: !retryLater,
    };
    
    setMissingFields(newMissingFields);
    
    const missing = Object.entries(newMissingFields)
      .filter(([_, isMissing]) => isMissing)
      .map(([field]) => field[0].toUpperCase() + field.slice(1));
    
    if (missing.length > 0) {
      setFormError(`Please fill in the following required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`);
      return;
    }
  
    setFormError("");
    const filteredSolutions = solutions.filter(
      (sol) => sol.code.trim() !== ""
    );
    const problemData = {
      user_id: user.uid, // ✅ required by backend
      title,
      url,
      difficulty,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes,
      solutions: filteredSolutions,
      date_solved: dateSolved,
      retry_later: retryLater,
    };

    try {
      const res = await axios.post("/api/problems/", problemData, {
        baseURL: "http://localhost:8000",
      });
      console.log("✅ Problem saved:", res.data);
      sessionStorage.removeItem("addProblemDraft");
      navigate(`/problems/${res.data.id}`);
    } catch (err) {
      if (err.response?.status === 409) {
        const data = err.response.data;
        setFormError(data.detail || "A problem already exists.");
        setConflicts(data.conflicts || []);
      } else {
        setFormError("Something went wrong while saving the problem.");
        setConflicts([]);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 bg-white dark:bg-zinc-900 text-black dark:text-white">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="h-6 w-6 text-foreground" strokeWidth={2.5} />
        <h1 className="text-3xl font-bold">Add a New Problem</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Label htmlFor="title" className="flex items-center gap-2 text-lg mb-1">
          Problem Title
          {missingFields.title && <AlertCircle className="h-5 w-5 text-red-500" />}
        </Label>
        <Input
          id="title"
          placeholder="e.g. Two Sum"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setConflicts((prev) => prev.filter((c) => c.field !== "title"));
          }}
          className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 bg-background text-foreground placeholder:text-neutral-400"
        />
      </div>
      <div className="relative">
        <Label htmlFor="url" className="flex items-center gap-2 text-lg mb-1">
          Problem URL
          {missingFields.url && <AlertCircle className="h-5 w-5 text-red-500" />}
        </Label>
        <Input
          id="url"
          type="text"
          placeholder="https://leetcode.com/problems/two-sum"
          value={url}
          onChange={(e) => {
            const val = e.target.value;
            setUrl(val);
            setConflicts((prev) => prev.filter((c) => c.field !== "url"));
            // Validate only if not empty
            setMissingFields((prev) => ({
              ...prev,
              url: val.trim() !== "" && !isValidUrl(val.trim()),
            }));
          }}
          className={`w-full text-xl font-semibold border-none shadow-none focus-visible:ring-0 bg-background text-foreground placeholder:text-neutral-400 ${
            missingFields.url ? "ring-1 ring-red-500" : ""
          }`}
        />

        {missingFields.url && (
          <p className="text-sm text-red-500 mt-1">Please enter a valid URL.</p>
        )}
      </div>

        <div className="relative">
          <Label className="flex items-center gap-2 text-lg mb-1">
            Difficulty
            {missingFields.difficulty && <AlertCircle className="h-5 w-5 text-red-500" />}
          </Label>
          <div className="flex gap-2">
            {["Easy", "Medium", "Hard"].map((level) => {
              const selected = difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-1 cursor-pointer rounded-full text-sm border transition-all
                    ${selected
                      ? "bg-accent text-accent-foreground border-accent font-semibold shadow"
                      : "text-muted-foreground border-border hover:bg-muted/40 opacity-60"}`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="tags" className="text-lg mb-1 block">Tags</Label>
          <Input
            id="tags"
            placeholder="e.g. array, hash map"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 bg-background text-foreground placeholder:text-neutral-400"
          />
        </div>

        <div data-color-mode={theme}>
          <Label htmlFor="notes" className="text-lg mb-1 block">Notes (Markdown supported)</Label>
          <div className="border rounded-xl bg-background placeholder:text-muted-foreground [&:placeholder-shown]:text-muted-foreground [&:not(:placeholder-shown)]:placeholder-transparent text-foreground">
            <MDEditor value={notes} onChange={setNotes} height={300} />
          </div>
        </div>

        <div>
          <Label className="text-lg mb-2 block">Solution(s)</Label>
          {solutions.map((sol, idx) => (
            <div key={idx} className="relative mb-10">
              {solutions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer absolute top-2 right-2 z-10 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteSolutionEditor(idx)}
                >
                  ✕
                </Button>
              )}
              <CodeEditor
                code={sol.code}
                language={sol.language}
                theme={theme}
                onChange={(val) => handleSolutionChange(idx, val)}
                onLangChange={(val) => handleLanguageChange(idx, val)}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={addSolutionEditor}
          >
            + Add Another Solution
          </Button>
        </div>

        <Label htmlFor="date_solved" className="text-lg mb-1 block">Date Solved</Label>
        <DateSolvedInput dateSolved={dateSolved} setDateSolved={setDateSolved} />

        <div className="relative">
          <Label className="flex items-center gap-2 text-lg mb-1">
            Retry Later?
            {missingFields.retryLater && <AlertCircle className="h-5 w-5 text-red-500" />}
          </Label>
          <div className="flex gap-2">
            {["Yes", "No"].map((option) => {
              const selected = retryLater === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRetryLater(option)}
                  className={`cursor-pointer px-4 py-1 rounded-full text-sm border transition-all
                    ${selected
                      ? "bg-accent text-accent-foreground border-accent font-semibold shadow"
                      : "text-muted-foreground border-border hover:bg-muted/40 opacity-60"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        {formError && (
          <div className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-2 rounded-md text-center">
            {formError}
          </div>
        )}
        {conflicts.length > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600 px-4 py-2 rounded-md mt-4 space-y-1">
            {conflicts.map((conflict) => (
              <div key={conflict.field} className="flex items-center justify-between">
                <span>
                  A problem with this <strong>{conflict.field}</strong> already exists.
                </span>
                <a
                  href={`/problems/${conflict.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
        <Button type="submit" className="w-full cursor-pointer bg-black text-white text-lg dark:bg-white dark:text-black">
          Submit Problem
        </Button>
      </form>
    </div>
  );
}

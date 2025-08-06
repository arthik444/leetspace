import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DateSolvedInput from "@/components/dateSelector.jsx";
import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import CodeEditor from "@/components/CodeEditor";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle,Pencil,ExternalLink } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function EditProblem() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [retryLater, setRetryLater] = useState("");
  const [dateSolved, setDateSolved] = useState("");
  const [formError, setFormError] = useState("");
  const [solutions, setSolutions] = useState([{ code: "", language: "javascript" }]);
  const [missingFields, setMissingFields] = useState({});
  const [conflicts, setConflicts] = useState([]);

  const isDark = document.documentElement.classList.contains("dark");
  const [theme, setTheme] = useState(isDark ? "dark" : "light");
   // Helper function to get today's date as YYYY-MM-DD without timezone issues
   const getTodayAsYYYYMMDD = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const isValidUrl = (value) => {
    try {
      new URL(value);
      return /^(https?):\/\/[\w.-]+\.[a-z]{2,}.*$/i.test(value);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      setTheme(dark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  // Load draft from sessionStorage or API
  useEffect(() => {
    const storageKey = `editProblemDraft-${id}`;
    const intentKey = `editProblemIntent-${id}`;
    const isFresh = sessionStorage.getItem(intentKey) === "fresh";
  
    if (isFresh) {
      // Clear the flag and reset everything
      sessionStorage.removeItem(intentKey);
      sessionStorage.removeItem(storageKey);
  
      setTitle("");
      setUrl("");
      setDifficulty("");
      setTags("");
      setNotes("");
      setDateSolved(new Date().toLocaleDateString("en-CA"));
      setRetryLater("");
      setSolutions([{ code: "// write your solution here", language: "javascript" }]);
    } else {
      // Load from sessionStorage
      const saved = sessionStorage.getItem(storageKey);
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
          return;
        } catch (err) {
          console.error("❌ Failed to parse draft:", err);
        }
      }
  
      // Fallback: fetch from API
      async function fetchProblem() {
        try {
          const res = await axios.get(`/api/problems/${id}`, {
            baseURL: "http://localhost:8000",
          });
          const p = res.data;
          setTitle(p.title);
          setUrl(p.url);
          setDifficulty(p.difficulty);
          setTags(p.tags.join(", "));
          setNotes(p.notes || "");
          setRetryLater(p.retry_later || "");
          setDateSolved(p.date_solved || getTodayAsYYYYMMDD());
          setSolutions(p.solutions || [{ code: "", language: "javascript" }]);
        } catch (err) {
          console.error("❌ Error fetching problem:", err);
        }
      }
  
      fetchProblem();
    }
  }, [id]);
  // Save draft to sessionStorage every 500ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      const draft = {
        title,
        url,
        difficulty,
        tags,
        notes,
        retryLater,
        dateSolved,
        solutions,
      };
      sessionStorage.setItem(`editProblemDraft-${id}`, JSON.stringify(draft));
    }, 500);
  
    return () => clearTimeout(timeout);
  }, [title, url, difficulty, tags, notes, retryLater, dateSolved, solutions, id]);

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
      user_id: user.uid,
      title,
      url,
      difficulty,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes,
      solutions:filteredSolutions,
      date_solved: dateSolved,
      retry_later: retryLater,
    };

    try {
      const res = await axios.put(`/api/problems/${id}`, problemData, {
        baseURL: "http://localhost:8000",
      });
      console.log("✅ Problem updated:", res.data);
      sessionStorage.removeItem(`editProblemDraft-${id}`); // Clear draft on success
      navigate(`/problems/${id}`);
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
        <Pencil className="h-6 w-6 text-foreground" strokeWidth={2.5} />
        <h1 className="text-3xl font-bold">Edit Problem</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="relative">
          <Label htmlFor="title" className="flex items-center gap-2 text-lg mb-1">
            Problem Title
            {missingFields.title && <AlertCircle className="h-5 w-5 text-red-500" />}
          </Label>
          <Input id="title" value={title} placeholder="e.g. Two Sum" onChange={(e) => setTitle(e.target.value)} 
          className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 bg-background text-foreground placeholder:text-neutral-400"/>
        </div>

        {/* URL */}
        <div className="relative">
          <Label htmlFor="url" className="flex items-center gap-2 text-lg mb-1">
            Problem URL
            {missingFields.url && <AlertCircle className="h-5 w-5 text-red-500" />}
          </Label>
          <Input id="url" value={url} 
          placeholder="https://leetcode.com/problems/two-sum"
          onChange={(e) => {
            const val = e.target.value;
            setUrl(val);

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

        {/* Difficulty */}
        <div className="relative">
          <Label className="flex items-center gap-2 text-lg mb-1">
            Difficulty
            {missingFields.difficulty && <AlertCircle className="h-5 w-5 text-red-500" />}
          </Label>
          <div className="flex gap-2">
            {["Easy", "Medium", "Hard"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`px-4 py-1 cursor-pointer rounded-full text-sm border transition-all ${
                  difficulty === level
                    ? "bg-accent text-accent-foreground border-accent font-semibold shadow"
                    : "text-muted-foreground border-border hover:bg-muted/40 opacity-60"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags" className="text-lg mb-1 block">Tags</Label>
          <Input id="tags" value={tags} placeholder="e.g. array, hash map" onChange={(e) => setTags(e.target.value)} 
          className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 bg-background text-foreground placeholder:text-neutral-400"/>
        </div>

        {/* Notes */}
        <div data-color-mode={theme}>
          <Label htmlFor="notes" className="text-lg mb-1 block">Notes</Label>
          <MDEditor value={notes} onChange={setNotes} height={300} />
        </div>

        {/* Solutions */}
        <div>
          <Label className="text-lg mb-2 block">Solution(s)</Label>
          {solutions.map((sol, idx) => (
            <div key={idx} className="relative mb-10">
              {solutions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer absolute top-2 right-2 z-10"
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
          <Button type="button" variant="ghost" onClick={addSolutionEditor} className="cursor-pointer">
            + Add Another Solution
          </Button>
        </div>

        {/* Date Solved */}
        <Label htmlFor="date_solved" className="text-lg mb-1 block">Date Solved</Label>
        <DateSolvedInput dateSolved={dateSolved} setDateSolved={setDateSolved} className="cursor-pointer" />

        {/* Retry Later */}
        <div className="relative">
          <Label className="flex items-center gap-2 text-lg mb-1">
            Retry Later?
            {missingFields.retryLater && <AlertCircle className="h-5 w-5 text-red-500" />}
          </Label>
          <div className="flex gap-2">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRetryLater(option)}
                className={`px-4 py-1 cursor-pointer rounded-full text-sm border transition-all ${
                  retryLater === option
                    ? "bg-accent text-accent-foreground border-accent font-semibold shadow"
                    : "text-muted-foreground border-border hover:bg-muted/40 opacity-60"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
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
        {/* Submit */}
        <Button type="submit" className="w-full bg-black text-white cursor-pointer text-lg dark:bg-white dark:text-black">
          Save Changes
        </Button>
      </form>
    </div>
  );
}

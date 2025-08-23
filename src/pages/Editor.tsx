import { useState } from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { Code2, Copy, Save, Download, Sun, Moon, Play } from "lucide-react";
import Editor from "@monaco-editor/react";
import { createSubmission, getSubmission } from "../../compilerApi";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const languageMap: Record<number, string> = {
  63: "javascript",
  71: "python",
  62: "java",
  54: "cpp",
};

const EditorPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { theme, toggleTheme } = useTheme();

  const [code, setCode] = useState("// Start coding...");
  const [language, setLanguage] = useState<number>(63);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState("");

  const runCode = async () => {
    setRunning(true);
    setOutput("Running...");
    try {
      const token = await createSubmission(code, language, stdin);

      let result;
      while (true) {
        result = await getSubmission(token);
        if (result.status?.id <= 2) await new Promise(res => setTimeout(res, 1000));
        else break;
      }

      let out = "";
      if (result.stdout) out += result.stdout;
      if (result.stderr) out += "\n" + result.stderr;
      if (result.compile_output) out += "\n" + result.compile_output;
      if (result.message) out += "\n" + result.message;
      setOutput(out.trim() || "No output");
    } catch (err) {
      setOutput("Error while running code");
      console.error(err);
    }
    setRunning(false);
  };

  const handleEditorChange = (value: string | undefined) => setCode(value || "");

  const copyRoomLink = () => roomId && navigator.clipboard.writeText(window.location.href);
  const saveCode = () => alert("Save functionality not implemented.");
  const exportCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] transition-colors duration-700">
      {/* Navbar */}
      <header className="h-16 border-b border-[#64ffda]/40 bg-[#0f0c29]/90 px-6 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-7 h-7 text-[#64ffda] drop-shadow-xl" />
            <span className="font-bold text-lg text-[#e6f1ff] tracking-wide">CodeCollab</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono bg-[#302b63]/70 text-[#64ffda] border border-[#64ffda]">
              Room: {roomId}
            </Badge>
            <Button variant="ghost" size="sm" onClick={copyRoomLink} className="hover:bg-[#64ffda]/30 transition">
              <Copy className="w-4 h-4 text-[#e6f1ff]" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(Number(e.target.value))}
            className="rounded px-3 py-1 bg-[#1f1b38] text-[#64ffda] border border-[#64ffda] focus:outline-none focus:ring-2 focus:ring-[#64ffda] transition font-semibold shadow-md"
            style={{ minWidth: 170 }}
          >
            <option value={63}>JavaScript (Node.js)</option>
            <option value={71}>Python (3.8.1)</option>
            <option value={62}>Java (OpenJDK)</option>
            <option value={54}>C++ (GCC)</option>
          </select>

          <Button variant="default" size="sm" onClick={runCode} disabled={running} className="bg-[#64ffda] text-[#0f0c29] hover:bg-[#00fff0] shadow-lg transition">
            <Play className="w-4 h-4 mr-1" /> {running ? "Running..." : "Run"}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleTheme} className="hover:bg-[#64ffda]/30 transition">
            {theme === "dark" ? <Sun className="w-4 h-4 text-[#e6f1ff]" /> : <Moon className="w-4 h-4 text-[#e6f1ff]" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={saveCode} className="hover:bg-[#64ffda]/30 transition">
            <Save className="w-4 h-4 text-[#e6f1ff]" /> <span className="text-[#e6f1ff]">Save</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={exportCode} className="hover:bg-[#64ffda]/30 transition">
            <Download className="w-4 h-4 text-[#e6f1ff]" /> <span className="text-[#e6f1ff]">Export</span>
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-row gap-6 p-6">
        {/* Code Editor and Output */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="rounded-2xl shadow-2xl bg-[#1f1b38]/90 border border-[#64ffda] overflow-hidden flex-1 flex flex-col">
            <Editor
              height="400px"
              language={languageMap[language] || "plaintext"}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{ fontSize: 16, minimap: { enabled: true }, fontFamily: "Fira Mono, monospace", smoothScrolling: true }}
            />
          </div>

          <div className="rounded-xl shadow-xl bg-[#302b63]/80 border border-[#64ffda] p-3">
            <label className="block font-semibold mb-1 text-[#64ffda]" htmlFor="stdin-input">
              Optional Input (stdin):
            </label>
            <textarea
              id="stdin-input"
              className="w-full rounded border border-[#64ffda] p-2 bg-[#1f1b38] text-[#e6f1ff] focus:ring-2 focus:ring-[#64ffda] transition shadow-inner"
              rows={3}
              placeholder="Enter input for your program here..."
              value={stdin}
              onChange={e => setStdin(e.target.value)}
            />
          </div>

          <div className="rounded-xl shadow-2xl bg-[#1f1b38]/90 border border-[#64ffda] p-3 h-48 overflow-auto font-mono text-sm text-[#e6f1ff]">
            <strong className="text-[#64ffda]">Output:</strong>
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        </div>

        {/* Right Sidebar */}
        <Card className="w-80 m-0 rounded-2xl border-l-0 border-t-0 border-b-0 bg-[#302b63]/80 shadow-2xl backdrop-blur-md p-4">
          {/* Sidebar content (chat, participants, etc.) */}
        </Card>
      </div>
    </div>
  );
};

export default EditorPage;

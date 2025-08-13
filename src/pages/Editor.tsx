import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Code2, 
  Copy, 
  Save, 
  Download, 
  Sun, 
  Moon, 
  Users, 
  MessageCircle,
  Send,
  Wifi,
  WifiOff,
  Clock
} from "lucide-react";
import Editor from "@monaco-editor/react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface Message {
  id?: number;
  room_id: string;
  sender: string;
  content: string;
  created_at?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
}

const EditorPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { theme, toggleTheme } = useTheme();

  const [code, setCode] = useState("// Start coding...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (!roomId) return;

    const fetchData = async () => {
      // Fetch code
      const { data: codeData } = await supabase
        .from("code")
        .select("code_text")
        .eq("room_id", roomId)
        .single();

      if (codeData?.code_text) setCode(codeData.code_text);

      // Fetch messages
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (msgData) setMessages(msgData);

      // Optionally: fetch participants
      const { data: partData } = await supabase
        .from("participants")
        .select("*")
        .eq("room_id", roomId);

      if (partData) setParticipants(partData as Participant[]);
    };

    fetchData();

    // Real-time code updates
    const codeChannel = supabase
      .channel(`code:${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "code", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setCode(payload.new.code_text);
        }
      )
      .subscribe();

    // Real-time messages
    const msgChannel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(codeChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [roomId]);

  // Update code in Supabase
  const handleEditorChange = useCallback(
    async (value: string | undefined) => {
      setCode(value || "");
      if (!roomId) return;
      await supabase.from("code").update({ code_text: value }).eq("room_id", roomId);
    },
    [roomId]
  );

  // Send a chat message
  const sendMessage = async () => {
    if (!message.trim() || !roomId) return;

    await supabase.from("messages").insert([
      { room_id: roomId, sender: "User", content: message }
    ]);

    setMessage("");
  };

  // Copy room link
  const copyRoomLink = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(`${window.location.origin}/editor/${roomId}`);
  };

  // Save/export code locally
  const saveCode = () => console.log("Saving code...");
  const exportCode = () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `room-${roomId}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="h-14 border-b bg-navbar-background px-4 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <span className="font-semibold">CodeCollab</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              Room: {roomId}
            </Badge>
            <Button variant="ghost" size="sm" onClick={copyRoomLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={saveCode}>
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={exportCode}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((p) => (
              <Avatar key={p.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={p.avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {p.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 3 && (
              <div className="w-8 h-8 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{participants.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-editor-background">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={handleEditorChange}
            theme={theme === "dark" ? "vs-dark" : "light"}
            options={{
              fontFamily: "Fira Code, monospace",
              fontSize: 14,
              lineHeight: 1.6,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              lineNumbers: "on",
              renderWhitespace: "boundary",
              bracketPairColorization: { enabled: true },
              cursorBlinking: "smooth",
              smoothScrolling: true
            }}
          />
        </div>

        {/* Right Sidebar */}
        <Card className="w-80 m-0 rounded-none border-l border-r-0 border-t-0 border-b-0 bg-sidebar-background">
          <Tabs defaultValue="participants" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="participants" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="flex-1 m-4 mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={p.avatar || undefined} />
                          <AvatarFallback>{p.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${p.online ? "bg-green-500" : "bg-muted"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{p.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 m-4 mt-4 flex flex-col">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.created_at?.slice(11, 16)}</span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={sendMessage} disabled={!message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Footer */}
      <footer className="h-10 border-t bg-navbar-background px-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Disconnected</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Alice is typing...</span>
          </div>
        </div>
        <div className="text-muted-foreground">
          JavaScript • {code.split("\n").length} lines
        </div>
      </footer>
    </div>
  );
};

export default EditorPage;

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/contexts/ThemeContext';
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
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const EditorPage = () => {
  const { roomId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [code, setCode] = useState('// Welcome to CodeCollab!\n// Start coding together...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();');
  const [isConnected] = useState(true);
  const [message, setMessage] = useState('');
  const [messages] = useState([
    { id: 1, user: 'Alice', message: 'Hey everyone! Ready to code?', time: '2:30 PM' },
    { id: 2, user: 'Bob', message: 'Let\'s build something amazing!', time: '2:31 PM' }
  ]);
  
  const participants = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: null, online: true },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', avatar: null, online: true },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', avatar: null, online: false }
  ];

  const handleEditorChange = useCallback((value: string | undefined) => {
    setCode(value || '');
  }, []);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/editor/${roomId}`;
    navigator.clipboard.writeText(link);
  };

  const saveCode = () => {
    // Save logic would go here
    console.log('Saving code...');
  };

  const exportCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room-${roomId}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Send message logic would go here
      setMessage('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navbar */}
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
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
            {participants.slice(0, 3).map((participant) => (
              <Avatar key={participant.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={participant.avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {participant.name.split(' ').map(n => n[0]).join('')}
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
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-editor-background">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={handleEditorChange}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                fontFamily: 'Fira Code, monospace',
                fontSize: 14,
                lineHeight: 1.6,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'boundary',
                bracketPairColorization: { enabled: true },
                cursorBlinking: 'smooth',
                smoothScrolling: true
              }}
            />
          </div>
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
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.avatar || undefined} />
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                          participant.online ? 'bg-green-500' : 'bg-muted'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{participant.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{participant.email}</div>
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
                        <span className="font-medium text-sm">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
          JavaScript • {code.split('\n').length} lines
        </div>
      </footer>
    </div>
  );
};

export default EditorPage;
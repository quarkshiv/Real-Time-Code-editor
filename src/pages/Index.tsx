import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ParticleBackground } from '@/components/Particles';
import { Code2, Users, Zap, Github } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/editor/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      navigate(`/editor/${roomId.trim()}`);
    }
  };

  const features = [
    {
      icon: Code2,
      title: "Real-time Editing",
      description: "Code together with instant synchronization across all participants"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "See who's online, chat with your team, and track changes"
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "No downloads required. Create a room and start coding immediately"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero" />
        
        {/* Particles */}
        <ParticleBackground />
        
        {/* Hero Image */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Code collaboration" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium mb-6">
              <Code2 className="w-4 h-4" />
              Collaborative Code Editor
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Code Together,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                Build Together
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Real-time collaborative code editor for teams. Share rooms, edit code together, 
              and bring your ideas to life with seamless synchronization.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={createRoom}
              className="text-lg px-8 py-4"
            >
              <Zap className="w-5 h-5" />
              Create Room
            </Button>
            
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter room ID..."
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
              />
              <Button 
                variant="hero-outline" 
                size="lg"
                onClick={joinRoom}
                disabled={!roomId.trim()}
              >
                Join Room
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 text-white/80 text-sm">
            <div className="text-center">
              <div className="font-semibold text-white text-lg">1000+</div>
              <div>Active Rooms</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white text-lg">50K+</div>
              <div>Lines of Code</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white text-lg">24/7</div>
              <div>Always Available</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Everything you need to code together
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern development teams. 
              Simple setup, powerful collaboration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 gradient-card shadow-medium hover:shadow-large transition-smooth border-0">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">CodeCollab</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 CodeCollab. Built with love.</span>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { Database } from '@/lib/db';
import { toast } from 'sonner';

interface LoginProps {
  db: Database;
  onLogin: (userId: string) => void;
}

export function Login({ db, onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.profiles.find(p => p.email === email && p.password === password);
    
    if (user) {
      onLogin(user.id);
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Gradebook</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t space-y-3">
            <p className="text-sm text-muted-foreground text-center">Demo Accounts:</p>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="font-medium">Teacher:</span>
                <span className="text-muted-foreground">teacher@demo / demo</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="font-medium">Student:</span>
                <span className="text-muted-foreground">student@demo / demo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

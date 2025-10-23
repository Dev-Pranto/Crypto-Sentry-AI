import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Bell } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use URLSearchParams for OAuth2 form data format
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2PasswordRequestForm expects 'username' field
      formData.append('password', password);

      const response = await axios.post('http://localhost:8000/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Login successful:', response.data);

      login(response.data.access_token);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 100);

    } catch (error: any) {
      console.error('Login error:', error.response?.data);

      let errorMessage = 'Invalid email or password';

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response?.status === 422) {
          errorMessage = 'Validation error: Please check your input';
        }
      }

      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 bg-card border-border">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/20 rounded-full shadow-glow">
            <Bell className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-center mb-8">
          Sign in to your Crypto-Sentry AI account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary hover:opacity-90 transition-smooth"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;

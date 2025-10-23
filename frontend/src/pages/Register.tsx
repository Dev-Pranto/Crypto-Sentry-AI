import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Bell } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Register user with JSON data
      const registerResponse = await axios.post('http://localhost:8000/api/auth/register', {
        email,
        password,
      });

      console.log('Register successful:', registerResponse.data);

      // Auto-login after registration using OAuth2 form data
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await axios.post('http://localhost:8000/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Auto-login successful:', loginResponse.data);

      login(loginResponse.data.access_token);
      toast({
        title: 'Account Created!',
        description: 'Welcome to Crypto-Sentry AI',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 100);

    } catch (error: any) {
      console.error('Registration error:', error.response?.data);

      let errorMessage = 'Failed to create account. Please try again.';

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response?.status === 400) {
          errorMessage = 'Email already registered';
        }
      }

      toast({
        title: 'Registration Failed',
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

        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-muted-foreground text-center mb-8">
          Start monitoring crypto markets with AI
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

          <div>
            <label className="text-sm font-medium mb-2 block">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-secondary border-border"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary hover:opacity-90 transition-smooth"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;

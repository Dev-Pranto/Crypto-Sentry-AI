import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, LogOut, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

// We'll create simple versions of these components first
import PriceChart from '@/components/PriceChart';
import CreateAlertForm from '@/components/CreateAlertForm';
import AlertsList from '@/components/AlertsList';

const Dashboard = () => {
  const { logout, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshAlerts, setRefreshAlerts] = useState(0);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted - isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check AI status when component mounts
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const status = await response.json();
      setAiStatus(status);
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAlertCreated = () => {
    setRefreshAlerts(prev => prev + 1);
    toast({
      title: 'Alert Created!',
      description: 'Your crypto alert has been set up successfully.',
    });
  };

  const runAIAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/ai/analyze/BTC-USD', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();

      toast({
        title: result.is_anomaly ? '🚨 Anomaly Detected!' : '✅ Market Normal',
        description: `AI detected ${result.is_anomaly ? 'unusual activity' : 'normal patterns'} with ${(result.anomaly_score * 100).toFixed(1)}% confidence`,
        variant: result.is_anomaly ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Could not perform AI analysis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Crypto-Sentry AI</h1>
              <p className="text-sm text-muted-foreground">Real-time Crypto Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {aiStatus && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                aiStatus.model_loaded
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {aiStatus.model_loaded ? '🤖 AI Active' : '⚠️ Demo Mode'}
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Status</p>
                <p className="text-xl font-bold">
                  {aiStatus?.model_loaded ? 'LSTM Active' : 'Demo Mode'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-xl font-bold text-green-600">Operational</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quick Analysis</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runAIAnalysis}
                  disabled={loading}
                  className="mt-1"
                >
                  {loading ? 'Analyzing...' : 'Scan BTC'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          {/* Chart Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Market Overview</h2>
            <PriceChart />
          </div>

          {/* Alert Management Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Create Alert</h2>
              <CreateAlertForm onAlertCreated={handleAlertCreated} />
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Your Alerts</h2>
              <AlertsList refresh={refreshAlerts} />
            </div>
          </div>

          {/* AI Status Panel */}
          {aiStatus && (
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-4">AI System Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Model Type</p>
                  <p className="font-medium">{aiStatus.model_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    aiStatus.model_loaded ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {aiStatus.status}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sequence Length</p>
                  <p className="font-medium">{aiStatus.sequence_length || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Features</p>
                  <p className="font-medium">{aiStatus.feature_count || 'N/A'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

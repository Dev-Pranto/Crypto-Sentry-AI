import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, TrendingUp, Shield, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-primary/20 rounded-full shadow-glow">
              <Bell className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Crypto-Sentry AI
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stay ahead of the market with AI-powered crypto alerts. Monitor price anomalies, 
            volume spikes, and trends in real-time.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register">
              <Button size="lg" className="gradient-primary hover:opacity-90 transition-smooth text-lg px-8 shadow-glow">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-card/50 border-primary text-lg px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Features for Crypto Traders
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-xl border border-border hover:border-primary transition-smooth">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Alerts</h3>
              <p className="text-muted-foreground">
                Get instant notifications for price anomalies, volume spikes, and market trends 
                across multiple cryptocurrencies.
              </p>
            </div>

            <div className="p-8 bg-card rounded-xl border border-border hover:border-primary transition-smooth">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Advanced machine learning algorithms analyze market data to identify 
                significant patterns and opportunities.
              </p>
            </div>

            <div className="p-8 bg-card rounded-xl border border-border hover:border-primary transition-smooth">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Never miss a market movement with our high-performance infrastructure 
                delivering alerts in milliseconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of traders using Crypto-Sentry AI to stay ahead of the market.
          </p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary hover:opacity-90 transition-smooth text-lg px-8 shadow-glow">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;

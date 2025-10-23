import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceData {
  timestamp: number;
  price: number;
}

const PriceChart = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBitcoinPrice = async () => {
    try {
      setLoading(true);

      // Using CoinGecko API for real Bitcoin price
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();

      // Transform the data for our chart
      const transformedData = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price
      }));

      setPriceData(transformedData);

      // Get current price (last data point)
      if (transformedData.length > 0) {
        const latestPrice = transformedData[transformedData.length - 1].price;
        setCurrentPrice(latestPrice);
      }

    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      toast({
        title: 'Price Data Error',
        description: 'Using demo data - real prices unavailable',
        variant: 'destructive',
      });

      // Fallback to realistic mock data with current prices
      const mockData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          timestamp: date.getTime(),
          price: 95000 + Math.sin(i * 0.5) * 5000 + Math.random() * 2000
        };
      });

      setPriceData(mockData);
      setCurrentPrice(mockData[mockData.length - 1].price);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();

    // Refresh price every 30 seconds
    const interval = setInterval(fetchBitcoinPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const priceChange = priceData.length > 1
    ? ((priceData[priceData.length - 1].price - priceData[priceData.length - 2].price) / priceData[priceData.length - 2].price) * 100
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Loading...</h3>
            <p className="text-muted-foreground">Fetching price data</p>
          </div>
        </div>
        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{formatPrice(currentPrice)}</h3>
          <p className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {priceChange.toFixed(2)}% (7d)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBitcoinPrice}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-sm text-muted-foreground">
            BTC-USD • Live
          </div>
        </div>
      </div>

      <div className="h-64 bg-muted/20 rounded-lg p-4">
        {priceData.length > 0 ? (
          <div className="h-full flex items-end gap-1">
            {priceData.map((data, index) => {
              const prices = priceData.map(d => d.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const height = ((data.price - minPrice) / (maxPrice - minPrice)) * 80 + 10; // 10-90% height

              return (
                <div
                  key={data.timestamp}
                  className="flex-1 bg-gradient-to-t from-primary to-primary/70 rounded-t hover:from-primary/80 hover:to-primary/60 transition-all duration-200 relative group"
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {formatPrice(data.price)}
                    <br />
                    {new Date(data.timestamp).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No price data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-muted-foreground">24h High</p>
          <p className="font-medium text-green-600">
            {priceData.length > 0 ? formatPrice(Math.max(...priceData.slice(-2).map(d => d.price))) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">24h Low</p>
          <p className="font-medium text-red-600">
            {priceData.length > 0 ? formatPrice(Math.min(...priceData.slice(-2).map(d => d.price))) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Market Cap</p>
          <p className="font-medium">
            {currentPrice ? `$${(currentPrice * 19500000 / 1000000000).toFixed(0)}B` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

// You'll need to import Button component
import { Button } from '@/components/ui/button';

export default PriceChart;

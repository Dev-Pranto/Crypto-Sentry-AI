import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CreateAlertFormProps {
  onAlertCreated: () => void;
}

const CreateAlertForm = ({ onAlertCreated }: CreateAlertFormProps) => {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [alertType, setAlertType] = useState('PRICE_TARGET');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Alert Created!',
        description: `Set ${alertType} alert for ${symbol} at $${targetPrice}`,
      });

      setTargetPrice('');
      onAlertCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Cryptocurrency</label>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BTC-USD">Bitcoin (BTC-USD)</SelectItem>
            <SelectItem value="ETH-USD">Ethereum (ETH-USD)</SelectItem>
            <SelectItem value="ADA-USD">Cardano (ADA-USD)</SelectItem>
            <SelectItem value="DOT-USD">Polkadot (DOT-USD)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Alert Type</label>
        <Select value={alertType} onValueChange={setAlertType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRICE_TARGET">Price Target</SelectItem>
            <SelectItem value="ANOMALY">AI Anomaly Detection</SelectItem>
            <SelectItem value="TREND_UP">Trend Up</SelectItem>
            <SelectItem value="TREND_DOWN">Trend Down</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          {alertType === 'PRICE_TARGET' ? 'Target Price (USD)' : 'Threshold'}
        </label>
        <Input
          type="number"
          placeholder="e.g., 50000"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !targetPrice}
      >
        {loading ? 'Creating Alert...' : 'Create Alert'}
      </Button>
    </form>
  );
};

export default CreateAlertForm;

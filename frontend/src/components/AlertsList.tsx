import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  symbol: string;
  alertType: string;
  targetPrice?: number;
  isActive: boolean;
  createdAt: string;
}

interface AlertsListProps {
  refresh: number;
}

const AlertsList = ({ refresh }: AlertsListProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockAlerts: Alert[] = [
      {
        id: '1',
        symbol: 'BTC-USD',
        alertType: 'PRICE_TARGET',
        targetPrice: 50000,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        symbol: 'ETH-USD',
        alertType: 'ANOMALY',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    setAlerts(mockAlerts);
    setLoading(false);
  }, [refresh]);

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ANOMALY':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'TREND_UP':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Alerts Yet</h3>
        <p className="text-muted-foreground">Create your first alert to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getAlertIcon(alert.alertType)}
            <div>
              <p className="font-medium">{alert.symbol}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {alert.alertType.toLowerCase().replace('_', ' ')}
                {alert.targetPrice && ` • $${alert.targetPrice}`}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteAlert(alert.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default AlertsList;

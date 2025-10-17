import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import './MonthlyComparisonChart.css';

interface MonthlyData {
  month: string;
  monthName: string;
  totalSpent: number;
}

interface MonthlyComparisonChartProps {
  months?: number;
}

export default function MonthlyComparisonChart({ months = 6 }: MonthlyComparisonChartProps) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparisonData();
  }, [months]);

  const loadComparisonData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const comparisonData = await apiService.getMonthlyComparison(months);
      setData(comparisonData);
    } catch (err) {
      console.error('Failed to load monthly comparison:', err);
      setError('Failed to load comparison data');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.monthName}</p>
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate color based on value (higher = darker red, lower = green)
  const getBarColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.8) return '#dc2626'; // Red for high spending
    if (ratio > 0.6) return '#f59e0b'; // Orange for medium-high
    if (ratio > 0.4) return '#3b82f6'; // Blue for medium
    return '#10b981'; // Green for low spending
  };

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h2>Monthly Expense Comparison</h2>
        </div>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h2>Monthly Expense Comparison</h2>
        </div>
        <div className="chart-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h2>Monthly Expense Comparison</h2>
        </div>
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <p>No data available for comparison</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.totalSpent));
  const avgSpending = data.reduce((sum, d) => sum + d.totalSpent, 0) / data.length;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Monthly Expense Comparison</h2>
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">{formatCurrency(avgSpending)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest</span>
            <span className="stat-value highest">{formatCurrency(maxValue)}</span>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="totalSpent"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.totalSpent, maxValue)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

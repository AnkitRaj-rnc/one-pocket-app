/* eslint-disable @typescript-eslint/no-explicit-any */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryData } from '../utils/analytics';
import { formatCurrency } from '../utils/helpers';
import './ExpensePieChart.css';

interface ExpensePieChartProps {
  data: CategoryData[];
}

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <div className="pie-chart-container">
        <div className="pie-chart-empty">
          <div className="empty-chart-icon">📊</div>
          <p>No expense data to display</p>
        </div>
      </div>
    );
  }

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.category}</p>
          <p className="tooltip-amount">{formatCurrency(data.amount)}</p>
          <p className="tooltip-percentage">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    if (entry.percentage < 5) return ''; // Hide labels for small slices
    return `${entry.percentage.toFixed(0)}%`;
  };

  return (
    <div className="pie-chart-container">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        {data.map((entry) => (
          <div key={entry.category} className="legend-item">
            <div className="legend-header">
              <div className="legend-title-section">
                <div className="legend-title-row">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="legend-text">{entry.category}</span>
                </div>
                <span className="legend-count">{entry.count} transaction{entry.count !== 1 ? 's' : ''}</span>
              </div>
              <span className="legend-amount">{formatCurrency(entry.amount)}</span>
            </div>
            <div className="legend-progress-container">
              <div
                className="legend-progress-bar"
                style={{
                  width: `${entry.percentage}%`,
                  backgroundColor: entry.color
                }}
              />
              <span className="legend-percentage">{entry.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
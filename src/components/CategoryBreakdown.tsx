import type { CategoryData } from '../utils/analytics';
import { formatCurrency } from '../utils/helpers';
import './CategoryBreakdown.css';

interface CategoryBreakdownProps {
  data: CategoryData[];
  totalAmount: number;
}

export default function CategoryBreakdown({ data, totalAmount }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="category-breakdown">
        <h3>Category Breakdown</h3>
        <div className="no-data">
          <p>No expenses to analyze yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-breakdown">
      <div className="breakdown-header">
        <h3>Category Breakdown</h3>
        <div className="total-amount">
          Total: {formatCurrency(totalAmount)}
        </div>
      </div>

      <div className="category-list">
        {data.map((category) => (
          <div key={category.category} className="category-item">
            <div className="category-header">
              <div className="category-info">
                <div
                  className="category-color"
                  style={{ backgroundColor: category.color }}
                />
                <div className="category-details">
                  <div className="category-name">{category.category}</div>
                  <div className="category-stats">
                    {category.count} transaction{category.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="category-amount-info">
                <div className="category-amount">{formatCurrency(category.amount)}</div>
                <div className="category-percentage">{category.percentage.toFixed(1)}%</div>
              </div>
            </div>

            <div className="category-bar">
              <div
                className="category-bar-fill"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
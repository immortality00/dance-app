'use client';

import { withRole } from '@/components/auth/withRole';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Loading } from '@/components/Loading';

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

function FinanceDashboard() {
  const [monthlyData, setMonthlyData] = useState<FinancialData[]>([]);
  const [revenueSources, setRevenueSources] = useState<RevenueSource[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'6months' | '1year'>('6months');

  useEffect(() => {
    fetchFinancialData();
  }, [timeframe]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - (timeframe === '6months' ? 6 : 12));

      // Fetch class payments
      const classPaymentsQuery = query(
        collection(db, 'payments'),
        where('type', '==', 'class'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );

      // Fetch studio rentals
      const rentalPaymentsQuery = query(
        collection(db, 'payments'),
        where('type', '==', 'rental'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );

      // Fetch expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );

      const [classPayments, rentalPayments, expenses] = await Promise.all([
        getDocs(classPaymentsQuery),
        getDocs(rentalPaymentsQuery),
        getDocs(expensesQuery)
      ]);

      // Process monthly data
      const monthlyDataMap = new Map<string, FinancialData>();
      const months = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const monthKey = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        months.push(monthKey);
        monthlyDataMap.set(monthKey, {
          month: monthKey,
          revenue: 0,
          expenses: 0,
          profit: 0
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Process class payments
      classPayments.forEach(doc => {
        const payment = doc.data();
        const date = (payment.date as Timestamp).toDate();
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        const data = monthlyDataMap.get(monthKey)!;
        data.revenue += payment.amount;
        data.profit += payment.amount;
      });

      // Process rental payments
      rentalPayments.forEach(doc => {
        const payment = doc.data();
        const date = (payment.date as Timestamp).toDate();
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        const data = monthlyDataMap.get(monthKey)!;
        data.revenue += payment.amount;
        data.profit += payment.amount;
      });

      // Process expenses
      expenses.forEach(doc => {
        const expense = doc.data();
        const date = (expense.date as Timestamp).toDate();
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        const data = monthlyDataMap.get(monthKey)!;
        data.expenses += expense.amount;
        data.profit -= expense.amount;
      });

      // Convert map to array and sort by month
      const monthlyDataArray = Array.from(monthlyDataMap.values());

      setMonthlyData(monthlyDataArray);

      // Calculate revenue sources
      const totalRevenue = monthlyDataArray.reduce((sum, data) => sum + data.revenue, 0);
      const classRevenue = classPayments.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
      const rentalRevenue = rentalPayments.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

      setRevenueSources([
        {
          source: 'Class Payments',
          amount: classRevenue,
          percentage: (classRevenue / totalRevenue) * 100
        },
        {
          source: 'Studio Rentals',
          amount: rentalRevenue,
          percentage: (rentalRevenue / totalRevenue) * 100
        }
      ]);

      // Calculate expense categories
      const expensesByCategory = new Map<string, number>();
      expenses.forEach(doc => {
        const expense = doc.data();
        const current = expensesByCategory.get(expense.category) || 0;
        expensesByCategory.set(expense.category, current + expense.amount);
      });

      const totalExpenses = monthlyDataArray.reduce((sum, data) => sum + data.expenses, 0);
      const expenseCategoriesArray = Array.from(expensesByCategory.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }));

      setExpenseCategories(expenseCategoriesArray);

    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  const totalRevenue = monthlyData.reduce((sum, data) => sum + data.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, data) => sum + data.expenses, 0);
  const totalProfit = monthlyData.reduce((sum, data) => sum + data.profit, 0);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Financial Overview</h1>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '6months' | '1year')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select time period"
          >
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last 12 Months</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                ${totalRevenue.toLocaleString()}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">
                ${totalExpenses.toLocaleString()}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Net Profit</dt>
              <dd className={`mt-1 text-3xl font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalProfit.toLocaleString()}
              </dd>
            </div>
          </div>
        </div>

        {/* Monthly Revenue & Expenses Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue & Expenses</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#059669" />
                <Bar dataKey="expenses" name="Expenses" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Sources & Expense Categories */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Sources</h2>
            <div className="space-y-4">
              {revenueSources.map((source) => (
                <div key={source.source}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">{source.source}</span>
                    <span className="text-sm text-gray-600">${source.amount.toLocaleString()} ({source.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Categories</h2>
            <div className="space-y-4">
              {expenseCategories.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">{category.category}</span>
                    <span className="text-sm text-gray-600">${category.amount.toLocaleString()} ({category.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRole('admin')(FinanceDashboard); 
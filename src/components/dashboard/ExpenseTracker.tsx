import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Budget {
  category: string;
  limit: number;
}

const CATEGORIES = [
  { name: 'Food', icon: '🍔', color: 'bg-orange-500' },
  { name: 'Books', icon: '📚', color: 'bg-blue-500' },
  { name: 'Entertainment', icon: '🎮', color: 'bg-purple-500' },
  { name: 'Transport', icon: '🚌', color: 'bg-green-500' },
  { name: 'Supplies', icon: '✏️', color: 'bg-yellow-500' },
  { name: 'Other', icon: '📦', color: 'bg-gray-500' },
];

export function ExpenseTracker() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('student-expenses', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('student-budgets', [
    { category: 'Food', limit: 300 },
    { category: 'Books', limit: 100 },
    { category: 'Entertainment', limit: 50 },
  ]);
  const [monthlyBudget, setMonthlyBudget] = useLocalStorage<number>('student-monthly-budget', 500);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  // Get current month's expenses
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = monthlyBudget - totalSpent;
  const spentPercentage = Math.min((totalSpent / monthlyBudget) * 100, 100);

  // Group expenses by category
  const expensesByCategory = CATEGORIES.map(cat => {
    const catExpenses = monthlyExpenses.filter(e => e.category === cat.name);
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = budgets.find(b => b.category === cat.name)?.limit || 0;
    return { ...cat, total, budget, expenses: catExpenses };
  }).filter(cat => cat.total > 0 || cat.budget > 0);

  const addExpense = () => {
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    };

    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmount('');
    setShowAddExpense(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateBudget = (categoryName: string, newLimit: number) => {
    const existing = budgets.find(b => b.category === categoryName);
    if (existing) {
      setBudgets(budgets.map(b => 
        b.category === categoryName ? { ...b, limit: newLimit } : b
      ));
    } else {
      setBudgets([...budgets, { category: categoryName, limit: newLimit }]);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Expense Tracker
          </CardTitle>
          <Button 
            size="sm" 
            variant={showAddExpense ? "secondary" : "default"}
            onClick={() => setShowAddExpense(!showAddExpense)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monthly Overview */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Budget</p>
              {editingBudget ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(e.target.value)}
                    className="w-24 h-8"
                    placeholder={monthlyBudget.toString()}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => {
                      if (parseFloat(newBudgetLimit) > 0) {
                        setMonthlyBudget(parseFloat(newBudgetLimit));
                      }
                      setEditingBudget(false);
                      setNewBudgetLimit('');
                    }}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <p 
                  className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setEditingBudget(true)}
                >
                  ${monthlyBudget.toFixed(2)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${remaining.toFixed(2)}
              </p>
            </div>
          </div>
          
          <Progress 
            value={spentPercentage} 
            className={`h-2 ${spentPercentage > 90 ? '[&>div]:bg-red-500' : spentPercentage > 70 ? '[&>div]:bg-yellow-500' : ''}`}
          />
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingDown className="w-3 h-3" />
              Spent: ${totalSpent.toFixed(2)}
            </span>
            <span className="text-muted-foreground">
              {spentPercentage.toFixed(0)}% used
            </span>
          </div>
        </div>

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="p-4 bg-muted/20 rounded-lg space-y-3 border border-border/50">
            <Input
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  step="0.01"
                  min="0"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 bg-background border border-input rounded-md text-sm min-w-[120px]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <Button className="w-full" onClick={addExpense}>
              Add Expense
            </Button>
          </div>
        )}

        {/* Category Breakdown */}
        {expensesByCategory.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">By Category</p>
            {expensesByCategory.map(cat => {
              const percentage = cat.budget > 0 ? Math.min((cat.total / cat.budget) * 100, 100) : 0;
              return (
                <div key={cat.name} className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">${cat.total.toFixed(2)}</span>
                      {cat.budget > 0 && (
                        <span className="text-xs text-muted-foreground"> / ${cat.budget}</span>
                      )}
                    </div>
                  </div>
                  {cat.budget > 0 && (
                    <Progress 
                      value={percentage} 
                      className={`h-1.5 ${percentage > 90 ? '[&>div]:bg-red-500' : percentage > 70 ? '[&>div]:bg-yellow-500' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Expenses */}
        {monthlyExpenses.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Recent Expenses</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {monthlyExpenses.slice(0, 10).map(expense => {
                const cat = CATEGORIES.find(c => c.name === expense.category);
                return (
                  <div 
                    key={expense.id}
                    className="flex items-center justify-between p-2 bg-muted/20 rounded-lg group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">{cat?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`${cat?.color} text-white text-xs`}>
                        ${expense.amount.toFixed(2)}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {monthlyExpenses.length === 0 && !showAddExpense && (
          <div className="text-center py-6 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No expenses this month</p>
            <p className="text-sm">Click + to add your first expense!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

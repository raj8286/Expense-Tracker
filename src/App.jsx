import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense') // 'income' or 'expense'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('all') // 'all', 'monthly', 'yearly'

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('expenseTrackerData')
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('expenseTrackerData', JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount || amount <= 0) {
      alert('Please fill in all fields with valid values')
      return
    }

    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      date,
      timestamp: new Date().toISOString()
    }

    setTransactions([newTransaction, ...transactions])
    setDescription('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
  }

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id))
  }

  const getFilteredTransactions = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    switch (viewMode) {
      case 'monthly':
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date)
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear
        })
      case 'yearly':
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date)
          return transactionDate.getFullYear() === currentYear
        })
      default:
        return transactions
    }
  }

  const calculateTotals = (transactionList = transactions) => {
    const income = transactionList
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactionList
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return { income, expenses, balance: income - expenses }
  }

  const filteredTransactions = getFilteredTransactions()
  const totals = calculateTotals(filteredTransactions)
  const allTimeTotals = calculateTotals()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>💰 Expense Tracker</h1>
        <p>Track your income and expenses easily</p>
      </div>

      <div className="container">
        {/* Summary Section with View Toggle */}
        <div className="summary-section">
          {/* View Toggle Buttons */}
          <div className="view-toggle">
            <button 
              onClick={() => setViewMode('all')}
              className={viewMode === 'all' ? 'active' : ''}
            >
              All Time
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={viewMode === 'monthly' ? 'active' : ''}
            >
              This Month
            </button>
            <button 
              onClick={() => setViewMode('yearly')}
              className={viewMode === 'yearly' ? 'active' : ''}
            >
              This Year
            </button>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card income">
              <h3>💚 Income</h3>
              <p className="amount">{formatCurrency(totals.income)}</p>
            </div>
            <div className="summary-card expense">
              <h3>❤️ Expenses</h3>
              <p className="amount">{formatCurrency(totals.expenses)}</p>
            </div>
            <div className={`summary-card balance ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
              <h3>💰 Balance</h3>
              <p className="amount">{formatCurrency(totals.balance)}</p>
            </div>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="form-section">
          <h2>Add New Transaction</h2>
          <form onSubmit={addTransaction} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="form-control"
                >
                  <option value="expense">💸 Expense</option>
                  <option value="income">💰 Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="form-control"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary">
              Add Transaction
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="transactions-section">
          <div className="transactions-header">
            <h2>
              {viewMode === 'monthly' ? 'This Month\'s Transactions' : 
               viewMode === 'yearly' ? 'This Year\'s Transactions' : 
               'All Transactions'}
            </h2>
            <span className="transaction-count">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found for the selected period.</p>
              <p>Add your first transaction above! 👆</p>
            </div>
          ) : (
            <div className="transactions-list">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-info">
                    <div className="transaction-description">
                      <span className="type-icon">
                        {transaction.type === 'income' ? '💰' : '💸'}
                      </span>
                      {transaction.description}
                    </div>
                    <div className="transaction-date">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <span className={transaction.type}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <button 
                      onClick={() => deleteTransaction(transaction.id)}
                      className="delete-btn"
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Time Summary (shown when viewing filtered data) */}
        {viewMode !== 'all' && (
          <div className="all-time-summary">
            <h3>All Time Summary</h3>
            <div className="summary-row">
              <span>Total Income: {formatCurrency(allTimeTotals.income)}</span>
              <span>Total Expenses: {formatCurrency(allTimeTotals.expenses)}</span>
              <span className={allTimeTotals.balance >= 0 ? 'positive' : 'negative'}>
                Net Balance: {formatCurrency(allTimeTotals.balance)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

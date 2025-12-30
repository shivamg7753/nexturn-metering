import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import UsageBillingPage from './pages/UsageBillingPage'
import ProductCataloguePage from './pages/ProductCataloguePage'
import PlaceholderPage from './pages/PlaceholderPage'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('usage-billing')
  const [themeMode, setThemeMode] = useState('dark')

  // Update data-theme attribute for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)
  }, [themeMode])

  const handleThemeToggle = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage themeMode={themeMode} />
      case 'balances':
        return <PlaceholderPage title="Balances" description="View and manage account balances" themeMode={themeMode} />
      case 'transactions':
        return <PlaceholderPage title="Transactions" description="View transaction history" themeMode={themeMode} />
      case 'customers':
        return <PlaceholderPage title="Customers" description="Manage your customers" themeMode={themeMode} />
      case 'products':
        return <ProductCataloguePage themeMode={themeMode} />
      case 'revenue':
        return <PlaceholderPage title="Revenue Recovery" description="Track and recover revenue" themeMode={themeMode} />
      case 'usage-billing':
        return <UsageBillingPage themeMode={themeMode} />
      case 'billing-overview':
        return <PlaceholderPage title="Billing Overview" description="View billing summary and metrics" themeMode={themeMode} />
      case 'invoices':
        return <PlaceholderPage title="Invoices" description="Manage and view invoices" themeMode={themeMode} />
      case 'subscriptions':
        return <PlaceholderPage title="Subscriptions" description="Manage customer subscriptions" themeMode={themeMode} />
      case 'payments':
        return <PlaceholderPage title="Payments" description="View and manage payments" themeMode={themeMode} />
      case 'billing':
        return <PlaceholderPage title="Billing" description="Configure billing settings" themeMode={themeMode} />
      case 'reporting':
        return <PlaceholderPage title="Reporting" description="View reports and analytics" themeMode={themeMode} />
      default:
        return <HomePage themeMode={themeMode} />
    }
  }

  return (
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      themeMode={themeMode}
      onThemeToggle={handleThemeToggle}
    >
      {renderPage()}
    </Layout>
  )
}

export default App

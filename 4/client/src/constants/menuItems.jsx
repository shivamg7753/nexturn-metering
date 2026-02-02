import HomeIcon from '@mui/icons-material/Home'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PeopleIcon from '@mui/icons-material/People'
import InventoryIcon from '@mui/icons-material/Inventory'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PaymentIcon from '@mui/icons-material/Payment'
import DescriptionIcon from '@mui/icons-material/Description'
import BarChartIcon from '@mui/icons-material/BarChart'
import BoltIcon from '@mui/icons-material/Bolt'

export const mainMenuItems = [
    { text: 'Home', icon: <HomeIcon />, key: 'home' },
    { text: 'Balances', icon: <AccountBalanceWalletIcon />, key: 'balances' },
    { text: 'Transactions', icon: <ReceiptLongIcon />, key: 'transactions' },
    { text: 'Customers', icon: <PeopleIcon />, key: 'customers' },
    { text: 'Product Catalogue', icon: <InventoryIcon />, key: 'products' },
    { text: 'Demo Product', icon: <BoltIcon />, key: 'demo-product' },
]

export const shortcutItems = [
    { text: 'Revenue Recovery', icon: <TrendingUpIcon />, key: 'revenue' },
    { text: 'Usage Billing', icon: <ReceiptIcon />, key: 'usage-billing' },
    { text: 'Billing Overview', icon: <AssessmentIcon />, key: 'billing-overview' },
    { text: 'Invoices', icon: <DescriptionIcon />, key: 'invoices' },
    { text: 'Subscriptions', icon: <ReceiptLongIcon />, key: 'subscriptions' },
    { text: 'Events Dashboard', icon: <BarChartIcon />, key: 'events-dashboard' },
]

export const productMenuItems = [
    { text: 'Payments', icon: <PaymentIcon />, key: 'payments' },
    { text: 'Billing', icon: <DescriptionIcon />, key: 'billing' },
    { text: 'Reporting', icon: <BarChartIcon />, key: 'reporting' },
]

export const meterTabs = ['Rate Cards', 'Preview', 'Meters']

export const aggregationDescriptions = {
    Sum: 'Bill customers based on the sum of all usage values for the billing period.',
    Count: 'Bill customers based on the count of all usage for the billing period.',
    Last: "Bill customers based on the most recent usage event's value for the billing period."
}

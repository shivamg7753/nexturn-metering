import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { getThemeColors, getGlassStyle } from '../theme/styles';
import { buildApiUrl } from '../api/config';

function EventsDashboardPage({ themeMode = 'dark' }) {
    const isDark = themeMode === 'dark';
    const colors = getThemeColors(themeMode);
    const glassStyle = getGlassStyle(themeMode);

    const [chartData, setChartData] = useState([]);
    const [rawEvents, setRawEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, rawRes] = await Promise.all([
                fetch(buildApiUrl('/ingest/summary')),
                fetch(buildApiUrl('/ingest/raw'))
            ]);

            const summaryData = await summaryRes.json();
            const rawData = await rawRes.json();

            setChartData(summaryData);
            setRawEvents(rawData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading && chartData.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#a78bfa' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                    Events Dashboard
                </Typography>
                <Typography sx={{ color: colors.textSecondary }}>
                    Monitor real-time event ingestion and usage trends
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Usage Graph */}
                <Grid item xs={12}>
                    <Paper sx={{
                        ...glassStyle,
                        p: 3,
                        height: 400,
                        border: `1px solid ${colors.border}`,
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)'
                    }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: colors.text }}>
                            Usage Over Time
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                <XAxis
                                    dataKey="date"
                                    stroke={colors.textSecondary}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke={colors.textSecondary}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        borderColor: colors.border,
                                        borderRadius: '8px',
                                        color: colors.text
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#a78bfa"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Raw Events Table */}
                <Grid item xs={12}>
                    <Paper sx={{
                        ...glassStyle,
                        p: 3,
                        border: `1px solid ${colors.border}`,
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)'
                    }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: colors.text }}>
                            Recent Raw Events
                        </Typography>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Event Name</TableCell>
                                        <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Customer ID</TableCell>
                                        <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Payload (JSON Structure)</TableCell>
                                        <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Timestamp</TableCell>
                                        <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rawEvents.map((event) => (
                                        <TableRow key={event._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ color: colors.text, fontWeight: 500 }}>
                                                {event.eventName}
                                            </TableCell>
                                            <TableCell sx={{ color: colors.textSecondary, fontFamily: 'monospace' }}>
                                                {event.customerId}
                                            </TableCell>
                                            <TableCell sx={{ color: colors.textSecondary }}>
                                                <Box sx={{
                                                    p: 1,
                                                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                                                    borderRadius: 1,
                                                    fontSize: '0.75rem',
                                                    fontFamily: 'monospace',
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {JSON.stringify(event.payload)}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: colors.textSecondary }}>
                                                {new Date(event.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label="Ingested"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(34, 197, 94, 0.15)',
                                                        color: '#4ade80',
                                                        fontWeight: 600,
                                                        fontSize: '0.65rem'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {rawEvents.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 6, color: colors.textSecondary }}>
                                                No events ingested yet. Send data from the Demo Product page.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default EventsDashboardPage;

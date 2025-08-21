// Analytics - Handles charts, metrics, and reporting

class Analytics {
    constructor() {
        this.chart = null;
        this.eventHistory = [];
        this.incidentMetrics = {
            totalCreated: 0,
            totalResolved: 0,
            avgResolutionTime: 0,
            byCategory: {},
            bySeverity: {}
        };
    }
    
    // Initialize analytics
    init() {
        this.initChart();
        this.updateMetrics();
        
        // Update analytics every 5 seconds
        setInterval(() => {
            this.updateChart();
            this.updateMetrics();
        }, CONFIG.chartUpdateInterval);
    }
    
    // Initialize chart
    initChart() {
        const canvas = document.getElementById('trendsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Critical',
                        data: [],
                        borderColor: '#ff3d71',
                        backgroundColor: 'rgba(255, 61, 113, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'High',
                        data: [],
                        borderColor: '#ffb547',
                        backgroundColor: 'rgba(255, 181, 71, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Medium',
                        data: [],
                        borderColor: '#ffa500',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Low',
                        data: [],
                        borderColor: '#00d68f',
                        backgroundColor: 'rgba(0, 214, 143, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#e8eaed',
                            font: {
                                size: 10
                            },
                            padding: 5
                        }
                    },
                    title: {
                        display: true,
                        text: 'Event Trends (Last Hour)',
                        color: '#e8eaed',
                        font: {
                            size: 12
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: 'rgba(42, 52, 65, 0.5)'
                        },
                        ticks: {
                            color: '#9aa0a6',
                            font: {
                                size: 9
                            }
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(42, 52, 65, 0.5)'
                        },
                        ticks: {
                            color: '#9aa0a6',
                            font: {
                                size: 9
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update chart data
    updateChart() {
        if (!this.chart) return;
        
        const now = new Date();
        const hourAgo = new Date(now - 60 * 60 * 1000);
        
        // Get events from last hour
        const recentEvents = eventService.events.filter(e => 
            new Date(e.timestamp) >= hourAgo
        );
        
        // Group by 5-minute intervals
        const intervals = 12; // 12 x 5 minutes = 1 hour
        const data = {
            labels: [],
            critical: new Array(intervals).fill(0),
            high: new Array(intervals).fill(0),
            medium: new Array(intervals).fill(0),
            low: new Array(intervals).fill(0)
        };
        
        // Generate labels
        for (let i = intervals - 1; i >= 0; i--) {
            const time = new Date(now - i * 5 * 60 * 1000);
            data.labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        
        // Count events per interval
        recentEvents.forEach(event => {
            const eventTime = new Date(event.timestamp);
            const minutesAgo = (now - eventTime) / 60000;
            const intervalIndex = intervals - 1 - Math.floor(minutesAgo / 5);
            
            if (intervalIndex >= 0 && intervalIndex < intervals) {
                switch(event.severity) {
                    case 'Critical':
                        data.critical[intervalIndex]++;
                        break;
                    case 'High':
                        data.high[intervalIndex]++;
                        break;
                    case 'Medium':
                        data.medium[intervalIndex]++;
                        break;
                    case 'Low':
                        data.low[intervalIndex]++;
                        break;
                }
            }
        });
        
        // Update chart
        this.chart.data.labels = data.labels;
        this.chart.data.datasets[0].data = data.critical;
        this.chart.data.datasets[1].data = data.high;
        this.chart.data.datasets[2].data = data.medium;
        this.chart.data.datasets[3].data = data.low;
        this.chart.update('none'); // No animation for frequent updates
    }
    
    // Update metrics
    updateMetrics() {
        const incidents = serviceNowAPI.getAllIncidents();
        
        // Reset metrics
        this.incidentMetrics = {
            totalCreated: incidents.length,
            totalResolved: 0,
            avgResolutionTime: 0,
            byCategory: {},
            bySeverity: {},
            aiAccuracy: 0
        };
        
        let totalResolutionTime = 0;
        let resolvedCount = 0;
        
        incidents.forEach(incident => {
            // Count by category
            if (!this.incidentMetrics.byCategory[incident.category]) {
                this.incidentMetrics.byCategory[incident.category] = 0;
            }
            this.incidentMetrics.byCategory[incident.category]++;
            
            // Count by severity
            const severity = incident.priority.split('-')[1];
            if (!this.incidentMetrics.bySeverity[severity]) {
                this.incidentMetrics.bySeverity[severity] = 0;
            }
            this.incidentMetrics.bySeverity[severity]++;
            
            // Count resolved and calculate resolution time
            if (incident.state === 'Resolved' || incident.state === 'Closed') {
                this.incidentMetrics.totalResolved++;
                
                if (incident.resolvedAt) {
                    const resolutionTime = (new Date(incident.resolvedAt) - new Date(incident.createdAt)) / 3600000; // hours
                    totalResolutionTime += resolutionTime;
                    resolvedCount++;
                }
            }
        });
        
        // Calculate average resolution time
        if (resolvedCount > 0) {
            this.incidentMetrics.avgResolutionTime = totalResolutionTime / resolvedCount;
        }
        
        // Calculate AI accuracy (simulated)
        const analyses = window.aiAnalysisEngine?.analysisHistory || [];
        if (analyses.length > 0) {
            const totalConfidence = analyses.reduce((sum, a) => sum + a.overallConfidence, 0);
            this.incidentMetrics.aiAccuracy = (totalConfidence / analyses.length) * 100;
        }
        
        // Update dashboard if needed
        this.updateDashboardMetrics();
    }
    
    // Update dashboard metrics display
    updateDashboardMetrics() {
        // This would update additional metric displays if they existed in the UI
        // For now, the main metrics are handled by other components
    }
    
    // Get event statistics
    getEventStats() {
        const stats = {
            total: eventService.events.length,
            bySeverity: {},
            byType: {},
            recentRate: 0
        };
        
        // Count by severity and type
        eventService.events.forEach(event => {
            if (!stats.bySeverity[event.severity]) {
                stats.bySeverity[event.severity] = 0;
            }
            stats.bySeverity[event.severity]++;
            
            if (!stats.byType[event.type]) {
                stats.byType[event.type] = 0;
            }
            stats.byType[event.type]++;
        });
        
        // Calculate recent event rate (events per minute in last 10 minutes)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentEvents = eventService.events.filter(e => 
            new Date(e.timestamp) >= tenMinutesAgo
        );
        stats.recentRate = recentEvents.length / 10;
        
        return stats;
    }
    
    // Get performance metrics
    getPerformanceMetrics() {
        const metrics = {
            mttr: this.incidentMetrics.avgResolutionTime,
            resolutionRate: 0,
            slaCompliance: 0,
            teamUtilization: 0
        };
        
        // Calculate resolution rate
        if (this.incidentMetrics.totalCreated > 0) {
            metrics.resolutionRate = (this.incidentMetrics.totalResolved / this.incidentMetrics.totalCreated) * 100;
        }
        
        // Calculate SLA compliance
        const incidents = serviceNowAPI.getAllIncidents();
        let slaCompliant = 0;
        incidents.forEach(incident => {
            const status = serviceNowAPI.checkSLAStatus(incident);
            if (status === 'on-track' || status === 'completed') {
                slaCompliant++;
            }
        });
        
        if (incidents.length > 0) {
            metrics.slaCompliance = (slaCompliant / incidents.length) * 100;
        }
        
        // Calculate team utilization
        const workloadStats = assignmentEngine.getWorkloadStats();
        metrics.teamUtilization = workloadStats.utilizationPercent;
        
        return metrics;
    }
    
    // Export data
    exportData(format = 'json') {
        const data = {
            exportDate: new Date().toISOString(),
            events: eventService.events.slice(0, 100),
            incidents: serviceNowAPI.getAllIncidents(),
            metrics: {
                incident: this.incidentMetrics,
                event: this.getEventStats(),
                performance: this.getPerformanceMetrics()
            }
        };
        
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `noc-analytics-${Date.now()}.json`;
            a.click();
        } else if (format === 'csv') {
            // Convert to CSV format
            let csv = 'Type,ID,Time,Severity,Category,Status,Description\n';
            
            // Add events
            eventService.events.slice(0, 50).forEach(event => {
                csv += `Event,${event.id},${event.timestamp},${event.severity},${event.type},${event.status},"${event.message}"\n`;
            });
            
            // Add incidents
            serviceNowAPI.getAllIncidents().forEach(incident => {
                csv += `Incident,${incident.number},${incident.createdAt},${incident.priority},${incident.category},${incident.state},"${incident.shortDescription}"\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `noc-report-${Date.now()}.csv`;
            a.click();
        }
    }
}

// Create global instance
const analytics = new Analytics();

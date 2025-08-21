// Configuration settings for the NOC AI Analyst application
const CONFIG = {
    // Event generation settings
    eventGenerationEnabled: false,
    eventGenerationInterval: 15000, // milliseconds
    
    // AI Analysis settings
    aiConfidenceThreshold: 0.75,
    aiAnalysisDelay: 3000, // Simulated processing time
    
    // SLA Configuration (in hours)
    slaSettings: {
        'Critical': 1,
        'High': 4,
        'Medium': 8,
        'Low': 24
    },
    
    // Team settings
    teamRotationInterval: 30000, // Check team availability every 30 seconds
    maxConcurrentTickets: 5,
    
    // Analytics settings
    maxEventHistory: 1000,
    chartUpdateInterval: 5000,
    
    // API simulation delays
    apiDelay: {
        cmdb: 500,
        ticket: 1000,
        knowledge: 750
    }
};

// Event severity levels
const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

// Event types
const EVENT_TYPES = ['Network', 'Server', 'Database', 'Application', 'Security'];

// Incident states
const INCIDENT_STATES = ['New', 'In Progress', 'Resolved', 'Closed'];

// Assignment groups
const ASSIGNMENT_GROUPS = [
    'L1 Support',
    'L2 Network',
    'L2 Application',
    'L3 Database',
    'Security Team',
    'Infrastructure'
];

// Common error patterns for event generation
const ERROR_PATTERNS = {
    Network: [
        'Network interface down',
        'High packet loss detected',
        'BGP session flapping',
        'Switch CPU utilization critical',
        'Port channel member down',
        'OSPF neighbor relationship lost',
        'Network latency exceeded threshold'
    ],
    Server: [
        'HTTP 500 errors increasing',
        'CPU utilization above 90%',
        'Memory usage critical',
        'Disk space low',
        'Service failed to start',
        'System reboot detected',
        'Hardware sensor alert'
    ],
    Database: [
        'Connection pool exhausted',
        'Long running queries detected',
        'Transaction log full',
        'Replication lag increasing',
        'Deadlock detected',
        'Index fragmentation high',
        'Backup job failed'
    ],
    Application: [
        'Application response time degraded',
        'Session timeout errors',
        'API rate limit exceeded',
        'Cache miss rate high',
        'Queue processing delayed',
        'Microservice unreachable',
        'Memory leak detected'
    ],
    Security: [
        'Multiple failed login attempts',
        'Suspicious network activity',
        'Firewall rule violation',
        'Certificate expiring soon',
        'Intrusion detection alert',
        'Malware signature detected',
        'Unauthorized access attempt'
    ]
};

// Knowledge base entries for known issues
const KNOWLEDGE_BASE = [
    {
        id: 'KB001',
        title: 'Database Connection Pool Exhaustion',
        symptoms: ['Connection timeout', 'Pool exhausted', 'Database unavailable'],
        solution: 'Increase connection pool size and restart application server',
        category: 'Database'
    },
    {
        id: 'KB002',
        title: 'High CPU Usage on Web Servers',
        symptoms: ['CPU > 90%', 'Slow response', 'Thread pool full'],
        solution: 'Scale horizontally, optimize code, check for infinite loops',
        category: 'Server'
    },
    {
        id: 'KB003',
        title: 'Network Interface Flapping',
        symptoms: ['Interface down/up', 'Packet loss', 'BGP flapping'],
        solution: 'Check cable connections, update firmware, replace SFP module',
        category: 'Network'
    },
    {
        id: 'KB004',
        title: 'Application Memory Leak',
        symptoms: ['Memory increasing', 'OutOfMemory errors', 'Performance degradation'],
        solution: 'Apply latest patches, increase heap size temporarily, schedule restart',
        category: 'Application'
    },
    {
        id: 'KB005',
        title: 'SSL Certificate Issues',
        symptoms: ['Certificate expired', 'SSL handshake failed', 'Security warning'],
        solution: 'Renew certificate, update trust store, verify certificate chain',
        category: 'Security'
    }
];

// Store configuration in localStorage
function saveConfig() {
    localStorage.setItem('nocConfig', JSON.stringify(CONFIG));
}

// Load configuration from localStorage
function loadConfig() {
    const saved = localStorage.getItem('nocConfig');
    if (saved) {
        Object.assign(CONFIG, JSON.parse(saved));
    }
}

// Initialize configuration
loadConfig();

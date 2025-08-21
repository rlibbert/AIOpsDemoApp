// Mock data for the NOC AI Analyst application

// Mock CMDB (Configuration Management Database) data
const CMDB = {
    servers: [
        {
            id: 'srv-web-01',
            name: 'server-web-01.company.com',
            type: 'Web Server',
            os: 'Linux',
            ip: '10.0.1.10',
            environment: 'Production',
            dependencies: ['srv-db-01', 'srv-cache-01'],
            services: ['nginx', 'nodejs'],
            status: 'online'
        },
        {
            id: 'srv-web-02',
            name: 'server-web-02.company.com',
            type: 'Web Server',
            os: 'Linux',
            ip: '10.0.1.11',
            environment: 'Production',
            dependencies: ['srv-db-01', 'srv-cache-01'],
            services: ['nginx', 'nodejs'],
            status: 'online'
        },
        {
            id: 'srv-app-01',
            name: 'server-app-01.company.com',
            type: 'Application Server',
            os: 'Windows',
            ip: '10.0.2.20',
            environment: 'Production',
            dependencies: ['srv-db-01', 'srv-mq-01'],
            services: ['IIS', 'dotnet'],
            status: 'online'
        },
        {
            id: 'srv-db-01',
            name: 'database-01.company.com',
            type: 'Database Server',
            os: 'Linux',
            ip: '10.0.3.30',
            environment: 'Production',
            dependencies: [],
            services: ['postgresql', 'pgbouncer'],
            status: 'online'
        },
        {
            id: 'srv-db-02',
            name: 'database-02.company.com',
            type: 'Database Server',
            os: 'Linux',
            ip: '10.0.3.31',
            environment: 'Production',
            dependencies: ['srv-db-01'],
            services: ['postgresql'],
            status: 'online'
        },
        {
            id: 'srv-cache-01',
            name: 'cache-01.company.com',
            type: 'Cache Server',
            os: 'Linux',
            ip: '10.0.4.40',
            environment: 'Production',
            dependencies: [],
            services: ['redis'],
            status: 'online'
        },
        {
            id: 'srv-mq-01',
            name: 'messagequeue-01.company.com',
            type: 'Message Queue',
            os: 'Linux',
            ip: '10.0.5.50',
            environment: 'Production',
            dependencies: [],
            services: ['rabbitmq'],
            status: 'online'
        }
    ],
    
    networkDevices: [
        {
            id: 'net-fw-01',
            name: 'firewall-01.company.com',
            type: 'Firewall',
            vendor: 'Cisco',
            ip: '10.0.0.1',
            location: 'Datacenter A',
            status: 'online'
        },
        {
            id: 'net-sw-core-01',
            name: 'switch-core-01.company.com',
            type: 'Core Switch',
            vendor: 'Cisco',
            ip: '10.0.0.10',
            location: 'Datacenter A',
            status: 'online'
        },
        {
            id: 'net-rt-edge-01',
            name: 'router-edge-01.company.com',
            type: 'Edge Router',
            vendor: 'Juniper',
            ip: '10.0.0.20',
            location: 'Datacenter A',
            status: 'online'
        },
        {
            id: 'net-lb-01',
            name: 'loadbalancer-01.company.com',
            type: 'Load Balancer',
            vendor: 'F5',
            ip: '10.0.0.30',
            location: 'Datacenter A',
            status: 'online'
        }
    ],
    
    applications: [
        {
            id: 'app-web-portal',
            name: 'Customer Portal',
            type: 'Web Application',
            criticality: 'High',
            dependencies: ['srv-web-01', 'srv-web-02', 'srv-db-01', 'srv-cache-01'],
            url: 'https://portal.company.com',
            status: 'online'
        },
        {
            id: 'app-api',
            name: 'REST API Service',
            type: 'API',
            criticality: 'Critical',
            dependencies: ['srv-app-01', 'srv-db-01', 'srv-mq-01'],
            url: 'https://api.company.com',
            status: 'online'
        },
        {
            id: 'app-admin',
            name: 'Admin Dashboard',
            type: 'Web Application',
            criticality: 'Medium',
            dependencies: ['srv-web-01', 'srv-db-01'],
            url: 'https://admin.company.com',
            status: 'online'
        }
    ]
};

// Mock team members data
const TEAM_MEMBERS = [
    {
        id: 'tm-001',
        name: 'John Smith',
        email: 'john.smith@company.com',
        role: 'L2 Network Engineer',
        skills: ['Network', 'Firewall', 'Routing'],
        group: 'L2 Network',
        availability: 'available',
        currentLoad: 2,
        maxLoad: 5,
        shift: 'day',
        timezone: 'EST'
    },
    {
        id: 'tm-002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'L3 Database Admin',
        skills: ['Database', 'PostgreSQL', 'Performance'],
        group: 'L3 Database',
        availability: 'available',
        currentLoad: 3,
        maxLoad: 5,
        shift: 'day',
        timezone: 'EST'
    },
    {
        id: 'tm-003',
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        role: 'L2 Application Support',
        skills: ['Application', 'Linux', 'Troubleshooting'],
        group: 'L2 Application',
        availability: 'busy',
        currentLoad: 4,
        maxLoad: 5,
        shift: 'day',
        timezone: 'PST'
    },
    {
        id: 'tm-004',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        role: 'L1 Support Analyst',
        skills: ['Monitoring', 'Incident Management', 'Triage'],
        group: 'L1 Support',
        availability: 'available',
        currentLoad: 1,
        maxLoad: 8,
        shift: 'night',
        timezone: 'EST'
    },
    {
        id: 'tm-005',
        name: 'Robert Wilson',
        email: 'robert.wilson@company.com',
        role: 'Security Analyst',
        skills: ['Security', 'Firewall', 'Incident Response'],
        group: 'Security Team',
        availability: 'available',
        currentLoad: 2,
        maxLoad: 4,
        shift: 'day',
        timezone: 'CST'
    },
    {
        id: 'tm-006',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@company.com',
        role: 'Infrastructure Engineer',
        skills: ['Server', 'VMware', 'Storage'],
        group: 'Infrastructure',
        availability: 'offline',
        currentLoad: 0,
        maxLoad: 5,
        shift: 'day',
        timezone: 'EST'
    },
    {
        id: 'tm-007',
        name: 'David Martinez',
        email: 'david.martinez@company.com',
        role: 'L2 Network Engineer',
        skills: ['Network', 'Load Balancing', 'DNS'],
        group: 'L2 Network',
        availability: 'available',
        currentLoad: 1,
        maxLoad: 5,
        shift: 'night',
        timezone: 'PST'
    },
    {
        id: 'tm-008',
        name: 'Jessica Thompson',
        email: 'jessica.thompson@company.com',
        role: 'L1 Support Analyst',
        skills: ['Monitoring', 'Documentation', 'Communication'],
        group: 'L1 Support',
        availability: 'available',
        currentLoad: 3,
        maxLoad: 8,
        shift: 'day',
        timezone: 'EST'
    }
];

// Recent changes data (for correlation analysis)
const RECENT_CHANGES = [
    {
        id: 'CHG0001234',
        title: 'Database maintenance window',
        type: 'Scheduled',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        affectedSystems: ['srv-db-01', 'srv-db-02'],
        status: 'Completed'
    },
    {
        id: 'CHG0001235',
        title: 'Firewall rule update',
        type: 'Standard',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
        affectedSystems: ['net-fw-01'],
        status: 'Completed'
    },
    {
        id: 'CHG0001236',
        title: 'Application deployment - v2.5.0',
        type: 'Standard',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endTime: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        affectedSystems: ['srv-app-01', 'app-api'],
        status: 'Completed'
    }
];

// Historical incidents for pattern matching
const HISTORICAL_INCIDENTS = [
    {
        number: 'INC0000999',
        title: 'Database connection pool exhaustion',
        category: 'Database',
        rootCause: 'Connection leak in application code',
        resolution: 'Increased pool size and fixed application code',
        resolutionTime: 3.5,
        occurrences: 5
    },
    {
        number: 'INC0000998',
        title: 'High CPU on web servers',
        category: 'Server',
        rootCause: 'Memory leak causing excessive garbage collection',
        resolution: 'Applied patch and restarted services',
        resolutionTime: 2.0,
        occurrences: 3
    },
    {
        number: 'INC0000997',
        title: 'Network latency spike',
        category: 'Network',
        rootCause: 'BGP route flapping due to ISP issue',
        resolution: 'Worked with ISP to stabilize routes',
        resolutionTime: 4.5,
        occurrences: 2
    },
    {
        number: 'INC0000996',
        title: 'Application timeout errors',
        category: 'Application',
        rootCause: 'Slow database queries blocking threads',
        resolution: 'Optimized queries and added indexes',
        resolutionTime: 5.0,
        occurrences: 4
    },
    {
        number: 'INC0000995',
        title: 'SSL certificate expired',
        category: 'Security',
        rootCause: 'Certificate renewal process failed',
        resolution: 'Manually renewed and updated certificate',
        resolutionTime: 1.0,
        occurrences: 1
    }
];

// Generate random source system
function getRandomSource() {
    const sources = [
        ...CMDB.servers.map(s => s.name),
        ...CMDB.networkDevices.map(n => n.name),
        ...CMDB.applications.map(a => a.name)
    ];
    return sources[Math.floor(Math.random() * sources.length)];
}

// Get affected systems based on source
function getAffectedSystems(source) {
    const affected = [source];
    
    // Find dependencies
    const server = CMDB.servers.find(s => s.name === source);
    if (server && server.dependencies.length > 0) {
        const deps = server.dependencies.map(d => {
            const dep = CMDB.servers.find(s => s.id === d);
            return dep ? dep.name : d;
        });
        affected.push(...deps);
    }
    
    // Find dependent applications
    const apps = CMDB.applications.filter(a => {
        const srv = CMDB.servers.find(s => s.name === source);
        return srv && a.dependencies.includes(srv.id);
    });
    affected.push(...apps.map(a => a.name));
    
    return [...new Set(affected)]; // Remove duplicates
}

// Get system details from CMDB
function getSystemDetails(systemName) {
    // Check servers
    let system = CMDB.servers.find(s => s.name === systemName || s.id === systemName);
    if (system) return { ...system, systemType: 'server' };
    
    // Check network devices
    system = CMDB.networkDevices.find(n => n.name === systemName || n.id === systemName);
    if (system) return { ...system, systemType: 'network' };
    
    // Check applications
    system = CMDB.applications.find(a => a.name === systemName || a.id === systemName);
    if (system) return { ...system, systemType: 'application' };
    
    return null;
}

// Get team member by skills
function getTeamMemberBySkills(requiredSkills) {
    const available = TEAM_MEMBERS.filter(m => 
        m.availability === 'available' && 
        m.currentLoad < m.maxLoad &&
        requiredSkills.some(skill => m.skills.includes(skill))
    );
    
    if (available.length === 0) {
        // Get busy members as fallback
        return TEAM_MEMBERS.filter(m =>
            m.availability !== 'offline' &&
            requiredSkills.some(skill => m.skills.includes(skill))
        );
    }
    
    // Sort by workload (ascending) and return the least loaded
    return available.sort((a, b) => a.currentLoad - b.currentLoad);
}

// Update team member workload
function updateTeamMemberLoad(memberId, delta) {
    const member = TEAM_MEMBERS.find(m => m.id === memberId);
    if (member) {
        member.currentLoad = Math.max(0, member.currentLoad + delta);
        if (member.currentLoad >= member.maxLoad) {
            member.availability = 'busy';
        } else if (member.currentLoad > 0) {
            member.availability = 'available';
        }
    }
}

// Rotate team availability (simulate shift changes)
function rotateTeamAvailability() {
    const hour = new Date().getHours();
    const isNightShift = hour >= 20 || hour < 8;
    
    TEAM_MEMBERS.forEach(member => {
        if (member.shift === 'day' && isNightShift) {
            member.availability = 'offline';
        } else if (member.shift === 'night' && !isNightShift) {
            member.availability = 'offline';
        } else if (member.availability === 'offline') {
            // Coming back online
            member.availability = member.currentLoad >= member.maxLoad ? 'busy' : 'available';
        }
    });
}

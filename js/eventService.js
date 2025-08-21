// Event Service - Handles event generation, storage, and management

class EventService {
    constructor() {
        this.events = [];
        this.eventCounter = 1000;
        this.eventGenerationInterval = null;
        this.subscribers = [];
        this.filters = {
            severity: '',
            type: ''
        };
    }
    
    // Initialize the event service
    init() {
        // Load saved events from localStorage
        this.loadEvents();
        
        // Generate some initial events
        this.generateInitialEvents();
        
        // Start team rotation check
        setInterval(() => rotateTeamAvailability(), CONFIG.teamRotationInterval);
    }
    
    // Generate initial events for demo
    generateInitialEvents() {
        // Generate 5 initial events with different severities
        const initialEvents = [
            { severity: 'Critical', type: 'Database', delay: 0 },
            { severity: 'High', type: 'Server', delay: 500 },
            { severity: 'Medium', type: 'Network', delay: 1000 },
            { severity: 'Low', type: 'Application', delay: 1500 },
            { severity: 'High', type: 'Security', delay: 2000 }
        ];
        
        initialEvents.forEach(({ severity, type, delay }) => {
            setTimeout(() => {
                this.generateEvent(severity, type);
            }, delay);
        });
    }
    
    // Generate a random event
    generateEvent(forcedSeverity = null, forcedType = null) {
        const severity = forcedSeverity || SEVERITY_LEVELS[Math.floor(Math.random() * SEVERITY_LEVELS.length)];
        const type = forcedType || EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        const source = getRandomSource();
        const message = this.getRandomMessage(type);
        
        const event = {
            id: `EVT-2024-${String(this.eventCounter++).padStart(6, '0')}`,
            timestamp: new Date().toISOString(),
            severity: severity,
            type: type,
            source: source,
            message: message,
            affectedSystems: getAffectedSystems(source),
            metrics: this.generateMetrics(type, severity),
            status: 'active',
            analyzed: false
        };
        
        this.addEvent(event);
        return event;
    }
    
    // Get random message based on type
    getRandomMessage(type) {
        const patterns = ERROR_PATTERNS[type];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    // Generate metrics based on event type
    generateMetrics(type, severity) {
        const metrics = {};
        
        switch(type) {
            case 'Network':
                metrics.packetLoss = severity === 'Critical' ? Math.random() * 50 + 50 : Math.random() * 30;
                metrics.latency = severity === 'Critical' ? Math.random() * 500 + 500 : Math.random() * 200;
                break;
            case 'Server':
                metrics.cpuUsage = severity === 'Critical' ? Math.random() * 20 + 80 : Math.random() * 50 + 40;
                metrics.memoryUsage = Math.random() * 100;
                metrics.diskUsage = Math.random() * 100;
                break;
            case 'Database':
                metrics.connectionPool = severity === 'Critical' ? Math.random() * 10 + 90 : Math.random() * 60;
                metrics.queryTime = Math.random() * 5000;
                metrics.deadlocks = Math.floor(Math.random() * 10);
                break;
            case 'Application':
                metrics.errorRate = severity === 'Critical' ? Math.random() * 50 + 50 : Math.random() * 25;
                metrics.responseTime = Math.random() * 10000;
                metrics.throughput = Math.floor(Math.random() * 1000);
                break;
            case 'Security':
                metrics.failedAttempts = Math.floor(Math.random() * 100);
                metrics.suspiciousTraffic = Math.random() * 100;
                metrics.threatLevel = severity === 'Critical' ? 'High' : 'Medium';
                break;
        }
        
        return metrics;
    }
    
    // Add event to the list
    addEvent(event) {
        this.events.unshift(event);
        
        // Keep only the last N events
        if (this.events.length > CONFIG.maxEventHistory) {
            this.events = this.events.slice(0, CONFIG.maxEventHistory);
        }
        
        // Save to localStorage
        this.saveEvents();
        
        // Notify subscribers
        this.notifySubscribers('eventAdded', event);
        
        // Update UI
        this.updateEventDisplay();
        this.updateEventCount();
        
        // Auto-analyze critical events
        if (event.severity === 'Critical' && !event.analyzed) {
            setTimeout(() => {
                window.aiAnalysisEngine?.analyzeEvent(event);
            }, 1000);
        }
    }
    
    // Update event display in UI
    updateEventDisplay() {
        const eventList = document.getElementById('eventList');
        if (!eventList) return;
        
        const filteredEvents = this.getFilteredEvents();
        
        eventList.innerHTML = '';
        filteredEvents.slice(0, 50).forEach(event => {
            const eventElement = this.createEventElement(event);
            eventList.appendChild(eventElement);
        });
    }
    
    // Create event element for display
    createEventElement(event) {
        const div = document.createElement('div');
        div.className = `event-item severity-${event.severity.toLowerCase()}`;
        div.dataset.eventId = event.id;
        div.onclick = () => this.showEventDetails(event);
        
        const timestamp = new Date(event.timestamp);
        const timeStr = timestamp.toLocaleTimeString();
        
        div.innerHTML = `
            <div class="event-header">
                <span class="event-severity ${event.severity.toLowerCase()}">${event.severity}</span>
                <span class="event-time">${timeStr}</span>
            </div>
            <div class="event-body">
                <div class="event-source">${event.source}</div>
                <div class="event-message">${event.message}</div>
            </div>
            <div class="event-footer">
                <span class="event-type">${event.type}</span>
                ${event.analyzed ? '<span class="event-type">Analyzed</span>' : ''}
            </div>
        `;
        
        return div;
    }
    
    // Show event details in modal
    showEventDetails(event) {
        const modal = document.getElementById('eventModal');
        const modalBody = document.getElementById('eventModalBody');
        
        const systemDetails = getSystemDetails(event.source);
        
        modalBody.innerHTML = `
            <div class="event-detail">
                <h4>Event Information</h4>
                <p><strong>ID:</strong> ${event.id}</p>
                <p><strong>Time:</strong> ${new Date(event.timestamp).toLocaleString()}</p>
                <p><strong>Severity:</strong> <span class="event-severity ${event.severity.toLowerCase()}">${event.severity}</span></p>
                <p><strong>Type:</strong> ${event.type}</p>
                <p><strong>Status:</strong> ${event.status}</p>
            </div>
            
            <div class="event-detail">
                <h4>Source System</h4>
                <p><strong>Name:</strong> ${event.source}</p>
                ${systemDetails ? `
                    <p><strong>Type:</strong> ${systemDetails.type || systemDetails.systemType}</p>
                    <p><strong>IP:</strong> ${systemDetails.ip || 'N/A'}</p>
                    <p><strong>Environment:</strong> ${systemDetails.environment || 'Production'}</p>
                ` : ''}
            </div>
            
            <div class="event-detail">
                <h4>Event Message</h4>
                <p>${event.message}</p>
            </div>
            
            <div class="event-detail">
                <h4>Affected Systems</h4>
                <ul>
                    ${event.affectedSystems.map(sys => `<li>${sys}</li>`).join('')}
                </ul>
            </div>
            
            ${Object.keys(event.metrics).length > 0 ? `
                <div class="event-detail">
                    <h4>Metrics</h4>
                    ${Object.entries(event.metrics).map(([key, value]) => 
                        `<p><strong>${this.formatMetricName(key)}:</strong> ${this.formatMetricValue(key, value)}</p>`
                    ).join('')}
                </div>
            ` : ''}
        `;
        
        // Store current event for actions
        modal.dataset.eventId = event.id;
        modal.classList.add('show');
    }
    
    // Format metric name for display
    formatMetricName(name) {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    // Format metric value for display
    formatMetricValue(name, value) {
        if (typeof value === 'number') {
            if (name.includes('Usage') || name.includes('Loss') || name.includes('Rate')) {
                return `${value.toFixed(1)}%`;
            } else if (name.includes('Time') || name.includes('latency')) {
                return `${value.toFixed(0)}ms`;
            } else {
                return value.toFixed(1);
            }
        }
        return value;
    }
    
    // Get filtered events
    getFilteredEvents() {
        return this.events.filter(event => {
            if (this.filters.severity && event.severity !== this.filters.severity) {
                return false;
            }
            if (this.filters.type && event.type !== this.filters.type) {
                return false;
            }
            return true;
        });
    }
    
    // Set event filter
    setFilter(filterType, value) {
        this.filters[filterType] = value;
        this.updateEventDisplay();
    }
    
    // Update event count in header
    updateEventCount() {
        const countElement = document.getElementById('activeEventsCount');
        if (countElement) {
            const activeEvents = this.events.filter(e => e.status === 'active').length;
            countElement.textContent = activeEvents;
        }
    }
    
    // Start automatic event generation
    startEventGeneration() {
        if (this.eventGenerationInterval) return;
        
        CONFIG.eventGenerationEnabled = true;
        
        this.eventGenerationInterval = setInterval(() => {
            // Random chance to generate an event
            if (Math.random() < 0.7) {
                this.generateEvent();
            }
        }, CONFIG.eventGenerationInterval);
        
        this.notifySubscribers('generationStarted');
    }
    
    // Stop automatic event generation
    stopEventGeneration() {
        if (this.eventGenerationInterval) {
            clearInterval(this.eventGenerationInterval);
            this.eventGenerationInterval = null;
        }
        
        CONFIG.eventGenerationEnabled = false;
        this.notifySubscribers('generationStopped');
    }
    
    // Toggle event generation
    toggleEventGeneration() {
        if (CONFIG.eventGenerationEnabled) {
            this.stopEventGeneration();
        } else {
            this.startEventGeneration();
        }
        return CONFIG.eventGenerationEnabled;
    }
    
    // Get event by ID
    getEventById(eventId) {
        return this.events.find(e => e.id === eventId);
    }
    
    // Update event status
    updateEventStatus(eventId, status) {
        const event = this.getEventById(eventId);
        if (event) {
            event.status = status;
            this.saveEvents();
            this.updateEventDisplay();
            this.updateEventCount();
        }
    }
    
    // Mark event as analyzed
    markEventAnalyzed(eventId) {
        const event = this.getEventById(eventId);
        if (event) {
            event.analyzed = true;
            this.updateEventDisplay();
        }
    }
    
    // Subscribe to event service updates
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    
    // Notify all subscribers
    notifySubscribers(action, data) {
        this.subscribers.forEach(callback => {
            callback({ action, data });
        });
    }
    
    // Save events to localStorage
    saveEvents() {
        try {
            localStorage.setItem('nocEvents', JSON.stringify(this.events.slice(0, 100)));
        } catch (e) {
            console.error('Failed to save events:', e);
        }
    }
    
    // Load events from localStorage
    loadEvents() {
        try {
            const saved = localStorage.getItem('nocEvents');
            if (saved) {
                this.events = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load events:', e);
        }
    }
    
    // Clear all events
    clearEvents() {
        this.events = [];
        this.saveEvents();
        this.updateEventDisplay();
        this.updateEventCount();
    }
}

// Create global instance
const eventService = new EventService();

// Main Application Controller

// Global app controller
const app = {
    initialized: false,
    simulationRunning: false,
    
    // Initialize the application
    init() {
        if (this.initialized) return;
        
        console.log('Initializing NOC AI Analyst Application...');
        
        // Initialize all services
        eventService.init();
        assignmentEngine.init();
        window.ticketManagement.init();
        analytics.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load saved configuration
        loadConfig();
        
        // Update UI elements
        this.updateUI();
        
        this.initialized = true;
        console.log('Application initialized successfully');
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Event filters
        document.getElementById('severityFilter').addEventListener('change', (e) => {
            eventService.setFilter('severity', e.target.value);
        });
        
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            eventService.setFilter('type', e.target.value);
        });
    },
    
    // Update UI elements
    updateUI() {
        // Update simulation button
        const icon = document.getElementById('simulationIcon');
        if (icon) {
            icon.className = this.simulationRunning ? 'fas fa-pause' : 'fas fa-play';
        }
        
        // Update event frequency display
        const freqValue = document.getElementById('eventFrequencyValue');
        if (freqValue) {
            freqValue.textContent = CONFIG.eventGenerationInterval / 1000;
        }
        
        // Update confidence threshold display
        const confValue = document.getElementById('confidenceThresholdValue');
        if (confValue) {
            confValue.textContent = `${CONFIG.aiConfidenceThreshold * 100}%`;
        }
    }
};

// Modal control functions
function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('show');
}

function closeIncidentModal() {
    window.ticketManagement.closeIncidentModal();
}

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('show');
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('show');
}

function saveSettings() {
    // Get values from settings modal
    const eventFreq = document.getElementById('eventFrequency').value;
    const confThreshold = document.getElementById('confidenceThreshold').value;
    const criticalSLA = document.getElementById('criticalSLA').value;
    const highSLA = document.getElementById('highSLA').value;
    
    // Update configuration
    CONFIG.eventGenerationInterval = parseInt(eventFreq) * 1000;
    CONFIG.aiConfidenceThreshold = parseInt(confThreshold) / 100;
    CONFIG.slaSettings.Critical = parseInt(criticalSLA);
    CONFIG.slaSettings.High = parseInt(highSLA);
    
    // Save configuration
    saveConfig();
    
    // Update UI
    app.updateUI();
    
    // Close settings modal
    closeSettings();
    
    alert('Settings saved successfully');
}

// Event control functions
function injectTestEvent() {
    const modal = document.getElementById('injectEventModal');
    modal.classList.add('show');
}

function closeInjectModal() {
    const modal = document.getElementById('injectEventModal');
    modal.classList.remove('show');
}

function submitInjectEvent() {
    const severity = document.getElementById('injectSeverity').value;
    const type = document.getElementById('injectType').value;
    const source = document.getElementById('injectSource').value || getRandomSource();
    const message = document.getElementById('injectMessage').value || 
                    eventService.getRandomMessage(type);
    
    // Create custom event
    const event = {
        id: `EVT-2024-${String(eventService.eventCounter++).padStart(6, '0')}`,
        timestamp: new Date().toISOString(),
        severity: severity,
        type: type,
        source: source,
        message: message,
        affectedSystems: getAffectedSystems(source),
        metrics: eventService.generateMetrics(type, severity),
        status: 'active',
        analyzed: false
    };
    
    // Add event
    eventService.addEvent(event);
    
    // Close modal
    closeInjectModal();
    
    // Clear form
    document.getElementById('injectSource').value = '';
    document.getElementById('injectMessage').value = '';
}

function filterEvents() {
    eventService.updateEventDisplay();
}

// Analysis control functions
async function analyzeEvent() {
    const modal = document.getElementById('eventModal');
    const eventId = modal.dataset.eventId;
    const event = eventService.getEventById(eventId);
    
    if (!event) return;
    
    // Close modal
    closeEventModal();
    
    // Run analysis
    await window.aiAnalysisEngine.analyzeEvent(event);
}

async function createTicketFromEvent() {
    await window.ticketManagement.createTicketFromEvent();
}

// Incident control functions
async function createManualTicket() {
    await window.ticketManagement.createManualTicket();
}

async function updateIncident() {
    await window.ticketManagement.updateIncident();
}

async function addWorkNote() {
    await window.ticketManagement.addWorkNote();
}

async function escalateIncident() {
    await window.ticketManagement.escalateIncident();
}

// Simulation control
function toggleSimulation() {
    const isRunning = eventService.toggleEventGeneration();
    app.simulationRunning = isRunning;
    
    // Update button icon
    const icon = document.getElementById('simulationIcon');
    if (icon) {
        icon.className = isRunning ? 'fas fa-pause' : 'fas fa-play';
    }
    
    // Show notification
    const status = isRunning ? 'started' : 'stopped';
    console.log(`Event simulation ${status}`);
}

// Configuration update functions
function updateEventFrequency(value) {
    document.getElementById('eventFrequencyValue').textContent = value;
}

function updateConfidenceThreshold(value) {
    document.getElementById('confidenceThresholdValue').textContent = `${value}%`;
}

// Utility functions
function exportAnalytics() {
    const format = confirm('Export as JSON? (Cancel for CSV)') ? 'json' : 'csv';
    analytics.exportData(format);
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear all events and incidents? This cannot be undone.')) {
        return;
    }
    
    // Clear events
    eventService.clearEvents();
    
    // Clear incidents
    serviceNowAPI.clearIncidents();
    
    // Reset team workloads
    TEAM_MEMBERS.forEach(member => {
        member.currentLoad = 0;
        member.availability = member.availability === 'offline' ? 'offline' : 'available';
    });
    
    // Update displays
    window.ticketManagement.updateIncidentDisplay();
    assignmentEngine.updateTeamDisplay();
    
    alert('All data cleared successfully');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+S: Open settings
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        openSettings();
    }
    
    // Ctrl+E: Export data
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportAnalytics();
    }
    
    // Ctrl+I: Inject event
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        injectTestEvent();
    }
    
    // Ctrl+Space: Toggle simulation
    if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        toggleSimulation();
    }
    
    // ESC: Close modals
    if (e.key === 'Escape') {
        // Close any open modal
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    app.init();
    
    // Show welcome message
    setTimeout(() => {
        console.log('%c🚀 NOC AI Analyst Ready', 'color: #00a4ef; font-size: 20px; font-weight: bold;');
        console.log('%cUse Ctrl+Space to start event simulation', 'color: #00d68f; font-size: 14px;');
        console.log('%cPress Ctrl+S for settings, Ctrl+I to inject events', 'color: #ffb547; font-size: 14px;');
    }, 1000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause intensive operations
        if (analytics.chart) {
            analytics.chart.options.animation = false;
        }
    } else {
        // Page is visible again
        if (analytics.chart) {
            analytics.chart.options.animation = true;
        }
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // Could send to logging service in production
});

// Unload handler
window.addEventListener('beforeunload', () => {
    // Save current state
    saveConfig();
    eventService.saveEvents();
    serviceNowAPI.saveIncidents();
});

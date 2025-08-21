// Ticket Management - Handles incident creation, updates, and display

class TicketManagement {
    constructor() {
        this.currentIncident = null;
        this.slaMonitor = null;
    }
    
    // Initialize ticket management
    init() {
        this.updateIncidentDisplay();
        this.updateSLAMonitor();
        
        // Update displays every 30 seconds
        setInterval(() => {
            this.updateIncidentDisplay();
            this.updateSLAMonitor();
        }, 30000);
    }
    
    // Update incident display
    updateIncidentDisplay() {
        const incidentList = document.getElementById('incidentList');
        if (!incidentList) return;
        
        const incidents = serviceNowAPI.getOpenIncidents();
        const countElement = document.getElementById('openIncidentsCount');
        if (countElement) {
            countElement.textContent = incidents.length;
        }
        
        if (incidents.length === 0) {
            incidentList.innerHTML = '<div class="no-incidents">No active incidents</div>';
            return;
        }
        
        let html = '';
        incidents.forEach(incident => {
            const statusClass = `status-${incident.state.toLowerCase().replace(' ', '-')}`;
            const slaStatus = serviceNowAPI.checkSLAStatus(incident);
            const assignee = TEAM_MEMBERS.find(m => m.email === incident.assignedTo);
            
            html += `
                <div class="incident-item" onclick="ticketManagement.showIncidentDetails('${incident.number}')">
                    <div class="incident-header">
                        <span class="incident-number">${incident.number}</span>
                        <span class="incident-status ${statusClass}">${incident.state}</span>
                    </div>
                    <div class="incident-details">
                        ${incident.shortDescription}
                    </div>
                    <div class="incident-footer">
                        <span class="incident-assigned">
                            <i class="fas fa-user"></i> ${assignee ? assignee.name : 'Unassigned'}
                        </span>
                        <span class="sla-indicator sla-${slaStatus}">
                            <i class="fas fa-clock"></i> SLA ${slaStatus}
                        </span>
                    </div>
                </div>
            `;
        });
        
        incidentList.innerHTML = html;
    }
    
    // Update SLA monitor
    updateSLAMonitor() {
        const incidents = serviceNowAPI.getAllIncidents();
        const slaStats = {
            onTrack: 0,
            atRisk: 0,
            breached: 0
        };
        
        incidents.forEach(incident => {
            const status = serviceNowAPI.checkSLAStatus(incident);
            if (status === 'on-track' || status === 'completed') {
                slaStats.onTrack++;
            } else if (status === 'at-risk') {
                slaStats.atRisk++;
            } else if (status === 'breached') {
                slaStats.breached++;
            }
        });
        
        const onTrackElement = document.getElementById('slaOnTrack');
        const atRiskElement = document.getElementById('slaAtRisk');
        const breachedElement = document.getElementById('slaBreached');
        
        if (onTrackElement) onTrackElement.textContent = slaStats.onTrack;
        if (atRiskElement) atRiskElement.textContent = slaStats.atRisk;
        if (breachedElement) breachedElement.textContent = slaStats.breached;
    }
    
    // Show incident details in modal
    showIncidentDetails(incidentNumber) {
        const incident = serviceNowAPI.getIncident(incidentNumber);
        if (!incident) return;
        
        this.currentIncident = incident;
        const modal = document.getElementById('incidentModal');
        const modalBody = document.getElementById('incidentModalBody');
        
        const assignee = TEAM_MEMBERS.find(m => m.email === incident.assignedTo);
        const slaStatus = serviceNowAPI.checkSLAStatus(incident);
        const slaDeadline = new Date(incident.slaDeadline);
        
        let html = `
            <div class="incident-detail-section">
                <h4>Incident Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Number:</label>
                        <span>${incident.number}</span>
                    </div>
                    <div class="detail-item">
                        <label>State:</label>
                        <span class="status-${incident.state.toLowerCase().replace(' ', '-')}">${incident.state}</span>
                    </div>
                    <div class="detail-item">
                        <label>Priority:</label>
                        <span>${incident.priority}</span>
                    </div>
                    <div class="detail-item">
                        <label>Category:</label>
                        <span>${incident.category}</span>
                    </div>
                    <div class="detail-item">
                        <label>Created:</label>
                        <span>${new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <label>SLA Deadline:</label>
                        <span class="sla-${slaStatus}">${slaDeadline.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <div class="incident-detail-section">
                <h4>Assignment</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Assigned To:</label>
                        <span>${assignee ? assignee.name : 'Unassigned'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Assignment Group:</label>
                        <span>${incident.assignmentGroup}</span>
                    </div>
                </div>
            </div>
            
            <div class="incident-detail-section">
                <h4>Description</h4>
                <p>${incident.shortDescription}</p>
                <pre class="incident-description">${incident.description}</pre>
            </div>
        `;
        
        // Add root cause analysis if available
        if (incident.rootCauseAnalysis && incident.rootCauseAnalysis.length > 0) {
            html += `
                <div class="incident-detail-section">
                    <h4>AI Root Cause Analysis</h4>
            `;
            
            incident.rootCauseAnalysis.forEach((rc, index) => {
                html += `
                    <div class="root-cause-detail">
                        <strong>${index + 1}. ${rc.cause}</strong>
                        <div>Confidence: ${(rc.confidence * 100).toFixed(0)}%</div>
                        <div>Category: ${rc.category}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        // Add work notes
        if (incident.workNotes && incident.workNotes.length > 0) {
            html += `
                <div class="incident-detail-section">
                    <h4>Work Notes</h4>
                    <div class="work-notes">
            `;
            
            incident.workNotes.forEach(note => {
                html += `
                    <div class="work-note">
                        <div class="note-header">
                            <span class="note-author">${note.author}</span>
                            <span class="note-time">${new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="note-text">${note.text.replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        modalBody.innerHTML = html;
        modal.classList.add('show');
    }
    
    // Close incident modal
    closeIncidentModal() {
        const modal = document.getElementById('incidentModal');
        modal.classList.remove('show');
        this.currentIncident = null;
    }
    
    // Update incident status
    async updateIncident() {
        if (!this.currentIncident) return;
        
        const newState = prompt('Enter new state (New/In Progress/Resolved/Closed):', this.currentIncident.state);
        if (!newState) return;
        
        await serviceNowAPI.updateIncident(this.currentIncident.number, {
            state: newState
        });
        
        await serviceNowAPI.addWorkNote(this.currentIncident.number, {
            text: `Status updated to: ${newState}`
        });
        
        this.updateIncidentDisplay();
        this.showIncidentDetails(this.currentIncident.number);
    }
    
    // Add work note to incident
    async addWorkNote() {
        if (!this.currentIncident) return;
        
        const noteText = prompt('Enter work note:');
        if (!noteText) return;
        
        await serviceNowAPI.addWorkNote(this.currentIncident.number, {
            text: noteText,
            author: 'Manual Entry'
        });
        
        this.showIncidentDetails(this.currentIncident.number);
    }
    
    // Escalate incident
    async escalateIncident() {
        if (!this.currentIncident) return;
        
        const priority = this.currentIncident.priority.split('-')[1];
        const rule = assignmentEngine.escalationRules[priority];
        
        if (rule) {
            await assignmentEngine.escalateIncident(this.currentIncident, rule);
            this.updateIncidentDisplay();
            this.showIncidentDetails(this.currentIncident.number);
        }
    }
    
    // Create manual ticket
    async createManualTicket() {
        const shortDescription = prompt('Enter short description:');
        if (!shortDescription) return;
        
        const priority = prompt('Enter priority (1-Critical/2-High/3-Medium/4-Low):', '3-Medium');
        const category = prompt('Enter category (Network/Server/Database/Application/Security):', 'Application');
        
        const incidentData = {
            shortDescription: shortDescription,
            description: `Manually created incident\n\nShort Description: ${shortDescription}`,
            priority: priority,
            category: category
        };
        
        const incident = await serviceNowAPI.createIncident(incidentData);
        
        // Auto-assign
        await assignmentEngine.autoAssignIncident(incident);
        
        this.updateIncidentDisplay();
        alert(`Incident ${incident.number} created successfully`);
    }
    
    // Create ticket from event
    async createTicketFromEvent() {
        const modal = document.getElementById('eventModal');
        const eventId = modal.dataset.eventId;
        const event = eventService.getEventById(eventId);
        
        if (!event) return;
        
        // Close event modal first
        window.closeEventModal();
        
        // Check if analysis exists
        let analysis = window.aiAnalysisEngine?.analysisHistory.find(a => a.eventId === eventId);
        
        if (!analysis) {
            // Run analysis first
            alert('Running AI analysis before creating ticket...');
            analysis = await window.aiAnalysisEngine?.analyzeEvent(event);
            
            // Wait for analysis to complete
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Create incident from analysis
        const incident = await window.aiAnalysisEngine?.createIncidentFromAnalysis(event, analysis);
        
        if (incident) {
            this.updateIncidentDisplay();
            this.showIncidentDetails(incident.number);
        }
    }
}

// Create global instance
window.ticketManagement = new TicketManagement();

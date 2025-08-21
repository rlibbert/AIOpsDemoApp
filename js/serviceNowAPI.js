// Mock ServiceNow API Service

class ServiceNowAPI {
    constructor() {
        this.incidentCounter = 1000;
        this.incidents = [];
        this.loadIncidents();
    }
    
    // Query CMDB for system information
    async queryCMDB(systemName) {
        // Simulate API delay
        await this.simulateDelay(CONFIG.apiDelay.cmdb);
        
        const systemDetails = getSystemDetails(systemName);
        
        if (systemDetails) {
            // Add related information
            systemDetails.recentChanges = RECENT_CHANGES.filter(change => 
                change.affectedSystems.includes(systemDetails.id) ||
                change.affectedSystems.includes(systemName)
            );
            
            systemDetails.historicalIncidents = HISTORICAL_INCIDENTS.filter(inc =>
                inc.category === systemDetails.type ||
                inc.category === systemDetails.systemType
            );
        }
        
        return systemDetails;
    }
    
    // Search knowledge base for solutions
    async searchKnowledgeBase(symptoms) {
        await this.simulateDelay(CONFIG.apiDelay.knowledge);
        
        const relevantArticles = KNOWLEDGE_BASE.filter(kb => {
            // Check if any symptom matches
            return kb.symptoms.some(symptom => 
                symptoms.some(s => 
                    s.toLowerCase().includes(symptom.toLowerCase()) ||
                    symptom.toLowerCase().includes(s.toLowerCase())
                )
            );
        });
        
        return relevantArticles;
    }
    
    // Create a new incident
    async createIncident(incidentData) {
        await this.simulateDelay(CONFIG.apiDelay.ticket);
        
        const incident = {
            number: `INC${String(this.incidentCounter++).padStart(7, '0')}`,
            category: incidentData.category || 'Software',
            subcategory: incidentData.subcategory || 'Performance',
            priority: incidentData.priority || '3-Medium',
            state: 'New',
            assignedTo: incidentData.assignedTo || '',
            assignmentGroup: incidentData.assignmentGroup || 'L1 Support',
            shortDescription: incidentData.shortDescription,
            description: incidentData.description,
            rootCauseAnalysis: incidentData.rootCauseAnalysis || [],
            createdBy: 'AI NOC Analyst',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolvedAt: null,
            slaDeadline: this.calculateSLA(incidentData.priority),
            workNotes: [],
            comments: [],
            relatedEventId: incidentData.eventId || null,
            affectedSystems: incidentData.affectedSystems || [],
            impact: incidentData.impact || '3-Low',
            urgency: incidentData.urgency || '3-Low'
        };
        
        this.incidents.unshift(incident);
        this.saveIncidents();
        
        // Update team member workload
        if (incident.assignedTo) {
            const member = TEAM_MEMBERS.find(m => m.email === incident.assignedTo);
            if (member) {
                updateTeamMemberLoad(member.id, 1);
            }
        }
        
        return incident;
    }
    
    // Update an existing incident
    async updateIncident(incidentNumber, updates) {
        await this.simulateDelay(CONFIG.apiDelay.ticket / 2);
        
        const incident = this.incidents.find(i => i.number === incidentNumber);
        if (!incident) {
            throw new Error(`Incident ${incidentNumber} not found`);
        }
        
        // Handle state transitions
        if (updates.state && updates.state !== incident.state) {
            if (updates.state === 'Resolved' && incident.state !== 'Resolved') {
                incident.resolvedAt = new Date().toISOString();
                
                // Release team member workload
                if (incident.assignedTo) {
                    const member = TEAM_MEMBERS.find(m => m.email === incident.assignedTo);
                    if (member) {
                        updateTeamMemberLoad(member.id, -1);
                    }
                }
            }
        }
        
        // Handle reassignment
        if (updates.assignedTo && updates.assignedTo !== incident.assignedTo) {
            // Release old assignee
            if (incident.assignedTo) {
                const oldMember = TEAM_MEMBERS.find(m => m.email === incident.assignedTo);
                if (oldMember) {
                    updateTeamMemberLoad(oldMember.id, -1);
                }
            }
            
            // Assign to new member
            const newMember = TEAM_MEMBERS.find(m => m.email === updates.assignedTo);
            if (newMember) {
                updateTeamMemberLoad(newMember.id, 1);
            }
        }
        
        // Apply updates
        Object.assign(incident, updates);
        incident.updatedAt = new Date().toISOString();
        
        this.saveIncidents();
        return incident;
    }
    
    // Add work note to incident
    async addWorkNote(incidentNumber, note) {
        const incident = this.incidents.find(i => i.number === incidentNumber);
        if (!incident) {
            throw new Error(`Incident ${incidentNumber} not found`);
        }
        
        const workNote = {
            id: Date.now(),
            author: note.author || 'AI NOC Analyst',
            timestamp: new Date().toISOString(),
            text: note.text,
            type: 'work_note'
        };
        
        incident.workNotes.push(workNote);
        incident.updatedAt = new Date().toISOString();
        
        this.saveIncidents();
        return workNote;
    }
    
    // Add comment to incident
    async addComment(incidentNumber, comment) {
        const incident = this.incidents.find(i => i.number === incidentNumber);
        if (!incident) {
            throw new Error(`Incident ${incidentNumber} not found`);
        }
        
        const commentObj = {
            id: Date.now(),
            author: comment.author || 'System',
            timestamp: new Date().toISOString(),
            text: comment.text,
            type: 'comment'
        };
        
        incident.comments.push(commentObj);
        incident.updatedAt = new Date().toISOString();
        
        this.saveIncidents();
        return commentObj;
    }
    
    // Get incident by number
    getIncident(incidentNumber) {
        return this.incidents.find(i => i.number === incidentNumber);
    }
    
    // Get all incidents
    getAllIncidents() {
        return this.incidents;
    }
    
    // Get open incidents
    getOpenIncidents() {
        return this.incidents.filter(i => 
            i.state !== 'Closed' && i.state !== 'Resolved'
        );
    }
    
    // Calculate SLA deadline based on priority
    calculateSLA(priority) {
        const now = new Date();
        let hours = 24; // Default
        
        switch(priority) {
            case '1-Critical':
                hours = CONFIG.slaSettings.Critical;
                break;
            case '2-High':
                hours = CONFIG.slaSettings.High;
                break;
            case '3-Medium':
                hours = CONFIG.slaSettings.Medium;
                break;
            case '4-Low':
                hours = CONFIG.slaSettings.Low;
                break;
        }
        
        now.setHours(now.getHours() + hours);
        return now.toISOString();
    }
    
    // Check SLA status for an incident
    checkSLAStatus(incident) {
        if (incident.state === 'Resolved' || incident.state === 'Closed') {
            return 'completed';
        }
        
        const now = new Date();
        const deadline = new Date(incident.slaDeadline);
        const hoursLeft = (deadline - now) / (1000 * 60 * 60);
        
        if (hoursLeft < 0) {
            return 'breached';
        } else if (hoursLeft < 2) {
            return 'at-risk';
        } else {
            return 'on-track';
        }
    }
    
    // Get assignment recommendations based on incident type
    async getAssignmentRecommendations(incidentData) {
        await this.simulateDelay(300);
        
        // Determine required skills based on category
        let requiredSkills = [];
        switch(incidentData.category) {
            case 'Network':
                requiredSkills = ['Network'];
                break;
            case 'Database':
                requiredSkills = ['Database'];
                break;
            case 'Server':
            case 'Hardware':
                requiredSkills = ['Server', 'Infrastructure'];
                break;
            case 'Application':
            case 'Software':
                requiredSkills = ['Application'];
                break;
            case 'Security':
                requiredSkills = ['Security'];
                break;
            default:
                requiredSkills = ['Monitoring', 'Incident Management'];
        }
        
        // Get suitable team members
        const recommendations = getTeamMemberBySkills(requiredSkills);
        
        return recommendations.map(member => ({
            name: member.name,
            email: member.email,
            role: member.role,
            group: member.group,
            availability: member.availability,
            workload: `${member.currentLoad}/${member.maxLoad}`,
            skills: member.skills,
            score: this.calculateAssignmentScore(member, incidentData)
        })).sort((a, b) => b.score - a.score);
    }
    
    // Calculate assignment score
    calculateAssignmentScore(member, incidentData) {
        let score = 100;
        
        // Availability
        if (member.availability === 'offline') return 0;
        if (member.availability === 'busy') score -= 30;
        
        // Workload
        const workloadPercent = (member.currentLoad / member.maxLoad) * 100;
        score -= workloadPercent * 0.5;
        
        // Priority matching
        if (incidentData.priority === '1-Critical' && member.group.includes('L3')) {
            score += 20;
        } else if (incidentData.priority === '4-Low' && member.group.includes('L1')) {
            score += 10;
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    // Get recent changes
    async getRecentChanges(timeframe = 24) {
        await this.simulateDelay(CONFIG.apiDelay.cmdb);
        
        const cutoff = new Date(Date.now() - timeframe * 60 * 60 * 1000);
        return RECENT_CHANGES.filter(change => 
            new Date(change.startTime) >= cutoff
        );
    }
    
    // Search historical incidents
    async searchHistoricalIncidents(keywords) {
        await this.simulateDelay(CONFIG.apiDelay.knowledge);
        
        return HISTORICAL_INCIDENTS.filter(incident => {
            const searchText = `${incident.title} ${incident.rootCause} ${incident.resolution}`.toLowerCase();
            return keywords.some(keyword => 
                searchText.includes(keyword.toLowerCase())
            );
        });
    }
    
    // Simulate API delay
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Save incidents to localStorage
    saveIncidents() {
        try {
            localStorage.setItem('nocIncidents', JSON.stringify(this.incidents));
        } catch (e) {
            console.error('Failed to save incidents:', e);
        }
    }
    
    // Load incidents from localStorage
    loadIncidents() {
        try {
            const saved = localStorage.getItem('nocIncidents');
            if (saved) {
                this.incidents = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load incidents:', e);
        }
    }
    
    // Clear all incidents
    clearIncidents() {
        this.incidents = [];
        this.saveIncidents();
    }
}

// Create global instance
const serviceNowAPI = new ServiceNowAPI();

// Assignment Engine - Handles intelligent ticket assignment

class AssignmentEngine {
    constructor() {
        this.assignmentHistory = [];
        this.escalationRules = {
            'Critical': { maxTime: 30, escalateTo: 'L3' },
            'High': { maxTime: 60, escalateTo: 'L2' },
            'Medium': { maxTime: 120, escalateTo: 'L2' },
            'Low': { maxTime: 240, escalateTo: 'L1' }
        };
    }
    
    // Initialize assignment engine
    init() {
        this.updateTeamDisplay();
        
        // Check for escalations every minute
        setInterval(() => this.checkEscalations(), 60000);
        
        // Update team display every 30 seconds
        setInterval(() => this.updateTeamDisplay(), 30000);
    }
    
    // Get best assignment for an incident
    async getBestAssignment(incidentData) {
        const recommendations = await serviceNowAPI.getAssignmentRecommendations(incidentData);
        
        if (recommendations.length === 0) {
            return {
                assignedTo: null,
                assignmentGroup: 'L1 Support',
                reason: 'No available team members with required skills'
            };
        }
        
        // Apply additional scoring based on current context
        const scoredRecommendations = recommendations.map(rec => {
            let score = rec.score;
            
            // Boost score for same timezone
            const hour = new Date().getHours();
            if ((hour >= 8 && hour <= 17) && rec.shift === 'day') {
                score += 10;
            } else if ((hour < 8 || hour > 17) && rec.shift === 'night') {
                score += 10;
            }
            
            // Penalty for high workload
            const workloadRatio = parseInt(rec.workload.split('/')[0]) / parseInt(rec.workload.split('/')[1]);
            if (workloadRatio > 0.8) {
                score -= 20;
            }
            
            return { ...rec, finalScore: score };
        });
        
        // Sort by final score
        scoredRecommendations.sort((a, b) => b.finalScore - a.finalScore);
        
        const selected = scoredRecommendations[0];
        
        return {
            assignedTo: selected.email,
            assignmentGroup: selected.group,
            reason: `Best match: ${selected.name} - ${selected.role}`,
            score: selected.finalScore
        };
    }
    
    // Auto-assign incident
    async autoAssignIncident(incident) {
        const assignment = await this.getBestAssignment(incident);
        
        if (assignment.assignedTo) {
            await serviceNowAPI.updateIncident(incident.number, {
                assignedTo: assignment.assignedTo,
                assignmentGroup: assignment.assignmentGroup
            });
            
            await serviceNowAPI.addWorkNote(incident.number, {
                text: `Auto-assigned to ${assignment.assignedTo}\nReason: ${assignment.reason}\nAssignment Score: ${assignment.score}`
            });
            
            this.assignmentHistory.push({
                incidentNumber: incident.number,
                assignedTo: assignment.assignedTo,
                timestamp: new Date().toISOString(),
                score: assignment.score
            });
        }
        
        return assignment;
    }
    
    // Check for incidents requiring escalation
    checkEscalations() {
        const incidents = serviceNowAPI.getOpenIncidents();
        
        incidents.forEach(incident => {
            if (incident.state === 'New' || incident.state === 'In Progress') {
                const timeSinceCreation = (new Date() - new Date(incident.createdAt)) / 60000; // minutes
                const priority = incident.priority.split('-')[1];
                const rule = this.escalationRules[priority];
                
                if (rule && timeSinceCreation > rule.maxTime) {
                    this.escalateIncident(incident, rule);
                }
            }
        });
    }
    
    // Escalate an incident
    async escalateIncident(incident, rule) {
        // Find higher level team member
        const escalationGroup = rule.escalateTo + ' ' + incident.category;
        const members = TEAM_MEMBERS.filter(m => 
            m.group.includes(rule.escalateTo) && 
            m.availability !== 'offline'
        );
        
        if (members.length > 0) {
            const selected = members[0];
            
            await serviceNowAPI.updateIncident(incident.number, {
                assignedTo: selected.email,
                assignmentGroup: selected.group,
                priority: this.increasePriority(incident.priority)
            });
            
            await serviceNowAPI.addWorkNote(incident.number, {
                text: `ESCALATED: Incident escalated due to SLA risk\nReassigned to: ${selected.name}\nNew Priority: ${this.increasePriority(incident.priority)}`
            });
            
            // Update UI
            window.ticketManagement?.updateIncidentDisplay();
        }
    }
    
    // Increase priority level
    increasePriority(currentPriority) {
        const priorities = ['4-Low', '3-Medium', '2-High', '1-Critical'];
        const currentIndex = priorities.indexOf(currentPriority);
        if (currentIndex > 0) {
            return priorities[currentIndex - 1];
        }
        return currentPriority;
    }
    
    // Update team display in UI
    updateTeamDisplay() {
        const teamList = document.getElementById('teamList');
        if (!teamList) return;
        
        let html = '';
        TEAM_MEMBERS.forEach(member => {
            const availabilityClass = member.availability === 'available' ? 'available' : 
                                     member.availability === 'busy' ? 'busy' : 'offline';
            
            html += `
                <div class="team-member">
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-skills">${member.skills.join(', ')}</div>
                    </div>
                    <div class="member-status">
                        <span class="availability ${availabilityClass}">${member.availability}</span>
                        <span class="workload">${member.currentLoad}/${member.maxLoad} tickets</span>
                    </div>
                </div>
            `;
        });
        
        teamList.innerHTML = html;
    }
    
    // Get workload statistics
    getWorkloadStats() {
        const stats = {
            totalCapacity: 0,
            currentLoad: 0,
            availableMembers: 0,
            busyMembers: 0,
            offlineMembers: 0
        };
        
        TEAM_MEMBERS.forEach(member => {
            stats.totalCapacity += member.maxLoad;
            stats.currentLoad += member.currentLoad;
            
            if (member.availability === 'available') stats.availableMembers++;
            else if (member.availability === 'busy') stats.busyMembers++;
            else stats.offlineMembers++;
        });
        
        stats.utilizationPercent = (stats.currentLoad / stats.totalCapacity) * 100;
        
        return stats;
    }
    
    // Rebalance workload
    async rebalanceWorkload() {
        const overloadedMembers = TEAM_MEMBERS.filter(m => 
            m.currentLoad >= m.maxLoad && m.availability !== 'offline'
        );
        
        const underloadedMembers = TEAM_MEMBERS.filter(m => 
            m.currentLoad < m.maxLoad * 0.5 && m.availability === 'available'
        );
        
        if (overloadedMembers.length > 0 && underloadedMembers.length > 0) {
            // Find incidents that can be reassigned
            const incidents = serviceNowAPI.getOpenIncidents();
            
            for (const incident of incidents) {
                const currentAssignee = TEAM_MEMBERS.find(m => m.email === incident.assignedTo);
                
                if (currentAssignee && overloadedMembers.includes(currentAssignee)) {
                    // Find suitable replacement
                    const replacement = underloadedMembers.find(m => 
                        m.skills.some(skill => incident.category.includes(skill))
                    );
                    
                    if (replacement) {
                        await serviceNowAPI.updateIncident(incident.number, {
                            assignedTo: replacement.email,
                            assignmentGroup: replacement.group
                        });
                        
                        await serviceNowAPI.addWorkNote(incident.number, {
                            text: `Workload rebalancing: Reassigned from ${currentAssignee.name} to ${replacement.name}`
                        });
                        
                        // Update workloads
                        updateTeamMemberLoad(currentAssignee.id, -1);
                        updateTeamMemberLoad(replacement.id, 1);
                        
                        break; // Rebalance one at a time
                    }
                }
            }
        }
    }
}

// Create global instance
const assignmentEngine = new AssignmentEngine();

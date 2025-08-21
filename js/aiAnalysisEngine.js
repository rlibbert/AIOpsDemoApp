// AI Analysis Engine - Performs root cause analysis and generates solutions

class AIAnalysisEngine {
    constructor() {
        this.analysisInProgress = false;
        this.analysisHistory = [];
        this.currentAnalysis = null;
    }
    
    // Main analysis function
    async analyzeEvent(event) {
        if (this.analysisInProgress) {
            console.log('Analysis already in progress');
            return;
        }
        
        this.analysisInProgress = true;
        this.currentAnalysis = {
            eventId: event.id,
            startTime: new Date().toISOString(),
            status: 'initializing'
        };
        
        try {
            // Update UI to show analysis starting
            this.updateAnalysisStatus('Initializing AI analysis...');
            await this.delay(500);
            
            // Step 1: Query CMDB for system information
            this.updateAnalysisStatus('Querying CMDB for system information...');
            const systemInfo = await serviceNowAPI.queryCMDB(event.source);
            await this.delay(800);
            
            // Step 2: Check for recent changes
            this.updateAnalysisStatus('Checking for recent changes...');
            const recentChanges = await serviceNowAPI.getRecentChanges(48);
            const relatedChanges = this.correlateChanges(event, recentChanges);
            await this.delay(600);
            
            // Step 3: Search knowledge base
            this.updateAnalysisStatus('Searching knowledge base for known issues...');
            const symptoms = this.extractSymptoms(event);
            const knowledgeArticles = await serviceNowAPI.searchKnowledgeBase(symptoms);
            await this.delay(700);
            
            // Step 4: Search historical incidents
            this.updateAnalysisStatus('Analyzing historical incident patterns...');
            const historicalIncidents = await serviceNowAPI.searchHistoricalIncidents(symptoms);
            await this.delay(500);
            
            // Step 5: Perform root cause analysis
            this.updateAnalysisStatus('Performing root cause analysis...');
            const rootCauses = await this.performRootCauseAnalysis(
                event, 
                systemInfo, 
                relatedChanges, 
                knowledgeArticles,
                historicalIncidents
            );
            await this.delay(1000);
            
            // Step 6: Generate solutions
            this.updateAnalysisStatus('Generating recommended solutions...');
            const solutions = this.generateSolutions(rootCauses, knowledgeArticles);
            await this.delay(800);
            
            // Step 7: Calculate confidence scores
            this.updateAnalysisStatus('Calculating confidence scores...');
            const analysis = this.finalizeAnalysis(
                event,
                systemInfo,
                rootCauses,
                solutions,
                relatedChanges,
                knowledgeArticles
            );
            
            // Mark event as analyzed
            eventService.markEventAnalyzed(event.id);
            
            // Display results
            this.displayAnalysisResults(analysis);
            
            // Store analysis
            this.currentAnalysis = analysis;
            this.analysisHistory.push(analysis);
            
            // Auto-create incident for critical events
            if (event.severity === 'Critical') {
                setTimeout(() => {
                    this.createIncidentFromAnalysis(event, analysis);
                }, 2000);
            }
            
            return analysis;
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.updateAnalysisStatus('Analysis failed: ' + error.message);
        } finally {
            this.analysisInProgress = false;
        }
    }
    
    // Extract symptoms from event
    extractSymptoms(event) {
        const symptoms = [event.message];
        
        // Add metric-based symptoms
        if (event.metrics) {
            Object.entries(event.metrics).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    if (key.includes('Usage') && value > 80) {
                        symptoms.push(`High ${key}`);
                    } else if (key.includes('Error') && value > 10) {
                        symptoms.push(`Elevated ${key}`);
                    } else if (key.includes('Time') && value > 5000) {
                        symptoms.push(`Slow ${key}`);
                    }
                }
            });
        }
        
        // Add type-specific symptoms
        symptoms.push(event.type);
        
        return symptoms;
    }
    
    // Correlate event with recent changes
    correlateChanges(event, changes) {
        return changes.filter(change => {
            // Check if change affected the event source
            const systemDetails = getSystemDetails(event.source);
            if (!systemDetails) return false;
            
            return change.affectedSystems.some(sys => 
                sys === systemDetails.id || 
                event.affectedSystems.includes(sys)
            );
        });
    }
    
    // Perform root cause analysis
    async performRootCauseAnalysis(event, systemInfo, changes, knowledgeBase, historicalIncidents) {
        const rootCauses = [];
        
        // Pattern-based analysis
        if (event.type === 'Database' && event.message.includes('connection')) {
            rootCauses.push({
                cause: 'Database Connection Pool Exhaustion',
                confidence: 0.85,
                evidence: [
                    'Connection-related error message',
                    'Database system affected',
                    event.metrics?.connectionPool > 90 ? 'High connection pool usage' : null
                ].filter(Boolean),
                category: 'Resource Exhaustion'
            });
        }
        
        if (event.type === 'Server' && event.metrics?.cpuUsage > 90) {
            rootCauses.push({
                cause: 'High CPU Utilization',
                confidence: 0.90,
                evidence: [
                    `CPU usage at ${event.metrics.cpuUsage.toFixed(1)}%`,
                    'Server performance degradation'
                ],
                category: 'Performance'
            });
        }
        
        if (event.type === 'Network' && event.metrics?.packetLoss > 20) {
            rootCauses.push({
                cause: 'Network Connectivity Issues',
                confidence: 0.75,
                evidence: [
                    `Packet loss at ${event.metrics.packetLoss.toFixed(1)}%`,
                    'Network device affected'
                ],
                category: 'Connectivity'
            });
        }
        
        // Change-based analysis
        if (changes.length > 0) {
            const recentChange = changes[0];
            rootCauses.push({
                cause: `Recent Change: ${recentChange.title}`,
                confidence: 0.70,
                evidence: [
                    `Change ${recentChange.id} completed ${this.getTimeAgo(recentChange.endTime)}`,
                    'Affected same systems as event'
                ],
                category: 'Change-Related'
            });
        }
        
        // Knowledge base correlation
        if (knowledgeBase.length > 0) {
            const topArticle = knowledgeBase[0];
            rootCauses.push({
                cause: topArticle.title,
                confidence: 0.80,
                evidence: [
                    'Matches known issue pattern',
                    `Knowledge Article: ${topArticle.id}`
                ],
                category: 'Known Issue'
            });
        }
        
        // Historical pattern matching
        if (historicalIncidents.length > 0) {
            const similar = historicalIncidents[0];
            rootCauses.push({
                cause: similar.rootCause,
                confidence: 0.65,
                evidence: [
                    `Similar to ${similar.occurrences} past incidents`,
                    `Average resolution time: ${similar.resolutionTime} hours`
                ],
                category: 'Historical Pattern'
            });
        }
        
        // Sort by confidence
        return rootCauses.sort((a, b) => b.confidence - a.confidence);
    }
    
    // Generate solutions based on root causes
    generateSolutions(rootCauses, knowledgeArticles) {
        const solutions = [];
        
        rootCauses.forEach(rc => {
            let solution = {
                rootCause: rc.cause,
                confidence: rc.confidence,
                steps: []
            };
            
            // Generate solution steps based on category
            switch(rc.category) {
                case 'Resource Exhaustion':
                    solution.steps = [
                        'Identify resource-consuming processes',
                        'Increase resource allocation temporarily',
                        'Optimize application configuration',
                        'Schedule restart during maintenance window'
                    ];
                    break;
                    
                case 'Performance':
                    solution.steps = [
                        'Analyze performance metrics',
                        'Identify bottlenecks',
                        'Scale resources if needed',
                        'Optimize code or queries'
                    ];
                    break;
                    
                case 'Connectivity':
                    solution.steps = [
                        'Check physical connections',
                        'Verify network configuration',
                        'Test connectivity between endpoints',
                        'Review firewall rules'
                    ];
                    break;
                    
                case 'Change-Related':
                    solution.steps = [
                        'Review change implementation',
                        'Check for configuration errors',
                        'Consider rollback if critical',
                        'Document lessons learned'
                    ];
                    break;
                    
                case 'Known Issue':
                    // Use knowledge base solution if available
                    const kb = knowledgeArticles.find(k => k.title === rc.cause);
                    if (kb) {
                        solution.steps = [kb.solution];
                    } else {
                        solution.steps = ['Apply known fix from knowledge base'];
                    }
                    break;
                    
                default:
                    solution.steps = [
                        'Gather additional diagnostic information',
                        'Isolate affected components',
                        'Apply targeted fix',
                        'Monitor for recurrence'
                    ];
            }
            
            solutions.push(solution);
        });
        
        return solutions;
    }
    
    // Finalize analysis results
    finalizeAnalysis(event, systemInfo, rootCauses, solutions, changes, knowledgeArticles) {
        const overallConfidence = rootCauses.length > 0 
            ? rootCauses[0].confidence 
            : 0.5;
        
        return {
            id: `ANALYSIS-${Date.now()}`,
            eventId: event.id,
            timestamp: new Date().toISOString(),
            systemInfo: systemInfo,
            rootCauses: rootCauses,
            solutions: solutions,
            relatedChanges: changes,
            knowledgeArticles: knowledgeArticles,
            overallConfidence: overallConfidence,
            confidenceLevel: this.getConfidenceLevel(overallConfidence),
            estimatedResolutionTime: this.estimateResolutionTime(rootCauses),
            recommendedPriority: this.calculatePriority(event, rootCauses)
        };
    }
    
    // Get confidence level label
    getConfidenceLevel(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.6) return 'medium';
        return 'low';
    }
    
    // Estimate resolution time
    estimateResolutionTime(rootCauses) {
        if (rootCauses.length === 0) return 4;
        
        // Base estimate on category
        const estimates = {
            'Known Issue': 1,
            'Resource Exhaustion': 2,
            'Performance': 3,
            'Change-Related': 2,
            'Connectivity': 2,
            'Historical Pattern': 3
        };
        
        const category = rootCauses[0].category;
        return estimates[category] || 4;
    }
    
    // Calculate incident priority
    calculatePriority(event, rootCauses) {
        if (event.severity === 'Critical') return '1-Critical';
        if (event.severity === 'High') return '2-High';
        
        // Adjust based on confidence
        if (rootCauses.length > 0 && rootCauses[0].confidence > 0.8) {
            if (event.severity === 'Medium') return '3-Medium';
        }
        
        return '4-Low';
    }
    
    // Update analysis status in UI
    updateAnalysisStatus(message) {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.innerHTML = `
                <i class="fas fa-robot"></i>
                <span>${message}</span>
            `;
        }
    }
    
    // Display analysis results in UI
    displayAnalysisResults(analysis) {
        const contentElement = document.getElementById('analysisContent');
        if (!contentElement) return;
        
        const confidenceClass = analysis.confidenceLevel;
        
        let html = `
            <div class="analysis-result">
                <div class="analysis-header">
                    <div class="analysis-title">Root Cause Analysis Complete</div>
                    <div class="confidence-score">
                        <span>Confidence:</span>
                        <span class="confidence-value confidence-${confidenceClass}">
                            ${(analysis.overallConfidence * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
                
                <div class="root-causes">
                    <h4>Identified Root Causes:</h4>
        `;
        
        analysis.rootCauses.forEach((rc, index) => {
            html += `
                <div class="cause-item">
                    <div class="cause-title">${index + 1}. ${rc.cause}</div>
                    <div class="cause-description">
                        Category: ${rc.category} | Confidence: ${(rc.confidence * 100).toFixed(0)}%
                    </div>
                    <div class="cause-evidence">
                        <strong>Evidence:</strong>
                        <ul>
                            ${rc.evidence.map(e => `<li>${e}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div class="solutions">
                    <h4>Recommended Solutions:</h4>
        `;
        
        analysis.solutions.forEach((solution, index) => {
            html += `
                <div class="cause-solution">
                    <strong>For: ${solution.rootCause}</strong>
                    <ol>
                        ${solution.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div class="analysis-footer">
                    <p><strong>Estimated Resolution Time:</strong> ${analysis.estimatedResolutionTime} hours</p>
                    <p><strong>Recommended Priority:</strong> ${analysis.recommendedPriority}</p>
                </div>
            </div>
        `;
        
        contentElement.innerHTML = html;
        
        // Update status
        this.updateAnalysisStatus('Analysis complete - Ready for ticket creation');
    }
    
    // Create incident from analysis
    async createIncidentFromAnalysis(event, analysis) {
        const incidentData = {
            category: event.type,
            subcategory: 'Performance',
            priority: analysis.recommendedPriority,
            shortDescription: `${event.severity} - ${event.message}`,
            description: this.generateIncidentDescription(event, analysis),
            rootCauseAnalysis: analysis.rootCauses,
            eventId: event.id,
            affectedSystems: event.affectedSystems,
            impact: this.mapSeverityToImpact(event.severity),
            urgency: this.mapSeverityToUrgency(event.severity)
        };
        
        // Get assignment recommendation
        const recommendations = await serviceNowAPI.getAssignmentRecommendations(incidentData);
        if (recommendations.length > 0) {
            incidentData.assignedTo = recommendations[0].email;
            incidentData.assignmentGroup = recommendations[0].group;
        }
        
        // Create the incident
        const incident = await serviceNowAPI.createIncident(incidentData);
        
        // Update UI
        window.ticketManagement?.updateIncidentDisplay();
        
        // Add work note with AI analysis
        await serviceNowAPI.addWorkNote(incident.number, {
            text: `AI Analysis Complete:\n\nConfidence: ${(analysis.overallConfidence * 100).toFixed(0)}%\n\nTop Root Cause: ${analysis.rootCauses[0]?.cause || 'Unknown'}\n\nRecommended Solution:\n${analysis.solutions[0]?.steps.join('\n') || 'No specific solution available'}`
        });
        
        this.updateAnalysisStatus(`Incident ${incident.number} created and assigned`);
        
        return incident;
    }
    
    // Generate incident description
    generateIncidentDescription(event, analysis) {
        let description = `Automated incident created by AI NOC Analyst\n\n`;
        description += `Event Details:\n`;
        description += `- Event ID: ${event.id}\n`;
        description += `- Source: ${event.source}\n`;
        description += `- Type: ${event.type}\n`;
        description += `- Severity: ${event.severity}\n`;
        description += `- Message: ${event.message}\n\n`;
        
        description += `AI Analysis Results:\n`;
        description += `- Overall Confidence: ${(analysis.overallConfidence * 100).toFixed(0)}%\n`;
        description += `- Estimated Resolution Time: ${analysis.estimatedResolutionTime} hours\n\n`;
        
        description += `Root Causes Identified:\n`;
        analysis.rootCauses.forEach((rc, index) => {
            description += `${index + 1}. ${rc.cause} (${(rc.confidence * 100).toFixed(0)}% confidence)\n`;
        });
        
        description += `\nRecommended Actions:\n`;
        if (analysis.solutions.length > 0) {
            analysis.solutions[0].steps.forEach((step, index) => {
                description += `${index + 1}. ${step}\n`;
            });
        }
        
        return description;
    }
    
    // Map severity to impact
    mapSeverityToImpact(severity) {
        const mapping = {
            'Critical': '1-High',
            'High': '2-Medium',
            'Medium': '3-Low',
            'Low': '3-Low'
        };
        return mapping[severity] || '3-Low';
    }
    
    // Map severity to urgency
    mapSeverityToUrgency(severity) {
        const mapping = {
            'Critical': '1-High',
            'High': '2-Medium',
            'Medium': '3-Low',
            'Low': '3-Low'
        };
        return mapping[severity] || '3-Low';
    }
    
    // Get time ago string
    getTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diff = (now - then) / 1000; // seconds
        
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }
    
    // Delay helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global instance
window.aiAnalysisEngine = new AIAnalysisEngine();

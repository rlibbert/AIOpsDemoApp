# NOC AI Analyst - Intelligent Network Operations Center

A full-featured web application that simulates an agentic AI acting as a NOC (Network Operations Center) analyst. The application implements a complete workflow for monitoring events, analyzing root causes, and creating ServiceNow tickets with intelligent assignment.

![Image](https://github.com/user-attachments/assets/50f0581d-bc04-463b-a3e2-a1ba6be63b08)

## 🚀 Features

### Core Functionality
- **Real-time Event Monitoring**: Live feed of network/system events with severity-based color coding
- **AI Root Cause Analysis**: Intelligent analysis engine that correlates events with CMDB, recent changes, and historical patterns
- **ServiceNow Integration**: Mock API for ticket creation, assignment, and management
- **Intelligent Assignment**: Skill-based routing with workload balancing and automatic escalation
- **Analytics Dashboard**: Real-time charts and metrics for event trends and performance
- **SLA Monitoring**: Track and alert on SLA compliance with visual indicators

### Event Types Supported
- Network (interface down, packet loss, BGP flapping)
- Server (CPU/memory issues, service failures)
- Database (connection pool, replication lag)
- Application (response time, cache issues)
- Security (failed logins, intrusion detection)

## 🎯 Quick Start

### Installation
1. Clone or download the project to your local machine
2. No installation required - runs directly in browser
3. Open `index.html` in a modern web browser (Chrome, Firefox, Edge recommended)

### Basic Usage
1. **Start Simulation**: Press `Ctrl+Space` or click the play button to start event generation
2. **View Events**: Monitor incoming events in the left panel
3. **Analyze Events**: Click on any event to view details and run AI analysis
4. **Create Incidents**: Auto-create tickets from critical events or manually from the UI
5. **Monitor SLA**: Track incident status and SLA compliance in real-time

## 🎮 Keyboard Shortcuts

- `Ctrl+Space` - Toggle event simulation on/off
- `Ctrl+S` - Open settings configuration
- `Ctrl+I` - Inject custom test event
- `Ctrl+E` - Export analytics data
- `ESC` - Close any open modal

## 📊 Application Workflow

The application follows this intelligent workflow:

1. **Event Detection**: Continuous monitoring of system events
2. **CMDB Query**: Retrieve configuration and dependency information
3. **Context Analysis**: Check recent changes and historical patterns
4. **Root Cause Analysis**: AI engine identifies probable causes with confidence scores
5. **Solution Generation**: Recommend specific remediation steps
6. **Intelligent Assignment**: Match incident to best available team member
7. **Ticket Creation**: Auto-generate ServiceNow incident with full context
8. **SLA Monitoring**: Track and escalate based on priority
9. **Knowledge Update**: Learn from resolved incidents

## 🔧 Configuration

Access settings via the gear icon or `Ctrl+S`:

### Simulation Settings
- **Event Generation Frequency**: 5-60 seconds between events
- **AI Confidence Threshold**: 50-95% minimum confidence for auto-actions

### SLA Configuration
- **Critical**: 1 hour default
- **High**: 4 hours default
- **Medium**: 8 hours default
- **Low**: 24 hours default

### Team Management
The system includes 8 pre-configured team members with different skills:
- L1 Support (monitoring, triage)
- L2 Network/Application (specialized support)
- L3 Database (expert support)
- Security Team (incident response)
- Infrastructure (server/storage)

## 🎨 User Interface

### Dashboard Layout
- **Header**: Real-time statistics and controls
- **Left Panel**: Live event monitor with filters
- **Center Panel**: AI analysis results and active incidents
- **Right Panel**: Team status, SLA monitor, and analytics

### Color Coding
- 🔴 **Critical** (Red): Immediate attention required
- 🟠 **High** (Orange): Urgent issues
- 🟡 **Medium** (Yellow): Standard priority
- 🟢 **Low** (Green): Informational

## 📈 Analytics & Reporting

### Real-time Metrics
- Event trends by severity (line chart)
- Active incidents by state
- SLA compliance rates
- Team utilization percentages
- AI confidence scores

### Export Options
- **JSON**: Complete data export with all details
- **CSV**: Simplified tabular format for spreadsheets

## 🤖 AI Analysis Engine

The AI engine performs multi-step analysis:

1. **Symptom Extraction**: Parse event messages and metrics
2. **Pattern Matching**: Compare against known issues
3. **Change Correlation**: Link to recent system changes
4. **Historical Analysis**: Learn from past incidents
5. **Confidence Scoring**: Rate each hypothesis
6. **Solution Mapping**: Generate specific remediation steps

### Confidence Levels
- **High (80-100%)**: Auto-create tickets for critical events
- **Medium (60-79%)**: Recommend manual review
- **Low (<60%)**: Gather additional information

## 🔍 Mock Data

The application includes realistic mock data:

### CMDB Items
- 7 servers (web, app, database, cache, message queue)
- 4 network devices (firewall, switches, router, load balancer)
- 3 applications (customer portal, API, admin dashboard)

### Knowledge Base
- Database connection pool exhaustion
- High CPU usage patterns
- Network interface flapping
- Application memory leaks
- SSL certificate issues

### Team Members
- 8 team members across different shifts
- Varied skill sets (Network, Database, Application, Security)
- Realistic workload distribution

## 🛠 Technical Stack

- **Frontend**: Pure JavaScript (ES6+)
- **Styling**: Custom CSS with dark theme
- **Charts**: Chart.js for analytics
- **Icons**: Font Awesome
- **Storage**: LocalStorage for persistence
- **Architecture**: Service-oriented with modular components

## 📝 Testing Scenarios

### Manual Test Cases

1. **Critical Event Flow**
   - Inject critical database event
   - Verify AI analysis runs automatically
   - Check incident creation with proper assignment
   - Monitor SLA tracking

2. **Escalation Testing**
   - Create high priority incident
   - Wait for escalation threshold
   - Verify automatic reassignment

3. **Workload Balancing**
   - Generate multiple incidents
   - Verify distribution across team
   - Check workload limits

4. **Knowledge Base Matching**
   - Inject known issue pattern
   - Verify KB article correlation
   - Check solution recommendations

## 🔐 Security & Privacy

- All data is stored locally in browser
- No external API calls
- No sensitive information transmitted
- Clear data option available

## 🚦 Performance

- Handles 100+ events per hour
- Smooth UI updates with 50+ active incidents
- Efficient memory management with event limits
- Optimized chart rendering

## 📚 Future Enhancements

Potential improvements for production deployment:

- Real ServiceNow API integration
- Machine learning for pattern recognition
- Multi-tenant support
- Real-time collaboration features
- Advanced reporting dashboards
- Mobile responsive design
- WebSocket for real-time updates
- Integration with monitoring tools (Nagios, Zabbix, etc.)

## 🐛 Troubleshooting

### Common Issues

**Events not generating:**
- Check if simulation is running (play button)
- Verify browser console for errors
- Clear browser cache and reload

**Charts not displaying:**
- Ensure Chart.js CDN is accessible
- Check browser developer tools for errors
- Try different browser

**Data not persisting:**
- Check localStorage availability
- Clear browser data if corrupted
- Export data before clearing

## 📄 License

This is a demonstration application for educational purposes.

## 🙏 Acknowledgments

Built to demonstrate the complete NOC analyst workflow with AI-driven automation and intelligent incident management.

---

**Note**: This is a simulation application with mock data. For production use, integrate with actual monitoring tools and ServiceNow APIs.


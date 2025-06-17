# Rhythmiq Personal OS

**AI-augmented Personal Operating System for ADHD-friendly productivity and cognitive management**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)

Rhythmiq is a modular, AI-augmented Personal Operating System designed to serve as an externalized executive function for individuals with ADHD. It combines smart task management, chaos detection, AI-powered assistance, and behavioral nudges into a unified platform that works *with* how ADHD brains operate, rather than against them.

---

## 🎯 Project Philosophy

Most productivity systems assume neurotypical executive function. Rhythmiq acknowledges that ADHD brains need different organizational systems:

- **Nonlinear thinking** with structured execution
- **Frictionless capture** with deliberate review  
- **Chaos detection** with gentle intervention
- **Visual progress indicators** for dopamine feedback
- **AI augmentation** for cognitive support
- **Forgiveness built-in** - no guilt for imperfect usage

---

## 🏗️ Current Status (Phase 1: Core Trinity)

### ✅ Implemented Features

#### **Dashboard & System Status**
- Real-time system health monitoring
- Task loading and API connectivity status
- Brain weather indicator (🟢🟡🔴)
- Phase 1 feature status tracking

#### **Task Management**
- Most Important Tasks (MITs) display and tracking
- Task status management (Not Started, Doing, Done, Blocked, Paused)
- Priority-based task organization
- MIT badge system for critical task identification

#### **API Infrastructure**
- FastAPI backend with full OpenAPI documentation
- PostgreSQL database with ADHD-optimized schema
- RESTful endpoints for tasks, ideas, journal entries
- Health monitoring and status endpoints

#### **Development Environment**
- Complete Docker Compose stack
- Hot-reload development setup
- Automated database migrations
- Development/production configuration management

### 🔄 Ready for Integration

#### **Chaos Detection System**
- Pattern recognition for rapid idea capture (3+ ideas in 10 minutes)
- Task switching behavior monitoring
- Urgency keyword analysis ("urgent", "need to", "should")
- Completion ratio tracking
- Intervention suggestions based on mental state

#### **AI Routing Service**
- Dual AI system: Claude (engineering) + ChatGPT (creative)
- @mention routing system (@claude, @chatgpt, @all)
- Context-aware conversations with current task/project data
- Conversation history and thread management

#### **Automation Engine**
- n8n integration for smart nudges and reminders
- Webhook-based intervention system
- Customizable notification scheduling
- Behavioral pattern triggers

---

## 🚀 Technical Architecture

### **Frontend Stack**
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with responsive design
- **Build Tool**: Vite with hot module replacement
- **PWA Ready**: Service worker and offline capability prepared
- **Mobile First**: Progressive Web App architecture

### **Backend Stack**
- **API**: FastAPI with automatic OpenAPI documentation
- **Database**: PostgreSQL with graph-migration-ready schema
- **Caching**: Redis for session and performance optimization
- **Authentication**: Prepared for JWT with role-based access
- **Task Queue**: Celery integration prepared

### **DevOps & Infrastructure**
- **Containerization**: Docker Compose for development
- **Database**: Managed PostgreSQL with automated backups
- **Automation**: n8n for workflow orchestration
- **Security**: Tailscale VPN for secure remote access
- **Monitoring**: Structured logging and health checks

### **AI Integration**
- **OpenAI**: GPT-4 for creative tasks and strategic thinking
- **Anthropic**: Claude for technical tasks and engineering support
- **Context Management**: Automatic context sharing between AI systems
- **Conversation Threading**: Persistent conversation history

---

## 📊 Database Schema

### **Core Entities**

```sql
-- Users and Authentication
Users (id, username, email, hashed_password, is_active, created_at)

-- Task Management  
Tasks (id, title, description, status, priority, is_mit, project, tags, 
       estimated_minutes, actual_minutes, due_date, completed_at, user_id)

-- Idea Management
Ideas (id, title, description, status, category, tags, ai_enriched, 
       ai_enrichment_data, origin, next_step, user_id)

-- Journal & Reflection
JournalEntries (id, content, prompt, mood, focus_level, roadblocks, 
                project_tags, user_id)

-- AI Conversations
AIConversations (id, thread_title, messages, ai_participants, 
                 context_data, user_id)

-- Chaos Detection
ChaosMetrics (id, chaos_level, capture_velocity, task_switches, 
              urgency_keywords, completion_ratio, detection_reason, 
              intervention_triggered, user_id)
```

### **Graph-Ready Design**
The schema is designed for future migration to Neo4j for advanced relationship mapping between ideas, tasks, projects, and journal entries.

---

## 🎪 Planned Modules (Future Phases)

### **Phase 2: Enhanced Capture & Intelligence**

#### **Idea Vault with AI Enrichment**
- Lightning-fast idea capture with automatic categorization
- AI-powered keyword extraction and research suggestions
- Relationship mapping between ideas and existing projects
- Status management (Active, Dormant, Archived)

#### **Smart Journal System**
- Prompted daily entries with mood and focus tracking
- Automatic project tag extraction from entries
- Roadblock identification and suggestion engine
- Weekly/monthly retrospective generation

#### **Advanced Chaos Detection**
- Real-time intervention suggestions during chaotic periods
- Personalized chaos pattern recognition
- Adaptive nudging based on effectiveness
- Integration with external data (calendar, health metrics)

### **Phase 3: External Integrations**

#### **Health & Habit Tracking**
- WHOOP API integration for sleep and recovery data
- Manual vitamin, hydration, and medication logging
- Correlation analysis between health metrics and productivity
- Automated health-based task scheduling suggestions

#### **Calendar & Project Sync**
- Two-way synchronization with Google/Apple Calendar
- Automatic focus block scheduling based on task priorities
- Deadline tracking and proactive reminder system
- Meeting preparation and follow-up automation

#### **Code & Learning Integration**
- GitHub API for commit tracking and code-linked tasks
- Learning progress tracking with resource management
- Skill tree visualization for expertise development
- Automated progress celebrations and milestone tracking

### **Phase 4: Advanced AI Features**

#### **Contextual AI Assistant**
- Proactive task and project suggestions based on patterns
- Natural language task creation and modification
- Intelligent project planning with SMART goal integration
- Mood-aware communication and intervention strategies

#### **Predictive Analytics**
- Task completion time prediction based on historical data
- Optimal work session scheduling recommendations
- Burnout risk assessment and prevention
- Productivity pattern analysis and optimization

#### **Graph-Based Knowledge Management**
- Interactive visualization of connections between ideas, tasks, and projects
- Automatic relationship discovery using AI analysis
- Knowledge graph querying for project planning
- Serendipitous connection suggestions

### **Phase 5: Social & Collaboration**

#### **Accountability & Support**
- Optional sharing of progress with accountability partners
- Anonymous community challenges and support groups
- Success story sharing and motivation
- Peer learning and best practice exchange

#### **Professional Integration**
- Team project management with ADHD-aware features
- Client communication templates and automation
- Time tracking and billing integration
- Professional portfolio and achievement tracking

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Docker and Docker Compose
- Git
- OpenAI API key (optional)
- Anthropic API key (optional)

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/wardspan/rhythmiq-personal-os.git
cd rhythmiq-personal-os

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start the development environment
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# n8n: http://localhost:5678 (admin/admin)
```

### **Environment Configuration**

```bash
# Required
DATABASE_URL=postgresql://rhythmiq_user:rhythmiq_dev_password@localhost:5432/rhythmiq
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_secret_key_here

# Optional (for AI features)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Development
ENVIRONMENT=development
DEBUG=true
```

---

## 📖 API Documentation

### **Core Endpoints**

#### **Health & Status**
- `GET /` - API root information
- `GET /health` - Health check
- `GET /api/v1/health` - Detailed API health

#### **Task Management**
- `GET /api/v1/tasks` - List all tasks
- `GET /api/v1/tasks/mits` - Get Most Important Tasks
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task

#### **Future Endpoints** (Planned)
- `/api/v1/ideas` - Idea management
- `/api/v1/journal` - Journal entries
- `/api/v1/ai/chat` - AI conversation routing
- `/api/v1/chaos` - Chaos detection and intervention
- `/api/v1/nudges` - Behavioral nudges and reminders

### **Interactive Documentation**
Visit `http://localhost:8000/docs` for complete interactive API documentation with request/response examples.

---

## 🧠 Design Principles

### **ADHD-Aware Design**

#### **Cognitive Load Management**
- Minimal visual clutter with clean, focused interfaces
- Progressive disclosure of complexity
- Single-action capture for ideas and tasks
- Clear visual hierarchy and status indicators

#### **Executive Function Support**
- Automated priority suggestions based on patterns
- Gentle intervention when chaos patterns detected
- Visual progress tracking for dopamine feedback
- Forgiveness-first design - no guilt for incomplete usage

#### **Hyperfocus Protection**
- Frictionless capture to avoid breaking flow states
- Context preservation for easy re-entry after interruptions
- Smart notification scheduling based on activity patterns
- Optional "focus mode" with minimal distractions

### **Technical Principles**

#### **Modularity**
- Microservices-ready architecture
- Feature flags for gradual rollout
- Plugin system for custom integrations
- API-first design for future mobile apps

#### **Privacy & Security**
- Local-first data storage with optional cloud sync
- End-to-end encryption for sensitive data
- No tracking or analytics without explicit consent
- Full data export and deletion capabilities

#### **Performance**
- Optimistic UI updates for immediate feedback
- Intelligent caching and preloading
- Progressive Web App for offline functionality
- Mobile-first responsive design

---

## 🧪 Testing Strategy

### **Current Testing**
- API endpoint testing with FastAPI's built-in test client
- Database schema validation
- Docker environment consistency testing

### **Planned Testing**
- Frontend component testing with React Testing Library
- Integration testing for AI routing and chaos detection
- Performance testing for large data sets
- Accessibility testing for neurodivergent users
- Behavioral testing with real ADHD users

---

## 🤝 Contributing

### **Development Setup**

```bash
# Backend development
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Frontend development  
cd frontend
npm install
npm run dev

# Database management
cd backend
alembic upgrade head  # Apply migrations
alembic revision --autogenerate -m "Description"  # Create migration
```

### **Code Standards**
- **Backend**: Black formatting, type hints, docstrings
- **Frontend**: ESLint, Prettier, TypeScript strict mode
- **Commits**: Conventional commits with gitmoji
- **Documentation**: Comprehensive README updates for new features

### **Feature Development Process**
1. **Research Phase**: Study ADHD user needs and existing solutions
2. **Design Phase**: Create user-centered mockups and workflows
3. **Implementation Phase**: Build with testing and documentation
4. **Validation Phase**: Test with ADHD users and iterate

---

## 📚 Research & Inspiration

### **ADHD & Executive Function Research**
- Russell Barkley's executive function model
- Cognitive load theory and working memory limitations
- Dopamine reward systems and motivation
- Time blindness and task initiation challenges

### **Productivity System Analysis**
- Getting Things Done (GTD) methodology
- Building a Second Brain (BASB) principles  
- Bullet Journal system adaptations
- Pomodoro Technique variations for ADHD

### **Technology Approaches**
- Personal Knowledge Management systems
- AI-augmented note-taking tools
- Habit tracking and behavioral intervention apps
- Assistive technology for cognitive disabilities

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ADHD Community**: For sharing experiences and feedback
- **Open Source**: FastAPI, React, PostgreSQL, and the entire ecosystem
- **AI Partners**: OpenAI and Anthropic for cognitive augmentation capabilities
- **Research Community**: For studies on ADHD, executive function, and assistive technology

---

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/wardspan/rhythmiq-personal-os/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wardspan/rhythmiq-personal-os/discussions)  
- **Documentation**: [Wiki](https://github.com/wardspan/rhythmiq-personal-os/wiki)

---

**Rhythmiq Personal OS**: *Building a mind prosthetic for the ADHD brain, one feature at a time.*
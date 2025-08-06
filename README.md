# 88X AI - Project 88X Main Repository

## 🚀 Overview

88X AI is a comprehensive AI-powered system for inbound marketing orchestration and audience analysis. The project consists of multiple microservices that work together to provide intelligent marketing automation capabilities.

## 🏗️ Architecture

### Core Components

- **Inbound Orchestrator**: WebSocket-enabled service for initiating agent runs
- **Intent Parser**: AI agent for analyzing user intent and keywords
- **Marketer Agent**: Specialized agent for marketing strategy and audience analysis
- **Scout Agents**: Multiple specialized agents for data collection and analysis
- **Frontend**: React-based command deck for mission control and visualization

### Technology Stack

- **Backend**: Node.js, Express, WebSocket
- **Frontend**: React, Vite, Tailwind CSS
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (optional)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VltrnOne/88X_Ai.git
   cd 88X_Ai
   ```

2. **Set up environment variables**
   ```bash
   # Copy the template files
   cp kubernetes/vltrn-secrets.template.yaml kubernetes/vltrn-secrets.yaml
   cp deploy-production.template.sh deploy-production.sh
   
   # Edit the files with your actual API keys and credentials
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - Inbound Orchestrator: http://localhost:8083

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# API Configuration
API_PORT=4000
API_HOST=0.0.0.0

# AI/LLM Configuration
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
VENICE_API_KEY=your_venice_key

# Enrichment APIs
GOOGLE_API_KEY=your_google_key
SEARCH_ENGINE_ID=your_search_engine_id
GITHUB_PAT=your_github_token

# AgenticFlow Configuration
AGENTICFLOW_API_KEY=your_agenticflow_key
AGENTICFLOW_TEAMSPACE_ID=your_teamspace_id
```

## 🎯 Features

### Inbound Orchestrator
- WebSocket-enabled agent communication
- Real-time audience analysis
- Keyword-based marketing strategy generation
- Multi-agent coordination

### Intent Parser
- Natural language processing
- User intent classification
- Keyword extraction and analysis
- Context-aware responses

### Marketer Agent
- Audience demographic analysis
- Pain point identification
- Content strategy recommendations
- Marketing channel optimization

### Scout Agents
- **SalesNav Scout**: LinkedIn data collection
- **WARN Scout**: Government notice monitoring
- **Selenium Scout**: Web scraping capabilities

## 📊 API Endpoints

### Inbound Orchestrator
- `POST /api/inbound/start-analysis` - Initiate audience analysis

### Production Backend
- `GET /api/health` - Health check
- `POST /api/missions` - Create new missions
- `GET /api/missions/:id` - Get mission details

## 🐳 Docker Services

The system runs as a collection of Docker containers:

- `inbound-orchestrator`: WebSocket-enabled orchestrator
- `intent-parser`: AI intent analysis service
- `marketer-agent`: Marketing strategy agent
- `scout-salesnav`: LinkedIn data collection
- `scout-warn`: Government notice monitoring
- `dataroom-db`: PostgreSQL database
- `frontend`: React application

## 🔒 Security

### Sensitive Files
The following files contain sensitive information and are excluded from version control:
- `kubernetes/vltrn-secrets.yaml` (use template)
- `deploy-production.sh` (use template)
- `.env` files
- Any files containing API keys

### Template Files
Use the provided template files and replace placeholder values:
- `kubernetes/vltrn-secrets.template.yaml`
- `deploy-production.template.sh`

## 🚀 Deployment

### Local Development
```bash
docker-compose up -d
```

### Production Deployment
```bash
# Use the deployment script
chmod +x deploy-production.sh
./deploy-production.sh
```

### Kubernetes Deployment
```bash
# Apply Kubernetes configurations
kubectl apply -f kubernetes/
```

## 📈 Monitoring

### Health Checks
- Frontend: http://localhost:3000/health
- API: http://localhost:4000/api/health
- Orchestrator: http://localhost:8083/health

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f inbound-orchestrator
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in each service directory
- Review the deployment guides

## 🔄 Updates

Stay updated with the latest changes:
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

**88X AI** - Intelligent Marketing Automation Platform

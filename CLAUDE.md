# Sienna Naturals Dashboard - Claude Code Documentation

## Project Overview

The Sienna Naturals Dashboard is an enterprise-grade analytics and management platform for the Sienna Naturals chatbot ecosystem. It provides comprehensive insights into user interactions, conversation analytics, product recommendations, and business intelligence.

## Recent Updates (August 2025)

### Myavana Integration Enhancements

The dashboard has been upgraded with advanced features previously available in the Myavana Chatbot Dashboard:

- **Conversation Intelligence**: Advanced sentiment analysis and topic detection
- **Enhanced Product Management**: Comprehensive product performance tracking
- **Team Management System**: Role-based access and activity monitoring
- **File Upload Processing**: Advanced file handling with multiple storage providers
- **CopilotKit Integration**: AI-powered development tools
- **Premium Analytics**: Real-time metrics and business intelligence

## Architecture

### Tech Stack
- **Frontend**: Next.js 13+ with React 18
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with advanced analytics tables
- **Caching**: Redis for response caching
- **Storage**: Multiple providers (Local, S3, Cloudinary, Bytescale)
- **AI Models**: Multi-model system (Gemini, GPT-4, Grok)
- **Styling**: Sienna Naturals Premium Design System

### Database Schema

The application uses a comprehensive PostgreSQL schema with 20+ tables:

#### Core Tables
- `user_profiles`: Enhanced user profiles with hair care data
- `conversations`: Conversation tracking with AI model analytics
- `analytics_events`: Comprehensive analytics tracking
- `error_logs`: System error monitoring

#### Advanced Features
- `conversation_intelligence`: Sentiment and topic analysis
- `product_recommendations`: Product recommendation tracking
- `team_members`: Team management and permissions
- `file_uploads`: File processing and storage
- `copilot_actions`: CopilotKit integration tracking

### Key Components

#### Dashboard Components
- `DashBoardLayerOne.jsx`: Main dashboard overview
- `AIModelsLayer.jsx`: AI model performance monitoring
- `CostAnalyticsLayer.jsx`: Cost analysis and optimization
- `ExperimentsLayer.jsx`: A/B testing management
- `UserJourneyLayer.jsx`: User journey tracking

#### Child Components
- `PremiumMetricsOverview.jsx`: Advanced metrics display
- `AIPerformanceMonitor.jsx`: Real-time AI monitoring
- `HairConcernsOverviewChart.jsx`: Hair concern analytics
- `UserJourneyTracker.jsx`: Journey progression tracking

## Development Guidelines

### Code Standards
- Use TypeScript for type safety where applicable
- Follow React functional components with hooks
- Implement proper error boundaries
- Use the Sienna Naturals design system

### Database Operations
- Always use parameterized queries
- Implement proper connection pooling
- Use transactions for complex operations
- Include comprehensive error logging

### API Development
- Follow RESTful principles
- Implement proper rate limiting
- Use authentication middleware
- Include request/response logging

## Sienna Naturals Branding

### Color Palette
```css
--sienna-sage: #91A996;         /* Primary brand color */
--sienna-charcoal: #131A19;     /* Text and labels */
--sienna-terra: #817F7E;        /* Earthy accent */
--sienna-white: #FFFFFF;        /* Clean backgrounds */
```

### Design Principles
- Clean and minimal layouts
- Generous white space
- Natural, calming color schemes
- Focus on usability and accessibility
- Premium, professional aesthetic

## Development Commands

### Database Migration
```bash
# Run all migrations
psql -d sienna_naturals -f packages/core/migrations/run_migrations.sql

# Run specific migration
psql -d sienna_naturals -f packages/core/migrations/004_myavana_integration_enhancements.sql
```

### Development Server
```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- --port 3001

# Build for production
npm run build
```

### Package Management
```bash
# Install dependencies
npm install

# Update packages
npm update

# Check for security vulnerabilities
npm audit
```

## API Endpoints

### Analytics
- `GET /api/dashboard-metrics` - Main dashboard statistics
- `GET /api/conversation-intelligence` - Conversation analytics
- `GET /api/ai-model-performance` - AI model statistics
- `GET /api/cost-analytics` - Cost analysis data

### User Management
- `GET /api/users` - User listing with pagination
- `GET /api/users/[userId]` - Specific user details
- `GET /api/hair-profiles` - Hair profile management
- `GET /api/user-journey` - User journey tracking

### Product Management
- `GET /api/products` - Product catalog
- `POST /api/products` - Create new product
- `PUT /api/products/[productId]` - Update product
- `DELETE /api/products/[productId]` - Delete product

### Team Management
- `GET /api/team/users` - Team member listing
- `POST /api/team/users` - Add team member
- `PUT /api/team/users/[userId]` - Update member
- `DELETE /api/team/users/[userId]` - Remove member

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=components
```

### Test Database
```bash
# Setup test database
createdb sienna_naturals_test

# Run test migrations
psql -d sienna_naturals_test -f packages/core/migrations/run_migrations.sql
```

## Deployment

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/sienna_naturals
REDIS_URL=redis://localhost:6379

# AI Models
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_api_key

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
BYTESCALE_API_KEY=your_bytescale_key
```

### Production Build
```bash
# Build application
npm run build

# Start production server
npm start

# Use PM2 for process management
pm2 start ecosystem.config.js
```

## Monitoring and Maintenance

### Health Checks
- Database connection monitoring
- Redis cache health
- AI model availability
- File storage accessibility

### Regular Maintenance
- Database performance optimization
- Cache cleanup and optimization
- Log rotation and cleanup
- Security updates

### Performance Monitoring
- Response time tracking
- Database query optimization
- Memory usage monitoring
- Error rate tracking

## Support and Documentation

### Getting Help
- Check the project README for basic setup
- Review API documentation in `/docs`
- Check error logs in `/logs` directory
- Contact the development team for complex issues

### Contributing
- Follow the established code style
- Include tests for new features
- Update documentation for changes
- Submit pull requests for review

## Security Considerations

### Data Protection
- All user data is encrypted at rest
- PII is handled according to GDPR guidelines
- Regular security audits are performed
- Access logs are maintained

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management
- API rate limiting

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL and network connectivity
2. **Redis Cache**: Verify Redis server is running and accessible
3. **AI Models**: Ensure API keys are valid and models are available
4. **File Uploads**: Check storage provider configuration
5. **Memory Issues**: Monitor and optimize query performance

### Debug Mode
```bash
# Enable debug logging
DEBUG=sienna:* npm run dev

# Check system health
curl http://localhost:3000/api/health

# View database connections
psql -d sienna_naturals -c "SELECT * FROM pg_stat_activity;"
```

## Future Enhancements

### Planned Features
- Advanced AI model comparison tools
- Real-time collaboration features
- Enhanced mobile responsiveness
- Advanced export capabilities
- Integration with external CRM systems

### Performance Improvements
- Database indexing optimization
- Caching strategy enhancements
- Frontend performance optimization
- API response time improvements

---

**Last Updated**: August 28, 2025  
**Version**: 4.0.0  
**Documentation Maintainer**: Claude Code Integration Agent
# Expi-Trak: Expedite Material Request Tracker

A modern web application for tracking and managing "must-go" and expedite material requests, facilitating seamless communication between customer service and warehouse teams.

## Key Features

- **Real-time Tracking**: Monitor expedite requests with instant updates
- **Analytics Dashboard**: Track performance and identify trends
- **Team Collaboration**: Seamless communication between teams
- **Role-based Access**: Admin, Customer Service, and Warehouse roles
- **Multi-site Support**: Manage multiple locations
- **Email Notifications**: Automated alerts for important events
- **Responsive Design**: Works on all devices
- **Dark/Light Theme**: Choose your preferred interface

## Application Preview

<div align="center">

### Landing Page
![Landing Page](public/landing.png)

### Request Management Interface
![Request List](public/list.png)

### Analytics Dashboard
![Analytics Dashboard](public/dashboard.png)

</div>

## Quick Start Guide

### Option 1: One-Click Deployment (Recommended for Home Users)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fashlessscythe%2Fexpi-trako)

1. Click the "Deploy with Vercel" button above
2. Sign up for a free Vercel account if you don't have one
3. Connect your GitHub account
4. Follow the setup wizard to configure your deployment
5. Add your environment variables in the Vercel dashboard
6. Your application will be live in minutes!

### Option 2: Manual Deployment (Recommended for Corporate Users)

#### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL database
  - For development: [Download PostgreSQL](https://www.postgresql.org/download/)
  - For production: [Neon.tech](https://neon.tech) (recommended) or your corporate database
- Git ([Download](https://git-scm.com/downloads))

#### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ashlessscythe/expi-trako.git
   cd expi-trako
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/expi_trako"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Email (Required for notifications)
   RESEND_API_KEY="your-resend-api-key"
   EMAIL_FROM_DOMAIN="your-domain.com"
   
   # Application
   NEXT_PUBLIC_APP_NAME="Expi-Trak"
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

Visit `http://localhost:3000` to access your application.

## Deployment Options

### 1. Vercel Deployment (Recommended for Most Users)

- Free tier available
- Automatic HTTPS
- Global CDN
- Zero-config deployments
- Automatic preview deployments for pull requests

### 2. Docker Deployment (Recommended for Corporate Users)

```bash
# Build the Docker image
docker build -t expi-trako .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  expi-trako
```

### 3. Traditional Server Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set up a reverse proxy (Nginx/Apache) to serve the application
3. Configure SSL certificates
4. Set up a process manager (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start npm --name "expi-trako" -- start
   ```

## User Roles and Permissions

### Customer Service Team
- Submit and track expedite requests
- Real-time status updates
- Clear communication with warehouse

### Warehouse Staff
- Prioritized request queue
- Real-time processing updates
- Efficient workflow management

### Administrators
- User management
- System configuration
- Performance monitoring
- Report generation

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Email**: Resend API
- **Hosting**: Vercel + Neon.tech (recommended)

## Features

### Core Functionality

- **Real-time Tracking**: Monitor expedite requests in real-time with instant status updates
- **Analytics Dashboard**: Comprehensive analytics to track performance and identify trends
- **Team Collaboration**: Seamless communication between customer service and warehouse teams
- **Efficient Processing**: Streamlined workflow for faster must-go shipment processing

### Key Features

- Role-based access control (Admin, Customer Service, Warehouse)
- Comprehensive request tracking with status updates
- Part information management
- Email notifications for important events
- Multi-site support with site-specific settings
- Responsive design for all devices
- Dark/Light theme support

### User Interface

![Request List](public/list.png)

_Request management interface for easy tracking and updates_

![Analytics Dashboard](public/dashboard.png)

_Comprehensive dashboard for performance monitoring_

## Support and Resources

- [Documentation](docs/)
- [Issue Tracker](https://github.com/ashlessscythe/expi-trako/issues)
- [Contributing Guidelines](CONTRIBUTING.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

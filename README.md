# 🚌 Driver Instruction Tracker

A professional web application for recording and tracking instructions given to drivers with comprehensive reporting and management features. Built for fleet management and bus operations teams.

## ✨ Features

### Core Functionality
- **Instruction Recording**: Record driver instructions with employee ID, route, run number, headway deviation, early/late status, instruction content, and communication method
- **Calendar View**: View instructions for specific dates with an intuitive calendar interface
- **Advanced Search**: Multi-field filtering and search capabilities
- **Statistics & Analytics**: Comprehensive reporting and data analysis

### Advanced Features
- **Employee Summaries**: Generate detailed reports for specific employees on selected dates
- **Daily Reports**: Complete daily instruction reports with all activities
- **Edit Functionality**: Modify employee ID and timestamps with security confirmations
- **Delete Management**: Safe deletion of instruction entries with confirmation dialogs
- **Real-time Updates**: Live updates using WebSocket technology

### UI/UX Excellence
- **Three-Color Gradient Design**: Professional dark background → light card → beige input fields
- **Compact Form Layout**: Optimized space utilization with 15-character field limits
- **Responsive Design**: Fully responsive for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🚀 Technology Stack

### Core Framework
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first styling
- **🧩 shadcn/ui** - High-quality accessible components

### Backend & Database
- **🗄️ Prisma** - Next-generation ORM
- **💾 SQLite** - Lightweight database
- **🔌 Socket.IO** - Real-time communication
- **🌐 REST API** - Full CRUD operations

### State Management & Data
- **🐻 Zustand** - Client state management
- **🔄 TanStack Query** - Server state management
- **🎣 React Hook Form** - Form handling
- **✅ Zod** - Schema validation

## 🎯 Use Cases

### For Fleet Managers
- Track all driver instructions in one centralized system
- Generate daily and employee-specific reports
- Monitor compliance and instruction follow-through
- Analyze patterns and optimize operations

### For Dispatch Teams
- Record instructions with precise timing and details
- Communicate effectively with drivers
- Maintain accurate records for auditing
- Access historical data for reference

### For Operations Teams
- Comprehensive reporting for management review
- Data-driven decision making
- Performance tracking and improvement
- Regulatory compliance documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd driver-instruction-tracker

# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📱 Application Access

- **Development**: http://localhost:3000
- **Production**: [Deployed URL will be provided after deployment]

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL=file:./db/custom.db
```

### Database Setup
The application uses SQLite with Prisma ORM. The database file is automatically created in the `db/` directory.

## 📊 API Endpoints

### Instructions
- `GET /api/instructions` - Get all instructions
- `POST /api/instructions` - Create new instruction
- `PATCH /api/instructions/[id]` - Update instruction
- `DELETE /api/instructions/[id]` - Delete instruction

### Health Check
- `GET /api/health` - Application health status

## 🎨 User Interface

### Main Features
1. **Instruction Entry Form**: Compact form with all necessary fields
2. **Calendar View**: Navigate and view instructions by date
3. **Search & Filter**: Find specific instructions quickly
4. **Reports**: Generate various types of reports
5. **Real-time Updates**: Live updates without page refresh

### Design System
- **Color Palette**: Professional gradient with dark backgrounds
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Interactive Elements**: Hover effects and smooth transitions

## 🔒 Security Features

- **Input Validation**: All inputs validated with Zod schemas
- **Confirmation Dialogs**: Safe deletion and editing with confirmations
- **Timestamp Protection**: Prevents unauthorized timestamp modifications
- **Data Integrity**: ACID compliant database operations

## 📈 Reporting Capabilities

### Employee Summary
- Specific employee instructions for selected date
- Communication method breakdown
- Performance metrics

### Daily Report
- All instructions for a specific date
- Chronological timeline
- Statistical summary

### Statistics
- Instruction frequency analysis
- Communication method distribution
- Performance trends over time

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Static site hosting
- **Railway**: Full-stack deployment
- **Digital Ocean**: Cloud server deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

Built with ❤️ for fleet management and operations teams.
# Pashion ERP System

A comprehensive web-based ERP system for clothing factory management, built with React, Node.js, Express, and MySQL.

## 🚀 Features

### Core Modules
- **Sales Management** - Sales orders, customer management, pipeline tracking
- **Procurement** - Purchase orders, vendor management, goods receipt
- **Challan Management** - Central challan register with barcode/QR generation
- **Inventory Management** - Stock tracking, low stock alerts, barcode scanning
- **Manufacturing** - Production tracking, stage-wise monitoring, quality control
- **Outsourcing** - Vendor management, quality tracking, performance analytics
- **Samples** - Sample requests, conversion tracking, cost analysis
- **Shipment & Delivery** - Courier integration, real-time tracking
- **School Store** - Multi-location store management, sales tracking
- **Finance** - Invoicing, payments, cash flow management
- **Admin Panel** - User management, roles, permissions, system configuration

### Key Features
- **Role-based Authentication** - JWT-based secure login system
- **Department-wise Dashboards** - Customized views for each department
- **Central Challan System** - Auto-numbering (CHN-YYYYMMDD-XXXX format)
- **Barcode/QR Code Generation** - For all challans and inventory items
- **Real-time Notifications** - System-wide notification management
- **Attendance Management** - Check-in/check-out functionality
- **Comprehensive Reporting** - Analytics across all modules
- **Responsive Design** - Works on desktop and mobile browsers

## 🏗️ Architecture

### Frontend (React)
```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.js
│   │   │   └── Sidebar.js
│   │   └── common/
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── dashboards/
│   │   │   ├── SalesDashboard.js
│   │   │   ├── ProcurementDashboard.js
│   │   │   ├── ChallanDashboard.js
│   │   │   ├── InventoryDashboard.js
│   │   │   ├── ManufacturingDashboard.js
│   │   │   ├── OutsourcingDashboard.js
│   │   │   ├── SamplesDashboard.js
│   │   │   ├── ShipmentDashboard.js
│   │   │   ├── StoreDashboard.js
│   │   │   ├── FinanceDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── ProfilePage.js
│   │   ├── AttendancePage.js
│   │   └── NotificationsPage.js
│   └── App.js
```

### Backend (Node.js/Express)
```
server/
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── SalesOrder.js
│   ├── PurchaseOrder.js
│   ├── Challan.js
│   ├── Inventory.js
│   ├── ProductionOrder.js
│   └── [15+ models]
├── routes/
│   ├── auth.js
│   ├── sales.js
│   ├── procurement.js
│   ├── challans.js
│   ├── inventory.js
│   ├── manufacturing.js
│   └── [12+ route files]
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── rateLimiter.js
└── index.js
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Context** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database operations
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd passion-inventory
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE passion_erp;

-- Create user (optional)
CREATE USER 'passion_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON passion_erp.* TO 'passion_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
DB_HOST=localhost
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=passion_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 4. Frontend Setup
```bash
cd client
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 5. Database Migration
```bash
cd server
npm run migrate
npm run seed  # Optional: seed with sample data
```

### 6. Start the Application
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👥 User Roles & Permissions

### Default Roles
1. **Super Admin** - Full system access
2. **Sales Manager** - Sales operations management
3. **Procurement Officer** - Purchase and vendor management
4. **Production Supervisor** - Manufacturing operations
5. **Store Manager** - School store operations
6. **Finance Manager** - Financial operations
7. **Quality Controller** - Quality assurance
8. **Inventory Manager** - Stock management

### Default Login Credentials
```
Super Admin:
Email: admin@pashion.com
Password: admin123

Sales Manager:
Email: sales@pashion.com
Password: sales123

[Additional users created during seeding]
```

## 📊 Dashboard Features

### Sales Dashboard
- Sales pipeline tracking
- Order status monitoring
- Customer management
- Revenue analytics
- Performance metrics

### Procurement Dashboard
- Purchase order management
- Vendor performance tracking
- Goods receipt notes
- Spend analysis

### Manufacturing Dashboard
- Production order tracking
- Stage-wise monitoring (Cutting → Embroidery → Stitching → Finishing → QC → Packaging)
- Worker performance
- Quality control metrics
- Efficiency tracking

### Inventory Dashboard
- Real-time stock levels
- Low stock alerts
- Barcode scanning
- Stock movements
- Category-wise analysis

### Finance Dashboard
- Invoice management
- Payment tracking
- Cash flow analysis
- Outstanding receivables/payables
- Financial reports

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Sales
```
GET    /api/sales/orders
POST   /api/sales/orders
PUT    /api/sales/orders/:id
DELETE /api/sales/orders/:id
GET    /api/sales/customers
POST   /api/sales/customers
```

### Procurement
```
GET    /api/procurement/purchase-orders
POST   /api/procurement/purchase-orders
GET    /api/procurement/vendors
POST   /api/procurement/vendors
```

### Challans
```
GET    /api/challans
POST   /api/challans
GET    /api/challans/:id
PUT    /api/challans/:id
GET    /api/challans/:id/pdf
```

[Additional endpoints for all modules...]

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- Desktop computers (1920x1080 and above)
- Tablets (768px - 1024px)
- Mobile phones (320px - 767px)

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- SQL injection prevention with Sequelize ORM

## 📈 Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Lazy loading of components
- Image optimization
- Caching strategies
- Minification and compression

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# The build folder contains the production-ready files
```

### Environment Variables (Production)
```bash
# Backend (.env)
NODE_ENV=production
DB_HOST=your_production_db_host
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_strong_jwt_secret

# Frontend (.env.production)
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@pashion.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core ERP modules
- ✅ Role-based authentication
- ✅ Dashboard interfaces
- ✅ Basic reporting

### Phase 2 (Upcoming)
- [ ] Advanced analytics and BI
- [ ] Mobile app (React Native)
- [ ] API integrations (payment gateways, courier services)
- [ ] Advanced workflow automation
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] AI-powered demand forecasting
- [ ] IoT integration for manufacturing
- [ ] Advanced supply chain optimization
- [ ] Customer portal
- [ ] Vendor portal

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 10 GB free space
- **Database**: MySQL 8.0+
- **Node.js**: v16+

### Recommended Requirements
- **CPU**: 4 cores, 2.5 GHz
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **Database**: MySQL 8.0+ with dedicated server
- **Node.js**: v18+

---

**Built with ❤️ for Pashion Clothing Factory**
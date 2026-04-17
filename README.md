# RecycLinkSL_Backend

REST API backend for **RecycLinkSL** - a web-based recycling collection and citizen engagement system for Urban Councils in Sri Lanka  
Final Year Project (IIT/UoW) 
Author: Thenahandi Sandali Sawmindi De Silva


## Tech Stack

- Node.js ≥ 18
- Express.js
- TypeScript
- MongoDB + Mongoose ODM
- JWT + bcrypt + Passport.js
- dotenv (environment variables)
- Development: ts-node-dev + TypeScript
- SMSLenz for sms notifications

## Folder Structure

Modular Folder Structure
----------------------------
`
├── src/
│   ├── common/                  # Application utilities
│   │   ├── application-error.ts
│   │   ├── logging.ts
│   │   ├── util.ts
│   │   └── validation.ts
│
│   ├── dao/                     # Data Access Objects (DAOs)
│   │   ├── admin-dao.ts
│   │   ├── category-dao.ts
│   │   ├── collection-dao.ts
│   │   ├── collector-assignment-dao.ts
│   │   ├── customer-dao.ts
│   │   ├── installment-dao.ts
│   │   ├── pickup-request-dao.ts
│   │   ├── price-management-dao.ts
│   │   ├── schedule-dao.ts
│   │   ├── upload-dao.ts
│   │   └── user-dao.ts│
│   ├── dao/                     # Data Access Objects (DAOs)
│   │   ├── admin-dao.ts
│   │   ├── category-dao.ts
│   │   ├── collection-dao.ts
│   │   ├── collector-assignment-dao.ts
│   │   ├── customer-dao.ts
│   │   ├── installment-dao.ts
│   │   ├── pickup-request-dao.ts
│   │   ├── price-management-dao.ts
│   │   ├── schedule-dao.ts
│   │   ├── upload-dao.ts
│   │   └── user-dao.ts
│
│   ├── end-point/             # Route Definitions
│   │   ├── admin-ep.ts     
│   │   ├── admin-panel-ep.ts  
│   │   ├── citizen-ep.ts
│   │   ├── collector-ep.ts
│   │   ├── upload-ep.ts
│   │   ├── user-ep.ts
│    
│   ├── middleware/            # Auth, error handling, role verification
│   │   ├── authentication.ts
│   │   ├── error-handle.ts
│   │   ├── jwt-token.ts
│   │   ├── request-logger.ts 
│   │   ├── response-handler.ts
│   │   ├── verify-permission.ts
│   │   └── verify-role.ts   
│   
│   ├── models/            # Mongoose Models 
│   │   ├── admin-model.ts
│   │   ├── audit-log-model.ts
│   │   ├── category-model.ts
│   │   ├── collection-model.ts
│   │   ├── collector-assignment-model.ts
│   │   ├── pickup-request-model.ts
│   │   ├── price-management-model.ts
│   │   ├── schedule-model.ts
│   │   ├── upload-model.ts
│   │   └── user-model.ts 
│ 
│   ├── routes/                  # Express route files
│   │   ├── admin-panel.ts
│   │   ├── admin.ts
│   │   ├── index.ts
│   │   └── user.ts
│   
│   ├── schemas/                 # Mongoose schemas
│   │   ├── sub-schema/
│   │   └── *.schema.ts
│   
│   ├── seed/                
│   │   ├── seed-runner.ts
│   │   ├── seed.ts
│   │   └── user-seed.ts
│   
│   ├── services/                # Business logic & external services
│   │   ├── sms-notifications.ts
│   │   └── sms.ts
│
│   ├── startup/                 # Startup configuration
│   │   ├── database.ts
│   │   └── passport.ts
│
│   │
│   ├── config.ts
│   ├── global.config.ts         
│   └── server.ts                # Main Express app entry point
│
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── tslint.json
├── README.md

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository and navigate to the backend folder

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp  .env
```

4. Run seed data (Optional)
```bash
npm run seed
```

### Development Commands

- **Start production server:**
  ```bash
  npm start
  ```

### API Base URL
http://localhost:3010
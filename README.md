# RecycLinkSL_Backend

REST API backend for **RecycLinkSL** — a web-based recycling collection and citizen engagement system for Urban Councils in Sri Lanka  
Final Year Project (IIT/UoW) 


## Tech Stack

- Node.js ≥ 18
- Express.js
- TypeScript
- PostgreSQL (via `pg`)
- CORS
- dotenv (environment variables)
- Development: ts-node-dev

## Folder Structure (Current – IPD Stage)

Modular MVC Folder Structure
----------------------------
`
├── src/
│   ├── config/
│   │   ├── db.ts                  # Database connection pool
│   │   └── index.ts               # App-wide config
│
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.model.ts      # DB queries
│   │   │   ├── auth.service.ts    # Business logic
│   │   │   ├── auth.controller.ts # Request/response handling
│   │   │   └── auth.route.ts      # Express router
│   │   │
│   │   ├── categories/
│   │   │   ├── categories.model.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── categories.controller.ts
│   │   │   └── categories.route.ts
│   │   │
│   │   ├── pickups/
│   │   │   ├── pickups.model.ts
│   │   │   ├── pickups.service.ts
│   │   │   ├── pickups.controller.ts
│   │   │   └── pickups.route.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.model.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.route.ts
│   │   │
│   │   └── collectors/
│   │       ├── collectors.model.ts
│   │       ├── collectors.service.ts
│   │       ├── collectors.controller.ts
│   │       └── collectors.route.ts
│
│   ├── middleware/
│   │   ├── authMiddleware.ts      # JWT / role checks
│   │   ├── errorHandler.ts        # Global error handling
│   │   └── validationMiddleware.ts # Input validation
│
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── helpers.ts             # Earnings calc, date utils
│   │   └── notifications.ts       # Nodemailer / Twilio helpers
│
│   ├── routes/
│   │   └── index.ts               # Combines all module routes
│
│   ├── types/
│   │   └── environment.d.ts       # Type-safe env variables
│
│   └── server.ts        # App entry point (main Express setup)
│
├── uploads/                       # uploaded images/docs
├── logs/                          # log files
├── dist/                          # TypeScript build output
├── .env
├── .gitignore
├── tsconfig.json
├── nodemon.json                   
├── package.json
└── package-lock.json
`

## Development Setup

### Prerequisites
- Node.js (v16.18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

### Development Commands

- **Development server with hot reload:**
  ```bash
  npm run dev
  ```

- **Build TypeScript to JavaScript:**
  ```bash
  npm run build
  ```

- **Start production server:**
  ```bash
  npm start
  ```

- **Watch mode for TypeScript compilation:**
  ```bash
  npm run dev:watch
  ```

### Environment Variables

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# API Security (Optional)
API_KEY="your-api-key"
JWT_SECRET="your-jwt-secret"
```
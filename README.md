# Patient Frontend Application


## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Installation

Follow these steps to set up and run the application:

### 1. Create `.env` File

Create a `.env` file in the root directory with the necessary environment variables:

```bash
# Example environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000
```

You can copy from `.env.example` if available, or create your own based on your configuration needs.

### 2. Install Dependencies

Install all project dependencies using npm:

```bash
npm install
```

This will install all packages listed in `package.json` and create a `package-lock.json` file.

### 3. Build the Project

Build the Next.js application for production:

```bash
npm run build
```

### 4. Start the Application

Start the production server:

```bash
npm start
```

The application will be available at `http://localhost:3000` by default.

## Development

To run the application in development mode with hot reloading:

```bash
npm run dev
```

The development server will typically run on `http://localhost:3000`


## Troubleshooting

### Port already in use

If port 3000 or 3001 is already in use, you can specify a different port:

```bash
# Development
npm run dev -- -p 3002

# Production
npm start -- -p 3002
```

### Clear cache

If you encounter issues, try clearing Next.js cache:

```bash
rmdir /s /q .next
npm install
npm run build
```

## Contribution
  1. นพณัช สาทิพย์พงษ์ besterOz
  2. พงศธร รักงาน prukngan
  3. ภวัต เลิศตระกูลชัย Phawat Loedtrakunchai
  4. ธฤต จันทร์ดี tharitpr



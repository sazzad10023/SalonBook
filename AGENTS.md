# SalonBook

SalonBook is a salon service booking platform that allows customers to explore salon services, book appointments, and manage their bookings. It also provides a dashboard for managing services, appointments, and users.

## Features

- User authentication and authorization
- Browse available salon services
- View service details
- Book salon appointments
- Manage and cancel pending appointments
- Customer dashboard
- Admin dashboard
- Appointment and payment status management
- Role-based access control

## Technology Stack

### Client
- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Better Auth

### Server
- Node.js
- Express.js
- MongoDB
- TypeScript / JavaScript
- JWT Authentication

## Installation Instructions

Clone the client and server repositories separately.

### 1. Clone Client Repository

```bash
git clone <CLIENT_REPOSITORY_URL>
cd <CLIENT_PROJECT_FOLDER>
pnpm install
```

### 2. Clone Server Repository

```bash
git clone <SERVER_REPOSITORY_URL>
cd <SERVER_PROJECT_FOLDER>
pnpm install
```

## Run the Project Locally

### Start the Server

```bash
cd <SERVER_PROJECT_FOLDER>
npm install
npm run dev
```

### Start the Client

```bash
cd <CLIENT_PROJECT_FOLDER>
npm install
npm run dev
```

Open the following URL in your browser:

```text
http://localhost:3000
```

## Environment Variables

Create `.env` files in both client and server projects.

### Client Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

### Server Environment Variables

```env
PORT=
MONGODB_URL=
CLIENT_URL=
```

**Note:** Never commit `.env` files or expose secret values publicly.

## Live Website

- Live Website: https://salon-book-phi.vercel.app
## Repository Links

- Client Repository: https://github.com/sazzad10023/SalonBook
- Server Repository: https://github.com/sazzad10023/Salon-server

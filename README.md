# Infra-backend (InfraVision CMS)

Welcome to the **InfraVision Backend**! This project is the engine behind the InfraVision platform, providing a comprehensive Content Management System (CMS) for homepage content, research papers, blog posts, team management, and more.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: installed on your machine.
- **Yarn** or **NPM**: for package management.
- **MongoDB**: A running instance (local or Atlas cluster).

### Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   # No need to cd since you are already in the project directory
   ```

2. **Install Dependencies**:

   ```bash
   yarn install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory. You can use the `env.template` as a starting point.

   ```env
   DATABASE_URL="mongodb+srv://..."
   JWT_SECRET="your_secret_key"

   # Optional: Initial SuperAdmin Configuration
   SUPERADMIN_EMAIL="admin@infravision.com"
   SUPERADMIN_PASSWORD="YourStrongPassword123"
   SUPERADMIN_NAME="Main Admin"
   ```

4. **Synchronize Database Schema**:
   Prisma needs to generate its client and push the schema to MongoDB.

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Server**:
   ```bash
   yarn start:dev
   ```
   Server runs on [http://localhost:4000](http://localhost:4000).

---

## 🔑 Initial Access

- **Automatic Seeding**: On the first run, the project automatically creates a **SuperAdmin** account. If you didn't specify credentials in your `.env`, the system uses these defaults for safety during development:
  - **Email**: `superadmin@admin.com`
  - **Password**: `SuperAdmin@123`
- **Swagger Documentation**: Explore all API endpoints and test them directly at [http://localhost:4000/docs](http://localhost:4000/docs).
- **Admin Panel**: The built-in admin interface is served at [http://localhost:4000/admin](http://localhost:4000/admin) (requires the `client/dist` folder to be present).

---

## 🛠 Project Architecture

This project is built using **NestJS** and **Prisma**.

### 1. NestJS Core Concepts (For Node Developers)

NestJS adds structure to Node apps. You'll work with three main file types:

- **Modules (`.module.ts`)**: The unit of organization. Every feature (like `Blog`) has its own module.
- **Controllers (`.controller.ts`)**: Define your API routes (e.g., `@Get('/blogs')`).
- **Services (`.service.ts`)**: The logical heart. Use these to fetch data from the database.

### 2. Prisma (The Database Layer)

Prisma is our **ORM**. Instead of writing raw MongoDB queries, we define our models in `prisma/schema.prisma` and use the generated `PrismaClient`.

- Edit `schema.prisma` -> run `npx prisma db push` -> use `prisma.modelName.findMany()` in your code.

### 3. Modular Structure

The `src/` directory is organized by feature:

- `src/auth/`: Security, login, and JWT logic.
- `src/homepage/`: Dynamic content management for the main site.
- `src/knowledge/`: Management of Blogs, Research Papers, and Videos.
- `src/teams/`: CRUD for Advisors, Fellows, Patrons, Team members, and Trustees.
- `src/common/`: Reusable logic like file uploading.

---

## 📂 Useful Tools

- **Prisma Studio**: View and edit your database in a browser-based GUI.
  ```bash
  yarn prisma:studio
  ```
- **File Uploads**: Static assets (images/PDFs) are stored in the `assets/` directory and served at `/assets/<filename>`.

---

## 📜 Available Scripts

- `yarn dev`: Start development server with hot-reload.
- `yarn build`: Create a production build.
- `yarn lint`: Check code quality.
- `yarn setup`: One-time setup command (install + generate + push).

# CEER Department Resource Management System

A comprehensive digital platform designed to streamline operations for the **Centre for Energy and Environmental Resources (CEER)**. This full-stack web application digitizes departmental workflows, enabling seamless interaction between students, faculty, lab in-charges, and administrators.

## Usage & Goal

The primary goal of this system is to replace manual paper-based processes with an efficient, transparent, and digital solution. It facilitates:
- **Resource Management:** Tracking lab materials, equipment availability, and consumption.
- **Academic Workflows:** simplifying team formation, project approvals, and Bill of Materials (BOM) submissions.
- **Sustainability Tracking:** Monitoring carbon footprint and energy usage for student projects.

## Tech Stack

### Frontend
- **Framework:** [React 18](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Premium, responsive design with Glassmorphism effects)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State/API:** Context API, Axios

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) & Google OAuth 2.0
- **File Storage:** Cloudinary (for image management)
- **Email:** Nodemailer (for notifications)

### DevOps & Tools
- **Containerization:** Docker & Docker Compose
- **Monitoring:** Prometheus & Grafana (System health & metrics)

---

##  Key Features by Role

### Student
- **Dashboard:** Personalized view of active projects, teams, and requests.
- **BOM Management:** Create and submit Bill of Materials for approval.
- **Resource Tracking:** Monitor generic energy consumption and carbon footprint of projects.
- **Team Formation:** Invite peers and form project teams digitally.
- **Equipment Requests:** Check availability and request lab machinery.

### Faculty
- **Digital Approvals:** Review and approve/reject Student BOMs and Team requests.
- **Team Oversight:** View detailed information about student teams under their mentorship.
- **Profile Management:** Secure login and profile updates.

### Lab In-Charge
- **Inventory Control:** Manage stock levels for consumables and materials.
- **Request Processing:** Validate and issue approved materials to students.
- **Equipment Management:** Oversee machine availability and maintenance status.

### Admin
- **Centralized Dashboard:** Real-time analytics on system usage, users, and resources.
- **User Management:** Bulk registration and role management for all users.
- **System Configuration:** Manage department assets, events, and master data.

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker (Optional, for containerized setup)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/webtech-ceer.git
cd webtech-ceer
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory with the following keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server will start on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Application will run on http://localhost:5173
```

## Project Structure

```
Webtech_CEER/
├── backend/                # Express API Server
│   ├── config/             # Database & External Service Configs
│   ├── controllers/        # Route Logic (Admin, Auth, BOM, etc.)
│   ├── models/             # Mongoose Schemas (User, Team, Material, etc.)
│   ├── routes/             # API Routes
│   ├── middleware/         # Auth & Error middlewares
│   └── ...
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Full Page Views (Dashboard, Login, etc.)
│   │   ├── context/        # Global State (AuthContext)
│   │   └── ...
├── docker-compose.yml      # Container Orchestration
└── ...
```
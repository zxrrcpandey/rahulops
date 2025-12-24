# RahulOps

<div align="center">
  <img src="https://via.placeholder.com/120x120/4F46E5/FFFFFF?text=RO" alt="RahulOps Logo" width="120" height="120" style="border-radius: 24px;" />
  
  <h3>ERPNext Multi-Tenant Deployment & Management Platform</h3>
  
  <p>Deploy, manage, and scale ERPNext instances across multiple servers with ease.</p>

  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
  ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
  ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
</div>

---

## ✨ Features

### 🖥️ Server Management
- Add and manage multiple Hostinger VPS servers
- Real-time health monitoring (CPU, RAM, Disk)
- One-click server setup with automated script
- SSH key-based secure connections

### 🌐 Site Deployment
- 5-step deployment wizard
- 22+ ERPNext ecosystem apps supported
- Custom domain & subdomain support
- Automatic SSL certificate setup via Certbot
- Per-site app activation

### 👥 Client Management
- Complete client database
- Multiple sites per client
- Contact information & notes
- Subscription tracking

### 💰 Billing & Auto-Suspension
- Subscription management
- **Automatic site suspension** on payment overdue
- Configurable grace period
- Payment reminder emails
- One-click reactivation

### 💾 Backup Management
- Full, database, or files-only backups
- Scheduled backups (daily, weekly, monthly)
- Remote storage support (S3, GCS)
- One-click restore
- Retention policies

### 📊 Dashboard & Analytics
- Real-time statistics
- Server health overview
- Recent activity feed
- Expiring subscription alerts

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Background Jobs** | Trigger.dev |
| **Email** | Resend |
| **DNS** | Cloudflare API |
| **Hosting** | Vercel |

### 💸 100% Free Tier Compatible

| Service | Free Tier |
|---------|-----------|
| Vercel | Unlimited deployments, 100GB bandwidth |
| Supabase | 500MB database, 50K auth users |
| Trigger.dev | 10,000 job runs/month |
| Resend | 3,000 emails/month |
| Cloudflare | Unlimited DNS |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Trigger.dev account
- Hostinger VPS (or any Ubuntu server)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/rahulops.git
cd rahulops
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Trigger.dev
TRIGGER_API_KEY=your_trigger_api_key
TRIGGER_API_URL=https://api.trigger.dev

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Cloudflare (Optional)
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
SSL_EMAIL=admin@yourdomain.com
```

### 3. Database Setup

```bash
# Run the schema in Supabase SQL Editor
# Copy contents of supabase/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📁 Project Structure

```
rahulops/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard home
│   │   ├── servers/           # Server management
│   │   ├── clients/           # Client management
│   │   ├── sites/             # Site management
│   │   ├── backups/           # Backup management
│   │   ├── billing/           # Billing & subscriptions
│   │   ├── activity/          # Activity log
│   │   └── settings/          # System settings
│   ├── api/                   # API routes
│   └── login/                 # Authentication
├── scripts/
│   ├── server-setup.sh        # One-time server setup
│   ├── site-deploy.sh         # Site deployment script
│   └── backup-manager.sh      # Backup operations
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── ssh.ts                 # SSH connection helper
│   └── database.types.ts      # TypeScript types
├── trigger/
│   └── jobs.ts                # Background jobs
├── supabase/
│   └── schema.sql             # Database schema
└── docs/
    └── TESTING-GUIDE.md       # Testing documentation
```

---

## 📱 Supported Apps (22+)

### Core
- **ERPNext** - Complete ERP with Accounting, Inventory, Sales, Purchase

### Standard
- **HRMS** - Payroll, Attendance, Leaves
- **Payments** - Razorpay, Stripe, PayPal integration
- **Webshop** - E-commerce storefront
- **India Compliance** - GST, e-Invoice, e-Waybill

### Industry
- **Healthcare** - Patient management, Clinical records
- **Education** - Student management, Admissions
- **Lending** - Loan management, EMI
- **Hospitality** - Hotel & restaurant
- **Agriculture** - Farm management
- **Non-Profit** - Donor management, Grants

### Productivity
- **CRM** - Customer relationship management
- **Helpdesk** - Support ticketing
- **Wiki** - Knowledge base
- **LMS** - Learning management
- **Gameplan** - Project collaboration

### Builder
- **Print Designer** - Visual print formats
- **Insights** - Business analytics
- **Builder** - Website builder
- **Drive** - Cloud file storage

---

## 🔒 Security

- **SSH Key Authentication** - No passwords stored
- **Database Encryption** - Sensitive data encrypted
- **Row Level Security** - Supabase RLS policies
- **HTTPS Only** - All communications encrypted
- **Audit Logging** - Complete activity trail

---

## 📖 Documentation

- [Testing Guide](docs/TESTING-GUIDE.md) - How to test the scripts
- [API Reference](docs/API.md) - API documentation (coming soon)
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment (coming soon)

---

## 🔄 Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      RahulOps Dashboard                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Team member fills deployment form (5-step wizard)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. API creates site record + deployment job in Supabase    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Trigger.dev job queued and started                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SSH to server → Run site-deploy.sh script               │
│     • Create new site                                       │
│     • Install selected apps                                 │
│     • Configure nginx                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Setup SSL via Certbot (if custom domain)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Save credentials (encrypted) to Supabase                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Email handover document to client                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Rahul** - [GitHub](https://github.com/yourusername)

---

<div align="center">
  <p>Built with ❤️ for the ERPNext community</p>
  <p><strong>RahulOps</strong> - Deploy ERPNext at Scale</p>
</div>

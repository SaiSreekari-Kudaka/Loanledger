# LoanLedger
### A Role-Based Loan Management & Repayment Tracking Platform

**LoanLedger** is a full-stack loan management platform designed to centralize loan records, simplify repayment tracking, and support NGO-led beneficiary management.

Built around two distinct user experiences, the platform enables individuals to manage their personal loan information while allowing NGO teams to organize beneficiaries, maintain repayment records, and monitor loan activity through a dedicated management dashboard.

The project focuses on structured financial record-keeping, role-based access, data visibility, and an intuitive interface that makes loan information easier to understand and manage.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Core Features](#core-features)
- [Application Roles](#application-roles)
- [Technical Architecture](#technical-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Security Considerations](#security-considerations)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Production Build](#production-build)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)

---

## Project Overview

Managing loans involves more than knowing the borrowed amount. Individuals need to understand repayment schedules, track outstanding balances, review interest costs, and maintain accurate payment histories.

For NGOs supporting communities with limited access to formal financial record-keeping, maintaining beneficiary loan information and monitoring repayment activity can also become difficult when records are scattered across spreadsheets or physical documents.

LoanLedger addresses these challenges through a centralized application with two primary workflows:

**Individual Loan Management**
- Maintain personal loan records.
- Calculate estimated EMI and repayment amounts.
- Compare available loan options.
- Record repayments and monitor outstanding balances.
- Review financial summaries and repayment history.

**NGO Loan Monitoring**
- Organize and manage beneficiary information.
- Maintain loan records associated with beneficiaries.
- Record and verify repayment activity.
- Monitor repayment progress and loan statuses.
- Access consolidated operational reports.

The platform is designed to make financial information more structured, accessible, and easier to monitor.

---

## Problem Statement

Loan information is frequently maintained across different sources, making it difficult to establish a clear picture of repayment progress.

Common challenges include:

- Fragmented loan and repayment records.
- Difficulty calculating and understanding repayment obligations.
- Limited visibility into outstanding loan balances.
- Manual tracking of beneficiary repayment activity.
- Challenges identifying overdue or defaulted loans.
- Lack of centralized reporting for NGO operations.

LoanLedger provides a unified application to organize these workflows and improve visibility into loan-related information.

## Objectives

The primary objectives of the project are:

1. **Centralized Record Management** — Maintain loan details and repayment history in one place.
2. **Financial Clarity** — Present loan amounts, interest information, repayments, and outstanding balances clearly.
3. **Repayment Tracking** — Maintain structured records of repayment transactions.
4. **Beneficiary Monitoring** — Give NGOs an organized way to monitor loans associated with beneficiaries.
5. **Role-Based Workflows** — Separate individual and NGO functionality according to user roles.
6. **Usable Interface** — Provide a consistent, responsive interface with accessible light and dark themes.

---

## Core Features

### 1. Individual Dashboard

A centralized overview of an individual's loan activity.

- View recorded loans and their current status.
- Monitor total borrowed amounts.
- Track amounts repaid and outstanding balances.
- Review repayment progress.
- Access relevant financial summaries and visualizations.

### 2. Loan Calculator

A financial calculation tool for understanding estimated loan repayments.

- Calculate monthly EMI.
- Use principal amount, interest rate, and loan tenure as inputs.
- Estimate total repayment and interest payable.
- Help users understand the financial implications of different loan terms.

### 3. Loan Comparison

A structured way to evaluate available loan options.

- Review available loan information.
- Compare interest rates and repayment details.
- Examine estimated EMI values.
- Make more informed comparisons between loan options.

### 4. Loan Logbook

A centralized record of loans and their associated repayment activity.

- Maintain individual loan records.
- Review loan details and repayment information.
- Track the amount paid and remaining balance.
- Maintain a chronological payment history.
- Access recorded loan information from a single interface.

### 5. Repayment Management

Structured recording of repayment transactions.

- Record repayment amounts.
- Maintain payment dates and transaction history.
- Update repayment totals based on recorded transactions.
- Monitor repayment progress.
- Maintain visibility into outstanding amounts.

### 6. NGO Management Dashboard

A dedicated interface for NGO administrators and staff.

- View and organize beneficiary information.
- Manage loans associated with beneficiaries.
- Monitor repayment activity across beneficiaries.
- Record payments reported by beneficiaries.
- Track active, completed, overdue, or defaulted loan statuses where supported.
- Review consolidated loan and repayment information.

**Important workflow distinction:** NGOs use LoanLedger to record, verify, and monitor repayments made by beneficiaries. The platform is intended to support repayment tracking, not to represent NGOs as the entities making loan payments.

### 7. Reports & Analytics

Visual summaries to support better understanding of loan activity.

- Review repayment-related statistics.
- Examine loan distribution and progress.
- Monitor beneficiary and loan information.
- Use charts and summaries to interpret financial records.

### 8. Authentication & Role-Based Access

The application supports separate user experiences based on assigned roles.

- Supabase-based authentication.
- Individual user access.
- NGO administrator access.
- NGO staff access.
- Database-level access policies through Supabase Row Level Security.

### 9. User Interface

Designed around clarity, consistency, and usability.

- Responsive dashboard layout.
- Light and dark themes.
- Consistent navigation and reusable UI components.
- Interactive charts and data presentation.
- Restrained transitions and visual feedback.
- Readable interface contrast across themes.

---

## Application Roles

LoanLedger organizes functionality around three application roles.

| Role | Responsibilities |
|---|---|
| `USER` | Manages personal loans, calculates EMI, compares loan options, and maintains repayment records. |
| `NGO_ADMIN` | Oversees NGO operations, manages beneficiaries, and monitors associated loan records. |
| `NGO_STAFF` | Supports beneficiary management and records or monitors repayment activity according to assigned access. |

Role-based workflows help separate personal financial management from NGO operational responsibilities.

---

## Technical Architecture

LoanLedger follows a frontend-and-backend-as-a-service architecture.

The React frontend handles application rendering, navigation, user interactions, and presentation of financial information. Supabase provides authentication, PostgreSQL database functionality, and database-level access control.

### Architecture Overview

```text
                 LOANLEDGER
                      |
                      |
             React Application
                      |
          +-----------+-----------+
          |           |           |
       USER UI     NGO UI     Shared UI
          |           |           |
          +-----------+-----------+
                      |
              Application Hooks
                      |
               Supabase Client
                      |
          +-----------+-----------+
          |           |           |
     Supabase Auth  PostgreSQL   RLS
          |           |           |
          +-----------+-----------+
                      |
               Application Data
```

### Architectural Responsibilities

| Layer | Responsibility |
|---|---|
| Presentation | React components, dashboards, forms, navigation, and visualizations. |
| Application Logic | Custom hooks for authentication, loan operations, bank information, and NGO workflows. |
| Backend Services | Supabase authentication and database services. |
| Database | PostgreSQL tables for application entities and transaction records. |
| Access Control | Row Level Security policies for database-level authorization. |

---

## Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend | React | Component-based user interface |
| Build Tool | Vite | Development server and production bundling |
| Language | JavaScript | Application logic |
| Styling | Tailwind CSS | Utility-based styling |
| Styling | Custom CSS | Application design system and themes |
| Backend Platform | Supabase | Backend services |
| Database | PostgreSQL | Persistent application data |
| Authentication | Supabase Auth | User authentication |
| Database Security | Supabase RLS | Row-level access control |
| Data Visualization | Recharts | Charts and financial insights |
| Icons | Lucide React | Interface icons |
| Version Control | Git and GitHub | Source control and collaboration |

---

## Project Structure

The project follows a component-oriented structure to separate interface elements, application logic, and backend configuration.

```text
LoanLedger/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── ngo/
│   │   └── shared/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │
│   ├── styles/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── supabase/
│   └── schema.sql
│
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── vite.config.js
├── .gitignore
└── README.md
```

*Note: This is a structural overview. Some folders or files may differ depending on the current project version.*

---

## Database Design

Supabase PostgreSQL is used to maintain the application's structured data.

The project schema includes tables for the following entities:

| Table | Purpose |
|---|---|
| `profiles` | User profile and role information |
| `banks` | Bank information |
| `loans` | Loan records and associated details |
| `beneficiaries` | NGO beneficiary information |
| `ngo_loans` | Loan associations and NGO management records |
| `payments` | Repayment transaction records |

The database schema also defines access policies and supporting database functionality.

The database design separates loan information, beneficiary associations, and repayment transactions to support organized data management.

---

## Security Considerations

Security is an important consideration because LoanLedger handles financial records and user-specific information.

The application uses Supabase services and database access policies as part of its security architecture.

Important deployment considerations:

- Store project credentials in environment variables.
- Never commit `.env` files.
- Never expose Supabase service-role keys in frontend code.
- Apply restrictive Row Level Security policies to sensitive tables.
- Ensure users cannot modify their own privileged role assignments.
- Validate authorization on sensitive operations.
- Review NGO and beneficiary access boundaries before production deployment.

**Note:** Database security depends on the correctness of the configured policies. These considerations should be reviewed before using real financial or personal information.

---

## Getting Started

Follow these steps to run LoanLedger locally.

### Prerequisites

Make sure the following are available:

- Node.js (compatible with the project dependencies).
- npm.
- Git.
- A Supabase project with database access.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/LoanLedger.git
cd LoanLedger
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholders with the corresponding values from your Supabase project.

The variable names must match the names referenced in the Supabase client configuration.

### 4. Configure Supabase Database

1. Open your Supabase project.
2. Navigate to the SQL Editor.
3. Open `supabase/schema.sql` from the repository.
4. Review the SQL statements and policies.
5. Execute the schema in the appropriate project database.

Make sure the database schema and frontend configuration are consistent.

### 5. Start the Development Server

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

The default URL is generally:

```text
http://localhost:5173
```

---

## Production Build

To generate an optimized production build:

```bash
npm run build
```

The generated files will be available in:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

---

## Future Enhancements

Potential areas for continued development include:

- Automated repayment reminders and notifications.
- Enhanced beneficiary communication workflows.
- More detailed repayment history and analytics.
- Advanced loan comparison and filtering.
- Improved reporting and export capabilities.
- Additional audit and verification workflows.
- Expanded accessibility and mobile usability.
- Stronger automated testing of financial calculations and role-based permissions.

---

## Disclaimer

LoanLedger is a software project intended for loan record management, repayment tracking, and NGO beneficiary support.

Financial calculations are estimates and should not be considered professional financial advice. Loan terms, interest rates, and repayment obligations should always be verified with the relevant financial institution.

The application should be security-reviewed and tested before being used with real financial or personal information.

---

## Author & Project

**LoanLedger** — Full-Stack Loan Management Platform

Developed as a software engineering project focused on practical financial management, role-based application architecture, and accessible digital record-keeping.

**Built with React, Vite, and Supabase.**
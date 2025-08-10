# ROBLEKA Pedidos - Sistema de Gestión de Pedidos

## Overview

ROBLEKA Pedidos es un sistema integral de gestión de pedidos especializado en artículos de papelería como agendas, libretas, etiquetas y tarjetas. Proporciona una solución completa para gestionar pedidos, seguimiento de clientes, control de pagos y análisis del rendimiento del negocio. La aplicación cuenta con una interfaz web moderna con análisis del dashboard, gestión del ciclo de vida de pedidos, calendario de seguimiento y capacidades de seguimiento financiero.

## User Preferences

Preferred communication style: Simple, everyday language.
Business focus: Artículos de papelería (agendas, libretas, etiquetas, tarjetas)
Color scheme: Azules oscuros, morados, violetas
Calendar function: Mostrar fechas de pedidos (no entregas)

## System Architecture

### Frontend Architecture
- **React-based SPA**: Built with React 18 using functional components and hooks
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for request logging and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **File Upload**: Multer middleware for handling product image uploads with size and type validation
- **Development Integration**: Vite middleware integration for seamless development experience

### Data Storage Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Design**: 
  - Customers table with contact information and addresses
  - Orders table with product details, pricing, and delivery information
  - Enum types for order status (pending, in_progress, completed) and payment methods (delivery, advance, full)
  - Foreign key relationships between customers and orders
- **File Storage**: Local file system storage for product images with organized directory structure

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store using connect-pg-simple
- **Legacy User System**: Basic user authentication structure exists but appears unused in current implementation
- **Security**: CORS handling and request validation middleware

### API Design
- **RESTful Endpoints**: 
  - `/api/orders` - CRUD operations for order management with filtering capabilities
  - `/api/customers` - Customer data management
  - `/api/dashboard/*` - Analytics and reporting endpoints
- **Data Validation**: Zod schemas for request/response validation and type safety
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **File Handling**: Dedicated endpoints for image upload and serving

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **UI Components**: Radix UI component primitives, Lucide React icons
- **Styling**: Tailwind CSS with PostCSS processing
- **Validation**: Zod for schema validation and type inference

### Backend Dependencies  
- **Express.js**: Core web framework with middleware support
- **Database**: Drizzle ORM, Neon Database serverless PostgreSQL
- **File Processing**: Multer for multipart form handling
- **Session Management**: Express session with PostgreSQL store
- **Development**: TSX for TypeScript execution, ESBuild for production builds

### Build and Development Tools
- **Vite**: Development server and build tool with React plugin
- **TypeScript**: Type checking and compilation
- **Replit Integration**: Runtime error overlay and cartographer plugins for development environment
- **Chart.js**: Data visualization for dashboard analytics

### Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database schema management and migrations
- **WebSocket Support**: Connection handling for real-time database features
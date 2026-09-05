# Qindil Apologetics — Platform & Operations Suite

> **Illuminating Truth, Defending Faith.**  
> A full-stack, enterprise-grade Islamic apologetics platform and internal operations system designed for scholarly research, article publishing, event management, and team production workflows.

---

## 🌟 Executive Summary

**Qindil Apologetics** is a dual-world web application built to serve both public readers and an internal 32-person research team:

1. **Public Research Platform**: Delivers peer-reviewed articles, theological refutations, comparative religion studies, and event schedules to truth-seekers worldwide. Features full SEO optimization, structured JSON-LD schemas, adaptive light/dark branding, and responsive web design.
2. **Internal Operations Suite (Qindil Ops)**: Provides a centralized management portal with fine-grained Role-Based Access Control (RBAC), multi-stage video production Kanban boards, task assignment workflows, audit logging, and automated notifications.

---

## 🛠️ Architecture & Tech Stack

### Frontend Architecture
- **Core Framework**: React 18 + Vite with TypeScript
- **State Management**: Zustand (Persisted stores for authentication and theme preference)
- **Styling & Design System**: Tailwind CSS v3 with HSL/RGB custom property tokenization, adaptive Light/Dark mode switching, and custom typography (Google Inter)
- **Animations & Micro-interactions**: Framer Motion
- **Rich Text & Content Rendering**: Tiptap Editor & Custom HTML Content Renderer
- **Data Fetching & Caching**: TanStack React Query v5

### Backend Architecture
- **Runtime & Server**: Node.js + Express with TypeScript
- **Database**: MongoDB with Mongoose ODM (17+ schemas)
- **Security Standards**: Helmet HTTP headers, CORS policies, MongoSanitize, HPP, JWT HTTP-only cookie rotation, and granular permission guards
- **Integrations**: Cloudinary Media API, Resend Transactional Email Engine, and Telegraf Bot API for real-time Telegram alerts

---

## ✨ Key System Features

- **Adaptive Brand Identity**: Custom SVG emblem and typography with dynamic Light/Dark theme persistence and prefers-color-scheme favicons.
- **Granular RBAC Security**: Multi-tier permissions across Public Readers, Team Members, Admins, and SuperAdmins.
- **Production Board Kanban**: 6-stage video production workflow (Idea → Scripting → Filming → Editing → Review → Published) with mobile stage-tab viewports.
- **System Audit Log**: Full security audit trail tracking administrative actions, role modifications, and content status transitions.
- **Search Engine Discoverability**: Automated XML sitemap generation, structured JSON-LD schemas (`Organization`, `Article`, `Event`, `WebSite`), and meta tag optimization.

---

## 👨‍💻 About the Developer

Designed, architected, and built by **Aymen**.

---

## 📄 License & Terms

This repository is proprietary software. All rights reserved. See `LICENSE` for details.

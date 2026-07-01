# Project Description

## AI-Powered Employee Performance & Potential Management using 9-Box Grid Framework

### Overview

This is an enterprise-grade HR Analytics platform built as a portfolio demonstration of full-stack AI engineering. The system evaluates employees using the industry-standard 9-Box Grid framework, combining traditional HR analytics with machine learning prediction and large language model (LLM) integration.

### Core Capabilities

**1. Employee Data Management**
Handles thousands of employee records with comprehensive attributes covering demographics, performance KPIs, attendance, training, and skill assessments. Supports CSV bulk upload (22 raw attributes) with robust validation and type coercion. The three talent labels — `performance_level`, `potential_level`, and `nine_box` — are **not** supplied in the upload; the system predicts them for every record and stores them as the source of truth.

**2. Secure Authentication**
Role-based access control with two tiers: Administrators (full platform access) and Employees (personal profile view). JWT tokens with bcrypt password hashing ensure enterprise-grade security.

**3. HR Analytics Dashboard**
Real-time analytics including salary band distribution, department performance comparisons, gender diversity metrics, 9-box grid heatmaps, and performance level histograms — all rendered with interactive Recharts visualizations.

**4. Machine Learning Prediction**
RandomForest classifiers trained on the raw employee metrics (plus two engineered domain scores) predict each employee's `performance_level` and `potential_level`; the `nine_box` placement is derived from those. Ground-truth labels for training come from the domain scoring engine, which also serves as a cold-start fallback before the model is trained. The model achieves high accuracy (typically 95–99%, scaling with dataset size) due to the structured nature of HR performance data. Includes full metrics: accuracy, precision, recall, F1 score, per-level accuracy, and confusion matrix.

**5. AI Recommendation Engine**
A hybrid system combining:
- Rule-based strategies (10 per 9-box position, covering career recovery to executive acceleration)
- LLM personalization via Ollama to generate context-specific additions based on the employee's actual profile

**6. Conversational AI Chatbot**
An HR-specialized chatbot powered by a local Ollama model (default `phi3:mini`, configurable) that assists with performance improvement, promotion roadmaps, skill development, and career guidance. Supports token streaming for responsive replies, persists and reloads conversation history, and falls back gracefully to curated responses when Ollama is unavailable.

### Technical Architecture

The system follows a clean separation of concerns:
- **Backend**: FastAPI with modular routers per domain (auth, employees, analytics, ML, recommendations, chatbot)
- **Database**: SQLite by default (zero-config) with SQLAlchemy ORM; PostgreSQL supported via `DATABASE_URL`
- **ML Pipeline**: Scikit-learn Pipelines with ColumnTransformer preprocessing + RandomForest, predicting talent levels from raw metrics
- **Frontend**: Next.js 14 (App Router) with Zustand state management, protected routing, a public landing page, and a fully responsive Tailwind UI (fixed sidebar on desktop, slide-in drawer navigation on mobile)
- **LLM**: Local Ollama inference with streaming, timeout handling, and fallback chains

### Business Value

Organizations using this platform can:
1. Identify high-potential employees for fast-track development
2. Detect at-risk performers early and intervene with targeted plans
3. Make data-driven succession planning decisions
4. Personalize development plans at scale using AI
5. Give employees self-service access to their performance profile and AI coaching

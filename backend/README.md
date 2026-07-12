#Backend Documentation

This document outlines the System Architecture, Database Schema, and API Structure for the SocialPilot platform.

#1. System Architecture

This architecture illustrates how the Next.js frontend, FastAPI backend, databases, and third-party APIs communicate.

```mermaid
graph TD
    %% Entities
    Client[Client Browser/Mobile]
    Frontend[Next.js Frontend]
    Gateway[FastAPI Backend - Main]
    AuthService[Auth / RBAC Module]
    SchedulingService[Content Scheduling Module]
    SocialService[Multi-Platform Publishing Module]
    AnalyticsService[Analytics Dashboard Module]
    
    Databases
    Postgres[(PostgreSQL)]
    Mongo[(MongoDB)]
    
    External
    SocialAPIs((Social Media APIs))

    Connections
    Client <-->|HTTPS| Frontend
    Frontend <-->|REST API / JWT| Gateway
    
    Gateway --> AuthService
    Gateway --> SchedulingService
    Gateway --> SocialService
    Gateway --> AnalyticsService
    
    AuthService <-->|Users, Roles, Campaigns| Postgres
    SchedulingService <-->|Campaign Metadata| Postgres
    SchedulingService <-->|Post Content, Media, Logs| Mongo
    
    SocialService <-->|Publishing via Tokens| SocialAPIs
    AnalyticsService <-->|Fetch Engagement| SocialAPIs


#2. Database Schema (ER Diagram)

The following Entity-Relationship diagram maps out the core relational data stored in PostgreSQL.

erDiagram
    USERS {
        int id PK
        string username
        string email
        string password_hash
        string role "Admin, Creator, Business"
        datetime created_at
    }
    
    SOCIAL_ACCOUNTS {
        int id PK
        int user_id FK
        string platform "Facebook, Twitter, LinkedIn, etc."
        string access_token
        string refresh_token
        datetime token_expires_at
    }
    
    CAMPAIGNS {
        int id PK
        int user_id FK
        string name
        date start_date
        date end_date
        float budget
    }
    
    POSTS {
        int id PK
        int campaign_id FK
        int social_account_id FK
        string status "Draft, Scheduled, Published, Failed"
        datetime scheduled_for
        string mongo_document_id "References Mongo content"
    }

    USERS ||--o{ SOCIAL_ACCOUNTS : "manages"
    USERS ||--o{ CAMPAIGNS : "creates"
    CAMPAIGNS ||--o{ POSTS : "contains"
    SOCIAL_ACCOUNTS ||--o{ POSTS : "publishes to"

# 3. API Structure

The RESTful APIs are modularized via FastAPI Routers.

### Authentication (`/api/v1/auth`)
*   `POST /register` - Create a new user
*   `POST /login` - Authenticate and receive JWT
*   `GET /me` - Get current user profile (Protected)

### Campaigns (`/api/v1/campaigns`)
*   `POST /` - Create a new campaign
*   `GET /` - List user's campaigns
*   `GET /{campaign_id}` - Get campaign details & metrics

### Posts & Scheduling (`/api/v1/posts`)
*   `POST /` - Create/schedule a new post
*   `GET /` - List posts (filterable by status/date)
*   `PUT /{post_id}` - Edit a scheduled post
*   `DELETE /{post_id}` - Cancel a scheduled post

### Analytics (`/api/v1/analytics`) - *To be implemented*
*   `GET /engagement` - Get engagement metrics across platforms
*   `GET /audience` - Get audience growth metrics

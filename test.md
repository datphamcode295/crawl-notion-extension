# FornaxAI Project Info

# Project Summary

| Project title       | FornaxAI                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Industry            | Generative AI                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Project description | Fornax AI provides AI-powered tools to help early-stage startup founders refine their pitch decks. The platform offers instant, actionable feedback on each slide to make presentations more concise and compelling. It provides tailored suggestions to improve content, structure, and design, ensuring effective communication with investors. Targeted at entrepreneurs seeking investment, Fornax AI helps enhance pitch decks even for those with limited experience. The service has proven successful, with users reporting improved fundraising outcomes, including acceptance into Y Combinator. By combining advanced AI with investor insights, Fornax AI empowers startups to present their ideas confidently. Ultimately, it increases their chances of securing the investment they need. |
| Client              | Fornax AI is a tech company specializing in artificial intelligence (AI) and machine learning (ML) solutions, with a particular focus on optimizing business processes and operations. Their platform is designed to address various challenges faced by organizations, including data management, automation, and decision-making.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Problems it Solves  | 1. Data Overload: Simplifies the management and analysis of large data volumes. 2. Operational Inefficiencies: Automates processes to improve efficiency and reduce errors. 3. Decision-Making Complexity: Provides tools for better, faster decision-making with AI-driven insights. 4. Scalability Issues: Offers scalable solutions that grow with business needs.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Website             | [https://fornax.ai/](https://fornax.ai/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |


# Project Definition

### Project Scope

- User Dashboard: 

- Allow end-users to upload and manage pitch decks and see reviews generated by AI

- Allow end-users to upload and manage pitch decks and see reviews generated by AI

- Partner Applications:
Fornax is positioned as an app for venture capitalists and investors to grade and mark startup pitch decks to sift and manage which startups they should follow up. Application clones of Fornax re-labelled for partner applications include, but not limited to:

- ‣

- ‣

- ‣

- ‣

### Tech Stacks

| Roles    | Tech Stacks                               |
| -------- | ----------------------------------------- |
| BackEnd  | Node.js, AWS Lambda, Serverless Framework |
| FrontEnd | Vercel, Next.js, Radix UI                 |


# Communication Management

### Project Stakeholders

| Roles    | DIR                | Responsibility                                                                                         | Backup |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------ | ------ |
| Founder  | David Peng, Sharie | Dealing with Partners to clone Fornax on their labelled apps                                           |        |
| Designer | Bloom              | Design dashboard, leaderboard, mobile, and any assets related to Royal Labs, parent company of Fornax. |        |


### Resource Allocation

| Name       | Role               | Work status | Responsibility                                                        |
| ---------- | ------------------ | ----------- | --------------------------------------------------------------------- |
| Tom Nguyen | Fullstack Engineer | Fulltime    | Coding, support, and technical consultation between Fornax’s partners |
| Minh Le    | Account Executive  | Fulltime    | Mediator and helping with contract and communications.                |


### Project Meetings

| Report Name          | Frequency | Lead by    | Recipient                   | Purpose                                                                                                                                                                                              |
| -------------------- | --------- | ---------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenVC <> Fornax API | Once      | David Peng | OpenVC Stakeholders (Lucas) | Before Dwarves entered, OpenVC has always requested a way to aggregate data generated from Fornax. This meeting is to settle creating mutual APIs to interface Fornax’s data with OpenVC’s database. |
| Fornax Alignment     | Once      | David Peng | Dwarves                     | To align project expectations of current and new tasks (new designs and requests).                                                                                                                   |


## Communication channels

| Communication Type                  | Communication Medium |
| ----------------------------------- | -------------------- |
| Questions and General Communication | Discord              |


## Project Changelog 

FornaxAI Changelog

# Project Roadmap

Regrettably, we currently do not have a specific roadmap. The client is primarily focused on marketing their product, and they will be seeking our advice to explore potential strategies and actions we can take together.

# Document

### High-level diagrams

ERD

```
erDiagram
    admin {
        number id PK
        string user_id FK
        string created_at
    }
    deck_uploads {
        number id PK
        string startup_id
        string deck_id
        string session_id
        string user_id
        string user_email
        string status
        string created_at
    }
    feedback {
        number id PK
        string sessionId
        string user_id FK
        number partner_id FK
        number partner_user_id FK
        string startup_id
        json overall
        json slideBySlide
        json summary
        string title
        string status
        boolean starred
        string starred_at
        boolean is_archived
        string archived_at
        string created_at
    }
    feedback_followup {
        number id PK
        string sessionId FK
        string email
        string brand
        string link
        string created_at
    }
    feedback_meta {
        number id PK
        string sessionId FK
        number percentage
        string created_at
    }
    feedback_rating {
        number id PK
        string sessionId FK
        json ratings
        string created_at
    }
    feedback_share {
        number id PK
        string sessionId FK
        string[] emails
        boolean is_public
        string created_at
    }
    invoices {
        number id PK
        number customer_id
        number store_id
        number subscription_id FK
        string user_email
        string user_name
        string status
        string billing_reason
        string subtotal_formatted
        string discount_total_formatted
        string total_formatted
        boolean refunded
        string refunded_at
        string created_at
        string updated_at
    }
    orders {
        number id PK
        string user_id FK
        number customer_id
        number store_id
        number product_id
        number variant_id
        string variant_name
        string user_email
        string user_name
        number order_number
        string status
        string currency
        string subtotal_formatted
        string discount_total_formatted
        string tax_formatted
        string tax_name
        string total_formatted
        boolean refunded
        string refunded_at
        boolean test_mode
        json meta
        string created_at
        string updated_at
    }
    partners {
        number id PK
        string partner
        string created_at
    }
    partners_user {
        number id PK
        string email
        string created_at
    }
    pitch_contents {
        number id PK
        string sessionId FK
        json pages
        string created_at
    }
    profile {
        number id PK
        string user_id FK
        boolean active
        string trial_ends_at
        string created_at
    }
    subscriptions {
        number id PK
        number customer_id
        number store_id
        number order_id FK
        number product_id
        number variant_id
        string variant_name
        string user_email
        string user_name
        string status
        string trial_ends_at
        string renews_at
        string ends_at
        string created_at
        string updated_at
    }
    users {
        string id PK
        string email
        string phone
        string encrypted_password
        string role
        json raw_app_meta_data
        json raw_user_meta_data
        string created_at
        string updated_at
    }

    admin ||--o{ users : "user_id"
    feedback ||--o{ users : "user_id"
    feedback ||--o{ partners : "partner_id"
    feedback ||--o{ partners_user : "partner_user_id"
    feedback_followup ||--|| feedback : "sessionId"
    feedback_meta ||--|| feedback : "sessionId"
    feedback_rating ||--|| feedback : "sessionId"
    feedback_share ||--|| feedback : "sessionId"
    invoices ||--|| subscriptions : "subscription_id"
    orders ||--o{ users : "user_id"
    pitch_contents ||--|| feedback : "sessionId"
    profile ||--|| users : "user_id"
    subscriptions ||--|| orders : "order_id"
```

Component Diagrams

- Step Runner

- Step Runner

```
graph TD
    subgraph "fornax-step-runner"
        StepRunner[Step Runner]
        ErrorHandler[Error Handler]
        RetryCounter[Retry Counter]
        
        subgraph "StateMachine"
            StepExtractImages[Step Extract Images]
            StepExtractImagesCheckError[Check Error]
            StepImageMagick[Step ImageMagick]
        end
    end

    StepRunner --> ErrorHandler
    StepRunner --> RetryCounter
    StepRunner --> StateMachine
    StepExtractImages --> StepExtractImagesCheckError
    StepExtractImagesCheckError -->|Error| ErrorHandler
    StepExtractImagesCheckError -->|No Error| StepImageMagick
```

- PDF Report Service

- PDF Report Service

```
graph TD
    subgraph "fornax-step-pdf-report"
        PDFReportHandler[PDF Report Handler]
        
        subgraph "Layers"
            ExpressPDF[Express PDF]
            CanvasNodejs[Canvas Node.js]
            PDFKit[PDFKit]
            SupabaseLayer[Supabase Layer]
        end
    end

    PDFReportHandler --> ExpressPDF
    PDFReportHandler --> CanvasNodejs
    PDFReportHandler --> PDFKit
    PDFReportHandler --> SupabaseLayer
```

- ImageMagick Service

- ImageMagick Service

```
graph TD
    subgraph "fornax-step-imagemagick"
        ImageMagickHandler[ImageMagick Handler]
        
        subgraph "Layers"
            ImageMagickLayer[ImageMagick Layer]
            GhostscriptLayer[Ghostscript Layer]
        end
    end

    ImageMagickHandler --> ImageMagickLayer
    ImageMagickHandler --> GhostscriptLayer
```

- Frontend Services

```
graph TD
    subgraph "Next.js Frontend"
        PageComponents[Pages<br>Home, Dashboard, Upload, Report]
        
        CommonComponents[Common Components<br>Header, Footer, Navigation]
        SpecificComponents[Specific Components<br>UploadForm, PDFViewer, ReportDisplay]
        
        APIRoutes[API Routes<br>Upload, GenerateReport, Feedback, Billing]
        
        Utils[Utilities<br>S3, Supabase, Auth]
        
        StateManagement[State Management<br>Context & Hooks]
        Styles[Styles<br>CSS & Styled Components]
    end

    subgraph "External Services"
        AWSS3[AWS S3]
        Supabase[Supabase]
        AWSAPI[AWS API Gateway]
    end

    PageComponents --> CommonComponents
    PageComponents --> SpecificComponents
    SpecificComponents --> APIRoutes
    APIRoutes --> AWSAPI
    Utils --> AWSS3
    Utils --> Supabase
    
    StateManagement --> PageComponents
    StateManagement --> SpecificComponents
    Styles --> PageComponents
    Styles --> SpecificComponents
    
    Utils --> APIRoutes
    Utils --> PageComponents
    Utils --> SpecificComponents

```

Infrastructure Diagrams:

- Current:

```
graph TD
    Client[Client Browser]
    NextJS[Next.js Frontend]
    API[API Gateway]
    S3[AWS S3]
    Supabase[Supabase]
    OpenAI[OpenAI]

    subgraph "AWS Lambda Functions"
        Generate[Generate Service]
        Feedback[Feedback Service]
        Billing[Billing Service]
        ExtractImages[Extract Images]
        CreateThreads[Create Threads]
        ReadImages[Read Images]
        PDFReport[PDF Report]
        ImageMagick[ImageMagick Extract PDF]
    end

    Client --> NextJS
    NextJS --> API
    API --> Generate
    API --> Feedback
    API --> Billing
    Generate --> S3
    Generate --> Supabase
    Generate --> OpenAI
    ExtractImages --> S3
    CreateThreads --> S3
    ReadImages --> S3
    PDFReport --> S3
    ImageMagick --> S3
    Feedback --> Supabase
    Billing --> Supabase

```

### Core features’ flow

- Flow Diagram:

- User Authentication:

- Login or registration process

- 

- Main Dashboard:

- Options to upload a pitch deck, view existing reports, or request a new report

- 

- Pitch Deck Processing:

- Uploading to S3

- 

- Extracting and processing images

- 

- Analyzing content with OpenAI

- 

- Feedback Report Generation:

- Checking for subscription status

- 

- Generating and storing the report

- 

- Notifying the user

- 

- Report Viewing and Feedback:

- Selecting and displaying reports

- 

- Option to provide feedback

- 

- Data Storage:

- Using AWS S3 for pitch deck storage

- 

- Using Supabase for report and feedback storage

- 

```
flowchart TD
    Start((Start)) --> Login{User Logged In?}
    Login -->|No| Register[Register/Login]
    Register --> Dashboard
    Login -->|Yes| Dashboard[View Dashboard]
    
    Dashboard --> Upload[Upload Pitch Deck]
    Dashboard --> ViewReports[View Existing Reports]
    Dashboard --> RequestReport[Request New Report]
    
    Upload --> S3[Store in AWS S3]
    S3 --> ExtractImages[Extract Images]
    ExtractImages --> ProcessImages[Process Images]
    ProcessImages --> AnalyzeContent[Analyze Content with OpenAI]
    
    RequestReport --> CheckSubscriptions{Purchased a subscription?}
    CheckSubscriptions -->|No| PurchaseSubscriptions[Purchase Subscription]
    PurchaseSubscriptions --> AnalyzeContent
    CheckSubscriptions -->|Yes| AnalyzeContent
    
    AnalyzeContent --> GenerateReport[Generate Feedback Report]
    GenerateReport --> StoreReport[Store Report in Supabase]
    StoreReport --> NotifyUser[Notify User]
    
    ViewReports --> SelectReport[Select Report]
    SelectReport --> DisplayReport[Display Report]
    
    DisplayReport --> Feedback{Provide Feedback?}
    Feedback -->|Yes| SubmitFeedback[Submit Feedback]
    SubmitFeedback --> UpdateDatabase[Update Supabase]
    Feedback -->|No| End((End))
    
    UpdateDatabase --> End
    NotifyUser --> End

```

### .env documentation

```
STAGE
NEXT_PUBLIC_FEEDBACK_SERVICE_API
NEXT_PUBLIC_SEGMENT_WRITE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_LS_CHECKOUT_URL
NEXT_PUBLIC_LS_PRODUCT_ID
NEXT_PUBLIC_LS_VAR_MONTHLY
NEXT_PUBLIC_LS_VAR_LIFETIME
NX_ZAP_NEW_USER
NX_ZAP_ERROR
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Audit source code 

The project now introduces devbox, which a devbox shell  command will initialize and install all the required packages for the repository. Below is the README used to run and manage the backend serverless services.

### Backup source code

Below are the GitLab remote clones for Fornax’s deployments https://git.d.foundation/fornax:

- fornax-ai

- fornax-ai

- fornax-partnerships

- fornax-partnerships

## AI Prompts

### README

```
# Fornax AI

Fornax AI local development and deployment instructions.

## Start the app

To start the Generate API server run `nx serve generate-service`. API is hosted to http://localhost:3000/

To start the Fornax FE run `nx serve fornax-app`. Open your browser and navigate to http://localhost:4200/



## Environment Variables

We have three stages which are the local, dev and prod. Please set your env to this format `.env.{stage}`

For local development, just use `.env.local`



## Backend Deployment

Services:
- AWS Lambda
- Serverless

Install AWS Serverless CLI `npm i -g serverless`. Configure your credentials by following in the documentation https://www.serverless.com/framework/docs/
You can also just login to your AWS CLI by setting it up on your end https://aws.amazon.com/cli/

To deploy the `generate-service` application:
- Head to the root folder and make sure you have the environment variable set for the stage you are deploying.
- Setup the environment variable `.env.{stage}`
- Then run this in the terminal:

  ```
   $ npm run build-generate-service --stage={stage}

   // example:
   $ npm run build-generate-service --stage=dev
  ```
- Head to the build folder

  ```
    $ cd dist/apps/generate-service

    // and run the serverless deploy
    $ serverless deploy --stage={stage}

    // and go back after the deploy is finished
    $ cd ....
  ```
  
Happy coding!
```

fdf
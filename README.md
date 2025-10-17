# Stormalytics

Hosted at [storm.bearloves.rocks](https://storm.bearloves.rocks)

## Future Work
- Add final scores to matchups
- Add YouTube link field to matchups
- Add team logos to matchup cards
- Remove hard-coding for login site info and cookies in blr-home

## Architecture Overview

Stormalytics is a serverless web application built on AWS, consisting of three main components:

### 1. Frontend (`frontend/`)
A static web application built with Webpack, Bootstrap, and jQuery:
- **Pages**: Index (main matchup view), Admin panel, About, System, Login
- **Build Tool**: Webpack 5 with multiple entry points
- **Authentication**: AWS Cognito integration via shared frontend library
- **Hosting**: S3 + CloudFront CDN with Route53 DNS
- **Key Features**:
  - View and sort matchups
  - Add and edit matchups (admin users)
  - Add comments to matchups (authenticated users)

### 2. Backend Lambdas (`lambdas/`)
Python 3.12 Lambda functions providing REST API functionality:
- **GetMatchups**: Retrieve all matchups from S3, sorted by date
- **AddMatchup**: Create new matchup entries (requires authentication)
- **EditMatchup**: Modify existing matchups (requires authentication)
- **AddComment**: Add comments to matchups (requires authentication)
- **UserAuth**: Custom Lambda authorizer for API Gateway authentication

### 3. Infrastructure (`infrastructure/`)
AWS infrastructure defined in CloudFormation (IaC):
- **Storage**: Public S3 bucket for frontend, private bucket for matchup data
- **API**: API Gateway (HTTP API) with Lambda integrations
- **Distribution**: CloudFront distribution with custom domain
- **DNS**: Route53 A and AAAA records
- **Security**: IAM roles with least-privilege policies, Lambda authorizer
- **Logging**: CloudWatch Logs for all Lambda functions (7-day retention)

## Project Structure

```
stormalytics/
├── frontend/
│   ├── src/                    # Source files
│   │   ├── scripts/           # JavaScript modules
│   │   ├── styles/            # Custom CSS
│   │   ├── images/            # Favicon and assets
│   │   └── *.html             # HTML templates
│   ├── dist/                  # Build output (generated)
│   ├── webpack.config.js      # Webpack configuration
│   ├── package.json           # Dependencies
│   ├── get-cf-params.sh       # CloudFormation parameter injection
│   └── deploy_frontend.sh     # Deployment script
├── lambdas/
│   ├── AddMatchup/
│   ├── EditMatchup/
│   ├── GetMatchups/
│   ├── AddComment/
│   ├── UserAuth/
│   └── deploy_lambdas.sh      # Deployment script
├── infrastructure/
│   ├── stormalytics-cfn.yaml  # CloudFormation template
│   ├── cfn-params-private.json # Stack parameters (not in git)
│   └── deploy_infrastructure.sh # Deployment script
└── README.md
```

## Build Process

### Prerequisites
- Node.js and npm (for frontend)
- Python 3.12 (for Lambda functions)
- AWS CLI configured with appropriate credentials

### Frontend Build
The frontend uses Webpack to bundle JavaScript modules and HTML pages:

```bash
cd frontend
npm install
npm run serve    # Development server at localhost:8000
bash deploy_frontend.sh # For deployment to infrastru
```

**Build Features**:
- Multi-page application with shared chunks
- CloudFormation parameters injected at build time via `get-cf-params.sh`
- Bundled output includes login and navbar modules from `blr-shared-frontend`

### Lambda Deployment
Each Lambda function is packaged as a ZIP file:

```bash
cd lambdas
bash deploy_lambdas.sh
```

This script:
1. Zips each Lambda function directory
2. Updates Lambda function code via AWS CLI
3. Performs string substitution for CloudFormation parameter references

### Infrastructure Deployment
Deploy AWS resources via CloudFormation:

```bash
cd infrastructure
bash deploy_infrastructure.sh cfn-params-private.json
```

**What gets deployed**:
- S3 buckets with encryption and public access blocking
- Lambda functions with IAM roles (read-only and read-write)
- API Gateway with REST endpoints and custom authorizer
- CloudFront distribution with SSL certificate
- Route53 DNS records for custom domain
- CloudWatch Log Groups

## API Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/matchups` | Retrieve all matchups | No |
| POST | `/matchups` | Create new matchup | Yes |
| PATCH | `/matchups` | Edit existing matchup | Yes |
| POST | `/comment` | Add comment to matchup | Yes |

Authentication is handled via custom Lambda authorizer checking JWT tokens from AWS Cognito.

## Configuration

The application uses CloudFormation parameters for environment-specific configuration:
- **Domain**: Custom domain and SSL certificate
- **Buckets**: S3 bucket names for public/private storage
- **Auth**: Integration with separate BLR Home stack for shared authentication
- **Lambda Names**: Configurable function names for all Lambdas

Parameters are stored in `infrastructure/cfn-params-private.json`.

## Data Model

Matchups are stored as JSON in S3 (`matchups.json` in private bucket):
- Each matchup contains date, teams/participants, and metadata
- Comments are nested within matchup objects
- Data is sorted by date (most recent first) when retrieved

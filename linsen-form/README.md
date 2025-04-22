# Linsenbestellung Form

A Next.js application for managing lens orders, featuring a form interface for handling different order statuses (executed, alternative, rejected) and generating CSV files.

## Features

- Form interface for managing lens orders
- Three different status types:
  - "Bestellung wird ausgeführt" (Order being executed)
  - "Alternative wird vorgeschlagen" (Alternative being proposed)
  - "Bestellung abgelehnt" (Order rejected)
- CSV file generation for order data
- Date picker for delivery dates
- Form validation
- Responsive design

## Prerequisites

- Node.js 18.0 or later
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lhildmann/linsbest.git
cd linsbest
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

## Deployment

### IIS Deployment

The application can be deployed to IIS. See the `web.config` file for IIS configuration.

### Docker Deployment

The application can also be deployed using Docker:

1. Create a `.env` file with your Zoho API credentials (see Environment Variables section)

2. Build and run the Docker container:
   ```bash
   # Build and run using docker-compose
   docker-compose up -d

   # Or build and run manually
   docker build -t linsbest .
   docker run -p 3000:3000 --env-file .env -d linsbest
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000)

The Docker setup includes:
- `Dockerfile` - Instructions for building the Docker image
- `docker-compose.yml` - Configuration for running the container with environment variables
- `.dockerignore` - List of files to exclude from the Docker build
- `.env.example` - Template for creating your `.env` file

## Project Structure

### Application Files
- `app/page.tsx` - Main form component
- `app/api/save-csv/route.ts` - API route for CSV file handling
- `types/global.d.ts` - TypeScript type definitions
- `next.config.js` - Next.js configuration
- `web.config` - IIS configuration
- `server.js` - Custom server for production

### Docker Files
- `Dockerfile` - Instructions for building the Docker image
- `docker-compose.yml` - Configuration for running the container
- `.dockerignore` - List of files to exclude from the Docker build
- `.env.example` - Template for creating your `.env` file

## Environment Variables

Create a `.env` file with the following variables:
```
# Zoho API Credentials
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_WORKDRIVE_FOLDER_ID=your_zoho_workdrive_folder_id
```

These environment variables are required for the Zoho WorkDrive integration to upload CSV files.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

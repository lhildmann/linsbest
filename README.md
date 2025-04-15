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

The application can be deployed to IIS. See the `web.config` file for IIS configuration.

## Project Structure

- `app/page.tsx` - Main form component
- `app/api/save-csv/route.ts` - API route for CSV file handling
- `types/global.d.ts` - TypeScript type definitions
- `next.config.js` - Next.js configuration
- `web.config` - IIS configuration

## Environment Variables

Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

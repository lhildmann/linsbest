# Linsenbestellung Form

A modern Next.js application for managing lens orders in an optician's workflow. This application provides a streamlined interface for handling lens orders with different statuses and generating standardized CSV outputs.

![Next.js](https://img.shields.io/badge/Next.js-13.0+-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

- **Dynamic Form Interface**
  - Three status options for orders:
    - ✅ "Bestellung wird ausgeführt" (Order being executed)
    - 🔄 "Alternative wird vorgeschlagen" (Alternative being proposed)
    - ❌ "Bestellung abgelehnt" (Order rejected)
  - Smart form validation
  - Real-time field updates

- **Lens Parameters Management**
  - Complete lens specification support:
    - Sphere (SPH)
    - Cylinder (CYL)
    - Axis (AX)
    - Length (LEN)
  - Support for up to 3 alternative lens options
  - EAN code tracking

- **Data Handling**
  - Automated CSV file generation
  - Integration with Zoho WorkDrive
  - Secure data processing

- **User Experience**
  - Responsive design for all devices
  - Intuitive calendar-based delivery week selection
  - Clear validation feedback
  - German language interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Infrastructure**: Docker support, IIS deployment ready
- **Integration**: Zoho WorkDrive API

## 📋 Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Docker (optional, for containerized deployment)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/lhildmann/linsbest.git
   cd linsbest
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file with your Zoho credentials:
   ```env
   ZOHO_CLIENT_ID=your_zoho_client_id
   ZOHO_CLIENT_SECRET=your_zoho_client_secret
   ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
   ZOHO_WORKDRIVE_FOLDER_ID=your_zoho_workdrive_folder_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚢 Deployment Options

### 🖥️ IIS Deployment
The application includes IIS configuration in `web.config`. Follow your organization's IIS deployment procedures.

### 🐳 Docker Deployment
1. Build and run using docker-compose:
   ```bash
   docker-compose up -d
   ```
   
2. Or manually:
   ```bash
   docker build -t linsbest .
   docker run -p 3000:3000 --env-file .env -d linsbest
   ```

## 📁 Project Structure

```
linsbest/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main form component
│   └── api/               # API routes
├── types/                 # TypeScript definitions
├── public/               # Static files
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose config
└── web.config           # IIS configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Authors

- **Ludwig Hildmann** - *Initial work*

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the Next.js and Tailwind CSS communities for their excellent documentation 

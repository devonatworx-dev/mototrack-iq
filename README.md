# mototrack-iq
AI-powered track day analytics platform

## Features
- GPX file upload and parsing with lap detection
- Video file support (MP4/MOV) for future analysis
- CSV telemetry data support (RaceBox exports)
- Real lap time calculation from GPS data
- Local storage persistence for sessions
- Track database with 14 major circuits
- Rider registration and login system
- Responsive design for mobile use at track

## Recent Improvements
- Enhanced GPX parsing with actual lap time detection
- Added video upload handling framework
- Implemented localStorage persistence for session data
- Improved session naming and tracking

## Next Steps
- Connect to real backend database (Supabase/Firebase)
- Add video processing and analysis pipeline
- Implement cloud storage for user data
- Add AI-powered coaching reports
- Enable social sharing of lap times and analyses

## Production source

Production is the Vercel project mototrack-portal-v2, deployed by the Vercel CLI from `src/` (those files are served at the site root). This snapshot is from deployment `dpl_8hKXTLgBjtSNHDNWqVvpnGUPamtC` (Nov 12, 2026). The API is the Railway backend at https://mototrack-iq-backend-production.up.railway.app.

The May 2026 prototype (`index.html`, `analysis.html`, and `package.json`) is kept in `legacy-may-2026/`.

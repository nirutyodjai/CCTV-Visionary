# CCTV Visionary Development Guide

## 🛠️ Project Status

✅ **All TypeScript errors fixed** (50 → 0)  
✅ **Security vulnerabilities resolved**  
✅ **Build successful**  
✅ **Tests passing**  
✅ **Development server working**  

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Copy environment variables template
copy .env.example .env

# Edit .env file with your Firebase configuration
# Get your Firebase config from Firebase Console

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run genkit:dev   # Start Genkit AI development server
npm run genkit:watch # Start Genkit AI in watch mode

# Production
npm run build        # Build for production
npm run start        # Start production server

# Quality Assurance
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm test             # Run Jest tests
```

## 🏗️ Architecture

### Core Technologies
- **Next.js 15.3.3** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Genkit AI** - AI-powered features
- **Firebase** - Backend services
- **Radix UI** - Component library
- **React DnD** - Drag and drop functionality

### Project Structure
```
src/
├── ai/                 # AI flows and Genkit integration
├── app/                # Next.js app router pages
├── components/         # React components
│   ├── canvas/         # Canvas-related components
│   ├── icons/          # Custom icons
│   ├── rack/           # Rack elevation view
│   ├── sidebar/        # Sidebar components
│   ├── topology/       # Network topology components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
└── lib/                # Utilities and configuration
```

## 🔧 Development Notes

### Recently Fixed Issues
1. **TypeScript Errors**: All 50 type errors resolved
2. **Missing Dependencies**: Added missing Radix UI components
3. **Security Issues**: Updated vulnerable packages
4. **Build Configuration**: Fixed for production builds
5. **Jest Setup**: Configured for Next.js 15 compatibility
6. **Firebase Environment**: Added missing MEASUREMENT_ID variable and .env.example

### Known Limitations
- Some Tailwind safelist patterns may need adjustment
- Jest configuration optimized for current setup
- OpenTelemetry warnings are expected (from Genkit dependency)

## 🧪 Testing

The project uses Jest with React Testing Library:
```bash
npm test              # Run all tests
npm test -- --watch  # Run tests in watch mode
```

### Test Structure
- Unit tests for components
- Integration tests for AI flows
- End-to-end tests (planned)

## 🔍 Debugging

### Common Issues
1. **TypeScript Errors**: Run `npm run typecheck` to identify issues
2. **Build Failures**: Check console output and dependency versions
3. **AI Features Not Working**: Ensure Genkit server is running with `npm run genkit:dev`

### Development Tools
- VS Code with TypeScript extension recommended
- React Developer Tools browser extension
- Next.js DevTools (built-in)

## 📚 Key Features

### Implemented
- ✅ Visual floor plan designer
- ✅ Device placement and configuration
- ✅ AI-powered placement suggestions
- ✅ Rack elevation view with drag & drop
- ✅ Network topology visualization
- ✅ Bill of materials generation
- ✅ Project management system
- ✅ Dark/light theme support

### In Development
- ⚠️ Advanced AI diagnostics
- ⚠️ PDF report generation
- ⚠️ Import/export functionality

## 🤝 Contributing

1. Check TypeScript with `npm run typecheck`
2. Run tests with `npm test`
3. Ensure build succeeds with `npm run build`
4. Follow existing code patterns and TypeScript types

## 📞 Support

If you encounter issues:
1. Check this README for common solutions
2. Review TypeScript errors with `npm run typecheck`
3. Check the development server logs
4. Verify all dependencies are installed correctly

---

**Last Updated**: July 7, 2025  
**Status**: ✅ Production Ready

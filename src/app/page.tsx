'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ArrowRight, 
    Bot, 
    Network, 
    FileText,
    ListChecks,
    Server,
    Map,
    MousePointerClick,
    Settings,
    ClipboardCheck,
    DraftingCompass
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserNav } from '@/components/ui/user-nav';
import { Skeleton } from '@/components/ui/skeleton';


const featureList = [
    {
        icon: Map,
        title: "Visual Floor Plan Designer",
        description: "Drag-and-drop cameras, network devices, and architectural elements onto a floor plan. Adjust device properties like FoV, range, and rotation."
    },
    {
        icon: Bot,
        title: "AI-Powered Assistance",
        description: "Leverage Genkit AI flows for camera placement suggestions, cable path finding, and plan diagnostics to identify potential issues."
    },
    {
        icon: Server,
        title: "Rack Elevation View",
        description: "Design and visualize equipment layout within server racks. Manage rack units and device placement for optimal organization."
    },
    {
        icon: Network,
        title: "Logical Topology View",
        description: "Automatically generate and visualize the logical network topology based on device connections, helping you understand data flow."
    },
    {
        icon: ListChecks,
        title: "Bill of Materials (BOM) Generation",
        description: "Automatically compile a comprehensive list of all required equipment, complete with quantities and potential costs."
    },
    {
        icon: FileText,
        title: "PDF Report Generation",
        description: "Generate professional PDF reports of your complete project plan, including floor plans, topology, and BOM for easy sharing."
    }
];

const workflowSteps = [
    {
        icon: DraftingCompass,
        title: "1. Design Your Space",
        description: "Upload an existing floor plan image or use the built-in architectural tools to draw walls and define the layout of your space."
    },
    {
        icon: MousePointerClick,
        title: "2. Place & Connect",
        description: "Drag and drop devices onto the canvas. Use AI suggestions for optimal placement and let the system automatically find the best cable paths."
    },
    {
        icon: Settings,
        title: "3. Manage & Configure",
        description: "Fine-tune every device's properties, organize equipment in the Rack View, and see the network topology update in real-time."
    },
    {
        icon: ClipboardCheck,
        title: "4. Analyze & Report",
        description: "Run diagnostics to validate your design, generate a complete Bill of Materials, and export a professional PDF report for stakeholders."
    }
]


export default function LandingPage() {
  const { user, loading } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <Map className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">CCTV & Network Planner</h1>
        </div>
        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          ) : user ? (
            <UserNav />
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost">Launch Planner</Button>
              </Link>
              <Link href="/login" passHref>
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-32">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white">
            Design, Plan, and Deploy Your Systems Intelligently
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Our Genkit AI-powered tool helps you create efficient, cost-effective CCTV and network infrastructure plans. From device placement to cable routing, we've got you covered.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/planner" passHref>
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>

        {/* <InteractiveFeaturePreview /> */}

        <section id="features" className="bg-white dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">A Comprehensive Toolkit for Modern System Design</h3>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Everything you need to take a project from concept to completion.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featureList.map((feature, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800/50 transform hover:scale-105 transition-transform duration-300 ease-in-out">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">From Concept to Completion in 4 Simple Steps</h3>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">A streamlined workflow to accelerate your design process.</p>
                </div>
                <div className="relative">
                    {/* The connecting line */}
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-300 dark:bg-gray-700" style={{top: '3rem'}}></div>
                    
                    <div className="grid md:grid-cols-4 gap-12 relative">
                        {workflowSteps.map((step) => (
                            <div key={step.title} className="text-center">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center mx-auto">
                                        <step.icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <h4 className="text-xl font-semibold mt-6 text-gray-900 dark:text-white">{step.title}</h4>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 CCTV & Network Planner. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

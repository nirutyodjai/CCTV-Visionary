
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { CctvBulletIcon } from '@/components/icons/cctv-bullet-icon';

// Helper function to calculate points for the FOV arc
const getArcPoints = (angle: number, fov: number, range: number) => {
    const startAngle = angle - fov / 2;
    const endAngle = angle + fov / 2;
    const x1 = range * Math.cos((startAngle * Math.PI) / 180);
    const y1 = range * Math.sin((startAngle * Math.PI) / 180);
    const x2 = range * Math.cos((endAngle * Math.PI) / 180);
    const y2 = range * Math.sin((endAngle * Math.PI) / 180);
    return `M 0 0 L ${x1} ${y1} A ${range} ${range} 0 ${fov > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
};

export function InteractiveFeaturePreview() {
    const [showFov, setShowFov] = useState(true);
    const [showRange, setShowRange] = useState(true);
    const [rotation, setRotation] = useState(45);

    const fovAngle = 90; // Field of View in degrees
    const viewRange = 80; // Range in pixels

    return (
        <section className="bg-gray-50 dark:bg-gray-900 py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Visualize Your Plan in Detail</h3>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Our interactive tools give you a clear and precise preview of your security system's coverage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Controls Column */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-white dark:bg-gray-800/50">
                            <CardHeader>
                                <CardTitle>Display Controls</CardTitle>
                                <CardDescription>Toggle visual elements on the canvas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="show-fov" checked={showFov} onCheckedChange={(checked) => setShowFov(!!checked)} />
                                    <Label htmlFor="show-fov" className="text-base">
                                        Show Field of View (FoV)
                                    </Label>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                                    Visualize the camera's coverage angle in a translucent cone.
                                </p>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="show-range" checked={showRange} onCheckedChange={(checked) => setShowRange(!!checked)} />
                                    <Label htmlFor="show-range" className="text-base">
                                        Show Effective Range
                                    </Label>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                                    Display a line indicating the maximum effective distance of the camera.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-800/50">
                             <CardHeader>
                                <CardTitle>Adjust Rotation</CardTitle>
                                <CardDescription>Use the slider to rotate the camera.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-4">
                                    <Slider
                                        id="rotation-slider"
                                        min={0}
                                        max={360}
                                        step={1}
                                        value={[rotation]}
                                        onValueChange={(value) => setRotation(value[0])}
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-center">
                                        {rotation}°
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Canvas Column */}
                    <div className="md:col-span-2 h-[400px] bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                         {/* Grid Background */}
                        <svg width="100%" height="100%" className="absolute inset-0">
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(156, 163, 175, 0.2)" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>

                        <div className="relative w-48 h-48 flex items-center justify-center">
                             {/* Visuals Group - Rotates based on slider */}
                            <div
                                className="absolute transition-transform duration-200 ease-in-out"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                {/* FOV Cone */}
                                <svg
                                    width={viewRange * 2}
                                    height={viewRange * 2}
                                    viewBox={`-${viewRange} -${viewRange} ${viewRange*2} ${viewRange*2}`}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                >
                                    <path
                                        d={getArcPoints(0, fovAngle, viewRange)}
                                        fill="hsl(var(--primary) / 0.2)"
                                        stroke="hsl(var(--primary) / 0.5)"
                                        strokeWidth="1.5"
                                        className={`transition-opacity duration-300 ${showFov ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                </svg>
                                
                                {/* Range Line */}
                                <div
                                    className={`absolute left-1/2 top-1/2 h-[1.5px] bg-red-500/70 origin-left transition-all duration-300 ${showRange ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ width: `${viewRange}px` }}
                                >
                                     <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
                                </div>

                            </div>
                            
                            {/* Camera Icon - Rotates with the group */}
                            <div 
                                className="relative transition-transform duration-200 ease-in-out z-10"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                <CctvBulletIcon className="w-10 h-10 text-gray-900 dark:text-gray-100" style={{transform: 'rotate(-90deg)'}} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

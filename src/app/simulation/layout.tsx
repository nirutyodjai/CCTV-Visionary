'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, usePathname } from 'next/navigation';

export default function SimulationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (value: string) => {
    router.push(`/simulation/${value}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-6 py-3 flex items-center justify-between bg-background">
        <h1 className="text-2xl font-bold">CCTV Visionary - ระบบจำลองสถานการณ์</h1>
        <Tabs
          defaultValue="dashboard"
          className="w-fit"
          onValueChange={handleTabChange}
          value={pathname.split('/')[2] || 'dashboard'}
        >
          <TabsList>
            <TabsTrigger value="dashboard">หน้าหลัก</TabsTrigger>
            <TabsTrigger value="network">จำลองเครือข่าย</TabsTrigger>
            <TabsTrigger value="camera">จำลองมุมมองกล้อง</TabsTrigger>
            <TabsTrigger value="reports">รายงาน</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}

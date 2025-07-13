import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ออกแบบ CCTV - CCTV Visionary',
  description: 'เครื่องมือออกแบบ CCTV และการวางแผนระบบรักษาความปลอดภัยแบบมืออาชีพ',
};

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
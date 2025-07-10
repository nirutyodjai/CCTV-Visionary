// ตัวอย่างการจัดเรียงเมนูที่เหมาะสมสำหรับการออกแบบ CCTV
// โครงสร้างเมนูที่เน้นการใช้งานจริงและลำดับการทำงาน

const designWorkflowMenus = {
  // 1. เตรียมงาน (Preparation)
  preparation: {
    title: "เตรียมงาน",
    icon: "📋",
    order: 1,
    items: [
      {
        id: "project",
        title: "จัดการโปรเจ็กต์",
        icon: "📁",
        description: "สร้าง บันทึก และจัดการโปรเจ็กต์",
        workflow: ["สร้างโปรเจ็กต์ใหม่", "ตั้งชื่อและรายละเอียด", "เลือกประเภทอาคาร"]
      },
      {
        id: "files",
        title: "ไฟล์และแบบแปลน",
        icon: "📄",
        description: "อัพโหลดแบบแปลน CAD รูปภาพ เอกสาร",
        workflow: ["อัพโหลดแบบแปลน", "ปรับขนาดและตำแหน่ง", "ตั้งค่ามาตราส่วน"]
      }
    ]
  },

  // 2. การออกแบบพื้นฐาน (Basic Design)
  basicDesign: {
    title: "การออกแบบพื้นฐาน",
    icon: "🏗️",
    order: 2,
    items: [
      {
        id: "architecture",
        title: "สถาปัตยกรรม",
        icon: "🏗️",
        description: "วาดกำแพง ประตู หน้าต่าง โครงสร้างอาคาร",
        workflow: ["วาดผนัง", "เพิ่มประตู-หน้าต่าง", "กำหนดพื้นที่ห้อง"]
      },
      {
        id: "zones",
        title: "กำหนดโซน",
        icon: "🗺️",
        description: "แบ่งพื้นที่ตามการใช้งานและความสำคัญ",
        workflow: ["กำหนดโซนความปลอดภัย", "แบ่งพื้นที่สาธารณะ-ส่วนตัว", "ระบุจุดเสี่ยง"]
      }
    ]
  },

  // 3. การออกแบบระบบ (System Design)
  systemDesign: {
    title: "การออกแบบระบบ",
    icon: "📷",
    order: 3,
    items: [
      {
        id: "devices",
        title: "อุปกรณ์ CCTV",
        icon: "📷",
        description: "วางตำแหน่งกล้อง NVR Monitor อุปกรณ์ต่างๆ",
        workflow: ["เลือกประเภทกล้อง", "วางตำแหน่งกล้อง", "ตั้งค่ามุมมองและระยะ"]
      },
      {
        id: "network",
        title: "ระบบเครือข่าย",
        icon: "🌐",
        description: "ออกแบบเครือข่าย Switch การเชื่อมต่อ",
        workflow: ["วางตำแหน่ง Switch", "กำหนด VLAN", "ออกแบบ IP scheme"]
      },
      {
        id: "cabling",
        title: "การเดินสาย",
        icon: "🔌",
        description: "ออกแบบเส้นทางสายเคเบิล",
        workflow: ["เลือกประเภทสาย", "กำหนดเส้นทาง", "คำนวณความยาว"]
      }
    ]
  },

  // 4. การวิเคราะห์ด้วย AI (AI Analysis)
  aiAnalysis: {
    title: "การวิเคราะห์ AI",
    icon: "🤖",
    order: 4,
    items: [
      {
        id: "ai-suggest",
        title: "ข้อแนะนำ AI",
        icon: "💡",
        description: "ให้ AI แนะนำตำแหน่งและการปรับปรุง",
        workflow: ["วิเคราะห์การครอบคลุม", "แนะนำตำแหน่งกล้อง", "เสนอทางเลือก"]
      },
      {
        id: "diagnostics",
        title: "การวินิจฉัย",
        icon: "🔍",
        description: "ตรวจสอบปัญหาและข้อบกพร่อง",
        workflow: ["ตรวจสอบจุดอับ", "วิเคราะห์การเชื่อมต่อ", "ประเมินประสิทธิภาพ"]
      },
      {
        id: "optimization",
        title: "การปรับปรุง",
        icon: "⚡",
        description: "ปรับปรุงประสิทธิภาพของระบบ",
        workflow: ["ลดจุดซ้ำซ้อน", "เพิ่มประสิทธิภาพ", "ลดต้นทุน"]
      }
    ]
  },

  // 5. การตรวจสอบและทดสอบ (Verification & Testing)
  verification: {
    title: "การตรวจสอบ",
    icon: "✅",
    order: 5,
    items: [
      {
        id: "3d-view",
        title: "มุมมอง 3D",
        icon: "📦",
        description: "ดูระบบในมุมมอง 3 มิติ",
        workflow: ["ดูภาพรวม 3D", "ตรวจสอบการติดตั้ง", "จำลองการทำงาน"]
      },
      {
        id: "simulation",
        title: "การจำลอง",
        icon: "🎮",
        description: "ทดสอบการทำงานของระบบ",
        workflow: ["จำลองการเฝ้าระวัง", "ทดสอบการครอบคลุม", "ประเมินประสิทธิภาพ"]
      },
      {
        id: "analytics",
        title: "การวิเคราะห์",
        icon: "📊",
        description: "สถิติและรายงานการทำงาน",
        workflow: ["วิเคราะห์ข้อมูล", "สร้างกราฟ", "ประเมินผล"]
      }
    ]
  },

  // 6. การจัดการและบำรุงรักษา (Management & Maintenance)
  management: {
    title: "การจัดการ",
    icon: "⚙️",
    order: 6,
    items: [
      {
        id: "datacenter",
        title: "ศูนย์ข้อมูล",
        icon: "🏢",
        description: "จัดการตู้แร็ค เซิร์ฟเวอร์",
        workflow: ["ออกแบบตู้แร็ค", "จัดวางอุปกรณ์", "คำนวณการระบายความร้อน"]
      },
      {
        id: "security",
        title: "ความปลอดภัย",
        icon: "🔒",
        description: "การรักษาความปลอดภัยระบบ",
        workflow: ["ตั้งค่าสิทธิการเข้าถึง", "การเข้ารหัส", "สำรองข้อมูล"]
      },
      {
        id: "monitoring",
        title: "การตรวจสอบ",
        icon: "👁️",
        description: "ติดตามการทำงานแบบเรียลไทม์",
        workflow: ["ติดตามสถานะ", "แจ้งเตือนปัญหา", "บันทึกเหตุการณ์"]
      }
    ]
  },

  // 7. การส่งออกและเอกสาร (Export & Documentation)
  documentation: {
    title: "เอกสารและส่งออก",
    icon: "📤",
    order: 7,
    items: [
      {
        id: "report",
        title: "รายงาน",
        icon: "📋",
        description: "สร้างรายงาน PDF, BOM",
        workflow: ["เลือกรูปแบบรายงาน", "ปรับแต่งเนื้อหา", "ส่งออกเอกสาร"]
      },
      {
        id: "export",
        title: "ส่งออกไฟล์",
        icon: "💾",
        description: "ส่งออก CAD, Excel, รูปภาพ",
        workflow: ["เลือกรูปแบบไฟล์", "ตั้งค่าคุณภาพ", "ดาวน์โหลดไฟล์"]
      },
      {
        id: "share",
        title: "แชร์โปรเจ็กต์",
        icon: "🔗",
        description: "แชร์งานให้ทีมและลูกค้า",
        workflow: ["สร้างลิงก์แชร์", "ตั้งค่าสิทธิ", "ส่งมอบงาน"]
      }
    ]
  },

  // 8. การช่วยเหลือ (Help & Support)
  support: {
    title: "ความช่วยเหลือ",
    icon: "❓",
    order: 8,
    items: [
      {
        id: "help",
        title: "คู่มือการใช้งาน",
        icon: "📖",
        description: "วิธีการใช้งานและเทคนิค",
        workflow: ["ค้นหาหัวข้อ", "ดูวิดีโอสอน", "ดาวน์โหลดคู่มือ"]
      },
      {
        id: "templates",
        title: "แม่แบบ",
        icon: "📐",
        description: "แม่แบบสำหรับงานประเภทต่างๆ",
        workflow: ["เลือกประเภทอาคาร", "ใช้แม่แบบ", "ปรับแต่งตามความต้องการ"]
      },
      {
        id: "settings",
        title: "การตั้งค่า",
        icon: "⚙️",
        description: "ตั้งค่าแอปพลิเคชัน",
        workflow: ["ตั้งค่าทั่วไป", "ปรับแต่ง UI", "จัดการผู้ใช้"]
      }
    ]
  }
};

// การจัดกลุ่มเมนูตามลำดับการทำงาน (Workflow-based grouping)
const workflowStages = {
  planning: {
    title: "วางแผน",
    color: "blue",
    menus: ["project", "files", "zones"]
  },
  designing: {
    title: "ออกแบบ",
    color: "green", 
    menus: ["architecture", "devices", "network", "cabling"]
  },
  analyzing: {
    title: "วิเคราะห์",
    color: "purple",
    menus: ["ai-suggest", "diagnostics", "optimization"]
  },
  verifying: {
    title: "ตรวจสอบ",
    color: "orange",
    menus: ["3d-view", "simulation", "analytics"]
  },
  finalizing: {
    title: "ส่งมอบ",
    color: "red",
    menus: ["report", "export", "share"]
  }
};

export { designWorkflowMenus, workflowStages };

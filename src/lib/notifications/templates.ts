export function appointmentConfirmation(params: {
  clientName: string;
  service: string;
  date: string;
  time: string;
  businessName: string;
}) {
  return {
    sms: `مرحباً ${params.clientName}، تم تأكيد موعدك لخدمة ${params.service} يوم ${params.date} الساعة ${params.time}. ${params.businessName}`,
    email: {
      subject: `تأكيد الموعد - ${params.businessName}`,
      html: `<div dir="rtl" style="font-family: sans-serif; padding: 20px;">
        <h2>تأكيد الموعد</h2>
        <p>مرحباً ${params.clientName}،</p>
        <p>تم تأكيد موعدك:</p>
        <ul>
          <li>الخدمة: ${params.service}</li>
          <li>التاريخ: ${params.date}</li>
          <li>الوقت: ${params.time}</li>
        </ul>
        <p>شكراً لك،<br/>${params.businessName}</p>
      </div>`,
    },
  };
}

export function appointmentReminder(params: {
  clientName: string;
  service: string;
  date: string;
  time: string;
  businessName: string;
}) {
  return {
    sms: `تذكير: لديك موعد ${params.service} غداً ${params.date} الساعة ${params.time}. ${params.businessName}`,
    email: {
      subject: `تذكير بالموعد - ${params.businessName}`,
      html: `<div dir="rtl" style="font-family: sans-serif; padding: 20px;">
        <h2>تذكير بالموعد</h2>
        <p>مرحباً ${params.clientName}،</p>
        <p>تذكير بأن لديك موعداً غداً:</p>
        <ul>
          <li>الخدمة: ${params.service}</li>
          <li>التاريخ: ${params.date}</li>
          <li>الوقت: ${params.time}</li>
        </ul>
        <p>${params.businessName}</p>
      </div>`,
    },
  };
}

export function invoiceReceipt(params: {
  clientName: string;
  invoiceNumber: string;
  total: string;
  currency: string;
  businessName: string;
}) {
  return {
    sms: `${params.businessName}: تم إصدار فاتورة رقم ${params.invoiceNumber} بمبلغ ${params.total} ${params.currency}. شكراً لك ${params.clientName}.`,
    email: {
      subject: `إيصال الفاتورة #${params.invoiceNumber} - ${params.businessName}`,
      html: `<div dir="rtl" style="font-family: sans-serif; padding: 20px;">
        <h2>إيصال الفاتورة</h2>
        <p>مرحباً ${params.clientName}،</p>
        <p>تم إصدار فاتورتك بنجاح:</p>
        <ul>
          <li>رقم الفاتورة: ${params.invoiceNumber}</li>
          <li>المبلغ الإجمالي: ${params.total} ${params.currency}</li>
        </ul>
        <p>شكراً لتعاملك معنا،<br/>${params.businessName}</p>
      </div>`,
    },
  };
}

export function lowStockAlert(params: {
  itemName: string;
  currentStock: number;
  reorderLevel: number;
  businessName: string;
}) {
  return {
    sms: `تنبيه مخزون: ${params.itemName} - الكمية الحالية ${params.currentStock} (حد إعادة الطلب: ${params.reorderLevel}). ${params.businessName}`,
    email: {
      subject: `تنبيه انخفاض المخزون - ${params.itemName} - ${params.businessName}`,
      html: `<div dir="rtl" style="font-family: sans-serif; padding: 20px;">
        <h2>تنبيه انخفاض المخزون</h2>
        <p>المنتج <strong>${params.itemName}</strong> وصل إلى مستوى منخفض:</p>
        <ul>
          <li>الكمية الحالية: ${params.currentStock}</li>
          <li>حد إعادة الطلب: ${params.reorderLevel}</li>
        </ul>
        <p>يرجى إعادة تعبئة المخزون في أقرب وقت.</p>
        <p>${params.businessName}</p>
      </div>`,
    },
  };
}

"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeImageProps {
  data: string;
  size?: number;
  className?: string;
}

export function QrCodeImage({ data, size = 150, className }: QrCodeImageProps) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (!data) return;
    QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then(setSrc)
      .catch((err) => console.error("QR code generation failed:", err));
  }, [data, size]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      className={className}
    />
  );
}

"use client";

import React, { useState, useEffect } from "react";

export interface GalleryItem {
  title: string;
  image: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
}

export function CircularGallery({ items }: CircularGalleryProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev + 0.4);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const angle = 360 / items.length;

  return (
    <div className="relative w-full h-[450px] flex items-center justify-center perspective-[2000px]">
      <div
        className="relative w-full h-full"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((item, i) => {
          const itemAngle = angle * i;

          return (
            <div
              key={i}
              className="absolute w-[200px] h-[260px] left-1/2 top-1/2"
              style={{
                transform: `rotateY(${itemAngle}deg) translateZ(400px)`,
                marginLeft: "-100px",
                marginTop: "-130px",
              }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden shadow-xl border">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-0 w-full bg-black/60 text-white text-sm p-3">
                  {item.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
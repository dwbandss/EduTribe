"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { tribalImages } from '@/data/images';
import { cn } from '@/lib/utils';

interface ScrollVelocityProps {
  className?: string;
}

const ScrollVelocity = ({ className = "" }: ScrollVelocityProps) => {
  const [scrollY, setScrollY] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const images = tribalImages.scrollVelocity;

  return (
    <section ref={ref} className={cn("relative py-20 overflow-hidden", className)}>
      <div className="container mx-auto px-6">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate={controls}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Transforming Rural Education
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Witness the incredible impact of our volunteers and partners in tribal communities across India
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image: string, index: number) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1 }
              }}
              className="relative group"
              style={{
                transform: `translateY(${scrollY * 0.1 * (index % 2 === 0 ? 1 : -1)}px)`,
              }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={image}
                  alt={`Education initiative ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">
                      {index === 0 && "Digital Learning Centers"}
                      {index === 1 && "Volunteer Teaching Programs"}
                      {index === 2 && "Community School Support"}
                      {index === 3 && "Tribal Education Initiatives"}
                      {index === 4 && "Rural Classroom Modernization"}
                      {index === 5 && "Student Development Programs"}
                      {index === 6 && "Teacher Training Workshops"}
                      {index === 7 && "Educational Resource Distribution"}
                    </h3>
                    <p className="text-sm opacity-90">
                      Empowering tribal communities through quality education and sustainable development.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollVelocity;

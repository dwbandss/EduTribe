"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { tribalImages } from '@/data/images';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  className?: string;
}

const BentoGrid = ({ className = "" }: BentoGridProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const gridItems = [
    {
      title: "Education Access",
      description: "Providing quality learning resources to tribal communities",
      image: tribalImages.bentoGrid.education,
      span: "col-span-1 row-span-2",
      icon: "📚",
      features: ["Digital Libraries", "Study Materials", "Learning Centers"]
    },
    {
      title: "Volunteer Network",
      description: "Connecting passionate educators with remote communities",
      image: tribalImages.bentoGrid.volunteer,
      span: "col-span-1 row-span-1",
      icon: "🤝",
      features: ["Teacher Training", "Skill Development", "Mentorship"]
    },
    {
      title: "School Support",
      description: "Infrastructure and resource development for village schools",
      image: tribalImages.bentoGrid.support,
      span: "col-span-1 row-span-1",
      icon: "🏫",
      features: ["Classroom Setup", "Technology Integration", "Maintenance"]
    },
    {
      title: "Community Empowerment",
      description: "Building sustainable educational ecosystems",
      image: tribalImages.bentoGrid.community,
      span: "col-span-1 row-span-2",
      icon: "🌱",
      features: ["Parent Workshops", "Community Events", "Local Partnerships"]
    }
  ];

  return (
    <section ref={ref} className={cn("py-20 px-6", className)}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
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
            Our Impact Areas
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Comprehensive support for tribal education through multiple initiatives
          </motion.p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]"
        >
          {gridItems.map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 0.8, rotateY: 90 },
                visible: { opacity: 1, scale: 1, rotateY: 0 }
              }}
              className={cn("relative group cursor-pointer", item.span)}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <div className="h-full overflow-hidden rounded-2xl border-2 border-transparent group-hover:border-terracotta/30 transition-all duration-300 shadow-lg">
                <div className="relative h-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                    <div>
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-sm opacity-90 mb-4">{item.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {item.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-terracotta rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGrid;

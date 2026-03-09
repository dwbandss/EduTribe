"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { tribalImages } from "@/data/images";
import { cn } from "@/lib/utils";

interface TestimonialsColumnsProps {
  className?: string;
}

const TestimonialsColumns = ({ className = "" }: TestimonialsColumnsProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const testimonials = [
    {
      text: "EduTribe has transformed our village school. The volunteers brought new teaching methods and our students' performance has improved dramatically.",
      name: "Rajesh Kumar",
      role: "School Headmaster",
      image: tribalImages.testimonials[0],
    },
    {
      text: "As a volunteer, I've seen firsthand how education can change lives. The support from EduTribe makes it possible to reach remote tribal communities.",
      name: "Priya Sharma",
      role: "Education Volunteer",
      image: tribalImages.testimonials[1],
    },
    {
      text: "Our daughter now has access to quality education right in our village. We're grateful for the digital learning center they established.",
      name: "Lakshmi Devi",
      role: "Parent",
      image: tribalImages.testimonials[2],
    },
    {
      text: "The teacher training programs have helped us implement modern educational practices while preserving our cultural heritage.",
      name: "Anand Patel",
      role: "Local Teacher",
      image: tribalImages.testimonials[3],
    },
    {
      text: "EduTribe's approach respects tribal traditions while providing modern education. This balance is crucial for our community's development.",
      name: "Meena Murmu",
      role: "Community Leader",
      image: tribalImages.testimonials[4],
    },
    {
      text: "The infrastructure support has created a safe and inspiring learning environment for our children.",
      name: "Suresh Oraon",
      role: "School Committee Member",
      image: tribalImages.testimonials[5],
    },
    {
      text: "Students who never had access to books are now reading fluently. The impact on literacy rates has been remarkable.",
      name: "Anita Singh",
      role: "Literacy Volunteer",
      image: tribalImages.testimonials[6],
    },
    {
      text: "The community workshops have helped parents understand the importance of education and support their children's learning journey.",
      name: "Deepak Kumar",
      role: "NGO Partner",
      image: tribalImages.testimonials[7],
    },
    {
      text: "Seeing the joy on children's faces when they learn something new is the greatest reward. EduTribe makes this possible every day.",
      name: "Ritu Verma",
      role: "Teaching Volunteer",
      image: tribalImages.testimonials[8],
    },
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  const TestimonialsColumn = ({
    testimonials: columnTestimonials,
    className: columnClassName,
    duration = 12,
  }: {
    testimonials: typeof testimonials;
    className?: string;
    duration?: number;
  }) => {
    const duplicated = [...columnTestimonials, ...columnTestimonials];

    return (
      <div className={columnClassName}>
        <motion.ul
          animate={{ y: "-50%" }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex flex-col gap-6 pb-6 list-none m-0 p-0"
        >
          {duplicated.map(({ text, image, name, role }, i) => (
            <motion.li
              key={i}
              whileHover={{ scale: 1.03, y: -8 }}
              whileFocus={{ scale: 1.03, y: -8 }}
              className="p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-black/5 max-w-xs w-full bg-white dark:bg-neutral-900 transition-all duration-300 cursor-default select-none group"
            >
              <blockquote>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  "{text}"
                </p>

                <footer className="flex items-center gap-3 mt-6">
                  <img
                    src={image}
                    alt={`Avatar of ${name}`}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800 group-hover:ring-primary/30 transition"
                  />

                  <div className="flex flex-col">
                    <cite className="font-semibold not-italic text-neutral-900 dark:text-white">
                      {name}
                    </cite>
                    <span className="text-sm text-neutral-500">{role}</span>
                  </div>
                </footer>
              </blockquote>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    );
  };

  return (
    <section
      ref={ref}
      className={cn("py-24 relative overflow-hidden", className)}
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        className="container px-4 mx-auto"
      >
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-block border px-4 py-1 rounded-full text-xs font-semibold uppercase text-neutral-600 bg-neutral-100">
            Testimonials
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mt-6">
            Stories of Impact
          </h2>

          <p className="mt-5 text-neutral-500 text-lg">
            Hear from communities, volunteers, and families whose lives
            have been transformed through education.
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-10 max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default TestimonialsColumns;
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Sun, Moon } from 'lucide-react';

// --- Types ---
interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

// --- Tribal Education Testimonials ---
const testimonials: Testimonial[] = [
  {
    text: "EduTribe transformed our village school. The volunteers brought new teaching methods and our students' attendance has increased by 70%. This platform is changing lives.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Priya Sharma",
    role: "School Principal, Madhya Pradesh",
  },
  {
    text: "As a volunteer, I've seen firsthand how EduTribe connects passionate educators with tribal communities. The impact is incredible and deeply rewarding.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Rajesh Kumar",
    role: "Education Volunteer",
  },
  {
    text: "The NGO partnership through EduTribe helped us reach 15 remote tribal schools. The platform's coordination tools made implementation seamless.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Anita Desai",
    role: "NGO Director, Teach for Tribes",
  },
  {
    text: "Our donation through EduTribe helped build a computer lab in a remote tribal school. Seeing the children learn digital skills is priceless.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Vikram Malhotra",
    role: "Corporate Donor",
  },
  {
    text: "EduTribe's teacher training program equipped me with modern teaching techniques. Now I can better serve my tribal community.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Lakshmi Murmu",
    role: "Tribal School Teacher",
  },
  {
    text: "The platform helped our school connect with volunteers and resources we never had access to. Our students are excelling now.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Biju Narayanan",
    role: "School Administrator, Kerala",
  },
  {
    text: "As a student from a tribal community, EduTribe gave me access to quality education and mentorship that changed my life.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sanjay Gond",
    role: "High School Student",
  },
  {
    text: "EduTribe's transparent donation tracking gave us confidence that our contributions are making real impact in tribal education.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Meera Patel",
    role: "Individual Donor",
  },
  {
    text: "The online resources and volunteer support from EduTribe helped our school maintain education during the pandemic.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "David Sangma",
    role: "Headmaster, Meghalaya",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.li 
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileFocus={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-10 rounded-3xl border border-border shadow-lg shadow-black/5 max-w-xs w-full bg-card transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-primary/30" 
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-muted-foreground leading-relaxed font-normal m-0 transition-colors duration-300">
                      {text}
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300 ease-in-out"
                      />
                      <div className="flex flex-col">
                        <cite className="font-semibold not-italic tracking-tight leading-5 text-foreground transition-colors duration-300">
                          {name}
                        </cite>
                        <span className="text-sm leading-5 tracking-tight text-muted-foreground mt-0.5 transition-colors duration-300">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section 
      aria-labelledby="testimonials-heading"
      className="bg-transparent py-24 relative overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 }
        }}
        className="container px-4 z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16">
          <div className="flex justify-center">
            <div className="border border-border py-1 px-4 rounded-full text-xs font-semibold tracking-wide uppercase text-muted-foreground bg-muted transition-colors">
              Tribal Community Voices
            </div>
          </div>

          <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 text-center text-foreground transition-colors">
            Stories of Impact
          </h2>
          <p className="text-center mt-5 text-muted-foreground text-lg leading-relaxed max-w-sm transition-colors">
            Hear from tribal communities, volunteers, and partners about their EduTribe journey.
          </p>
        </div>

        <div 
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </motion.div>
    </section>
  );
};

// --- Main App Component ---
export default function TestimonialV2() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      <TestimonialsSection />
    </div>
  );
}

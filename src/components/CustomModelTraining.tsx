"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeistMono } from "geist/font/mono";

// Prompt/illustration pairs - update image paths when you add the files
const PROMPTS = [
  { text: "Mixed berries", image: "/images/mixed-berries.png" },
  { text: "Tomatoes on a branch", image: "/images/tomatoes.png" },
  { text: "Salad in a bowl", image: "/images/salad.png" },
];

// Typing speed in ms per character
const TYPING_SPEED = 80;
// Pause after typing complete before "sending"
const PAUSE_AFTER_TYPING = 800;
// Duration to show the message bubble floating
const BUBBLE_DURATION = 1500;
// Duration for image crossfade
const IMAGE_CROSSFADE = 600;

export default function CustomModelTraining() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "sending" | "complete">("typing");
  const [showBubble, setShowBubble] = useState(false);
  const [displayedImageIndex, setDisplayedImageIndex] = useState(0);

  const currentPrompt = PROMPTS[currentIndex];
  const previousPrompt = PROMPTS[(currentIndex - 1 + PROMPTS.length) % PROMPTS.length];

  // Typing animation
  useEffect(() => {
    if (phase !== "typing") return;

    if (typedText.length < currentPrompt.text.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentPrompt.text.slice(0, typedText.length + 1));
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    } else {
      // Typing complete, pause then send
      const timeout = setTimeout(() => {
        setPhase("sending");
      }, PAUSE_AFTER_TYPING);
      return () => clearTimeout(timeout);
    }
  }, [typedText, phase, currentPrompt.text]);

  // Sending phase - show bubble, change image
  useEffect(() => {
    if (phase !== "sending") return;

    setShowBubble(true);

    // Change image after a short delay
    const imageTimeout = setTimeout(() => {
      setDisplayedImageIndex(currentIndex);
    }, 300);

    // Complete the cycle
    const completeTimeout = setTimeout(() => {
      setPhase("complete");
    }, BUBBLE_DURATION);

    return () => {
      clearTimeout(imageTimeout);
      clearTimeout(completeTimeout);
    };
  }, [phase, currentIndex]);

  // Complete phase - move to next prompt
  useEffect(() => {
    if (phase !== "complete") return;

    const timeout = setTimeout(() => {
      setShowBubble(false);
      setTypedText("");
      setCurrentIndex((prev) => (prev + 1) % PROMPTS.length);
      setPhase("typing");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [phase]);

  return (
    <section className="relative bg-black text-white px-[24px] md:px-[63px] py-[80px] md:py-[120px] min-h-[80vh]">
      {/* Corner markers */}
      <div className={`absolute top-[20px] left-[20px] text-[48px] md:text-[69px] font-light ${GeistMono.className}`}>
        +
      </div>
      <div className={`absolute top-[20px] right-[20px] text-[48px] md:text-[69px] font-light ${GeistMono.className}`}>
        +
      </div>
      <div className={`absolute bottom-[20px] left-[20px] text-[48px] md:text-[69px] font-light ${GeistMono.className}`}>
        +
      </div>
      <div className={`absolute bottom-[20px] right-[20px] text-[48px] md:text-[69px] font-light ${GeistMono.className}`}>
        +
      </div>

      {/* Title */}
      <div className="w-full md:w-[60%] mb-[60px] md:mb-[80px]">
        <p className="text-[24px] md:text-[34px] leading-[1.3]">
          <span className="font-bold">Custom Model Training </span>
          <span className="font-normal">
            — Fine-tuned AI models learn specific brand styles, generating
            illustrations that feel handcrafted, not generated.
          </span>
        </p>
      </div>

      {/* Main content area */}
      <div className="relative flex flex-col md:flex-row gap-[40px] md:gap-[60px] items-start md:items-center">
        {/* Left side - Input and floating bubble */}
        <div className="relative w-full md:w-[40%] min-h-[300px]">
          {/* Floating message bubble - shows the current/previous prompt */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute top-0 left-[20%] md:left-[30%] z-10"
              >
                <div className="bg-[#262626] px-[24px] md:px-[32px] py-[20px] md:py-[26px] rounded-[33px]">
                  <p className={`${GeistMono.className} font-light text-[18px] md:text-[22px] text-white text-right`}>
                    {currentPrompt.text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt input box */}
          <div
            className="absolute bottom-0 left-0 w-full max-w-[490px] rounded-[29px] border border-[#3f3f3f] p-[13px]"
            style={{
              background: "linear-gradient(179deg, rgb(0, 0, 0) 27%, rgb(42, 42, 42) 118%)",
            }}
          >
            {/* Label pill */}
            <div className="bg-[#1f1e1e] inline-flex items-center justify-center px-[10px] py-[8px] rounded-full mb-[16px]">
              <p className={`${GeistMono.className} font-light text-[10px] text-white`}>
                Text to illustration
              </p>
            </div>

            {/* Top right icons */}
            <div className="absolute top-[15px] right-[20px] flex items-center gap-[9px]">
              <div className="w-[10px] h-[10px] border border-white" />
              <p className={`${GeistMono.className} font-light text-[10px] text-white`}>+1</p>
              <div className="flex flex-col gap-[2px]">
                <div className="w-[3px] h-[3px] bg-white rounded-full" />
                <div className="w-[3px] h-[3px] bg-white rounded-full" />
                <div className="w-[3px] h-[3px] bg-white rounded-full" />
              </div>
            </div>

            {/* Typed prompt */}
            <div className="min-h-[40px] mb-[16px]">
              <p className={`${GeistMono.className} font-light text-[20px] md:text-[22px] text-white`}>
                {typedText}
                {phase === "typing" && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
            </div>

            {/* Send button */}
            <motion.button
              className="absolute bottom-[13px] right-[13px] w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center"
              animate={{
                scale: phase === "sending" ? 0.9 : 1,
                opacity: typedText.length > 0 ? 1 : 0.5,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="w-full md:w-[50%] aspect-square max-w-[580px] rounded-[12px] overflow-hidden relative bg-[#f5f5dc]">
          <AnimatePresence mode="wait">
            <motion.img
              key={displayedImageIndex}
              src={PROMPTS[displayedImageIndex].image}
              alt={PROMPTS[displayedImageIndex].text}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: IMAGE_CROSSFADE / 1000 }}
            />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

import { motion, easeInOut, easeOut, type Variants } from "framer-motion";

const floatVariant: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easeInOut,
    },
  },
};

const glowVariant: Variants = {
  animate: {
    scale: [0.95, 1.1, 0.95],
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: easeInOut,
    },
  },
};

const rippleVariant: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0.6,
  },
  animate: {
    scale: 1.6,
    opacity: 0,
  },
};

export default function Loader() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <motion.div
        className="loader-container z-50 d-flex align-items-center justify-content-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Floating hearts */}

        <div
          className="butterfly path-1 position-absolute "
          style={{ top: "35%", left: "35%" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g className="butterfly-wing" style={{ transformOrigin: "center" }}>
              <path
                d="M12 12C8 8 4 6 2 8C0 10 2 14 6 16C8 17 10 16 12 12Z"
                fill="var(--street-primary-base)"
                opacity="0.6"
              />
              <path
                d="M12 12C16 8 20 6 22 8C24 10 22 14 18 16C16 17 14 16 12 12Z"
                fill="var(--street-primary-base)"
                opacity="0.6"
              />
            </g>{" "}
            <ellipse
              cx="12"
              cy="14"
              rx="0.5"
              ry="4"
              fill="var(--street-primary-base)"
            />
          </svg>
        </div>
        <div
          className="butterfly path-3 position-absolute "
          style={{ top: "65%", left: "55%" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g className="butterfly-wing" style={{ transformOrigin: "center" }}>
              <path
                d="M12 12C8 8 4 6 2 8C0 10 2 14 6 16C8 17 10 16 12 12Z"
                fill="var(--street-primary-base)"
                opacity="0.6"
              />
              <path
                d="M12 12C16 8 20 6 22 8C24 10 22 14 18 16C16 17 14 16 12 12Z"
                fill="var(--street-primary-base)"
                opacity="0.6"
              />
            </g>{" "}
            <ellipse
              cx="12"
              cy="14"
              rx="0.5"
              ry="4"
              fill="var(--street-primary-base)"
            />
          </svg>
        </div>
        <div
          className="butterfly path-2 position-absolute "
          style={{ top: "45%", left: "65%" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g className="butterfly-wing" style={{ transformOrigin: "center" }}>
              <path
                d="M12 12C8 8 4 6 2 8C0 10 2 14 6 16C8 17 10 16 12 12Z"
                fill="var(--street-primary-base)"
                opacity="0.6"
              />
              <path
                d="M12 12C16 8 20 6 22 8C24 10 22 14 18 16C16 17 14 16 12 12Z"
                fill="var(--street-primary-base)"
                opacity="0.6"
              />
            </g>{" "}
            <ellipse
              cx="12"
              cy="14"
              rx="0.5"
              ry="4"
              fill="var(--street-primary-base)"
            />
          </svg>
        </div>
        {/* Main content */}
        <div className="text-center position-relative">
          {/* Logo container */}
          <motion.div
            className="position-relative mb-5 d-inline-block"
            variants={floatVariant}
            animate="animate"
          >
            {/* Glow effect */}
            <motion.div
              className="logo-glow"
              variants={glowVariant}
              animate="animate"
            />

            {/* Ripple rings - now with proper sizing */}
            {[0, 0.8, 1.6].map((delay, i) => (
              <motion.div
                key={i}
                className="ripple"
                variants={rippleVariant}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2.5,
                  delay,
                  repeat: Infinity,
                  repeatDelay: 0,
                  ease: easeOut,
                }}
              />
            ))}
            {/* Logo placeholder - centered heart icon */}
            <img
              src="assets/images/auth/e5fcae70d4835039e473c6b00f4a901799a86cf3.png"
              alt="Street Haven Logo"
              className="loader-logo rounded-circle bg-street-card shadow-lg"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="loader-title mb-3 text-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Street Haven
          </motion.h1>

          {/* Decorative line */}
          <motion.div
            className="decorative-line mb-3"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Loading dots */}
          <div className="d-flex justify-content-center gap-2 gap-sm-3">
            {[0, 1, 2,3].map((i) => (
              <motion.span
                key={i}
                className="loader-dot"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: easeInOut,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

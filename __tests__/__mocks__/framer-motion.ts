import React, { JSX } from 'react'
const actualFramerMotion = jest.requireActual('framer-motion')

interface AnimationProps {
  whileHover?: any;
  whileTap?: any;
  layout?: boolean | string;
  layoutId?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const mockMotionComponent = (type: keyof JSX.IntrinsicElements) => {
  return function MockMotion({ children, ...props }: AnimationProps) {
    const { whileHover, whileTap, layout, layoutId, ...restProps } = props
    // Strip animation props but preserve other attributes
    return React.createElement(type, {
      "data-testid": `motion-${String(type)}`,
      ...restProps
    }, children)
  }
}

// Create a proxy to handle any motion.* component requests
const motionProxy = new Proxy({}, {
  get: (_, prop: string | symbol) => {
    if (prop === '__esModule') return false
    if (typeof prop === 'string') {
      // Assume any string prop represents a valid HTML element
      return mockMotionComponent(prop as keyof JSX.IntrinsicElements)
    }
    return actualFramerMotion.motion[prop as keyof typeof actualFramerMotion.motion]
  }
})

interface AnimatePresenceProps {
  children: React.ReactNode;
  mode?: "sync" | "popLayout";
  initial?: boolean;
  exitBeforeEnter?: boolean;
  onExitComplete?: () => void;
}

module.exports = {
  ...actualFramerMotion,
  motion: motionProxy,
  AnimatePresence: ({ children, mode = "sync", initial = true, ...props }: AnimatePresenceProps) => {
    return React.createElement('div', { "data-testid": "animate-presence", ...props }, children)
  },
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn()
  }),
  animate: jest.fn(),
  useMotionValue: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn(),
    onChange: jest.fn()
  })),
  useTransform: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn()
  })),
  // Add mock layout animations
  LayoutGroup: ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { "data-testid": "layout-group" }, children)
  },
  useScroll: () => ({
    scrollY: { get: () => 0, onChange: jest.fn() },
    scrollYProgress: { get: () => 0, onChange: jest.fn() }
  }),
  useInView: () => ({
    inView: true,
    ref: { current: null }
  })
}

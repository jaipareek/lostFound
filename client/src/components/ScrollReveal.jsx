import { useEffect, useRef, useState } from 'react'

/**
 * useScrollReveal — Intersection Observer hook for scroll-triggered animations.
 * Attach the returned ref to any element to animate it into view.
 *
 * @param {object} options
 * @param {string} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for early/late trigger
 * @returns {{ ref: React.Ref, isVisible: boolean }}
 */
export function useScrollReveal({ threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = {}) {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(el)
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold, rootMargin])

    return { ref, isVisible }
}

/**
 * ScrollReveal — Wrapper component for scroll-triggered fade-in-up animation.
 */
export default function ScrollReveal({ children, className = '', delay = 0 }) {
    const { ref, isVisible } = useScrollReveal()

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
            }}
        >
            {children}
        </div>
    )
}

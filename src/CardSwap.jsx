import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { FastAverageColor } from 'fast-average-color';
import './CardSwap.css';

// Instância única
const fac = new FastAverageColor();

// --- CARD COMPONENT ---
export const Card = forwardRef(({ customClass, bg, accent, color, children, ...rest }, ref) => {
  // Inicializa estado
  const [extractedColor, setExtractedColor] = useState(accent || null);

  useEffect(() => {
    // Se já tem accent, ignora a extração
    if (accent) return;

    let isActive = true;

    if (bg && typeof bg === 'string' && bg.includes('url')) {
      const match = bg.match(/url\(["']?(.+?)["']?\)/);
      const url = match ? match[1] : null;

      if (url) {
        fac.getColorAsync(url, { algorithm: 'dominant', ignoredColor: [255, 255, 255, 255] })
          .then(colorData => {
            if (isActive) setExtractedColor(colorData.hex);
          })
          .catch(() => {
            if (isActive) setExtractedColor('#ffffff');
          });
      }
    }
    
    return () => { isActive = false; };
  }, [bg, accent]);

  // Cor final a ser escrita no DOM
  const finalColor = extractedColor || color || '#ffffff';

  return (
    <div 
      ref={ref} 
      {...rest} 
      className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
      data-color={finalColor}
      style={{ 
        background: bg,
        color: color,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderRadius: rest.style?.borderRadius ?? undefined,
        overflow: 'hidden',
        ...rest.style 
      }}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

// --- LÓGICA DE POSIÇÃO ---
const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
  filter: `brightness(${Math.max(0, 1 - (i * 0.20))})` 
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x, y: slot.y, z: slot.z,
    xPercent: -50, yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    filter: slot.filter,
    force3D: true
  });

// --- CARDSWAP COMPONENT ---
const CardSwap = ({
  width = 300, 
  height = 400,
  cardDistance = 20, 
  verticalDistance = 30,
  delay = 4000, 
  pauseOnHover = true, 
  onCardClick, 
  skewAmount = 4,
  children
}) => {
  const childArr = useMemo(() => Children.toArray(children), [children]);
  
  // CORREÇÃO: Dependência simplificada para agradar ao Linter
  const refs = useMemo(() => {
    return childArr.map(() => React.createRef());
  }, [childArr]); 
  
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const timerRef = useRef(null);
  const container = useRef(null);
  const isAnimating = useRef(false);

  // Helper simples sem hooks
  const updateGlobalColor = (element) => {
    if (!element) return;
    const color = element.dataset.color;
    if (color) {
      document.documentElement.style.setProperty('--active-card-color', color);
    }
  };

  useEffect(() => {
    const total = refs.length;

    // Posicionamento Inicial
    refs.forEach((r, i) => {
      if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });

    // Atualizar cor INICIAL
    const firstCard = refs[0]?.current;
    if (firstCard) {
      setTimeout(() => updateGlobalColor(firstCard), 100); 
    }

    const swap = () => {
      if (isAnimating.current || order.current.length < 2) return;
      isAnimating.current = true;

      const [front, ...rest] = order.current;
      
      // LÓGICA DE COR
      const nextIndex = rest[0];
      const nextCardEl = refs[nextIndex]?.current;
      if (nextCardEl) updateGlobalColor(nextCardEl);

      const elFront = refs[front].current;
      if (!elFront) { isAnimating.current = false; return; }
      
      gsap.killTweensOf(elFront);

      const tl = gsap.timeline({
        onComplete: () => {
          order.current = [...rest, front];
          const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
          
          gsap.set(elFront, {
            zIndex: backSlot.zIndex, x: backSlot.x, y: backSlot.y, z: backSlot.z,
            skewY: skewAmount, filter: backSlot.filter, rotationX: 0
          });

          isAnimating.current = false;
          timerRef.current = gsap.delayedCall(delay / 1000, swap);
        }
      });
      
      tlRef.current = tl;

      // Animação Card Frente
      tl.to(elFront, {
        y: '+=800', skewY: 0, rotationX: -10, filter: 'brightness(0)',
        duration: 0.55, ease: 'power2.in',
      }, 0);

      // Animação Outros Cards
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        gsap.killTweensOf(el);
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        gsap.set(el, { zIndex: slot.zIndex });

        tl.to(el, {
            x: slot.x, y: slot.y, z: slot.z, skewY: skewAmount, filter: slot.filter,
            duration: 0.75, ease: 'power3.inOut'
          }, i * 0.06
        );
      });
    };

    timerRef.current = gsap.delayedCall(delay / 1000, swap);

    if (pauseOnHover && container.current) {
      const node = container.current;
      const pause = () => { timerRef.current?.pause(); tlRef.current?.pause(); };
      const resume = () => { tlRef.current?.resume(); timerRef.current?.resume(); };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        timerRef.current?.kill(); tlRef.current?.kill();
        isAnimating.current = false;
      };
    }
    
    return () => {
      timerRef.current?.kill && timerRef.current.kill();
      tlRef.current?.kill && tlRef.current.kill();
      isAnimating.current = false;
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, refs]); 

  const rendered = childArr.map((child, i) =>
    isValidElement(child) ? cloneElement(child, {
      key: i,
      ref: refs[i],
      style: { width, height, ...(child.props.style ?? {}) },
      onClick: e => { child.props.onClick?.(e); onCardClick?.(i); }
    }) : child
  );

  return <div ref={container} className="card-swap-container" style={{ width, height }}>{rendered}</div>;
};

export default CardSwap;

import React from 'react';

/**
 * ═════════════════════════════════════════════════════════════════════
 * NARACORD AI — Master Official Vector Logo & Icon
 * 100% exact match to Brand Presentation & Design Kit (Snapshot 2 & 3)
 * ═════════════════════════════════════════════════════════════════════
 */

export const NaracordIcon = ({ 
  size = 40, 
  variant = 'bubble', // 'bubble' (standalone speech-bubble robot) or 'app-icon' (in squircle container)
  theme = 'indigo',   // 'indigo' | 'white' | 'dark' | 'whatsapp'
  glow = true,
  style = {},
  className = ''
}) => {
  const gradId = React.useId();
  const eyeGradId = React.useId();

  // Variant 1: Standalone Speech-Bubble Robot (Official Logo mark from Snapshot 2)
  if (variant === 'bubble') {
    const isWhite = theme === 'white';
    const bubbleFill = isWhite ? '#FFFFFF' : `url(#${gradId})`;
    const antennaFill = isWhite ? '#FFFFFF' : '#5850EC';
    const visorFill = isWhite ? 'rgba(88, 80, 236, 0.12)' : '#0B0F19';
    const eyeFill = isWhite ? '#5850EC' : '#38BDF8';
    const smileFill = isWhite ? '#5850EC' : '#6366F1';

    return (
      <div 
        className={`naracord-icon-wrapper ${className}`}
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          width={size} 
          height={size} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: glow && !isWhite ? 'drop-shadow(0 0 12px rgba(88, 80, 236, 0.55))' : 'none',
            overflow: 'visible'
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id={eyeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          {/* Top Antenna */}
          <circle cx="50" cy="11" r="5.5" fill={antennaFill} />
          <rect x="47.5" y="15" width="5" height="10" rx="2.5" fill={antennaFill} />

          {/* Main Speech Bubble Body with Tail */}
          <path 
            d="M 32 23 
               H 68 
               C 81 23 91 33 91 46 
               V 56 
               C 91 69 81 79 68 79 
               H 38 
               L 20 93 
               L 22 79 
               C 15 78 9 72 9 64 
               V 46 
               C 9 33 19 23 32 23 Z" 
            fill={bubbleFill} 
          />

          {/* Inner Robot Visor Capsule */}
          <rect 
            x="24" 
            y="38" 
            width="52" 
            height="26" 
            rx="13" 
            fill={visorFill} 
          />

          {/* Left Robot Eye */}
          <circle cx="39" cy="51" r="5.5" fill={isWhite ? eyeFill : `url(#${eyeGradId})`} />
          <circle cx="41" cy="49" r="1.8" fill="#FFFFFF" />

          {/* Right Robot Eye */}
          <circle cx="61" cy="51" r="5.5" fill={isWhite ? eyeFill : `url(#${eyeGradId})`} />
          <circle cx="63" cy="49" r="1.8" fill="#FFFFFF" />

          {/* Smile / Voice Wave Indicator */}
          <rect x="46" y="58" width="8" height="2" rx="1" fill={smileFill} />
        </svg>
      </div>
    );
  }

  // Variant 2: App Icon in Squircle Container (from Snapshot 2 App Icons grid)
  const isDarkContainer = theme === 'dark';
  const isWhatsApp = theme === 'whatsapp';
  
  const bgGradient = isWhatsApp
    ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
    : isDarkContainer
    ? 'linear-gradient(135deg, #161927 0%, #0B0F19 100%)'
    : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #3730A3 100%)';

  return (
    <div 
      className={`naracord-app-icon ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: bgGradient,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: glow 
          ? (isWhatsApp ? '0 8px 24px rgba(37, 211, 102, 0.35)' : '0 8px 24px rgba(88, 80, 236, 0.4)')
          : 'none',
        flexShrink: 0,
        ...style
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        width={size * 0.72} 
        height={size * 0.72} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Top Antenna */}
        <circle cx="50" cy="11" r="5.5" fill="#FFFFFF" />
        <rect x="47.5" y="15" width="5" height="10" rx="2.5" fill="#FFFFFF" />

        {/* Main Speech Bubble Body with Tail */}
        <path 
          d="M 32 23 
             H 68 
             C 81 23 91 33 91 46 
             V 56 
             C 91 69 81 79 68 79 
             H 38 
             L 20 93 
             L 22 79 
             C 15 78 9 72 9 64 
             V 46 
             C 9 33 19 23 32 23 Z" 
          fill="#FFFFFF" 
        />

        {/* Inner Robot Visor */}
        <rect 
          x="24" 
          y="38" 
          width="52" 
          height="26" 
          rx="13" 
          fill={isDarkContainer ? '#0B0F19' : '#1E1B4B'} 
        />

        {/* Glowing Eyes */}
        <circle cx="39" cy="51" r="5.5" fill="#38BDF8" />
        <circle cx="41" cy="49" r="1.8" fill="#FFFFFF" />

        <circle cx="61" cy="51" r="5.5" fill="#38BDF8" />
        <circle cx="63" cy="49" r="1.8" fill="#FFFFFF" />

        {/* Smile Indicator */}
        <rect x="46" y="58" width="8" height="2" rx="1" fill="#818CF8" />
      </svg>
    </div>
  );
};

export const NaracordLogo = ({ 
  variant = 'horizontal', // 'horizontal' | 'icon' | 'stacked'
  iconVariant = 'bubble', // 'bubble' | 'app-icon'
  theme = 'dark',         // 'dark' | 'light'
  size = 'md',            // 'sm' | 'md' | 'lg' | 'xl'
  badge = null,           // e.g. 'SUPER ADMIN' | 'CLIENT'
  subtitle = null,
  showDotAi = false,      // default false matching Snapshot 2 clean 'NARACORD' wordmark
  style = {},
  className = '' 
}) => {
  const isDark = theme === 'dark';

  // Specific pixel dimensions
  const configs = {
    sm: { icon: 32, font: 15, badgePad: '2px 5px', badgeFont: 9, gap: 9 },
    md: { icon: 38, font: 18, badgePad: '2px 6px', badgeFont: 9, gap: 10 },
    lg: { icon: 48, font: 24, badgePad: '3px 8px', badgeFont: 10, gap: 12 },
    xl: { icon: 64, font: 30, badgePad: '4px 10px', badgeFont: 11, gap: 14 }
  };

  const cfg = configs[size] || configs.md;

  if (variant === 'icon') {
    return <NaracordIcon size={cfg.icon} variant={iconVariant} theme="indigo" />;
  }

  return (
    <div 
      className={`naracord-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: cfg.gap,
        userSelect: 'none',
        textDecoration: 'none',
        lineHeight: 1,
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <NaracordIcon 
        size={cfg.icon} 
        variant={iconVariant} 
        theme="indigo" 
      />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'nowrap', width: '100%' }}>
          <span 
            style={{ 
              fontFamily: "'Space Grotesk', 'Inter', -apple-system, sans-serif",
              fontSize: cfg.font,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isDark ? '#FFFFFF' : '#0B0F19',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            NARACORD
            {showDotAi && (
              <span style={{ color: '#5850EC', fontWeight: 800, marginLeft: 2 }}>.AI</span>
            )}
          </span>

          {badge && (
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: cfg.badgePad,
                fontSize: cfg.badgeFont,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: badge.includes('SUPER') 
                  ? 'rgba(239, 68, 68, 0.16)' 
                  : 'rgba(88, 80, 236, 0.16)',
                color: badge.includes('SUPER') ? '#EF4444' : '#5850EC',
                border: badge.includes('SUPER') 
                  ? '1px solid rgba(239, 68, 68, 0.35)' 
                  : '1px solid rgba(88, 80, 236, 0.35)'
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <span 
            style={{ 
              fontSize: Math.max(10, cfg.font - 8),
              fontWeight: 500,
              color: isDark ? '#94A3B8' : '#64748B',
              marginTop: 3,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap'
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default NaracordLogo;


const Logo = () => (
  <div style={{ 
    position: 'relative', 
    width: '32px', 
    height: '32px',
    display: 'inline-block',
    marginRight: '8px'
  }}>
    <img 
      src="/logos/songjam.png" 
      alt="SongJam Logo" 
      style={{ 
        width: '100%', 
        height: '100%',
        mixBlendMode: 'overlay',
        filter: 'brightness(1.1) contrast(1.05)',
        borderRadius: '50%'
      }} 
    />
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(96,165,250,0.4), rgba(139,92,246,0.4), rgba(236,72,153,0.4))',
      opacity: 0.4,
      mixBlendMode: 'soft-light',
      borderRadius: '50%'
    }} />
  </div>
);

export default Logo;

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
        filter: 'brightness(1.2) contrast(1.1)'
      }} 
    />
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #60A5FA, #8B5CF6, #EC4899)',
      opacity: 0.85,
      mixBlendMode: 'color',
      borderRadius: '4px'
    }} />
  </div>
);

export default Logo;
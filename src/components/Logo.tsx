const Logo = () => (
  <div
    style={{
      position: 'relative',
      width: '32px',
      height: '32px',
      display: 'inline-block',
      marginRight: '8px',
      borderRadius: '50%',
      overflow: 'hidden',
    }}
  >
    <img
      src="/logos/songjam.jpeg"
      alt="SongJam Logo"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  </div>
);

export default Logo;

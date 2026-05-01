import React from 'react';

const FloatingOrbs: React.FC = () => {
  return (
    <>
      <div className="orb animate-float" style={{ width: 400, height: 400, top: '10%', left: '-5%', background: 'radial-gradient(circle, rgba(108,92,231,0.08), transparent 70%)' }} />
      <div className="orb animate-float-delayed" style={{ width: 300, height: 300, top: '60%', right: '-3%', background: 'radial-gradient(circle, rgba(253,121,168,0.06), transparent 70%)' }} />
      <div className="orb animate-float-slow" style={{ width: 250, height: 250, bottom: '10%', left: '30%', background: 'radial-gradient(circle, rgba(78,205,196,0.06), transparent 70%)' }} />
      <div className="orb animate-float" style={{ width: 200, height: 200, top: '5%', right: '25%', background: 'radial-gradient(circle, rgba(162,155,254,0.07), transparent 70%)' }} />
      <div className="orb animate-float-delayed" style={{ width: 180, height: 180, bottom: '30%', left: '10%', background: 'radial-gradient(circle, rgba(249,202,36,0.05), transparent 70%)' }} />
    </>
  );
};

export default FloatingOrbs;

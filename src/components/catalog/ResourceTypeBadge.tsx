import React from 'react';

interface ResourceTypeBadgeProps {
  style?: React.CSSProperties;
}

// Todo recurso é PDF (decisão da gestão: virada PDF-only, sem vídeo no produto).
const ResourceTypeBadge: React.FC<ResourceTypeBadgeProps> = ({ style }) => (
  <span className="type-badge" style={style}>
    📄 PDF
  </span>
);

export default ResourceTypeBadge;

import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 1000 240" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    {...props}
    className={`${props.className} select-none`}
  >
    {/* Versão para Modo Escuro (Fundo Escuro -> Texto Branco) */}
    <g className="hidden dark:block">
      <text 
        x="500" 
        y="120" 
        fill="white" 
        fontSize="190" 
        fontFamily="Inter, sans-serif"
        letterSpacing="-10"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan fontWeight="900">Smart</tspan>
        <tspan fontWeight="300">Study</tspan>
      </text>
    </g>

    {/* Versão para Modo Claro (Fundo Claro -> Texto Marinho/Navy) */}
    <g className="block dark:hidden">
      <text 
        x="500" 
        y="120" 
        fill="#0F172A" 
        fontSize="190" 
        fontFamily="Inter, sans-serif"
        letterSpacing="-10"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan fontWeight="900">Smart</tspan>
        <tspan fontWeight="300">Study</tspan>
      </text>
    </g>
  </svg>
);

export default LogoIcon;
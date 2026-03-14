
import React from "react";

function Logo() {
  return (
    
      <div className="flex flex-col items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width="65"
        height="65"
      >
        {/* Gear shape
        <path
          d="M100 20c10 0 15 5 20 10l10-3 18 24-10 8c2 5 14 20 4 15l10 3v16l-10 3c-1 5-2 10-4 15l7 8-8 14-10-3c-5 5-10 10-20 10s-15-10-40-10l-10 3-8-14 7-8c-2-5-4-10-4-15l-10-3V77l10-3c1-5 2-10 4-15l-7-8 8-14 10 3c5-5 10-10 20-10z"
          fill="#f97316"
        />  */}

        {/* #f97316  #070063ff #caf5ffff*/}  


        <circle cx="110" cy="100" r="87" fill="blue"/>   
         <circle cx="110" cy="100" r="83" fill="white" /> 

                  {/* Clipboard */}
        {/* Clipboard Background */}
<rect
  x="75"
  y="60"
  width="70"
  height="80"
  rx="8"
  fill="blue"
/>

{/* Clipboard Foreground (white layer) */}
<rect
  x="80"
  y="65"
  width="60"
  height="80"
  rx="5"
  fill="white"
/>
        {/* Checklist items */}
        <line x1="105" y1="85" x2="135" y2="85" stroke="blue" strokeWidth="3" />
        <polyline
          points="85,85 90,90 100,80"
          fill="none"
          stroke="blue"
          strokeWidth="3"
        />
        <line x1="105" y1="105" x2="135" y2="105" stroke="blue" strokeWidth="3" />
        <polyline
            points="85,105,90,110,100,100"
          fill="none"
          stroke="blue"
          strokeWidth="3"
        />
        <line x1="105" y1="125" x2="135" y2="125" stroke="blue" strokeWidth="3" />
        <polyline
            points="85,125,90,130,100,120"
          fill="none"
          stroke="blue"
          strokeWidth="3"
        />

        {/* Brick wall */}
        <g fill="blue">
          <rect x="70" y="140" width="25" height="15" />
          <rect x="100" y="140" width="25" height="15" />
          <rect x="130" y="140" width="25" height="15" />

          <rect x="85" y="160" width="25" height="15" />
          <rect x="115" y="160" width="25" height="15" />
        </g>
      </svg>

      {/* Text */}
      {/* <h1 className="mt-2 text-2xl font-bold tracking-wide text-white-900">
        CONSTRUCTIFY
      </h1> */}
    </div>
  );
}

export default Logo;
import{j as e}from"./index-C-AEaM24.js";const p=({isLoading:n,message:l="Processing...",subMessage:r,progress:i,variant:t="spinner",size:o="md",className:d})=>{if(!n)return null;const s={sm:{spinner:"2rem",dots:"0.4rem",text:"0.8rem"},md:{spinner:"3rem",dots:"0.6rem",text:"1rem"},lg:{spinner:"4rem",dots:"0.8rem",text:"1.2rem"}}[o];return e.jsx("div",{className:"position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center",style:{zIndex:1055},children:e.jsxs("div",{className:`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${d}`,style:{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",zIndex:9999,pointerEvents:"all"},children:[e.jsxs("div",{className:"card rounded-4 shadow-lg p-24 d-flex flex-column align-items-center justify-content-center gap-10 text-center border",style:{minWidth:"260px",width:"50%",maxWidth:"500px",animation:"fadeScale 0.25s ease-out",minHeight:"180px"},children:[t==="spinner"&&e.jsx("div",{className:"spinner-border text-street-primary mb-3",role:"status",style:{width:s.spinner,height:s.spinner}}),t==="dots"&&e.jsx("div",{className:"d-flex gap-2 mb-3",children:[0,1,2].map(a=>e.jsx("div",{className:"rounded-circle bg-street-primary",style:{width:s.dots,height:s.dots,animation:"dotPulse 0.8s infinite",animationDelay:`${a*.2}s`}},a))}),t==="pulse"&&e.jsx("div",{className:"rounded-circle bg-street-primary mb-3",style:{width:s.spinner,height:s.spinner,opacity:.6,animation:"pulseGrow 1.5s infinite"}}),t==="progress"&&e.jsxs("div",{className:"w-100 d-flex flex-column gap-12 ",children:[e.jsx("div",{className:"progress",style:{height:"8px"},children:e.jsx("div",{className:"progress-bar progress-bar-striped progress-bar-animated bg-street-primary",role:"progressbar",style:{width:`${i??0}%`}})}),e.jsxs("div",{className:"fw-semibold mt-2 text-street-dark",style:{fontSize:s.text},children:[Math.round(i||0),"%"]})]}),e.jsx("div",{className:"fw-semibold text-street-base",style:{fontSize:s.text},children:l}),r&&e.jsx("div",{className:"text-street-base mt-1",style:{fontSize:"0.85rem"},children:r})]}),e.jsx("style",{children:`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
        }

        @keyframes pulseGrow {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `})]})})};export{p as F};

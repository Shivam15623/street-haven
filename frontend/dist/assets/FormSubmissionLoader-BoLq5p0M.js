import{j as e}from"./index-Cme7tyVo.js";(function(){try{var s=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{};s.SENTRY_RELEASE={id:"be17f4c5b5a3220ad332b4f41ff786e79b43e0f8"};var r=new s.Error().stack;r&&(s._sentryDebugIds=s._sentryDebugIds||{},s._sentryDebugIds[r]="3c2737df-bb37-41cc-90b8-89214e3d34ea",s._sentryDebugIdIdentifier="sentry-dbid-3c2737df-bb37-41cc-90b8-89214e3d34ea")}catch{}})();const p=({isLoading:s,message:r="Processing...",subMessage:n,progress:a,variant:i="spinner",size:o="md",className:l})=>{if(!s)return null;const t={sm:{spinner:"2rem",dots:"0.4rem",text:"0.8rem"},md:{spinner:"3rem",dots:"0.6rem",text:"1rem"},lg:{spinner:"4rem",dots:"0.8rem",text:"1.2rem"}}[o];return e.jsx("div",{className:"position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center",style:{zIndex:1055},children:e.jsxs("div",{className:`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${l}`,style:{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",zIndex:9999,pointerEvents:"all"},children:[e.jsxs("div",{className:"card rounded-4 shadow-lg p-24 d-flex flex-column align-items-center justify-content-center gap-10 text-center border",style:{minWidth:"260px",width:"50%",maxWidth:"500px",animation:"fadeScale 0.25s ease-out",minHeight:"180px"},children:[i==="spinner"&&e.jsx("div",{className:"spinner-border text-street-primary mb-3",role:"status",style:{width:t.spinner,height:t.spinner}}),i==="dots"&&e.jsx("div",{className:"d-flex gap-2 mb-3",children:[0,1,2].map(d=>e.jsx("div",{className:"rounded-circle bg-street-primary",style:{width:t.dots,height:t.dots,animation:"dotPulse 0.8s infinite",animationDelay:`${d*.2}s`}},d))}),i==="pulse"&&e.jsx("div",{className:"rounded-circle bg-street-primary mb-3",style:{width:t.spinner,height:t.spinner,opacity:.6,animation:"pulseGrow 1.5s infinite"}}),i==="progress"&&e.jsxs("div",{className:"w-100 d-flex flex-column gap-12 ",children:[e.jsx("div",{className:"progress",style:{height:"8px"},children:e.jsx("div",{className:"progress-bar progress-bar-striped progress-bar-animated bg-street-primary",role:"progressbar",style:{width:`${a??0}%`}})}),e.jsxs("div",{className:"fw-semibold mt-2 text-street-dark",style:{fontSize:t.text},children:[Math.round(a||0),"%"]})]}),e.jsx("div",{className:"fw-semibold text-street-base",style:{fontSize:t.text},children:r}),n&&e.jsx("div",{className:"text-street-base mt-1",style:{fontSize:"0.85rem"},children:n})]}),e.jsx("style",{children:`
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

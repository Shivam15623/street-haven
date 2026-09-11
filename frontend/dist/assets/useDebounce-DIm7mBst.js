import{r as o}from"./index-C-AEaM24.js";function c(e,t=1e3){const[r,u]=o.useState(e);return o.useEffect(()=>{const n=setTimeout(()=>{u(e)},t);return()=>{clearTimeout(n)}},[e,t]),r}export{c as u};

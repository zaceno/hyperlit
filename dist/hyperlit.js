var html=function(t){let e,n,l,r,h,o,u;const p=()=>{},f=t=>" "==t||"\t"==t||"\n"==t||"\r"==t,g=e=>{l=[...l,"function"==typeof r?r(h,e):t.h(r,h,e)]},i=t=>(n,l=e)=>e=()=>t(n,l()),s=t=>(l=e)=>{n.push(e=>{t(e,l())}),e=p},c=i(t=>t&&l.push(t)),m=i(t=>{r=t,h={}}),a=i(t=>{h[t]=!0}),d=i(t=>{o=t,h[t]=""}),y=i(t=>{h[o]+=t}),E=i(()=>g([])),j=i(()=>{u=[l,h,r,u],l=[]}),v=i(()=>{let t=l;l=u[0],h=u[1],r=u[2],u=u[3],g(t)}),b=s(t=>{h[o]+=t}),k=s((t=[])=>{l.push(t)}),q=s(t=>{r=t,h={}}),w=s(t=>{h={...h,...t}}),x=s((t=!0)=>{h[o]=t}),z=s(p),A=t=>{e=p,n=[],(t=>{let e,n="",l=0;for(let r=0;r<t.length;r++){for(let h=0;h<t[r].length;h++)e=t[r][h],0==l?"<"==e?l=2:f(e)||(l=1,n=e):1==l?"<"==e?(c(n.trimEnd()),n="",l=2):n+=e:2==l?"/"==e?l=3:(l=4,n=e):3==l?">"==e&&(v(),l=0):4==l?f(e)?(m(n),l=5):"/"==e?(m(n),l=6):">"==e?(m(n),j(),l=0):n+=e:6==l?">"==e&&(E(),l=0):5==l?"."==e||("/"==e?l=6:">"==e?(j(),l=0):f(e)||(n=e,l=7)):7==l?"="==e?(d(n),l=8):">"==e?(a(n),j(),l=0):"/"==e?(a(n),l=6):f(e)?(a(n),l=5):n+=e:8==l?'"'==e&&(l=9,n=""):9==l&&('"'==e?(y(n),l=5):n+=e);2==l?(q(),l=5):1==l?r==t.length-1?(c(n.trimEnd()),n=""):(c(n),n="",k()):5==l?w():8==l?(x(),l=5):9==l?(y(n),b(),n=""):3==l?z():0==l&&r<t.length-1&&k()}})(t);let r=e,h=n;return t=>{l=[];for(let e=0;e<t.length;e++)h[e](t[e]);return r(),l.length>1?l:l[0]}},B={};return(t,...e)=>((t,e=t.join("|"),n=B[e])=>n||(B[e]=A(t)))(t)(e)}(hyperapp);

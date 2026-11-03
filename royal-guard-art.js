// Vector-native animation sheets: transparent, four directions, six distinct
// poses for walking, breathing on watch and weapon attacks. No remote assets.
export function royalGuardSheet(weapon){
 if(!['sword','spear'].includes(weapon))throw Error('Unknown royal weapon');
 const cells=[];
 for(let row=0;row<12;row++)for(let frame=0;frame<6;frame++){
  const view=row%4,back=view===2,side=view===1||view===3,flip=view===3?-1:1,attack=row>=8,walk=row<4;
  const beat=frame/6*Math.PI*2,stride=walk?Math.sin(beat)*9:0,bob=walk?Math.abs(Math.sin(beat))*1.5:Math.sin(beat)*.8;
  const reach=attack?Math.sin(frame/5*Math.PI):0,arm=weapon==='spear'?-reach*15:-reach*110;
  const armor=back?'#667986':'#a3b4be',tabard=weapon==='spear'?'#233f65':'#8b2938';
  const blade=weapon==='spear'?'<path d="M0 35V-98" stroke="#704d2c" stroke-width="5"/><path d="M0-120 -6-97 0-102 6-97Z" fill="#d6e4e7"/><path d="M0-115V-101" stroke="#fff"/>':'<path d="M-3 9V-57L0-71 4-57V9Z" fill="#d5e3e7"/><path d="M0-62V6" stroke="#fff"/><path d="M-11 9H12" stroke="#c5a557" stroke-width="5"/><path d="M0 12V26" stroke="#45352b" stroke-width="5"/><circle cy="28" r="4" fill="#c5a557"/>';
  cells.push(`<g transform="translate(${frame*140+70} ${row*256+242}) scale(${flip} 1)" stroke="#27313b" stroke-width="2" stroke-linejoin="round"><g transform="translate(0 ${bob})">
   <path d="M-16-77 -21 ${-28+stride} -24 ${-3+stride*.25} -7 ${-3+stride*.25} -5-69Z" fill="#677d8b"/><path d="M5-69 7 ${-3-stride*.25} 25 ${-3-stride*.25} 21 ${-28-stride} 16-77Z" fill="#95a8b3"/>
   <path d="M-24 ${-16+stride*.25} -28 0H-6V-16Z M7-16V0H29L24-16Z" fill="#3b3029"/>
   <path d="M-21-146 -29-98 -21-60 22-60 29-98 21-146Z" fill="${armor}"/>
   <path d="M-14-143 -17-65 0-52 17-65 14-143Z" fill="${tabard}"/>
   ${back?'':`<path d="M-7-122H7M0-129V-107M-7-115H7" stroke="#e5c56f" stroke-width="3"/>`}
   <path d="M-25-139 -33-130 -26-118 -16-124 -15-138Z M16-138 25-141 34-129 27-118 17-124Z" fill="#b5c2c7"/>
   <path d="M-19-94H19" stroke="#3b3029" stroke-width="7"/><rect x="-4" y="-98" width="8" height="8" fill="#d5b56a"/>
   <g transform="translate(${side?16:28} -114) rotate(${arm+(walk?Math.sin(beat)*7:0)})"><path d="M-3-12 4 12" stroke="${armor}" stroke-width="13"/><circle cy="11" r="6" fill="#738995"/>${blade}</g>
   ${weapon==='sword'?`<path d="M-39-128 -14-128 -15-92 -27-79 -40-92Z" fill="${back?'#604331':tabard}" stroke="#c2a265" stroke-width="3"/>${back?'':'<path d="M-33-113H-20M-27-120V-96" stroke="#e6ca80" stroke-width="3"/>'}`:'<path d="M-24-124 -32-100 -14-96" fill="none" stroke="#879faa" stroke-width="11"/>'}
   <path d="M-12-171H12L14-147H-14Z" fill="#b3987a"/><path d="M-19-169Q-20-195 0-199Q21-194 19-169L14-148H-14Z" fill="${armor}"/>
   ${back?'<path d="M-13-176H13M-11-167H11M-9-159H9" stroke="#465b6b"/>':side?'<path d="M2-180 20-177 18-167 2-166Z" fill="#273442"/><path d="M7-174H17" stroke="#131e26"/>':'<path d="M-14-180H14L12-169H-12Z" fill="#273442"/><path d="M-11-175H11" stroke="#101b26"/><path d="M0-181V-153" stroke="#d0dadd" stroke-width="4"/>'}
   <path d="M-3-198Q-8-215 3-219Q15-210 10-197Z" fill="${tabard}"/><path d="M-17-189Q0-201 17-189" fill="none" stroke="#c9d4d8"/>
  </g></g>`);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="3072" viewBox="0 0 840 3072">${cells.join('')}</svg>`;
}
export const royalGuardSheetURL=weapon=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(royalGuardSheet(weapon));

(()=>{
  const splash=document.getElementById('splash');
  const endSplash=()=>{if(!splash)return;splash.classList.add('done');setTimeout(()=>splash.remove(),800)};
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let already=false;try{already=sessionStorage.getItem('noverra-intro-seen')==='1';sessionStorage.setItem('noverra-intro-seen','1')}catch(e){}
  if(reduceMotion||already)endSplash();else setTimeout(endSplash,3300);
  document.getElementById('skip-intro')?.addEventListener('click',endSplash);
  const menuButton=document.getElementById('menu-button'),mobileNav=document.getElementById('mobile-nav');
  const closeMenu=()=>{mobileNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')};
  menuButton?.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});
  mobileNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.09,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  const workflowData=[
    {icon:'✉',title:'A service request is received',description:'An occupant reports an issue with its location, category and supporting details.'},
    {icon:'▤',title:'A traceable case is created',description:'The issue receives a reference, priority, status and a record linked to the correct space.'},
    {icon:'⌁',title:'The right team takes ownership',description:'A work order connects the issue to a technician, supervisor and relevant asset.'},
    {icon:'⚒',title:'Work happens with context',description:'Technicians document progress, material usage, photos and findings while the job moves ahead.'},
    {icon:'✓',title:'Verified. Closed. Remembered.',description:'Supervisory review finalises the work and adds a permanent chapter to the asset history.'}
  ];
  const steps=[...document.querySelectorAll('.workflow-step')],progress=[...document.querySelectorAll('#workflow-progress span')];
  const setStep=(index)=>{const d=workflowData[index];steps.forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-selected',String(i===index))});document.getElementById('workflow-icon').textContent=d.icon;document.getElementById('workflow-number').textContent=String(index+1).padStart(2,'0')+' / 05';document.getElementById('workflow-title').textContent=d.title;document.getElementById('workflow-description').textContent=d.description;progress.forEach((p,i)=>p.classList.toggle('on',i<=index));const ring=document.querySelector('.workflow-ring');ring.classList.remove('pulse');void ring.offsetWidth;ring.classList.add('pulse');setTimeout(()=>ring.classList.remove('pulse'),380)};
  steps.forEach((button,index)=>button.addEventListener('click',()=>setStep(index)));
  const form=document.getElementById('inquiry-form'),result=document.getElementById('form-result');
  form?.addEventListener('submit',async(event)=>{
    event.preventDefault();if(!form.reportValidity())return;
    const data=new FormData(form),name=String(data.get('name')||'').trim(),email=String(data.get('email')||'').trim(),org=String(data.get('organization')||'').trim(),interest=String(data.get('interest')||''),message=String(data.get('message')||'').trim();
    const draft=`Noverra Solution — Portfolio Enquiry\n\nName: ${name}\nEmail: ${email}\nOrganisation: ${org}\nInterest: ${interest}\n\nRequirements:\n${message||'(Not supplied)'}`;
    result.hidden=false;result.replaceChildren();
    const text=document.createElement('div');text.textContent='Your enquiry is prepared. Copy it to send through your preferred email or messaging app. No message has been sent.';
    const button=document.createElement('button');button.type='button';button.textContent='Copy enquiry';button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft);button.textContent='Copied ✓'}catch(e){const box=document.createElement('textarea');box.value=draft;box.style.width='100%';result.appendChild(box);box.select();button.textContent='Select and copy text'}});
    result.append(text,button);
  });
})();

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStudy } from '@/lib/store';
import { Study, Question } from '@/lib/types';
import {
  ArrowLeft, ArrowRight, X, Mic, Video, MessageSquare,
  Play, CheckCircle2, Lock, ChevronRight, FileText,
  Shield, Clock, PartyPopper, Star, Send, LayoutGrid,
} from 'lucide-react';

type SimStep = 'consent' | 'welcome' | 'modules' | 'questions' | 'module-complete' | 'finished';

/* ── Palette ──────────────────────────────────────────────────────
   Inspired by reference UI: warm off-white bg, pure white cards,
   dark sage-green accent for high contrast CTAs, clear state colours.
*/
const BG   = '#EDE9E2';   // page background
const CARD = '#FFFFFF';   // card surface
const GRN  = '#2D6B50';   // primary CTA – sage green
const GRN2 = '#245740';   // hover
const GRN_LIGHT = '#E6F2EC'; // completed badge bg
const GRN_TEXT  = '#1E5940'; // completed text

const TEXT    = '#1A1814';  // primary text
const TEXT2   = '#4A4540';  // secondary
const MUTED   = '#807870';  // muted
const FAINT   = '#ABA5A0';  // placeholder / locked

const BORDER  = '#D8D2CB';  // card border
const BORDER2 = '#EAE5DE';  // inner / light divider

const BADGE_LOCKED = '#EAE5DE';   // locked number bg
const BADGE_NUM    = '#3D3830';   // available number bg
const BADGE_GRN    = '#2D6B50';   // actually not used separately

const css = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn    { 0%{opacity:0;transform:scale(.93)} 100%{opacity:1;transform:scale(1)} }
  .fu  { animation: fadeUp .36s cubic-bezier(.22,1,.36,1) both; }
  .fu1 { animation-delay:.05s }
  .fu2 { animation-delay:.10s }
  .fu3 { animation-delay:.15s }
  .fu4 { animation-delay:.20s }
  .pi  { animation: popIn .32s cubic-bezier(.34,1.56,.64,1) both; }
  .mc:hover { background:#F5F2EE !important; }
  .mc-green:hover { background:${GRN2} !important; }
  .nav-btn:hover { background:#F0ECE7 !important; }
  .qopt:hover:not(.qopt-sel) { border-color:#B0A89E !important; background:#FAFAF8 !important; }
`;

/* ── Shared Shell ─────────────────────────────────────────────── */
function Shell({ children, title, onExit, showNav = true }: {
  children: React.ReactNode; title: string; onExit: () => void; showNav?: boolean;
}) {
  return (
    <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',flexDirection:'column',
      background:BG, fontFamily:'var(--font-sans,system-ui),sans-serif' }}>
      <style>{css}</style>
      {showNav && (
        <header style={{ height:52, paddingInline:24, display:'flex', alignItems:'center',
          justifyContent:'space-between', background:'rgba(237,233,226,.92)',
          backdropFilter:'blur(10px)', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28,height:28,borderRadius:7,background:GRN,
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#fff',fontWeight:800,fontSize:12,letterSpacing:'-.02em' }}>A</div>
            <span style={{ fontSize:13,fontWeight:500,color:TEXT2 }}>{title}</span>
          </div>
          <button onClick={onExit} className="nav-btn"
            style={{ display:'flex',alignItems:'center',gap:5, fontSize:12,fontWeight:500,
              color:MUTED, background:'transparent',border:'none',cursor:'pointer',
              padding:'5px 10px',borderRadius:7,transition:'background .15s' }}>
            <X size={13}/> Quitter
          </button>
        </header>
      )}
      <div style={{ flex:1,overflowY:'auto' }}>{children}</div>
    </div>
  );
}

/* ── Consent ──────────────────────────────────────────────────── */
function ConsentView({ study, modules, onAccept, onDecline }: {
  study: Study; modules: Study['protocol']['modules'];
  onAccept:()=>void; onDecline:()=>void;
}) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <div style={{ display:'flex',justifyContent:'center',padding:'36px 20px',minHeight:'100%' }}>
      <div className="fu" style={{ width:'100%',maxWidth:620 }}>
        <div style={{ textAlign:'center',marginBottom:24 }}>
          <div style={{ width:52,height:52,margin:'0 auto 14px',background:GRN_LIGHT,
            borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Shield size={24} color={GRN}/>
          </div>
          <h1 style={{ fontSize:21,fontWeight:700,color:TEXT,margin:'0 0 6px',letterSpacing:'-.02em' }}>
            Formulaire de consentement
          </h1>
          <p style={{ fontSize:13,color:MUTED,margin:0 }}>
            Lisez le document entièrement pour pouvoir continuer
          </p>
        </div>

        {/* Document */}
        <div
          onScroll={e=>{ const el=e.currentTarget; if(el.scrollTop+el.clientHeight>=el.scrollHeight-30) setScrolled(true); }}
          style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,
            padding:'28px 32px',maxHeight:'46vh',overflowY:'auto',
            boxShadow:'0 1px 8px rgba(0,0,0,.06)' }}>
          <div style={{ borderBottom:`1px solid ${BORDER2}`,paddingBottom:18,marginBottom:22 }}>
            <p style={{ fontSize:10,fontWeight:700,letterSpacing:'.12em',color:FAINT,
              textTransform:'uppercase',margin:'0 0 7px' }}>
              Comité d&apos;éthique de la recherche
            </p>
            <h2 style={{ fontSize:16,fontWeight:700,color:TEXT,margin:'0 0 5px' }}>{study.name}</h2>
            <p style={{ fontSize:12,color:MUTED,margin:0 }}>
              Protocole v{study.protocol.version} — Approuvé le 15 janvier 2026
            </p>
          </div>
          {[
            ['1. Nature et objectif',
              <>{study.description}<br/><br/>Cette recherche est menée par le Laboratoire PCAN du CRIUGM, affilié à l&apos;Université de Montréal.</>],
            ['2. Déroulement',
              <>Votre participation consiste à compléter {modules.length} module{modules.length>1?'s':''} comprenant
              des questionnaires, tâches audio/vidéo et exercices interactifs. La durée estimée est d&apos;environ{' '}
              {modules.reduce((s,m)=>s+Math.max(m.questions.length*2,5),0)} minutes.</>],
            ['3. Confidentialité',
              <>Vos données seront pseudonymisées sur des serveurs sécurisés au Canada.
              Seuls les chercheurs autorisés auront accès aux données brutes.</>],
            ['4. Risques et bénéfices',
              <>Les risques sont minimaux. Si vous ressentez un malaise, vous êtes libre
              de ne pas répondre ou d&apos;interrompre l&apos;étude à tout moment.</>],
            ['5. Droit de retrait',
              <>Vous pouvez vous retirer sans préjudice. Les données seront supprimées sur
              demande (Loi 25 du Québec / RGPD).</>],
            ['6. Contact',
              <>Pour toute question : <strong>contact@apertum.io</strong></>],
          ].map(([title,body],i)=>(
            <div key={i} style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:13,fontWeight:600,color:TEXT2,margin:'0 0 5px' }}>{title as string}</h3>
              <p style={{ fontSize:13,color:TEXT2,lineHeight:1.7,margin:0 }}>{body as React.ReactNode}</p>
            </div>
          ))}
        </div>

        {!scrolled && (
          <p style={{ textAlign:'center',fontSize:11,color:FAINT,margin:'10px 0 0' }}>
            ↓ Faites défiler l&apos;intégralité du document pour continuer
          </p>
        )}

        <div style={{ display:'flex',gap:10,marginTop:16 }}>
          <button onClick={onAccept} disabled={!scrolled}
            style={{ flex:1,padding:'13px 20px',borderRadius:10,
              background:scrolled?GRN:BADGE_LOCKED, color:scrolled?'#fff':FAINT,
              fontWeight:600,fontSize:14,border:'none',
              cursor:scrolled?'pointer':'not-allowed',transition:'background .2s' }}
            onMouseEnter={e=>scrolled&&(e.currentTarget.style.background=GRN2)}
            onMouseLeave={e=>(e.currentTarget.style.background=scrolled?GRN:BADGE_LOCKED)}>
            J&apos;accepte et je consens à participer
          </button>
          <button onClick={onDecline}
            style={{ flex:1,padding:'13px 20px',borderRadius:10,background:CARD,
              color:TEXT2,fontWeight:500,fontSize:14,border:`1px solid ${BORDER}`,cursor:'pointer' }}
            onMouseEnter={e=>(e.currentTarget.style.background=BG)}
            onMouseLeave={e=>(e.currentTarget.style.background=CARD)}>
            Je refuse
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Welcome ──────────────────────────────────────────────────── */
function WelcomeView({ study, modules, onStart }: {
  study:Study; modules:Study['protocol']['modules']; onStart:()=>void;
}) {
  const totalMin = modules.reduce((s,m)=>s+Math.max(m.questions.length*2,5),0);
  return (
    <div style={{ display:'flex',justifyContent:'center',alignItems:'center',
      minHeight:'100%',padding:'40px 20px' }}>
      <div className="fu" style={{ width:'100%',maxWidth:500,textAlign:'center' }}>
        <div style={{ width:72,height:72,margin:'0 auto 22px',borderRadius:20,background:GRN,
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:'0 8px 24px rgba(45,107,80,.28)' }}>
          <span style={{ fontSize:28,fontWeight:800,color:'#fff' }}>A</span>
        </div>
        <h1 style={{ fontSize:26,fontWeight:700,color:TEXT,margin:'0 0 6px',letterSpacing:'-.02em' }}>
          Bienvenue !
        </h1>
        <p style={{ fontSize:14,color:MUTED,margin:'0 0 28px' }}>
          Merci de participer à cette étude.
        </p>

        <div style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,
          padding:'20px 24px',textAlign:'left',marginBottom:24,
          boxShadow:'0 1px 6px rgba(0,0,0,.05)' }}>
          <h2 style={{ fontSize:15,fontWeight:700,color:TEXT,margin:'0 0 6px' }}>{study.name}</h2>
          <p style={{ fontSize:13,color:MUTED,margin:'0 0 16px',lineHeight:1.65 }}>{study.description}</p>
          <div style={{ display:'flex',gap:20 }}>
            {[
              [<FileText key="f" size={13} color={GRN}/>, `${modules.length} module${modules.length>1?'s':''}`],
              [<Clock key="c" size={13} color={GRN}/>, `~${totalMin} min`],
            ].map(([icon,label],i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',gap:6,fontSize:13,color:TEXT2 }}>
                {icon as React.ReactNode}{label as string}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onStart} className="mc-green"
          style={{ width:'100%',padding:'14px 24px',borderRadius:11,background:GRN,
            color:'#fff',fontWeight:600,fontSize:14,border:'none',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            boxShadow:'0 4px 16px rgba(45,107,80,.22)',transition:'background .15s' }}>
          Commencer l&apos;étude <ArrowRight size={16}/>
        </button>
        <p style={{ fontSize:11,color:FAINT,marginTop:10 }}>
          Vous pouvez interrompre à tout moment et reprendre plus tard.
        </p>
      </div>
    </div>
  );
}

/* ── Modules dashboard ────────────────────────────────────────── */
function ModulesView({ study, modules, completedModules, answers, isModuleUnlocked, startModule }: {
  study: Study;
  modules: Study['protocol']['modules'];
  completedModules: Set<number>;
  answers: Record<string,string>;
  isModuleUnlocked: (i:number)=>boolean;
  startModule: (i:number)=>void;
}) {
  const totalQ = modules.reduce((s,m)=>s+m.questions.length,0);
  const answeredQ = modules.reduce((s,m,idx)=>{
    if(completedModules.has(idx)) return s+m.questions.length;
    return s+m.questions.filter(q=>answers[q.id]).length;
  },0);
  const pct = totalQ>0 ? Math.round((answeredQ/totalQ)*100) : 0;

  return (
    <div style={{ display:'flex',justifyContent:'center',padding:'32px 20px',minHeight:'100%' }}>
      <div style={{ width:'100%',maxWidth:580 }}>

        {/* Study info card — like reference */}
        <div className="fu" style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,
          padding:'18px 20px',marginBottom:28,boxShadow:'0 1px 6px rgba(0,0,0,.05)' }}>
          <p style={{ fontSize:13,fontWeight:600,color:TEXT2,margin:'0 0 2px' }}>
            CRIUGM — Université de Montréal
          </p>
          <p style={{ fontSize:12,color:MUTED,margin:'0 0 14px' }}>
            {study.name}
          </p>
          {/* Progress bar */}
          <div style={{ height:8,background:BORDER2,borderRadius:4,overflow:'hidden',marginBottom:6 }}>
            <div style={{ height:'100%',width:`${pct}%`,background:GRN,borderRadius:4,
              transition:'width .5s ease' }}/>
          </div>
          <div style={{ textAlign:'right',fontSize:13,fontWeight:600,color:GRN_TEXT }}>
            {pct}% complété
          </div>
        </div>

        {/* Section label */}
        <p className="fu fu1" style={{ fontSize:11,fontWeight:700,letterSpacing:'.1em',
          color:MUTED,textTransform:'uppercase',margin:'0 0 12px' }}>
          Modules
        </p>

        {/* Module list */}
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {modules.map((mod,idx)=>{
            const unlocked = isModuleUnlocked(idx);
            const completed = completedModules.has(idx);
            return (
              <button key={mod.id} onClick={()=>startModule(idx)} disabled={!unlocked}
                className={`fu fu${Math.min(idx+2,4)} ${unlocked&&!completed?'mc':''}`}
                style={{ width:'100%',textAlign:'left',padding:'16px 18px',borderRadius:12,
                  background:CARD,border:`1px solid ${BORDER}`,cursor:unlocked?'pointer':'default',
                  display:'flex',alignItems:'center',gap:16,
                  boxShadow:unlocked&&!completed?'0 1px 4px rgba(0,0,0,.04)':'none',
                  transition:'background .15s' }}>

                {/* Icon badge */}
                <div style={{ width:40,height:40,borderRadius:10,flexShrink:0,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  background: completed ? GRN_LIGHT : unlocked ? BADGE_NUM : BADGE_LOCKED,
                  color: completed ? GRN : unlocked ? '#fff' : FAINT,
                  fontSize:15,fontWeight:700 }}>
                  {completed
                    ? <CheckCircle2 size={20} color={GRN}/>
                    : unlocked ? idx+1
                    : <Lock size={15} color={FAINT}/>
                  }
                </div>

                {/* Text */}
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:14,fontWeight:completed?600:unlocked?600:500,
                    color:unlocked?TEXT:FAINT,margin:'0 0 2px',
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                    {mod.name}
                  </p>
                  <p style={{ fontSize:12,margin:0,
                    color: completed ? GRN_TEXT : unlocked ? MUTED : FAINT }}>
                    {completed ? 'Complété'
                      : unlocked ? 'Disponible — Commencer'
                      : 'Verrouillé'}
                  </p>
                </div>

                {/* Arrow or check marker */}
                {unlocked && !completed && <Play size={15} color={GRN} style={{ flexShrink:0 }}/>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Question page ────────────────────────────────────────────── */
function QuestionView({ currentModule, currentQuestion, currentQuestionIdx, answer, setAnswer, onPrev, onNext, onBackToModules }: {
  currentModule: Study['protocol']['modules'][0];
  currentQuestion: Question;
  currentQuestionIdx: number;
  answer: string;
  setAnswer: (v:string)=>void;
  onPrev: ()=>void;
  onNext: ()=>void;
  onBackToModules: ()=>void;
}) {
  const q = currentQuestion;
  const total = currentModule.questions.length;
  const pct = ((currentQuestionIdx+1)/total)*100;

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>

      {/* Top bar — like reference */}
      <div style={{ flexShrink:0,background:BG,borderBottom:`1px solid ${BORDER}` }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'10px 20px 8px' }}>
          <button onClick={onBackToModules}
            style={{ display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:500,
              color:TEXT2,background:'none',border:'none',cursor:'pointer',padding:0 }}>
            <LayoutGrid size={14} color={MUTED}/> Modules
          </button>
          <span style={{ fontSize:12,fontWeight:500,color:MUTED,
            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:280,textAlign:'right' }}>
            {currentModule.name}
          </span>
        </div>
        {/* Full-width green progress bar */}
        <div style={{ height:4,background:BORDER2 }}>
          <div style={{ height:'100%',width:`${pct}%`,background:GRN,
            transition:'width .3s ease' }}/>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',
          padding:'5px 20px 8px',fontSize:11,color:MUTED }}>
          <span>Question {currentQuestionIdx+1} / {total}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1,overflowY:'auto',padding:'24px 20px',
        display:'flex',justifyContent:'center' }}>
        <div className="fu" style={{ width:'100%',maxWidth:580 }}>
          {/* Question card */}
          <div style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,
            padding:'22px 24px',boxShadow:'0 1px 6px rgba(0,0,0,.05)' }}>

            {/* Question badge + label */}
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
              <span style={{ width:28,height:28,borderRadius:8,background:GRN_LIGHT,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:13,fontWeight:700,color:GRN,flexShrink:0 }}>
                {currentQuestionIdx+1}
              </span>
              <span style={{ fontSize:11,fontWeight:700,letterSpacing:'.1em',
                color:MUTED,textTransform:'uppercase' }}>Question</span>
            </div>

            {/* Consigne */}
            {q.consigne.type==='image' && (
              <div style={{ height:140,background:BG,borderRadius:10,marginBottom:14,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:MUTED }}>
                [Image de consigne]
              </div>
            )}
            {q.consigne.type==='video' && (
              <div style={{ height:140,background:'#1A1A1A',borderRadius:10,marginBottom:14,
                display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Play size={28} color="rgba(255,255,255,.6)"/>
              </div>
            )}

            <h2 style={{ fontSize:17,fontWeight:600,color:TEXT,margin:'0 0 8px',lineHeight:1.4 }}>
              {q.label}
            </h2>
            {q.consigne.content && (
              <p style={{ fontSize:13,color:MUTED,lineHeight:1.7,margin:'0 0 18px' }}>
                {q.consigne.content}
              </p>
            )}

            {/* ── QCM ── */}
            {q.type==='qcm' && q.options && (
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {q.options.map((opt,oi)=>(
                  <button key={opt} onClick={()=>setAnswer(opt)}
                    className={answer===opt?'':'qopt'}
                    style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
                      borderRadius:8,background:answer===opt?GRN:CARD,
                      border:`1.5px solid ${answer===opt?GRN:BORDER}`,
                      color:answer===opt?'#fff':TEXT,textAlign:'left',
                      cursor:'pointer',fontSize:14,fontWeight:answer===opt?600:400,
                      transition:'border-color .15s,background .15s' }}>
                    <span style={{ width:22,height:22,borderRadius:'50%',flexShrink:0,border:`2px solid ${answer===opt?'rgba(255,255,255,.4)':BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:answer===opt?'#fff':FAINT }}>
                      {String.fromCharCode(65+oi)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* ── Likert — grid of numbered boxes like reference ── */}
            {q.type==='likert' && q.options && (
              <div>
                <div style={{ display:'grid',gridTemplateColumns:`repeat(${Math.min(q.options.length,5)},1fr)`,gap:8,marginBottom:8 }}>
                  {q.options.map((opt,i)=>(
                    <button key={opt} onClick={()=>setAnswer(opt)}
                      style={{ padding:'14px 8px',borderRadius:10,
                        background:answer===opt?GRN:CARD,
                        border:`1.5px solid ${answer===opt?GRN:BORDER}`,
                        color:answer===opt?'#fff':TEXT,cursor:'pointer',
                        fontSize:18,fontWeight:700,transition:'all .15s',
                        display:'flex',alignItems:'center',justifyContent:'center' }}>
                      {i}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:MUTED }}>
                  <span>{q.options[0]}</span>
                  <span>{q.options[q.options.length-1]}</span>
                </div>
              </div>
            )}

            {/* ── Texte ── */}
            {q.type==='texte' && (
              <textarea placeholder="Votre réponse..." rows={5} value={answer}
                onChange={e=>setAnswer(e.target.value)}
                style={{ width:'100%',padding:'12px 14px',borderRadius:8,resize:'none',
                  background:BG,border:`1.5px solid ${BORDER}`,color:TEXT,
                  fontSize:14,lineHeight:1.6,outline:'none',boxSizing:'border-box',
                  fontFamily:'inherit',transition:'border-color .15s' }}
                onFocus={e=>(e.target.style.borderColor=GRN)}
                onBlur={e=>(e.target.style.borderColor=BORDER)}/>
            )}

            {/* ── Audio ── */}
            {q.type==='audio' && (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:14,
                padding:'24px 0 8px' }}>
                <button onClick={()=>setAnswer(answer?'':'audio_recorded')}
                  style={{ width:72,height:72,borderRadius:'50%',border:'none',cursor:'pointer',
                    background:answer?GRN:'#FDECEA',color:answer?'#fff':'#D63031',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    boxShadow:answer?`0 0 0 8px ${GRN_LIGHT}`:'0 0 0 8px #FDE8E8',
                    transition:'all .2s' }}>
                  <Mic size={28}/>
                </button>
                <p style={{ fontSize:13,color:MUTED,margin:0,textAlign:'center' }}>
                  {answer?'Enregistrement terminé — appuyer pour recommencer':'Appuyer pour enregistrer'}
                </p>
              </div>
            )}

            {/* ── Video ── */}
            {q.type==='video' && (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:10 }}>
                <div style={{ width:'100%',height:160,background:'#111',borderRadius:10,
                  display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Video size={32} color="rgba(255,255,255,.35)"/>
                </div>
                <button onClick={()=>setAnswer(answer?'':'video_recorded')}
                  style={{ padding:'10px 22px',borderRadius:8,
                    background:answer?GRN:BG,color:answer?'#fff':TEXT2,
                    border:`1.5px solid ${answer?GRN:BORDER}`,cursor:'pointer',
                    fontSize:13,fontWeight:600 }}>
                  <Video size={13} style={{ display:'inline',marginRight:6,verticalAlign:'middle'}}/>
                  {answer?'Enregistré — Recommencer':'Démarrer la caméra'}
                </button>
              </div>
            )}

            {/* ── Video visionnage ── */}
            {q.type==='video_visionnage' && (
              <div>
                <div style={{ height:160,background:'#111',borderRadius:10,
                  display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                  onClick={()=>setAnswer('video_watched')}>
                  <div style={{ width:52,height:52,borderRadius:'50%',
                    background:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <Play size={22} color="#fff"/>
                  </div>
                </div>
                <p style={{ fontSize:12,color:answer?GRN_TEXT:MUTED,margin:'8px 0 0',textAlign:'center' }}>
                  {answer?'✓ Vidéo visionnée':'Cliquer pour lire la vidéo'}
                </p>
              </div>
            )}

            {/* ── IA ── */}
            {q.type==='ia' && (
              <div style={{ border:`1px solid ${BORDER}`,borderRadius:10,overflow:'hidden' }}>
                <div style={{ padding:'10px 14px',background:BG,borderBottom:`1px solid ${BORDER}`,
                  display:'flex',alignItems:'center',gap:7 }}>
                  <MessageSquare size={13} color={MUTED}/>
                  <span style={{ fontSize:12,color:MUTED,fontWeight:500 }}>Conversation avec l&apos;assistant IA</span>
                </div>
                <div style={{ padding:14,maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:10 }}>
                  <div style={{ background:BORDER2,color:TEXT2,padding:'9px 13px',borderRadius:'4px 10px 10px 10px',fontSize:13,maxWidth:'80%',lineHeight:1.6 }}>
                    Bonjour ! Comment allez-vous aujourd&apos;hui ?
                  </div>
                  {answer&&<div style={{ background:GRN,color:'#fff',padding:'9px 13px',borderRadius:'10px 4px 10px 10px',fontSize:13,maxWidth:'80%',marginLeft:'auto',lineHeight:1.6 }}>{answer}</div>}
                </div>
                <div style={{ padding:'10px 12px',borderTop:`1px solid ${BORDER}`,display:'flex',gap:8 }}>
                  <input placeholder="Votre message..." value={answer}
                    onChange={e=>setAnswer(e.target.value)}
                    style={{ flex:1,padding:'8px 12px',borderRadius:7,fontSize:13,
                      background:BG,border:`1px solid ${BORDER}`,color:TEXT,outline:'none',fontFamily:'inherit' }}/>
                  <button style={{ padding:'8px 12px',borderRadius:7,background:GRN,color:'#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center' }}>
                    <Send size={13}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer — like reference: two clear buttons */}
      <div style={{ flexShrink:0,padding:'14px 20px',borderTop:`1px solid ${BORDER}`,
        background:BG,display:'flex',gap:12 }}>
        <button onClick={onBackToModules}
          style={{ flex:1,padding:'13px 16px',borderRadius:10,background:CARD,
            color:TEXT2,fontWeight:500,fontSize:14,border:`1px solid ${BORDER}`,
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,
            transition:'background .15s' }}
          onMouseEnter={e=>(e.currentTarget.style.background=BG)}
          onMouseLeave={e=>(e.currentTarget.style.background=CARD)}>
          <ArrowLeft size={15}/> Modules
        </button>
        <button onClick={onNext} className="mc-green"
          style={{ flex:1,padding:'13px 16px',borderRadius:10,background:GRN,
            color:'#fff',fontWeight:600,fontSize:14,border:'none',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:7,
            boxShadow:'0 3px 12px rgba(45,107,80,.22)',transition:'background .15s' }}>
          {currentQuestionIdx===currentModule.questions.length-1?'Terminer':'Suivant'}
          <ArrowRight size={15}/>
        </button>
      </div>
    </div>
  );
}

/* ── Module complete ──────────────────────────────────────────── */
function ModuleCompleteView({ completedMod, completedCount, totalModules, nextMod, onNext, onBackToModules }: {
  completedMod:{name:string}; completedCount:number; totalModules:number;
  nextMod:{name:string}|undefined; onNext:()=>void; onBackToModules:()=>void;
}) {
  return (
    <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100%',padding:32 }}>
      <div className="pi" style={{ width:'100%',maxWidth:420,textAlign:'center' }}>
        <div style={{ width:68,height:68,margin:'0 auto 18px',background:GRN_LIGHT,borderRadius:20,
          display:'flex',alignItems:'center',justifyContent:'center' }}>
          <PartyPopper size={30} color={GRN}/>
        </div>
        <h1 style={{ fontSize:21,fontWeight:700,color:TEXT,margin:'0 0 8px' }}>Module terminé !</h1>
        <p style={{ fontSize:14,color:MUTED,margin:'0 0 24px' }}>
          Vous avez complété <strong style={{ color:TEXT }}>{completedMod.name}</strong>.
        </p>

        {/* Progress pills */}
        <div style={{ display:'flex',gap:6,justifyContent:'center',marginBottom:8 }}>
          {Array.from({length:totalModules},(_,i)=>(
            <div key={i} style={{ height:5,flex:1,borderRadius:3,
              background:i<completedCount?GRN:BORDER2,transition:'background .3s' }}/>
          ))}
        </div>
        <p style={{ fontSize:12,color:MUTED,margin:'0 0 28px' }}>
          {completedCount}/{totalModules} module{totalModules>1?'s':''} complété{completedCount>1?'s':''}
        </p>

        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {nextMod&&(
            <button onClick={onNext} className="mc-green"
              style={{ width:'100%',padding:'13px 20px',borderRadius:10,background:GRN,
                color:'#fff',fontWeight:600,fontSize:14,border:'none',cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              Continuer : {nextMod.name} <ChevronRight size={15}/>
            </button>
          )}
          <button onClick={onBackToModules}
            style={{ width:'100%',padding:'12px 20px',borderRadius:10,background:CARD,
              color:TEXT2,fontWeight:500,fontSize:14,border:`1px solid ${BORDER}`,cursor:'pointer' }}>
            Retour aux modules
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Finished ─────────────────────────────────────────────────── */
function FinishedView({ modules, answersCount, onExit }: {
  modules:Study['protocol']['modules']; answersCount:number; onExit:()=>void;
}) {
  return (
    <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100%',padding:32 }}>
      <div className="pi" style={{ width:'100%',maxWidth:420,textAlign:'center' }}>
        <div style={{ width:72,height:72,margin:'0 auto 20px',borderRadius:20,background:GRN,
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:'0 8px 24px rgba(45,107,80,.28)' }}>
          <Star size={32} color="#fff" fill="#fff"/>
        </div>
        <h1 style={{ fontSize:22,fontWeight:700,color:TEXT,margin:'0 0 8px',letterSpacing:'-.02em' }}>
          Merci pour votre participation !
        </h1>
        <p style={{ fontSize:14,color:MUTED,margin:'0 0 24px',lineHeight:1.7 }}>
          Vous avez complété tous les modules.<br/>Vos réponses ont bien été enregistrées.
        </p>
        <div style={{ background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,
          padding:'18px 22px',marginBottom:22,textAlign:'left' }}>
          {[['Modules complétés',`${modules.length}/${modules.length}`],
            ['Questions répondues',`${answersCount}`]].map(([l,v],i)=>(
            <div key={i} style={{ display:'flex',justifyContent:'space-between',
              padding:i>0?'10px 0 0':'0 0 10px',
              borderBottom:i===0?`1px solid ${BORDER2}`:'none' }}>
              <span style={{ fontSize:13,color:MUTED }}>{l}</span>
              <span style={{ fontSize:13,fontWeight:600,color:GRN_TEXT }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={onExit} className="mc-green"
          style={{ width:'100%',padding:'13px 20px',borderRadius:10,background:GRN,
            color:'#fff',fontWeight:600,fontSize:14,border:'none',cursor:'pointer',
            boxShadow:'0 3px 12px rgba(45,107,80,.20)' }}>
          Fermer
        </button>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function SimulationPage() {
  const params = useParams();
  const router = useRouter();
  const [study, setStudy]  = useState<Study|null>(null);
  const [step, setStep]    = useState<SimStep>('consent');
  const [activeModIdx, setActiveModIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx]  = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<string,string>>({});

  useEffect(()=>{ const s=getStudy(params.id as string); if(s) setStudy(s); },[params.id]);

  if(!study) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:BG }}>
      <p style={{ color:MUTED }}>Étude non trouvée</p>
    </div>
  );

  const modules = study.protocol.modules;
  const handleExit = () => router.push(`/etudes/${study.id}`);
  const isModuleUnlocked = (i:number) => i===0 || completedModules.has(i-1);

  function startModule(idx:number) {
    if(!isModuleUnlocked(idx)) return;
    setActiveModIdx(idx); setCurrentQIdx(0); setStep('questions');
  }
  function goNext() {
    const mod = modules[activeModIdx];
    if(currentQIdx < mod.questions.length-1) { setCurrentQIdx(currentQIdx+1); }
    else {
      setCompletedModules(new Set([...completedModules,activeModIdx]));
      setStep(activeModIdx<modules.length-1?'module-complete':'finished');
    }
  }
  function goPrev() { if(currentQIdx>0) setCurrentQIdx(currentQIdx-1); }

  if(step==='consent') return (
    <Shell title={study.name} onExit={handleExit}>
      <ConsentView study={study} modules={modules} onAccept={()=>setStep('welcome')} onDecline={handleExit}/>
    </Shell>
  );
  if(step==='welcome') return (
    <Shell title={study.name} onExit={handleExit}>
      <WelcomeView study={study} modules={modules} onStart={()=>setStep('modules')}/>
    </Shell>
  );
  if(step==='modules') return (
    <Shell title={study.name} onExit={handleExit}>
      <ModulesView study={study} modules={modules} completedModules={completedModules}
        answers={answers} isModuleUnlocked={isModuleUnlocked} startModule={startModule}/>
    </Shell>
  );
  if(step==='module-complete') return (
    <Shell title={study.name} onExit={handleExit}>
      <ModuleCompleteView completedMod={modules[activeModIdx]}
        completedCount={completedModules.size} totalModules={modules.length}
        nextMod={modules[activeModIdx+1]} onNext={()=>startModule(activeModIdx+1)}
        onBackToModules={()=>setStep('modules')}/>
    </Shell>
  );
  if(step==='finished') return (
    <Shell title={study.name} onExit={handleExit}>
      <FinishedView modules={modules} answersCount={Object.keys(answers).length} onExit={handleExit}/>
    </Shell>
  );

  // Questions
  const currentModule = modules[activeModIdx];
  const currentQuestion = currentModule?.questions[currentQIdx];
  if(!currentModule||!currentQuestion) return (
    <Shell title={study.name} onExit={()=>setStep('modules')} showNav={false}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%' }}>
        <p style={{ color:MUTED }}>Aucune question dans ce module.</p>
      </div>
    </Shell>
  );

  return (
    <Shell title={study.name} onExit={()=>setStep('modules')} showNav={false}>
      <QuestionView
        currentModule={currentModule} currentQuestion={currentQuestion}
        currentQuestionIdx={currentQIdx}
        answer={answers[currentQuestion.id]||''}
        setAnswer={v=>setAnswers({...answers,[currentQuestion.id]:v})}
        onPrev={goPrev} onNext={goNext}
        onBackToModules={()=>setStep('modules')}/>
    </Shell>
  );
}

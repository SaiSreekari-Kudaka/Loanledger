import ThemeToggle from '../shared/ThemeToggle'

const FEATURES = [
  { icon: '📊', title: 'Unified loan logbook', desc: 'Track every loan — bank, amount, EMI, tenure and repayment progress — in one clean ledger.' },
  { icon: '🧮', title: 'Smart EMI & amortisation', desc: 'Instant EMI, interest split and a full month-by-month repayment schedule as you type.' },
  { icon: '⚖️', title: 'Compare lenders', desc: 'See total interest and monthly EMI side by side to pick the cheapest option.' },
  { icon: '🏦', title: 'Live bank rates', desc: 'Browse competitive interest rates across leading banks for every loan type.' },
]

const STEPS = [
  { n: 1, title: 'Create your account', desc: 'Sign up as an individual borrower or an NGO admin in seconds.' },
  { n: 2, title: 'Add your loans', desc: 'Log each loan and let LoanLedger auto-calculate EMI and schedules.' },
  { n: 3, title: 'Stay in control', desc: 'Record payments, monitor progress and make confident decisions.' },
]

export default function LandingPage({ onGetStarted }) {

  return (
    <div style={{ minHeight:'100vh', background:'var(--md-background)', position:'relative' }}>
      {/* Organic atmospheric blur shapes — signature Material You */}
      <div aria-hidden="true" className="md-blob" style={{ width:520, height:520, top:'-12%', left:'-8%', background:'rgba(103,80,164,0.22)' }} />
      <div aria-hidden="true" className="md-blob" style={{ width:420, height:420, top:'18%', right:'-10%', background:'rgba(125,82,96,0.18)' }} />

      {/* NAV */}
      <header style={{
        position:'sticky', top:0, zIndex:20,
        display:'flex', alignItems:'center', gap:16, padding:'16px 24px',
        background:'color-mix(in srgb, var(--md-background) 80%, transparent)',
        backdropFilter:'blur(10px)', borderBottom:'1px solid var(--md-outline-variant)',
      }}>
        <div style={{
          fontFamily:'var(--font-d)', fontSize:22, fontWeight:700,
          background:'linear-gradient(135deg,var(--md-primary),var(--md-tertiary))',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>LoanLedger</div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <ThemeToggle />
          <button className="btn btn-ghost" onClick={onGetStarted}>Sign in</button>
          <button className="btn btn-cyan lp-cta" onClick={onGetStarted}>Get started</button>
        </div>
      </header>

      <main className="page-inner" style={{ padding:'0 24px 64px' }}>
        {/* HERO */}
        <section style={{ textAlign:'center', padding:'72px 0 56px', maxWidth:820, margin:'0 auto' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8, marginBottom:22,
            padding:'6px 14px', borderRadius:9999, background:'var(--md-secondary-container)',
            color:'var(--md-on-secondary-container)', fontSize:13, fontWeight:500,
          }}>
            ✨ Smart loan management, personalized
          </div>
          <h1 style={{
            fontFamily:'var(--font-d)', fontWeight:700, color:'var(--md-on-surface)',
            fontSize:'clamp(2.2rem, 6vw, 3.5rem)', lineHeight:1.15, letterSpacing:-0.01, marginBottom:20,
          }}>
            Take control of every loan you carry
          </h1>
          <p style={{
            fontSize:'clamp(1rem, 2.5vw, 1.25rem)', color:'var(--md-on-surface-variant)',
            lineHeight:1.6, maxWidth:620, margin:'0 auto 34px',
          }}>
            LoanLedger helps individuals and NGOs track loans, calculate EMIs, and stay on top of repayments — all in one calm, beautiful workspace.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-cyan lp-cta" style={{ padding:'14px 30px', fontSize:16 }} onClick={onGetStarted}>
              Get started — it's free
            </button>
            <button className="btn btn-ghost" style={{ padding:'14px 30px', fontSize:16 }} onClick={onGetStarted}>
              I already have an account
            </button>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ marginBottom:72 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card lp-card anim-fade-up" style={{ padding:26 }}>
                <div style={{
                  width:52, height:52, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
                  background:'var(--md-primary-container)', fontSize:26, marginBottom:16,
                }}>{f.icon}</div>
                <div style={{ fontFamily:'var(--font-d)', fontSize:18, fontWeight:500, color:'var(--md-on-surface)', marginBottom:8 }}>{f.title}</div>
                <div style={{ fontSize:14, color:'var(--md-on-surface-variant)', lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="card" style={{ padding:'clamp(28px, 5vw, 48px)', marginBottom:72, borderRadius:32 }}>
          <h2 style={{ fontFamily:'var(--font-d)', fontSize:'clamp(1.6rem, 4vw, 2rem)', fontWeight:500, color:'var(--md-on-surface)', textAlign:'center', marginBottom:40 }}>
            How it works
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ textAlign:'center' }}>
                <div style={{
                  width:56, height:56, borderRadius:'50%', margin:'0 auto 16px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:'linear-gradient(135deg,var(--md-primary),var(--md-tertiary))',
                  color:'var(--md-on-primary)', fontSize:22, fontWeight:700,
                  boxShadow:'0 4px 14px rgba(103,80,164,0.3)',
                }}>{s.n}</div>
                <div style={{ fontFamily:'var(--font-d)', fontSize:18, fontWeight:500, color:'var(--md-on-surface)', marginBottom:8 }}>{s.title}</div>
                <div style={{ fontSize:14, color:'var(--md-on-surface-variant)', lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{
          textAlign:'center', padding:'clamp(40px, 7vw, 64px)', borderRadius:32,
          background:'linear-gradient(135deg, var(--md-primary), var(--md-tertiary))',
          color:'var(--md-on-primary)', position:'relative', overflow:'hidden',
        }}>
          <h2 style={{ fontFamily:'var(--font-d)', fontSize:'clamp(1.6rem, 4vw, 2.2rem)', fontWeight:700, marginBottom:14 }}>
            Ready to master your loans?
          </h2>
          <p style={{ fontSize:'1.05rem', opacity:0.9, marginBottom:30, maxWidth:520, marginLeft:'auto', marginRight:'auto' }}>
            Join LoanLedger today and turn scattered debt into a clear, manageable plan.
          </p>
          <button className="btn lp-cta" onClick={onGetStarted}
            style={{
              background:'var(--md-on-primary)', color:'var(--md-primary)',
              padding:'14px 32px', fontSize:16, fontWeight:700,
            }}>
            Create your free account
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{
        padding:'28px 24px', textAlign:'center', borderTop:'1px solid var(--md-outline-variant)',
        color:'var(--md-on-surface-variant)', fontSize:13,
      }}>
        LoanLedger · Smart loan management for the future
      </footer>
    </div>
  )
}

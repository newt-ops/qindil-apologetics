import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Icon from '../../../components/icons/Icon';
import Seo from '../../../components/shared/Seo';

export function AboutPage() {
  const pillars = [
    {
      title: 'Rational Kalam & Epistemology',
      description: 'Defending foundational Islamic axioms with classical philosophical rigor and contemporary analytical logic.',
      icon: 'Scale',
      tag: 'Theology',
    },
    {
      title: 'Quranic & Hadith Hermeneutics',
      description: 'Preserving primary textual traditions against decontextualized skepticism and historical-critical distortions.',
      icon: 'BookOpen',
      tag: 'Textual Sciences',
    },
    {
      title: 'Comparative Abrahamic Apologetics',
      description: 'Systematic comparative theology exploring biblical manuscripts, Christology, and monotheistic developments.',
      icon: 'Compass',
      tag: 'Comparative Religion',
    },
    {
      title: 'Contemporary Secular Critiques',
      description: 'Deconstructing moral relativism, philosophical naturalism, and existential skepticism with intellectual clarity.',
      icon: 'Shield',
      tag: 'Philosophy',
    },
    {
      title: 'Cosmology & Philosophy of Science',
      description: 'Examining fine-tuning arguments, teleology, quantum cosmology, and the boundaries of scientific empiricism.',
      icon: 'Sparkles',
      tag: 'Metaphysics',
    },
    {
      title: 'Primary Historical Verification',
      description: 'Meticulous archival scrutiny of early Islamic historiography, orientalist narratives, and source transmissions.',
      icon: 'FileText',
      tag: 'Historiography',
    },
  ];

  const standards = [
    {
      step: '01',
      title: 'Primary Source Grounding',
      desc: 'All apologetic arguments reference original manuscripts, Arabic lexicons, or peer-reviewed academic literature.',
    },
    {
      step: '02',
      title: 'Blind Peer Review',
      desc: 'Research papers undergo rigorous double-check by resident subject matter specialists before public archiving.',
    },
    {
      step: '03',
      title: 'Steel-Manned Critiques',
      desc: 'We present opposing theological and philosophical views in their strongest formulations before refutation.',
    },
    {
      step: '04',
      title: 'Open Scholarly Access',
      desc: 'Articles, research papers, and refutation indices remain freely available to researchers and truth-seekers worldwide.',
    },
  ];

  const metrics = [
    { value: '450+', label: 'Primary Source Citations' },
    { value: '100%', label: 'Double-Reviewed Papers' },
    { value: '24+', label: 'Academic Disciplines' },
    { value: '32', label: 'Scholars & Fellows' },
  ];

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Qindil Apologetics',
    url: typeof window !== 'undefined' ? window.location.href : 'https://qindilapologetics.com/about',
    description:
      'Qindil Apologetics is an independent research platform dedicated to defending Islamic theology, comparative religion analysis, and philosophical refutations.',
    publisher: {
      '@type': 'Organization',
      name: 'Qindil Apologetics',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://qindilapologetics.com',
      logo:
        typeof window !== 'undefined'
          ? `${window.location.origin}/logo/logo-dark.svg`
          : 'https://qindilapologetics.com/logo/logo-dark.svg',
    },
  };

  return (
    <div className="relative min-h-screen bg-bg text-text font-sans py-6 sm:py-16 selection:bg-gold/20 selection:text-gold transition-colors duration-200 overflow-hidden">
      <Seo
        title="About Us — Institutional Mission & Methodology"
        description="Learn about Qindil Apologetics, an independent research initiative dedicated to defending Islamic theology, comparative apologetics, and philosophical refutations."
        jsonLd={aboutJsonLd}
      />

      {/* Ambient background glow & radial highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(179,133,76,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.12),rgba(0,0,0,0))]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] bg-gold/10 dark:bg-gold/5 blur-[130px] rounded-full" />

      <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-16">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 text-[11px] sm:text-xs font-semibold text-gold">
            <Icon name="Info" size={13} />
            <span>Institutional Overview</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text leading-tight">
            Illuminating Truth Through <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9a6e38] via-[#b3854c] to-[#9a6e38] dark:from-[#e5c368] dark:via-[#c9a84c] dark:to-[#e5c368]">
              Reason, Rigor, and Primary Sources.
            </span>
          </h1>

          <p className="text-xs sm:text-base text-textMuted leading-relaxed max-w-2xl mx-auto">
            Qindil Apologetics is an independent intellectual initiative dedicated to upholding the rational foundations of Islamic orthodoxy, formulating high-impact comparative treatises, and deconstructing contemporary philosophical skepticism.
          </p>
        </motion.div>

        {/* Academic Impact Metrics Bar - Prompt 42: 2x2 on mobile, 4-col on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-3 sm:p-6 shadow-lg shadow-stone-300/20 dark:shadow-black/40"
        >
          {metrics.map((m) => (
            <div key={m.label} className="text-center p-2 sm:p-3 space-y-0.5">
              <span className="text-xl sm:text-3xl font-black tracking-tight text-gold font-mono">
                {m.value}
              </span>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-textMuted">
                {m.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Institutional Mission Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative rounded-2xl border border-border bg-surface p-5 sm:p-10 shadow-xl overflow-hidden text-center space-y-3 sm:space-y-4"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/30">
            <Icon name="Compass" size={22} />
          </div>

          <h2 className="text-lg sm:text-2xl font-extrabold text-text">Our Institutional Mission</h2>
          <p className="text-xs sm:text-base text-textMuted leading-relaxed max-w-3xl mx-auto">
            To provide scholars, students of knowledge, and intellectual inquirers with definitive, referenced, and logically sound responses to theological queries, scriptural polemics, and modernist dogmas — bridging the wisdom of classical heritage with contemporary dialectics.
          </p>
        </motion.div>

        {/* Research Pillars - Prompt 42: Compact 2-col on mobile */}
        <div className="space-y-4 sm:space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold text-text">Research Pillars &amp; Disciplines</h2>
            <p className="text-[11px] sm:text-xs text-textMuted max-w-lg mx-auto">
              Our multidisciplinary focus areas for scholarly refutations and intellectual investigations
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="rounded-xl border border-border bg-surface/70 p-3 sm:p-6 space-y-2 sm:space-y-3 transition hover:border-gold/50 hover:shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gold/10 text-gold border border-gold/20">
                      <Icon name={p.icon as any} size={18} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gold uppercase tracking-wider bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-base font-bold text-text leading-snug">
                    {p.title}
                  </h3>
                  <p className="hidden sm:block text-xs text-textMuted leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="sm:hidden pt-1">
                  <p className="text-[10px] text-textMuted line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rigorous Standards & Methodology */}
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <h2 className="text-lg sm:text-2xl font-bold text-text">Editorial Standards &amp; Review Protocol</h2>
            <p className="text-[11px] sm:text-xs text-textMuted">
              How every piece of scholarship is researched, vetted, and released
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {standards.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-border/80 bg-bg/60 p-3.5 sm:p-5 space-y-2"
              >
                <span className="text-xs font-mono font-black text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
                  Step {s.step}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-text">{s.title}</h3>
                <p className="text-[11px] sm:text-xs text-textMuted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Strip */}
        <div className="rounded-xl sm:rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-surface to-bg p-5 sm:p-8 text-center space-y-3">
          <h2 className="text-lg sm:text-2xl font-bold text-text">Engage With Our Research Team</h2>
          <p className="text-xs sm:text-sm text-textMuted max-w-xl mx-auto">
            Have an academic inquiry, a research proposal, or want to invite our fellows for an academic discourse?
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 rounded-lg bg-gold px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-bg transition hover:bg-goldHover shadow-md"
            >
              <Icon name="Mail" size={13} />
              <span>Contact Our Team</span>
            </Link>
            <Link
              to="/articles"
              className="inline-flex items-center space-x-2 rounded-lg border border-border bg-surface px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold text-text transition hover:border-gold/50"
            >
              <Icon name="BookOpen" size={13} />
              <span>Explore Research Library</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;

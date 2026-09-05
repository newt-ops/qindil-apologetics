import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons/Icon';
import Seo from '../../components/shared/Seo';

export function AboutPage() {
  const values = [
    {
      title: 'Scholastic Rigor',
      description: 'Grounded in classical Islamic sciences, primary source analysis, and modern philosophical standards.',
      icon: 'BookOpen',
    },
    {
      title: 'Intellectual Clarity',
      description: 'Deconstructing complex secular, philosophical, and theological objections with logical precision.',
      icon: 'Shield',
    },
    {
      title: 'Multidisciplinary Approach',
      description: 'Bridging theology, cosmology, history, bioethics, and moral philosophy to provide coherent responses.',
      icon: 'Compass',
    },
  ];

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Qindil Apologetics',
    url: typeof window !== 'undefined' ? window.location.href : 'https://qindilapologetics.com/about',
    description: 'Qindil Apologetics is an independent research platform dedicated to defending Islamic theology, comparative religion analysis, and philosophical refutations.',
    publisher: {
      '@type': 'Organization',
      name: 'Qindil Apologetics',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://qindilapologetics.com',
      logo: typeof window !== 'undefined' ? `${window.location.origin}/logo/logo-dark.svg` : 'https://qindilapologetics.com/logo/logo-dark.svg',
    },
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans py-16">
      <Seo
        title="About Us"
        description="Learn about Qindil Apologetics, an independent research initiative dedicated to defending Islamic theology, comparative apologetics, and philosophical refutations."
        jsonLd={aboutJsonLd}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold">
            <Icon name="Info" size={14} />
            <span>About Qindil Apologetics</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-text leading-tight">
            Illuminating Truth Through <br />
            <span className="text-gold">Reason, Evidence, and Scholarship.</span>
          </h1>

          <p className="text-base sm:text-lg text-textMuted leading-relaxed">
            Qindil Apologetics is an independent research initiative dedicated to defending the intellectual integrity of Islamic theology, producing academic papers on Christian and Islamic apologetics, and deconstructing contemporary secular objections.
          </p>
        </motion.div>

        {/* Mission Statement Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-border bg-surface p-8 sm:p-12 shadow-xl text-center space-y-4"
        >
          <h2 className="text-2xl font-bold text-gold">Our Mission</h2>
          <p className="text-sm sm:text-base text-textMuted leading-relaxed max-w-3xl mx-auto">
            To empower Muslim scholars, students of knowledge, and sincere truth-seekers with clear, well-referenced, and rigorous responses to modern philosophical doubts, textual critiques, and ideological trends.
          </p>
        </motion.div>

        {/* Core Values Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text">Core Methodology</h2>
            <p className="text-xs text-textMuted mt-1">Our standard for research and publication</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="rounded-xl border border-border bg-surface/50 p-6 space-y-3 transition hover:border-gold/50 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Icon name={v.icon as any} size={20} />
                </div>
                <h3 className="text-lg font-bold text-text">{v.title}</h3>
                <p className="text-xs text-textMuted leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Strip */}
        <div className="rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-surface to-bg p-8 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-text">Have Questions or Want to Collaborate?</h2>
          <p className="text-xs sm:text-sm text-textMuted max-w-xl mx-auto">
            We welcome academic inquiries, collaboration requests, and sincere discussions.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 rounded-md bg-gold px-6 py-3 text-xs font-bold text-bg transition hover:bg-goldHover shadow-md"
            >
              <span>Contact Our Team</span>
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;

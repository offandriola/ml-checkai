import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Ler a Documentação
          </Link>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: 'Classificação por ML',
    description:
      'Modelo TF-IDF + SVM treinado com dados reais de agências de fact-checking brasileiras. Classifica textos como Verdadeiro, Falso ou Inconclusivo.',
  },
  {
    title: 'Verificação com Fontes',
    description:
      'Busca automática na web via Serper.dev, ranking de confiabilidade por tipo de fonte e análise NLI (Natural Language Inference) para cruzar evidências.',
  },
  {
    title: 'Pronto para Rodar',
    description:
      'Ambiente completo com Docker Compose: frontend React, backend FastAPI, banco MySQL e Jupyter Lab. Um único comando sobe tudo.',
  },
];

function Feature({title, description}: {title: string; description: string}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('text--center padding-horiz--md padding-vert--lg', styles.featureCard)}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Documentação"
      description="Documentação completa do projeto CheckAI — verificação de fake news com Machine Learning">
      <HomepageHeader />
      <main>
        <section className="padding-vert--xl">
          <div className="container">
            <div className="row">
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

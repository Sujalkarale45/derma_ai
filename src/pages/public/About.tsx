import { Activity, Brain, Users, ShieldCheck, Globe, Heart } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', padding: '5rem 0 4rem' }}>
        <div className="container text-center">
          <div style={{ width: 72, height: 72, borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Activity size={36} color="white" />
          </div>
          <h1 style={{ color: 'white', marginBottom: '1rem' }}>About DERMA AI</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '600px', margin: '0 auto', fontSize: 'var(--font-size-lg)', lineHeight: 1.7 }}>
            We are bridging the healthcare gap between rural and urban India using AI-powered skin lesion detection and telemedicine.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              {
                icon: <Heart size={28} color="var(--primary)" />,
                title: 'Our Mission',
                body: 'To make quality dermatological care accessible to every Indian, regardless of their location, income, or language. Skin cancer, caught early, is almost always treatable.',
              },
              {
                icon: <Brain size={28} color="var(--primary)" />,
                title: 'The Technology',
                body: 'Our CrossAttnHybrid model combines EfficientNet-B3 and Swin Transformer with bidirectional cross-attention, trained on HAM10000 (10,015 dermoscopic images) achieving 94.6% AUROC.',
              },
              {
                icon: <Globe size={28} color="var(--primary)" />,
                title: 'Rural Impact',
                body: 'India has 1 dermatologist per 100,000 people in rural areas. DERMA AI provides AI-first screening to triage patients before they travel, saving time and money for millions.',
              },
            ].map(item => (
              <Card key={item.title} hover style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  {item.icon}
                </div>
                <h4 style={{ marginBottom: '0.75rem' }}>{item.title}</h4>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, color: 'var(--text-muted)' }}>{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Model details */}
      <section className="section-padding" style={{ background: 'var(--neutral)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>AI Model Details</h2>
          <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Our classification model is built for research-grade accuracy and clinical safety.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { label: 'Architecture', value: 'CrossAttnHybrid' },
              { label: 'Backbone 1', value: 'EfficientNet-B3' },
              { label: 'Backbone 2', value: 'Swin Transformer' },
              { label: 'Training Dataset', value: 'HAM10000 (10K images)' },
              { label: 'Classes', value: '7 skin lesion types' },
              { label: 'AUROC Score', value: '94.6%' },
              { label: 'Accuracy', value: '79.6%' },
              { label: 'Framework', value: 'PyTorch Lightning' },
            ].map(({ label, value }) => (
              <Card key={label} style={{ textAlign: 'center', padding: '1.25rem' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{label}</p>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}>{value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--warning-light)', border: '0.5px solid var(--warning)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <h3 style={{ color: '#7a5200', marginBottom: '1rem' }}>⚠ Medical Disclaimer</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: '#7a5200', lineHeight: 1.7 }}>
              DERMA AI is a <strong>screening tool only</strong>. It is not a certified medical device and its outputs should never replace professional dermatological consultation. 
              All AI predictions are generated by a machine learning model and are subject to error. Always consult a qualified, licensed dermatologist for diagnosis and treatment.
              Early detection saves lives, but accurate diagnosis requires human expertise.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

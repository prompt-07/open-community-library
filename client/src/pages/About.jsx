import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 860, margin: '0 auto' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center' }}>
        <img
          src="/logo-main.png"
          alt="मुक्त वाचनालय — The Open Library"
          style={{ width: 'min(340px, 70vw)', height: 'auto', margin: '0 auto' }}
        />
        <h1 style={{ marginBottom: 4 }}>मुक्त वाचनालय — The Open Library</h1>
        <Quote>ज्ञान दिल्याने ज्ञान वाढते… — Knowledge grows when it is shared.</Quote>
      </section>

      <Section title="Introduction">
        <p>
          Books are meant to enrich minds, foster thoughtful conversations, and bring people together —
          not to sit locked away inside closed cupboards. <strong>मुक्त वाचनालय (The Open Library)</strong> is a
          grassroots community initiative dedicated to sharing books freely, cultivating a genuine love for
          reading, and building meaningful connections across our neighborhoods — without any financial barriers.
        </p>
      </Section>

      <Section title="Our Story">
        <p>
          The seed for मुक्त वाचनालय was sown during a quiet evening listening to classic songs on the radio.
          A line from a Marathi song resonated deeply: <em>“ज्ञान दिल्याने ज्ञान वाढते…”</em> (“Knowledge grows when shared”).
        </p>
        <p>
          Looking over at the books sitting quietly inside closed shelves at home, a lingering thought arose:
          these books hold knowledge, so why are they locked away? Can this knowledge not be freed? Why keep it
          limited to ourselves?
        </p>
        <p>
          Growing up, reading wasn't an immediate habit. English books were preferred over Marathi ones initially,
          but reading Marathi passages aloud upon a father's gentle request gradually sparked a lifelong love for
          literature and language. Reflecting on P. L. Deshpande's wisdom —
          <em> “Education is for earning a livelihood, but literature reading is for the joy of the soul”</em> —
          the desire to share this exact joy with the surrounding community grew strong.
        </p>
        <p>
          After discussing the idea with family in late December, the initiative was officially launched on
          <strong> January 1, 2026</strong>, as a meaningful way to step into the new year. Supported by family and
          guided by sacred traditions of dedicating a portion of one's efforts to society, मुक्त वाचनालय was
          established as a completely free community endeavor.
        </p>
      </Section>

      <Section title="What is मुक्त वाचनालय?">
        <p>
          A simple, home-grown initiative that makes books accessible to everyone in the neighborhood, free of cost.
        </p>
        <ul style={listStyle}>
          <li><strong>100% Free Access:</strong> no membership fees, security deposits, or subscription charges — not even a nominal fee.</li>
          <li><strong>Collection:</strong> over 600 books in Marathi and English — rural stories, novels, literary essays, autobiographies, and translated works by renowned authors.</li>
          <li><strong>Who Can Join:</strong> anyone from the community — families, children, women, and avid readers alike.</li>
          <li><strong>When &amp; Where:</strong> Sunday mornings, 7:00 AM – 9:00 AM, near Jewel of Navi Mumbai / Seawoods.</li>
        </ul>
      </Section>

      <Section title="How It Works">
        <p>Borrowing is simple, transparent, and completely free:</p>
        <ol style={listStyle}>
          <li><strong>Register on the website</strong> — create a quick reader profile so we can keep track of community members and book exchanges.</li>
          <li><strong>Select &amp; lock your book</strong> — browse the collection, add a book to your cart, and lock it for the upcoming Sunday.</li>
          <li><strong>Pick up your book</strong> — visit us during the Sunday morning session (7:00 AM – 9:00 AM) and collect your reserved book in person.</li>
          <li><strong>One book at a time</strong> — to ensure equal access for all, each reader borrows one book at a time. Return it on Sunday to pick up your next!</li>
        </ol>
        <p style={{ marginTop: 12 }}>
          <Link to="/browse" className="btn btn-primary">Browse Books | पुस्तके पहा</Link>
        </p>
      </Section>

      <Section title="Our Philosophy">
        <Quote>शरीराची समृद्धी व्यायाम आणि मनाची समृद्धी वाचन</Quote>
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          (Physical fitness comes from exercise; mental enrichment comes from reading.)
        </p>
        <p>
          In today's fast-paced world, screen time, social media, and endless scrolling often replace meaningful
          human interaction and quiet reflection. People readily exercise to maintain physical health, but mental
          well-being is often overlooked.
        </p>
        <p>
          We believe books are active companions during life's joys, struggles, and quiet moments. Reading nurtures
          empathy, sharpens focus, strengthens memory, improves communication, and deepens our understanding of
          society. By sharing books, we exchange not just paper and ink, but ideas, inspiration, perspectives, and goodwill.
        </p>
      </Section>

      <Section title="How the Community Works">
        <ul style={listStyle}>
          <li><strong>Weekly exchange:</strong> every Sunday 7:00–9:00 AM, readers return finished books and collect their reserved ones.</li>
          <li><strong>Simple record-keeping:</strong> a basic register logs the book title, reader's name, mobile number, and signature.</li>
          <li><strong>Thoughtful discussions:</strong> readers share feedback, recommend titles, and chat warmly about what they've read.</li>
          <li><strong>Mutual trust:</strong> readers are simply expected to handle books with care and return them each Sunday.</li>
        </ul>
      </Section>

      <Section title="Beyond Books">
        <p>
          While borrowing books is the core activity, मुक्त वाचनालय naturally serves as a space for building
          neighborhood relationships and encouraging healthy habits. Located where community members gather for
          morning walks and exercise, it bridges physical health with mental growth. It's also a gentle reminder
          that children emulate actions rather than words — encouraging adults to put down their phones and pick up a book.
        </p>
      </Section>

      <Section title="Our Impact &amp; Experience">
        <div style={statsGrid}>
          <Stat big="55–60" label="readers every Sunday" />
          <Stat big="~200" label="books donated by the community" />
          <Stat big="4+" label="areas reached (Seawoods, Juinagar, Nerul, Belapur)" />
          <Stat big="600+" label="books in the collection" />
        </div>
        <p style={{ marginTop: 12 }}>
          Many families visit together with their children, each borrowing a book of their choice.
        </p>
      </Section>

      <Section title="Challenges &amp; Lessons">
        <p>
          Trust is the bedrock of मुक्त वाचनालय. Inspired by J.R.D. Tata's philosophy on trust in leadership, we
          choose to trust our readers completely. Occasional delays happen when members get busy and cannot return
          books on time. Rather than imposing rigid penalties, we handle these exceptions with understanding —
          knowing that the vast majority of readers engage with deep care, honesty, and gratitude.
        </p>
      </Section>

      <Section title="Our Vision">
        <p>
          Starting as a modest initiative near the Jewel of Navi Mumbai, our dream is to see this
          <em> “creeper of reading” (वाचनरुपी वेल)</em> branch out across the city — reaching the entrance gates of
          residential societies so the joy of literature reaches every doorstep. Our goal remains singular: to
          protect reading culture and nurture a genuine love for books in every household.
        </p>
      </Section>

      <section
        style={{
          background: 'var(--color-accent)',
          color: '#fff',
          borderRadius: 16,
          padding: '1.75rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#fff', marginTop: 0 }}>A Note to Our Community</h2>
        <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
          “In moments of joy, sorrow, or difficulty, the one true companion that consistently guides us is a good book.”
        </p>
        <p>
          Step away from screens for a few moments, pick up a book, and embark on a journey of thoughtful reading
          and shared conversation. Join us this Sunday morning!
        </p>
        <Link
          to="/browse"
          className="btn"
          style={{ background: '#fff', color: 'var(--color-accent)', marginTop: 8 }}
        >
          Browse Books | पुस्तके पहा
        </Link>
      </section>
    </div>
  );
}

const listStyle = { lineHeight: 1.8, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: 6 };
const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '1rem',
};

function Section({ title, children }) {
  return (
    <section
      style={{
        background: 'var(--color-surface)',
        border: '2px solid var(--color-ink)',
        borderRadius: 16,
        padding: '1.5rem',
      }}
    >
      {/* title may contain an entity like &amp; */}
      <h2 style={{ marginTop: 0 }} dangerouslySetInnerHTML={{ __html: title }} />
      {children}
    </section>
  );
}

function Quote({ children }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.15rem',
        fontWeight: 700,
        color: 'var(--color-accent)',
        borderLeft: '4px solid var(--color-accent)',
        paddingLeft: '1rem',
        margin: '0.5rem 0',
      }}
    >
      {children}
    </p>
  );
}

function Stat({ big, label }) {
  return (
    <div
      style={{
        background: 'var(--color-parchment-alt)',
        border: '2px solid var(--color-accent)',
        borderRadius: 12,
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent)' }}>
        {big}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

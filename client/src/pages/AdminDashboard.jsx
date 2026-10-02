import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { GENRES, LANGUAGES } from '../constants.js';
import { fieldStyle } from '../components/formStyles.js';

const emptyBook = {
  title: '', author: '', language: 'Marathi', genre: 'History', coverImageUrl: '',
  shelfNumber: '', orientationTags: '', adminReview: '', isBookOfWeek: false,
  totalCopies: 1, availableCopies: 1,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [members, setMembers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const refreshAll = useCallback(async () => {
    api.get('/admin/stats').then(setStats).catch(() => {});
    api.get('/books?limit=100').then((d) => setBooks(d.items)).catch(() => {});
    api.get('/loans').then(setLoans).catch(() => {});
    api.get('/reservations').then(setReservations).catch(() => {});
    api.get('/admin/members').then(setMembers).catch(() => {});
    api.get('/admin/reviews').then(setReviews).catch(() => {});
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <StatsCards stats={stats} />
      <InventorySection books={books} onChange={refreshAll} />
      <LendingSection loans={loans} onChange={refreshAll} />
      <ReservationsSection reservations={reservations} onChange={refreshAll} />
      <SessionFulfillmentSection />
      <MembersSection members={members} />
      <ReviewsModerationSection reviews={reviews} onChange={refreshAll} />
      <ExportSection />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ background: 'var(--color-surface)', border: '2px solid var(--color-ink)', borderRadius: 12, padding: '1.25rem' }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

function StatsCards({ stats }) {
  const cards = [
    ['Total Books', stats?.totalBooks],
    ['Registered Members', stats?.registeredMembers],
    ['Currently Issued', stats?.booksCurrentlyIssued],
    ['Overdue', stats?.overdueBooks],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem' }}>
      {cards.map(([label, value]) => (
        <div key={label} style={{ background: 'var(--color-surface)', border: '2px solid var(--color-ink)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)' }}>{value ?? '—'}</div>
          <div style={{ fontWeight: 600 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function InventorySection({ books, onChange }) {
  const [form, setForm] = useState(emptyBook);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function onPickCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr('');
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setForm((f) => ({ ...f, coverImageUrl: url }));
    } catch (err) {
      setUploadErr(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    const payload = {
      ...form,
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
      orientationTags: form.orientationTags ? form.orientationTags.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editId) await api.put(`/books/${editId}`, payload);
      else await api.post('/books', payload);
      setForm(emptyBook); setEditId(null); setMsg('Saved.'); onChange();
    } catch (err) { setMsg(err.message); }
  }

  function edit(b) {
    setEditId(b._id);
    setForm({ ...emptyBook, ...b, orientationTags: (b.orientationTags || []).join(', ') });
  }

  async function del(id) {
    await api.del(`/books/${id}`); onChange();
  }

  async function makeBOW(id) {
    await api.put(`/books/${id}`, { isBookOfWeek: true }); onChange();
  }

  return (
    <Section title="Inventory Management">
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: '1rem' }}>
        <label>Title<input required value={form.title} onChange={set('title')} style={fieldStyle} /></label>
        <label>Author<input required value={form.author} onChange={set('author')} style={fieldStyle} /></label>
        <label>Language<select value={form.language} onChange={set('language')} style={fieldStyle}>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select></label>
        <label>Genre<select value={form.genre} onChange={set('genre')} style={fieldStyle}>{GENRES.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label style={{ gridColumn: '1 / -1' }}>
          Cover Image
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="cover preview" style={{ width: 56, height: 80, objectFit: 'cover', borderRadius: 6, border: '2px solid var(--color-ink)' }} />
            )}
            <input type="file" accept="image/*" onChange={onPickCover} />
            {uploading && <span>Uploading…</span>}
            {form.coverImageUrl && !uploading && (
              <button type="button" className="btn btn-secondary" style={{ minHeight: 36 }} onClick={() => setForm((f) => ({ ...f, coverImageUrl: '' }))}>Remove</button>
            )}
          </div>
          {uploadErr && <span style={{ color: 'var(--color-lent)', fontWeight: 600 }}>{uploadErr}</span>}
        </label>
        <label>Shelf Number<input value={form.shelfNumber} onChange={set('shelfNumber')} style={fieldStyle} /></label>
        <label>Orientation Tags (comma-sep)<input value={form.orientationTags} onChange={set('orientationTags')} style={fieldStyle} /></label>
        <label>Total Copies<input type="number" min="0" value={form.totalCopies} onChange={set('totalCopies')} style={fieldStyle} /></label>
        <label>Available Copies<input type="number" min="0" value={form.availableCopies} onChange={set('availableCopies')} style={fieldStyle} /></label>
        <label style={{ gridColumn: '1 / -1' }}>Admin Review<textarea value={form.adminReview} onChange={set('adminReview')} style={{ ...fieldStyle, minHeight: 60 }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.isBookOfWeek} onChange={set('isBookOfWeek')} /> Book of the Week</label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary">{editId ? 'Update Book' : 'Add Book'}</button>
          {editId && <button type="button" className="btn btn-secondary" onClick={() => { setForm(emptyBook); setEditId(null); }}>Cancel</button>}
          {msg && <span style={{ fontWeight: 600 }}>{msg}</span>}
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {books.map((b) => (
          <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderTop: '1px solid var(--color-ink)', paddingTop: 6, flexWrap: 'wrap' }}>
            <span><strong>{b.title}</strong> — {b.author} ({b.availableCopies}/{b.totalCopies}){b.isBookOfWeek ? ' ⭐' : ''}</span>
            <span style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn btn-secondary" style={{ minHeight: 36 }} onClick={() => edit(b)}>Edit</button>
              {!b.isBookOfWeek && <button type="button" className="btn btn-secondary" style={{ minHeight: 36 }} onClick={() => makeBOW(b._id)}>Make BOW</button>}
              <button type="button" className="btn btn-secondary" style={{ minHeight: 36 }} onClick={() => del(b._id)}>Delete</button>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function LendingSection({ loans, onChange }) {
  const [form, setForm] = useState({ bookId: '', memberName: '', memberPhone: '', memberEmail: '', memberAddress: '', dateIssued: '', expectedReturnDate: '', remarks: '' });
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function issue(e) {
    e.preventDefault(); setMsg('');
    try { await api.post('/loans/issue', form); setMsg('Issued.'); setForm({ bookId: '', memberName: '', memberPhone: '', memberEmail: '', memberAddress: '', dateIssued: '', expectedReturnDate: '', remarks: '' }); onChange(); }
    catch (err) { setMsg(err.message); }
  }
  async function receiveReturn(id) { await api.post(`/loans/${id}/return`); onChange(); }

  return (
    <Section title="Lending Log & Registration">
      <form onSubmit={issue} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: '1rem' }}>
        <label>Book ID<input required value={form.bookId} onChange={set('bookId')} style={fieldStyle} /></label>
        <label>Name<input required value={form.memberName} onChange={set('memberName')} style={fieldStyle} /></label>
        <label>Phone Number<input value={form.memberPhone} onChange={set('memberPhone')} style={fieldStyle} /></label>
        <label>Email<input type="email" value={form.memberEmail} onChange={set('memberEmail')} style={fieldStyle} /></label>
        <label>Address/Society<input value={form.memberAddress} onChange={set('memberAddress')} style={fieldStyle} /></label>
        <label>Date Issued<input type="date" required value={form.dateIssued} onChange={set('dateIssued')} style={fieldStyle} /></label>
        <label>Expected Return Date<input type="date" required value={form.expectedReturnDate} onChange={set('expectedReturnDate')} style={fieldStyle} /></label>
        <label>Remarks<input value={form.remarks} onChange={set('remarks')} style={fieldStyle} /></label>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary">Issue Book</button>
          {msg && <span style={{ fontWeight: 600 }}>{msg}</span>}
        </div>
      </form>

      <h3>Active Loans</h3>
      {loans.length === 0 ? <p style={{ opacity: 0.7 }}>No active loans.</p> : loans.map((l) => (
        <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-ink)', paddingTop: 6 }}>
          <span><strong>{l.book?.title}</strong> → {l.memberName} (due {new Date(l.expectedReturnDate).toLocaleDateString()})</span>
          <button type="button" className="btn btn-secondary" style={{ minHeight: 36 }} onClick={() => receiveReturn(l._id)}>Receive Return</button>
        </div>
      ))}
    </Section>
  );
}

function ReservationsSection({ reservations, onChange }) {
  async function approve(id) { await api.patch(`/reservations/${id}/approve`); onChange(); }
  async function cancel(id) { await api.patch(`/reservations/${id}/cancel`); onChange(); }
  return (
    <Section title="Pending Reservations">
      {reservations.length === 0 ? <p style={{ opacity: 0.7 }}>No pending reservations.</p> : reservations.map((r) => (
        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-ink)', paddingTop: 6 }}>
          <span><strong>{r.book?.title}</strong> — {r.member?.name} (session {new Date(r.sessionDate).toLocaleDateString()})</span>
          <span style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-primary" style={{ minHeight: 36 }} onClick={() => approve(r._id)}>Approve</button>
            <button type="button" className="btn btn-secondary" style={{ minHeight: 36 }} onClick={() => cancel(r._id)}>Cancel</button>
          </span>
        </div>
      ))}
    </Section>
  );
}

function SessionFulfillmentSection() {
  const [date, setDate] = useState('');
  const [data, setData] = useState(null);
  async function load() {
    if (!date) return;
    const res = await api.get(`/admin/session-fulfillment?sessionDate=${new Date(date).toISOString()}`);
    setData(res);
  }
  return (
    <Section title="Session Fulfillment Desk">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldStyle} />
        <button type="button" className="btn btn-primary" onClick={load}>Load</button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print</button>
      </div>
      {data && (data.groups.length === 0 ? <p>No approved reservations for that session.</p> : data.groups.map((g, i) => (
        <div key={i} style={{ borderTop: '1px solid var(--color-ink)', paddingTop: 6 }}>
          <strong>{g.member?.name || 'Unknown'}</strong> ({g.member?.email})
          <ul>{g.books.map((b, j) => <li key={j}>{b.title} — {b.author}</li>)}</ul>
        </div>
      )))}
    </Section>
  );
}

function MembersSection({ members }) {
  return (
    <Section title="Manage Members">
      {members.length === 0 ? <p style={{ opacity: 0.7 }}>No members.</p> : members.map((m) => (
        <div key={m._id} style={{ borderTop: '1px solid var(--color-ink)', paddingTop: 6 }}>
          <strong>{m.name}</strong> — {m.email} {m.phone ? `· ${m.phone}` : ''}
        </div>
      ))}
    </Section>
  );
}

function ReviewsModerationSection({ reviews, onChange }) {
  async function del(id) { await api.del(`/reviews/${id}`); onChange(); }
  return (
    <Section title="Moderate Reviews">
      {reviews.length === 0 ? <p style={{ opacity: 0.7 }}>No reviews.</p> : reviews.map((r) => (
        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-ink)', paddingTop: 6, gap: 8 }}>
          <span><strong>{r.book?.title}</strong> — {r.member?.name}: {'★'.repeat(r.rating)} {r.text}</span>
          <button type="button" className="btn btn-secondary" style={{ minHeight: 36 }} onClick={() => del(r._id)}>Delete</button>
        </div>
      ))}
    </Section>
  );
}

function ExportSection() {
  const [msg, setMsg] = useState('');
  async function exportReports() {
    setMsg('Preparing…');
    try {
      const res = await fetch(`${api.base}/admin/export/loans.xlsx`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'loans.xlsx'; document.body.appendChild(a); a.click();
      a.remove(); URL.revokeObjectURL(url);
      setMsg('Downloaded loans.xlsx');
    } catch (err) { setMsg(err.message); }
  }
  return (
    <Section title="Reports">
      <button type="button" className="btn btn-primary" onClick={exportReports}>Export Reports (.xlsx)</button>
      {msg && <span style={{ marginLeft: 12, fontWeight: 600 }}>{msg}</span>}
    </Section>
  );
}

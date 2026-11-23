
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const API = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }

    return config;
});

function App() {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user') || 'null')
    );

    const [page, setPage] = useState('home');
    const [msg, setMsg] = useState('');
    const [complaints, setComplaints] = useState([]);
    const [trackId, setTrackId] = useState('');
    const [tracked, setTracked] = useState(null);
    const [filter, setFilter] = useState('');

    function logout() {
        localStorage.clear();
        setUser(null);
        setPage('home');
        setMsg('Logged out');
    }

    async function load() {
        try {
            const response = await api.get(
                user?.role === 'admin'
                    ? '/admin/complaints'
                    : '/complaints/my'
            );

            setComplaints(response.data);
        } catch (error) {
            setMsg(error.response?.data?.message || error.message);
        }
    }

    useEffect(() => {
        if (user && page === 'dashboard') {
            load();
        }
    }, [user, page]);

    async function submitAuth(event, mode) {
        event.preventDefault();

        const form = new FormData(event.target);
        const data = Object.fromEntries(form.entries());

        try {
            const response = await api.post('/auth/' + mode, data);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            setUser(response.data.user);
            setPage('dashboard');
            setMsg('Welcome ' + response.data.user.name);
        } catch (error) {
            setMsg(error.response?.data?.message || error.message);
        }
    }

    async function submitComplaint(event) {
        event.preventDefault();

        const form = new FormData(event.target);

        try {
            const response = await api.post(
                '/complaints',
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setMsg(
                'Complaint registered! Your ID: ' +
                response.data.complaintId
            );

            event.target.reset();
            setPage('dashboard');
        } catch (error) {
            setMsg(error.response?.data?.message || error.message);
        }
    }

    async function track(event) {
        event.preventDefault();

        try {
            const response = await api.get('/complaints/' + trackId);

            setTracked(response.data);
            setMsg('');
        } catch (error) {
            setTracked(null);
            setMsg(error.response?.data?.message || 'Complaint not found');
        }
    }

    async function update(id, event) {
        event.preventDefault();

        const form = new FormData(event.target);

        try {
            await api.put(
                '/admin/complaints/' + id,
                Object.fromEntries(form.entries())
            );

            setMsg('Complaint updated');
            load();
        } catch (error) {
            setMsg(error.response?.data?.message || error.message);
        }
    }

    const shown = complaints.filter(
        complaint => !filter || complaint.status === filter
    );

    return (
        <>
            <header>
                <div className="brand">
                    🛡️ Complaint<span>Portal</span>
                </div>

                <nav>
                    <button onClick={() => setPage('home')}>Home</button>

                    <button onClick={() => setPage('track')}>
                        Track Complaint
                    </button>

                    {user && (
                        <button onClick={() => setPage('dashboard')}>
                            Dashboard
                        </button>
                    )}

                    {!user ? (
                        <>
                            <button onClick={() => setPage('login')}>
                                Login
                            </button>

                            <button
                                className="primary"
                                onClick={() => setPage('register')}
                            >
                                Register
                            </button>
                        </>
                    ) : (
                        <button onClick={logout}>Logout</button>
                    )}
                </nav>
            </header>

            <main>
                {msg && (
                    <div className="notice">
                        {msg}
                        <button onClick={() => setMsg('')}>×</button>
                    </div>
                )}

                {page === 'home' && (
                    <section className="hero">
                        <div>
                            <p className="eyebrow">YOUR VOICE MATTERS</p>

                            <h1>
                                Raise a concern.
                                <br />
                                <span>We’ll work on it.</span>
                            </h1>

                            <p className="lead">
                                Register complaints online, receive a unique
                                tracking ID and follow every update transparently.
                            </p>

                            <button
                                className="primary big"
                                onClick={() => setPage(user ? 'complaint' : 'login')}
                            >
                                Register a Complaint →
                            </button>

                            <button
                                className="secondary big"
                                onClick={() => setPage('track')}
                            >
                                Track Complaint
                            </button>

                            <div className="stats">
                                <div>
                                    <b>24/7</b>
                                    <small>Online access</small>
                                </div>

                                <div>
                                    <b>Unique ID</b>
                                    <small>Every complaint</small>
                                </div>

                                <div>
                                    <b>Live</b>
                                    <small>Status updates</small>
                                </div>
                            </div>
                        </div>

                        <div className="hero-card">
                            <div className="card-icon">📨</div>
                            <h3>Complaint journey</h3>

                            <div className="step">
                                <i>1</i>
                                <div>
                                    <b>Registered</b>
                                    <small>Complaint received</small>
                                </div>
                            </div>

                            <div className="step">
                                <i>2</i>
                                <div>
                                    <b>In Progress</b>
                                    <small>Team is reviewing</small>
                                </div>
                            </div>

                            <div className="step">
                                <i>3</i>
                                <div>
                                    <b>Resolved</b>
                                    <small>Issue has been addressed</small>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {page === 'login' && (
                    <section className="form-card">
                        <h2>Welcome back</h2>
                        <p>Login to manage and track your complaints.</p>

                        <form onSubmit={event => submitAuth(event, 'login')}>
                            <label>
                                Email
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                />
                            </label>

                            <label>
                                Password
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="Enter password"
                                />
                            </label>

                            <button className="primary full">Login</button>
                        </form>

                        <p>
                            New user?{' '}
                            <a onClick={() => setPage('register')}>
                                Create account
                            </a>
                        </p>

                        <div className="hint">
                            Admin demo: admin@complaint.com / Admin@123
                        </div>
                    </section>
                )}

                {page === 'register' && (
                    <section className="form-card">
                        <h2>Create account</h2>
                        <p>Register to submit and follow complaints.</p>

                        <form onSubmit={event => submitAuth(event, 'register')}>
                            <label>
                                Full name
                                <input name="name" required />
                            </label>

                            <label>
                                Email
                                <input name="email" type="email" required />
                            </label>

                            <label>
                                Phone
                                <input name="phone" />
                            </label>

                            <label>
                                Password
                                <input
                                    name="password"
                                    type="password"
                                    minLength="6"
                                    required
                                />
                            </label>

                            <button className="primary full">Register</button>
                        </form>

                        <p>
                            Already registered?{' '}
                            <a onClick={() => setPage('login')}>Login</a>
                        </p>
                    </section>
                )}

                {page === 'complaint' && (
                    <section className="form-card wide">
                        <h2>Register a complaint</h2>
                        <p>
                            Describe your concern clearly. You will receive
                            a unique complaint ID.
                        </p>

                        <form onSubmit={submitComplaint}>
                            <label>
                                Category
                                <select name="category" required>
                                    <option value="">Select category</option>
                                    {[
                                        'Academic',
                                        'Infrastructure',
                                        'Administration',
                                        'Hostel',
                                        'Transport',
                                        'Technical',
                                        'Other'
                                    ].map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Subject
                                <input name="subject" required maxLength="120" />
                            </label>

                            <label>
                                Description
                                <textarea name="description" rows="5" required />
                            </label>

                            <label>
                                Attachment (image/PDF, max 5 MB)
                                <input
                                    name="attachment"
                                    type="file"
                                    accept="image/*,.pdf"
                                />
                            </label>

                            <button className="primary full">
                                Submit Complaint
                            </button>
                        </form>
                    </section>
                )}

                {page === 'track' && (
                    <section className="form-card wide">
                        <h2>Track your complaint</h2>
                        <p>
                            Enter the complaint ID you received after registration.
                        </p>

                        <form className="inline-form" onSubmit={track}>
                            <input
                                value={trackId}
                                onChange={event => setTrackId(event.target.value)}
                                placeholder="e.g. CMP-12345678-123"
                                required
                            />

                            <button className="primary">Track</button>
                        </form>

                        {tracked && (
                            <div className="track-result">
                                <div>
                                    <small>COMPLAINT ID</small>
                                    <h3>{tracked.complaintId}</h3>
                                </div>

                                <span className={'status ' + tracked.status.replace(' ', '').toLowerCase()}>
                                    {tracked.status}
                                </span>

                                <h3>{tracked.subject}</h3>
                                <p>{tracked.description}</p>

                                <p>
                                    <b>Category:</b> {tracked.category}
                                    &nbsp;
                                    <b>Department:</b> {tracked.department || 'Not assigned'}
                                </p>

                                <p>
                                    <b>Admin remarks:</b>
                                    {tracked.remarks || 'No remarks yet'}
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {page === 'dashboard' && user && (
                    <section className="dashboard">
                        <div className="dash-head">
                            <div>
                                <p className="eyebrow">
                                    {user.role === 'admin' ? 'ADMIN PANEL' : 'USER PANEL'}
                                </p>

                                <h2>Hello, {user.name}</h2>
                                <p>Manage and monitor complaint requests.</p>
                            </div>

                            {user.role === 'user' && (
                                <button
                                    className="primary"
                                    onClick={() => setPage('complaint')}
                                >
                                    + New Complaint
                                </button>
                            )}
                        </div>

                        <div className="summary">
                            <div>
                                <small>Total complaints</small>
                                <b>{complaints.length}</b>
                            </div>

                            <div>
                                <small>Registered</small>
                                <b>
                                    {complaints.filter(c => c.status === 'Registered').length}
                                </b>
                            </div>

                            <div>
                                <small>In Progress</small>
                                <b>
                                    {complaints.filter(c => c.status === 'In Progress').length}
                                </b>
                            </div>

                            <div>
                                <small>Resolved</small>
                                <b>
                                    {complaints.filter(c => c.status === 'Resolved').length}
                                </b>
                            </div>
                        </div>

                        <div className="table-head">
                            <h3>
                                {user.role === 'admin' ? 'All complaints' : 'My complaints'}
                            </h3>

                            <select
                                value={filter}
                                onChange={event => setFilter(event.target.value)}
                            >
                                <option value="">All status</option>
                                <option>Registered</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                            </select>
                        </div>

                        <div className="complaint-list">
                            {shown.map(c => (
                                <article className="complaint" key={c._id}>
                                    <div className="complaint-top">
                                        <div>
                                            <small>
                                                {c.complaintId} · {new Date(c.createdAt).toLocaleDateString()}
                                            </small>

                                            <h3>{c.subject}</h3>
                                        </div>

                                        <span className={'status ' + c.status.replace(' ', '').toLowerCase()}>
                                            {c.status}
                                        </span>
                                    </div>

                                    <p>{c.description}</p>

                                    <small>
                                        Category: {c.category}
                                        {user.role === 'admin' && c.userId
                                            ? ' · User: ' + c.userId.name + ' (' + c.userId.email + ')'
                                            : ''}
                                    </small>

                                    {c.attachment && (
                                        <p>
                                            <a
                                                href={'http://localhost:5000' + c.attachment}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View attachment
                                            </a>
                                        </p>
                                    )}

                                    {user.role === 'admin' && (
                                        <form
                                            className="admin-update"
                                            onSubmit={event => update(c.complaintId, event)}
                                        >
                                            <select name="status" defaultValue={c.status}>
                                                <option>Registered</option>
                                                <option>In Progress</option>
                                                <option>Resolved</option>
                                            </select>

                                            <input
                                                name="department"
                                                defaultValue={c.department || ''}
                                                placeholder="Assign department"
                                            />

                                            <input
                                                name="remarks"
                                                defaultValue={c.remarks || ''}
                                                placeholder="Admin remarks"
                                            />

                                            <button className="primary">Update</button>
                                        </form>
                                    )}
                                </article>
                            ))}

                            {shown.length === 0 && (
                                <div className="empty">No complaints found.</div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <footer>
                Online Complaint Registration System · MCA Mini Project · MERN Stack
            </footer>
        </>
    );
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

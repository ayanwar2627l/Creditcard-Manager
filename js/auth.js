/**
 * CardWise Auth — Session-based authentication helpers
 * Uses localStorage as the "session store" (no backend needed for a static site).
 *
 * How it works with a real backend:
 *  - On login/register you would POST credentials to e.g. POST /api/auth/login
 *  - The server validates, creates a session/JWT, returns { token, user }
 *  - You store the token in localStorage (or httpOnly cookie for better security)
 *  - Every subsequent API call sends Authorization: Bearer <token>
 *  - On logout you call POST /api/auth/logout (invalidates server session) and clear localStorage
 *  - Here we skip the server and just store { name, email } directly in localStorage
 *    as a demonstration — swap the localStorage read/write with real fetch() calls when you add a backend.
 */

const AUTH = (() => {
    const SESSION_KEY = 'cw_session';   // key stored in localStorage
    const USERS_KEY   = 'cw_users';    // registered users (simulated DB)

    /** Return the current logged-in user object or null */
    function getSession() {
        try {
            return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
        } catch { return null; }
    }

    /** Return true if someone is logged in */
    function isLoggedIn() {
        return getSession() !== null;
    }

    /**
     * Register a new user.
     * Backend equivalent: POST /api/auth/register { name, email, password }
     * Returns { ok, error }
     */
    function register(name, email, password) {
        const users = _getUsers();
        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return { ok: false, error: 'An account with this email already exists.' };

        const user = { name, email: email.toLowerCase(), password: _hash(password) };
        users.push(user);
        _saveUsers(users);

        // Auto-login after register
        _createSession({ name, email: email.toLowerCase() });
        return { ok: true };
    }

    /**
     * Login an existing user.
     * Backend equivalent: POST /api/auth/login { email, password }
     * Returns { ok, error }
     */
    function login(email, password) {
        const users = _getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { ok: false, error: 'No account found with this email.' };
        if (user.password !== _hash(password)) return { ok: false, error: 'Incorrect password.' };

        _createSession({ name: user.name, email: user.email });
        return { ok: true };
    }

    /**
     * Logout the current user.
     * Backend equivalent: POST /api/auth/logout  (then clear token)
     */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    /** Redirect to login, saving current page as return URL */
    function requireLogin(returnUrl) {
        const dest = returnUrl || window.location.href;
        window.location.href = 'login.html?returnTo=' + encodeURIComponent(dest);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    function _createSession(userInfo) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(userInfo));
    }

    function _getUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
        catch { return []; }
    }

    function _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    /**
     * Trivial hash — NOT secure for production.
     * In a real app passwords are hashed on the SERVER (bcrypt/argon2).
     * We only hash here so plaintext isn't sitting in localStorage.
     */
    function _hash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            h = ((h << 5) - h) + chr;
            h |= 0;
        }
        return 'h_' + Math.abs(h).toString(36);
    }

    return { getSession, isLoggedIn, register, login, logout, requireLogin };
})();

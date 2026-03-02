f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

old_login = '''function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/auth").then(r => r.json()).then(setUsers); }, []);

  const handleLogin = async () => {
    if (!selectedId || !pin) return;
    setLoading(true); setError("");
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedId, pin }) });
    if (!res.ok) { setError("Invalid PIN"); setLoading(false); return; }
    onLogin(await res.json());
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/20">
            <ScalesIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Qanuni</h1>
          <p className="text-sm text-slate-400 mt-1">\\u0642\\u0627\\u0646\\u0648\\u0646\\u064a \\u2014 \\u0625\\u062f\\u0627\\u0631\\u0629 \\u0645\\u0643\\u062a\\u0628 \\u0627\\u0644\\u0645\\u062d\\u0627\\u0645\\u0627\\u0629</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Select User</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-emerald-200 outline-none">
              <option value="">Choose...</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} \\u2014 {ROLE_LABELS[u.role] || u.role}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">PIN</label>
            <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter 4-digit PIN" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-emerald-200 outline-none" />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button onClick={handleLogin} disabled={!selectedId || pin.length < 4 || loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-semibold hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 transition-all shadow-lg">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-6">Al-Rashid & Partners Law Firm</p>
      </div>
    </div>
  );
}'''

new_login = '''function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { fetch("/api/auth").then(r => r.json()).then(setUsers); setMounted(true); }, []);

  const pinValue = pin.join("");

  const handleLogin = async () => {
    if (!selectedId || pinValue.length < 4) return;
    setLoading(true); setError("");
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedId, pin: pinValue }) });
    if (!res.ok) { setError("Invalid PIN"); setPin(["","","",""]); setLoading(false); return; }
    onLogin(await res.json());
  };

  const handlePinInput = (index: number, value: string) => {
    if (!/^\\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError("");
    if (value && index < 3) {
      const next = document.getElementById("pin-" + (index + 1));
      next?.focus();
    }
    if (index === 3 && value && selectedId) {
      setTimeout(() => {
        const p = [...newPin].join("");
        if (p.length === 4) handleLogin();
      }, 150);
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prev = document.getElementById("pin-" + (index - 1));
      prev?.focus();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFB] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-emerald-50/80 to-teal-50/40 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-slate-100/60 to-blue-50/30 blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-emerald-50/30 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className={`w-full max-w-[380px] relative z-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Logo & branding */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center shadow-2xl shadow-slate-900/25">
              <ScalesIcon className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-[#F8FAFB] animate-pulse-ring" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Qanuni</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium" dir="rtl">\\u0642\\u0627\\u0646\\u0648\\u0646\\u064a \\u2014 \\u0625\\u062f\\u0627\\u0631\\u0629 \\u0645\\u0643\\u062a\\u0628 \\u0627\\u0644\\u0645\\u062d\\u0627\\u0645\\u0627\\u0629</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-200/40 p-7 space-y-5">
          {/* User select */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Select User</label>
            <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setError(""); }}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none transition-all">
              <option value="">Choose your account...</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} \\u2014 {ROLE_LABELS[u.role] || u.role}</option>)}
            </select>
          </div>

          {/* PIN dots */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 mb-3 block uppercase tracking-wider">Enter PIN</label>
            <div className="flex justify-center gap-3">
              {pin.map((digit, i) => (
                <input key={i} id={"pin-" + i} type="password" inputMode="numeric" maxLength={1}
                  value={digit} onChange={e => handlePinInput(i, e.target.value)}
                  onKeyDown={e => handlePinKeyDown(i, e)}
                  className={`w-14 h-14 text-center text-xl font-bold rounded-2xl border-2 outline-none transition-all duration-200 ${
                    digit ? "border-emerald-300 bg-emerald-50/50 text-emerald-700" : "border-slate-200 bg-slate-50/50 text-slate-700"
                  } focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100`} />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 border border-red-100 animate-scale-in">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleLogin} disabled={!selectedId || pinValue.length < 4 || loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white text-sm font-bold hover:shadow-xl hover:shadow-slate-900/15 disabled:opacity-30 disabled:hover:shadow-none transition-all duration-300 relative overflow-hidden group">
            <span className="relative z-10">{loading ? "Signing in..." : "Sign In"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[11px] text-slate-300 font-medium">Al-Rashid & Partners Law Firm</p>
          <p className="text-[9px] text-slate-200 mt-1">Powered by Qanuni</p>
        </div>
      </div>
    </div>
  );
}'''

# Use actual unicode chars
old_login_actual = old_login.replace('\\u0642\\u0627\\u0646\\u0648\\u0646\\u064a \\u2014 \\u0625\\u062f\\u0627\\u0631\\u0629 \\u0645\\u0643\\u062a\\u0628 \\u0627\\u0644\\u0645\\u062d\\u0627\\u0645\\u0627\\u0629', 'قانوني — إدارة مكتب المحاماة')
new_login_actual = new_login.replace('\\u0642\\u0627\\u0646\\u0648\\u0646\\u064a \\u2014 \\u0625\\u062f\\u0627\\u0631\\u0629 \\u0645\\u0643\\u062a\\u0628 \\u0627\\u0644\\u0645\\u062d\\u0627\\u0645\\u0627\\u0629', 'قانوني — إدارة مكتب المحاماة')
old_login_actual = old_login_actual.replace('\\u2014', '—')
new_login_actual = new_login_actual.replace('\\u2014', '—')
new_login_actual = new_login_actual.replace('\\\\d', '\\d')

if old_login_actual in f:
    f = f.replace(old_login_actual, new_login_actual)
    open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
    print("LOGIN PATCHED OK")
else:
    # Debug: find start
    idx = f.find('function LoginPage')
    if idx >= 0:
        print(f"Found at {idx}, showing 200 chars:")
        print(repr(f[idx:idx+200]))
    else:
        print("LoginPage not found at all!")

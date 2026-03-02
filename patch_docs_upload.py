f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\documents\page.tsx', 'r', encoding='utf-8').read()

# Add upload state
f = f.replace(
    'const [form, setForm] = useState({ title: "", title_ar: "", doc_type: "general", category: "general", case_id: "", content: "" });',
    'const [form, setForm] = useState({ title: "", title_ar: "", doc_type: "general", category: "general", case_id: "", content: "" });\n  const [uploading, setUploading] = useState(false);\n  const [uploadedUrl, setUploadedUrl] = useState("");'
)

# Add upload function
f = f.replace(
    'const create = async () => {',
    '''const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setUploadedUrl(data.url);
        if (!form.title) setForm(p => ({ ...p, title: file.name.replace(/\\.[^.]+$/, "") }));
      }
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const create = async () => {'''
)

# Pass file_url to create
f = f.replace(
    "body: JSON.stringify({ action: \"create\", ...form, created_by: user?.id })",
    "body: JSON.stringify({ action: \"create\", ...form, file_url: uploadedUrl || null, created_by: user?.id })"
)

# Reset uploadedUrl
f = f.replace(
    'setShowForm(false); setForm({ title: "", title_ar: "", doc_type: "general", category: "general", case_id: "", content: "" }); load();',
    'setShowForm(false); setForm({ title: "", title_ar: "", doc_type: "general", category: "general", case_id: "", content: "" }); setUploadedUrl(""); load();'
)

# Add file upload UI to the form modal, before the content textarea
old_textarea = '<textarea value={form.content}'
new_upload = '''
            {/* File upload */}
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploadedUrl ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 hover:border-slate-300"}`}>
              {uploadedUrl ? (
                <div className="flex items-center gap-2 justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs text-emerald-700 font-medium">File uploaded</span>
                  <a href={uploadedUrl} target="_blank" rel="noopener" className="text-xs text-emerald-600 underline">View</a>
                  <button onClick={() => setUploadedUrl("")} className="text-xs text-red-500 ml-2">Remove</button>
                </div>
              ) : uploading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin" />
                  <span className="text-xs text-slate-500">Uploading...</span>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.txt" />
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-xs text-slate-500 font-medium">Click to upload file</span>
                    <span className="text-[9px] text-slate-400">PDF, DOC, XLS, JPG, PNG (max 4.5MB)</span>
                  </div>
                </label>
              )}
            </div>
            <textarea value={form.content}'''

f = f.replace(old_textarea, new_upload)

# Add download link to document list items
f = f.replace(
    '<span>{d.created_at}</span>\n              </div>',
    '<span>{d.created_at}</span>\n                {d.file_url && <a href={d.file_url} target="_blank" rel="noopener" className="text-emerald-600 font-medium hover:underline">Download</a>}\n              </div>'
)

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\documents\page.tsx', 'w', encoding='utf-8').write(f)
print("DOCS UPLOAD OK")

import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";

const INITIAL_TAGS = [
  "Exercise","Movie","Podcast","Book","Food","Music",
  "Gaming","Travel","Photography","Art","Series","Dance",
  "Tech","Sports","Cooking","Nature","Anime","Reading",
];

const ROWS_PER_PAGE = 10;

export default function AdminTags() {
  const [tags, setTags]         = useState(INITIAL_TAGS.map((name, i) => ({ id: i+1, name })));
  const [search, setSearch]     = useState("");
  const [newTag, setNewTag]     = useState("");
  const [editId, setEditId]     = useState(null);
  const [editVal, setEditVal]   = useState("");
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(new Set());

  const filtered   = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page-1)*ROWS_PER_PAGE, page*ROWS_PER_PAGE);

  const handleAdd = () => {
    if (!newTag.trim()) return;
    const maxId = Math.max(...tags.map(t => t.id), 0);
    setTags(prev => [...prev, { id: maxId+1, name: newTag.trim() }]);
    setNewTag("");
  };

  const handleDelete = (id) => {
    setTags(prev => prev.filter(t => t.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleEditSave = (id) => {
    if (!editVal.trim()) return;
    setTags(prev => prev.map(t => t.id === id ? { ...t, name: editVal.trim() } : t));
    setEditId(null);
  };

  const toggleSelect = (id) => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const toggleAll = () =>
    setSelected(selected.size === paginated.length ? new Set() : new Set(paginated.map(t => t.id)));

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Nunito',sans-serif" }}>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[#1a2d6b] text-2xl font-black mb-1">Tag Management</h1>
          <p className="text-[#6b7fa3] text-sm font-semibold">Manage all tags in one place.</p>
        </div>

        {/* Search bar */}
        <div className="bg-[#1a2d6b] rounded-2xl px-5 py-4 flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">🔍</span>
            <input
              placeholder="Search tags..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white/10 border border-white/15 rounded-full py-2 pl-9 pr-4
                text-white text-sm font-semibold outline-none placeholder:text-white/35
                focus:border-white/30 transition-all"
            />
          </div>
          <span className="text-white/40 text-sm font-semibold ml-auto">{filtered.length} tags</span>
        </div>

        {/* Main card */}
        <div className="bg-[#1a2d6b] rounded-2xl p-6">

          {/* Add tag */}
          <div className="flex gap-3 mb-6">
            <input
              placeholder="Text to create a tag"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              className="flex-1 bg-white/8 border border-white/12 rounded-xl py-2.5 px-4
                text-white text-sm font-semibold outline-none placeholder:text-white/30
                focus:border-white/30 transition-all"
            />
            <button onClick={handleAdd}
              className="bg-[#4a7fe0] border-0 rounded-xl px-5 py-2.5 text-white text-sm font-extrabold
                cursor-pointer whitespace-nowrap hover:bg-[#5a8ff0] transition-colors">
              + Add Tag
            </button>
          </div>

          {/* Table — desktop */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-10 pb-3 text-left">
                    <input type="checkbox"
                      checked={selected.size === paginated.length && paginated.length > 0}
                      onChange={toggleAll}
                      className="accent-[#4a7fe0] w-4 h-4 cursor-pointer"
                    />
                  </th>
                  {["Tag Id","Tag Name","Actions"].map(h => (
                    <th key={h} className="pb-3 text-left text-white/50 text-xs font-extrabold uppercase tracking-wider border-b border-white/10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-white/30 text-sm">No tags found</td></tr>
                ) : paginated.map(tag => (
                  <tr key={tag.id} className="group border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 pr-3">
                      <input type="checkbox" checked={selected.has(tag.id)} onChange={() => toggleSelect(tag.id)}
                        className="accent-[#4a7fe0] w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="py-3 pr-6 text-white/35 font-mono text-sm">{String(tag.id).padStart(4,"0")}</td>
                    <td className="py-3 pr-6 text-white/85 text-sm font-semibold">
                      {editId === tag.id ? (
                        <input value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus
                          onKeyDown={e => { if (e.key==="Enter") handleEditSave(tag.id); if (e.key==="Escape") setEditId(null); }}
                          className="bg-white/10 border border-[#4a7fe0] rounded-lg py-1.5 px-3 text-white text-sm font-semibold outline-none w-full max-w-xs" />
                      ) : tag.name}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {editId === tag.id ? (
                          <>
                            <button onClick={() => handleEditSave(tag.id)}
                              className="bg-transparent border-0 text-base cursor-pointer p-1.5 hover:opacity-70 transition-opacity">✅</button>
                            <button onClick={() => setEditId(null)}
                              className="bg-transparent border-0 text-base cursor-pointer p-1.5 hover:opacity-70 transition-opacity">❌</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(tag.id); setEditVal(tag.name); }}
                              className="bg-transparent border-0 text-base cursor-pointer p-1.5 hover:opacity-70 transition-opacity" title="Edit">✏️</button>
                            <button onClick={() => handleDelete(tag.id)}
                              className="bg-transparent border-0 text-base cursor-pointer p-1.5 hover:opacity-70 transition-opacity" title="Delete">🗑️</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-2">
            {paginated.length === 0 ? (
              <p className="text-center py-8 text-white/30 text-sm">No tags found</p>
            ) : paginated.map(tag => (
              <div key={tag.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <input type="checkbox" checked={selected.has(tag.id)} onChange={() => toggleSelect(tag.id)}
                  className="accent-[#4a7fe0] w-4 h-4 cursor-pointer shrink-0" />
                <span className="text-white/35 font-mono text-xs shrink-0">{String(tag.id).padStart(4,"0")}</span>
                <div className="flex-1 min-w-0">
                  {editId === tag.id ? (
                    <input value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus
                      onKeyDown={e => { if (e.key==="Enter") handleEditSave(tag.id); if (e.key==="Escape") setEditId(null); }}
                      className="bg-white/10 border border-[#4a7fe0] rounded-lg py-1 px-2 text-white text-sm font-semibold outline-none w-full" />
                  ) : (
                    <span className="text-white/85 text-sm font-semibold truncate block">{tag.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {editId === tag.id ? (
                    <>
                      <button onClick={() => handleEditSave(tag.id)} className="bg-transparent border-0 text-base cursor-pointer p-1">✅</button>
                      <button onClick={() => setEditId(null)} className="bg-transparent border-0 text-base cursor-pointer p-1">❌</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(tag.id); setEditVal(tag.name); }} className="bg-transparent border-0 text-base cursor-pointer p-1">✏️</button>
                      <button onClick={() => handleDelete(tag.id)} className="bg-transparent border-0 text-base cursor-pointer p-1">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-1 mt-5">
              <button onClick={() => setPage(1)} disabled={page===1}
                className="w-8 h-8 rounded-lg bg-white/8 border-0 text-white/60 text-xs font-bold cursor-pointer flex items-center justify-center hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all">«</button>
              <button onClick={() => setPage(p=>p-1)} disabled={page===1}
                className="w-8 h-8 rounded-lg bg-white/8 border-0 text-white/60 text-xs font-bold cursor-pointer flex items-center justify-center hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_,i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg border-0 text-xs font-bold cursor-pointer flex items-center justify-center transition-all
                    ${page===p ? "bg-[#4a7fe0] text-white" : "bg-white/8 text-white/60 hover:bg-white/15"}`}>
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="w-8 h-8 flex items-center justify-center text-white/30 text-xs">…</span>}
              <button onClick={() => setPage(p=>p+1)} disabled={page===totalPages}
                className="w-8 h-8 rounded-lg bg-white/8 border-0 text-white/60 text-xs font-bold cursor-pointer flex items-center justify-center hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all">›</button>
              <button onClick={() => setPage(totalPages)} disabled={page===totalPages}
                className="w-8 h-8 rounded-lg bg-white/8 border-0 text-white/60 text-xs font-bold cursor-pointer flex items-center justify-center hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all">»</button>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
// src/pages/admin/AdminTags.jsx
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

  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
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

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(t => t.id)));
    }
  };

  return (
    <AdminLayout>
      <style>{`
        .at-header { margin-bottom: 24px; }
        .at-title  { color: #1a2d6b; font-size: 22px; font-weight: 900; margin-bottom: 4px; }
        .at-sub    { color: #6b7fa3; font-size: 13px; font-weight: 600; }

        .at-filter-bar {
          background: #1a2d6b; border-radius: 16px;
          padding: 16px 20px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
        }

        .at-search-wrap { position: relative; flex: 1; }
        .at-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); font-size: 14px; }
        .at-search {
          width: 100%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 22px;
          padding: 9px 16px 9px 36px;
          color: #fff; font-family: 'Nunito',sans-serif;
          font-size: 13px; font-weight: 600; outline: none;
        }
        .at-search::placeholder { color: rgba(255,255,255,0.35); }

        /* Main card */
        .at-card {
          background: #1a2d6b; border-radius: 16px;
          padding: 24px;
        }

        /* Add tag section */
        .at-add-section {
          display: flex; gap: 12px; margin-bottom: 24px;
        }

        .at-add-input {
          flex: 1;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 11px 16px;
          color: #fff; font-family: 'Nunito',sans-serif;
          font-size: 14px; font-weight: 600; outline: none;
        }
        .at-add-input::placeholder { color: rgba(255,255,255,0.3); }
        .at-add-input:focus { border-color: rgba(255,255,255,0.3); }

        .at-add-btn {
          background: #4a7fe0; border: none; border-radius: 12px;
          padding: 11px 20px; color: #fff;
          font-family: 'Nunito',sans-serif; font-size: 13px; font-weight: 800;
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s;
        }
        .at-add-btn:hover { background: #5a8ff0; }

        /* Table */
        .at-table { width: 100%; border-collapse: collapse; }

        .at-table th {
          color: rgba(255,255,255,0.5);
          font-size: 12px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.5px;
          padding: 10px 12px; text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .at-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
          font-size: 14px; font-weight: 600;
          vertical-align: middle;
        }

        .at-table tr:last-child td { border-bottom: none; }
        .at-table tr:hover td { background: rgba(255,255,255,0.03); }

        .at-id-cell { color: rgba(255,255,255,0.35); font-family: monospace; font-size: 13px; }

        .at-edit-input {
          background: rgba(255,255,255,0.1);
          border: 1.5px solid #4a7fe0;
          border-radius: 8px;
          padding: 6px 12px;
          color: #fff; font-family: 'Nunito',sans-serif;
          font-size: 13px; font-weight: 600; outline: none;
          width: 100%;
        }

        .at-action-btn {
          background: none; border: none; cursor: pointer;
          font-size: 15px; padding: 4px 6px;
          transition: opacity 0.2s;
        }
        .at-action-btn:hover { opacity: 0.7; }

        /* Pagination */
        .at-pagination {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 4px; margin-top: 16px;
        }

        .at-page-btn {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: none;
          color: rgba(255,255,255,0.6); font-family: 'Nunito',sans-serif;
          font-size: 12px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .at-page-btn:hover:not(:disabled) { background: rgba(255,255,255,0.15); color: #fff; }
        .at-page-btn.active { background: #4a7fe0; color: #fff; }
        .at-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      <div className="at-header">
        <h1 className="at-title">Tag Management</h1>
        <p className="at-sub">Manage all tags in one place.</p>
      </div>

      {/* Search bar */}
      <div className="at-filter-bar">
        <div className="at-search-wrap">
          <span className="at-search-icon">🔍</span>
          <input className="at-search" placeholder="Search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="at-card">
        {/* Add tag */}
        <div className="at-add-section">
          <input
            className="at-add-input"
            placeholder="Text to create a tag"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <button className="at-add-btn" onClick={handleAdd}>+ Add Tag</button>
        </div>

        {/* Table */}
        <table className="at-table">
          <thead>
            <tr>
              <th style={{ width:40 }}>
                <input type="checkbox"
                  checked={selected.size === paginated.length && paginated.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Tag Id</th>
              <th>Tag Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign:"center", padding:32, color:"rgba(255,255,255,0.3)" }}>No tags found</td></tr>
            ) : paginated.map(tag => (
              <tr key={tag.id}>
                <td><input type="checkbox" checked={selected.has(tag.id)} onChange={() => toggleSelect(tag.id)} /></td>
                <td className="at-id-cell">{String(tag.id).padStart(4,"0")}</td>
                <td>
                  {editId === tag.id ? (
                    <input
                      className="at-edit-input"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleEditSave(tag.id);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      autoFocus
                    />
                  ) : tag.name}
                </td>
                <td>
                  {editId === tag.id ? (
                    <>
                      <button className="at-action-btn" onClick={() => handleEditSave(tag.id)} title="Save">✅</button>
                      <button className="at-action-btn" onClick={() => setEditId(null)} title="Cancel">❌</button>
                    </>
                  ) : (
                    <>
                      <button className="at-action-btn" onClick={() => { setEditId(tag.id); setEditVal(tag.name); }} title="Edit">✏️</button>
                      <button className="at-action-btn" onClick={() => handleDelete(tag.id)} title="Delete">🗑️</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="at-pagination">
          <button className="at-page-btn" onClick={() => setPage(1)} disabled={page===1}>«</button>
          <button className="at-page-btn" onClick={() => setPage(p=>p-1)} disabled={page===1}>‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_,i) => i+1).map(p => (
            <button key={p} className={`at-page-btn ${page===p?"active":""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          {totalPages > 5 && <button className="at-page-btn" disabled>…</button>}
          <button className="at-page-btn" onClick={() => setPage(p=>p+1)} disabled={page===totalPages}>›</button>
          <button className="at-page-btn" onClick={() => setPage(totalPages)} disabled={page===totalPages}>»</button>
        </div>
      </div>
    </AdminLayout>
  );
}
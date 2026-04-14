import { useState, useRef, useEffect, useMemo } from "react";

/* ================= CONSTANTS ================= */
const NW = 200, NH = 64, GAP = 14;
const LX = [32, 296, 560, 824];

const PAL = [
  { bg:"#EFF6FF", border:"#93C5FD", accent:"#3B82F6", text:"#1E40AF" },
  { bg:"#F0FDF4", border:"#86EFAC", accent:"#22C55E", text:"#166534" },
  { bg:"#F5F3FF", border:"#C4B5FD", accent:"#8B5CF6", text:"#5B21B6" },
  { bg:"#FFFBEB", border:"#FCD34D", accent:"#F59E0B", text:"#92400E" },
];

const pal   = (lvl) => PAL[Math.min(lvl, 3)];
const lx    = (lvl) => LX[Math.min(lvl, 3)];
const clip  = (s, n=22) => !s ? "" : s.length > n ? s.slice(0,n)+"…" : s;
const short = (id, lvl) => !id ? "—" : lvl === 0 ? id : id.split(".").pop();

/* ================= TREE BUILDER ================= */
function buildTree(sample) {
  const sid  = sample.sample_id;
  const iso  = sample.microbiology?.primaryIsolatedRuns    || [];
  const mor  = sample.microbiology?.isolatedMorphologyRuns || [];
  const t    = sample.microbiology?.microbiologyTests      || {};
  const absy = t.antibacterialRuns || [];
  const aasy = t.antimalarialRuns  || [];
  const bt   = t.biochemicalRuns   || [];
  const ebt  = t.enzymaticRuns     || [];

  return {
    id: sid, label:"Sample", level:0,
    desc: [sample.sample_type, sample.kingdom].filter(Boolean).join(" · "),
    children: [
      sid && {
        id:`${sid}.MOR`, label:"Morphology", level:1,
        desc:"SEM · Microscope · Notes", independent:true, children:[]
      },
      sid && {
        id:`${sid}.MOL`, label:"Molecular", level:1,
        desc:"DNA · PCR · Sequencing", independent:true, children:[]
      },
      ...iso.map(r => ({
        id: r.isolatedId || `iso-${Math.random()}`,
        label:"Primary Isolated", level:1,
        desc:[r.isolatedType, r.agarMedia, r.dilution].filter(Boolean).join(" · "),
        children: mor.filter(m => m.linkedIsolatedId === r.isolatedId).map(m => {
          /* ✅ ISOMOR ID is now flat — no number */
          const isoMorId = m.isoMorId || `isomor-${Math.random()}`;

          /* ✅ tests use linkedId, can match either ISO or ISOMOR */
          const tests = [
            ...absy
              .filter(x => (x.linkedId === isoMorId || x.linkedId === r.isolatedId) && x.testId)
              .map(x => ({ id:x.testId, label:"Antibacterial", level:3, desc:x.pathogen||"—", children:[] })),
            ...aasy
              .filter(x => (x.linkedId === isoMorId || x.linkedId === r.isolatedId) && x.testId)
              .map(x => ({ id:x.testId, label:"Antimalarial",  level:3, desc:x.plasmodiumSpecies||"—", children:[] })),
            ...bt
              .filter(x => (x.linkedId === isoMorId || x.linkedId === r.isolatedId) && x.testId)
              .map(x => ({ id:x.testId, label:"Biochemical",   level:3, desc:(x.checked||[]).slice(0,2).join(", ")||"—", children:[] })),
            ...ebt
              .filter(x => (x.linkedId === isoMorId || x.linkedId === r.isolatedId) && x.testId)
              .map(x => ({ id:x.testId, label:"Enzymatic",     level:3, desc:(x.checked||[]).slice(0,2).join(", ")||"—", children:[] })),
          ];

          return {
            id: isoMorId,
            label:"Isolated Morphology", level:2, desc:"",
            children: tests
          };
        })
      }))
    ].filter(Boolean)
  };
}

/* ================= LAYOUT ================= */
function layoutTree(root, collapsed) {
  const nodes = [], edges = [], parents = {};
  let leaf = 0;

  function pass(node, parentId = null) {
    node.x = lx(node.level);
    node.hasKids = node.children?.length > 0;
    node.isCollapsed = collapsed.has(node.id);
    if (parentId) parents[node.id] = parentId;
    if (!node.hasKids || node.isCollapsed) {
      node.cy = leaf * (NH + GAP) + NH / 2;
      leaf++;
    } else {
      node.children.forEach(c => pass(c, node.id));
      const ys = node.children.map(c => c.cy);
      node.cy = (ys[0] + ys[ys.length - 1]) / 2;
    }
  }

  function collect(node) {
    nodes.push(node);
    if (!node.isCollapsed && node.hasKids) {
      node.children.forEach(c => {
        edges.push({
          key:`${node.id}→${c.id}`,
          x1:node.x+NW, y1:node.cy,
          x2:c.x,       y2:c.cy,
          lvl:node.level, from:node.id, to:c.id
        });
        collect(c);
      });
    }
  }

  pass(root);
  collect(root);
  return { nodes, edges, parents };
}

/* ================= CHAIN RESOLVER ================= */
function resolveChain(nodeId, parents) {
  const chain = new Set([nodeId]);
  let cur = nodeId;
  while (parents[cur]) { cur = parents[cur]; chain.add(cur); }
  return chain;
}

/* ================= ANIMATED EDGE ================= */
function AnimatedEdge({ edge, inChain, dimmed }) {
  const c  = pal(edge.lvl);
  const mx = (edge.x1 + edge.x2) / 2;
  const d  = `M${edge.x1},${edge.y1} C${mx},${edge.y1} ${mx},${edge.y2} ${edge.x2},${edge.y2}`;
  return (
    <path d={d} fill="none"
      stroke={dimmed ? (inChain ? c.accent : "#E5E7EB") : "#D1D5DB"}
      strokeWidth={dimmed && inChain ? 2.5 : 1.5}
      strokeLinecap="round"
      style={{ transition:"stroke 0.35s ease, stroke-width 0.35s ease, opacity 0.35s ease" }}
      opacity={dimmed && !inChain ? 0.12 : 1}
    />
  );
}

/* ================= ANIMATED NODE ================= */
function AnimatedNode({ node, isSel, inChain, isHov, isDim, onSelect, onToggle, onEnter, onLeave }) {
  const c  = pal(node.level);
  const tx = node.x;
  const ty = node.cy - NH / 2;

  return (
    <g className="mn"
      transform={`translate(${tx}, ${ty})`}
      opacity={isDim ? 0.18 : 1}
      filter={isHov || isSel ? `url(#ig${Math.min(node.level,3)})` : undefined}
      style={{ transition:"opacity 0.3s ease" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* shadow */}
      <rect x={2} y={3} width={NW} height={NH} rx={10}
        fill={isSel ? c.accent : "#000"}
        opacity={isSel ? 0.15 : 0.04}
        style={{ transition:"opacity 0.3s ease" }} />

      {/* card body — selects only */}
      <rect x={0} y={0} width={NW} height={NH} rx={10}
        fill={isSel ? c.accent : c.bg}
        stroke={isSel ? c.accent : (inChain||isHov) ? c.accent : "#E5E7EB"}
        strokeWidth={isSel ? 0 : (inChain||isHov) ? 1.5 : 0.5}
        style={{ cursor:"pointer", transition:"fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease" }}
        onClick={onSelect} />

      {/* left accent bar */}
      <rect x={0} y={8} width={3.5} height={NH-16} rx={2}
        fill={isSel ? "rgba(255,255,255,0.6)" : c.accent}
        style={{ transition:"fill 0.3s ease" }}
        onClick={onSelect} />

      {/* type label */}
      <text x={14} y={19} fontSize={9} fontWeight={600}
        fill={isSel ? "rgba(255,255,255,0.75)" : c.text}
        fontFamily="sans-serif" letterSpacing="0.05em"
        style={{ transition:"fill 0.3s ease", pointerEvents:"none" }}>
        {node.label.toUpperCase()}
      </text>

      {/* independent badge */}
      {node.independent && (
        <>
          <rect x={NW-70} y={5} width={62} height={13} rx={6}
            fill={isSel ? "rgba(255,255,255,0.25)" : c.accent}
            opacity={isSel ? 1 : 0.18}
            style={{ transition:"all 0.3s ease", pointerEvents:"none" }} />
          <text x={NW-39} y={15} fontSize={8} textAnchor="middle"
            fill={isSel ? "white" : c.accent}
            fontFamily="sans-serif" fontWeight={600}
            style={{ transition:"fill 0.3s ease", pointerEvents:"none" }}>
            Independent
          </text>
        </>
      )}

      {/* short ID */}
      <text x={14} y={39} fontSize={12} fontWeight={500}
        fill={isSel ? "white" : c.text}
        fontFamily="monospace"
        style={{ transition:"fill 0.3s ease", pointerEvents:"none" }}>
        {clip(short(node.id, node.level), 21)}
      </text>

      {/* desc */}
      {node.desc && (
        <text x={14} y={54} fontSize={9}
          fill={isSel ? "rgba(255,255,255,0.65)" : "#9CA3AF"}
          fontFamily="sans-serif"
          style={{ transition:"fill 0.3s ease", pointerEvents:"none" }}>
          {clip(node.desc, 27)}
        </text>
      )}

      {/* expand/collapse button — toggle only */}
      {node.hasKids && (
        <g onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{ cursor:"pointer" }}>
          <rect x={NW-21} y={NH/2-10} width={18} height={18} rx={5}
            fill={isSel ? "rgba(255,255,255,0.25)" : c.accent}
            opacity={isSel ? 1 : 0.18}
            style={{ transition:"all 0.3s ease" }} />
          <text x={NW-12} y={NH/2+5} fontSize={14} textAnchor="middle"
            fill={isSel ? "white" : c.accent}
            fontFamily="sans-serif" fontWeight={600}
            style={{ transition:"fill 0.3s ease", userSelect:"none" }}>
            {node.isCollapsed ? "+" : "−"}
          </text>
        </g>
      )}
    </g>
  );
}

/* ================= MAIN ================= */
export default function IDTraceTab({ sample }) {
  if (!sample) return null;

  const tree = useMemo(() => buildTree(sample), [sample]);
  const [collapsed, setCollapsed] = useState(new Set());
  const [selected,  setSelected]  = useState(null);
  const [hovered,   setHovered]   = useState(null);
  const [tf, setTf]   = useState({ x:24, y:24, s:1 });
  const [drag, setDrag] = useState(false);
  const dragRef = useRef({});
  const svgRef  = useRef();

  const { nodes, edges, parents } = useMemo(
    () => layoutTree(tree, collapsed),
    [tree, collapsed]
  );

  const chain = useMemo(
    () => selected ? resolveChain(selected, parents) : new Set(),
    [selected, parents]
  );

  const selectedNode = nodes.find(n => n.id === selected);
  const dimmed = selected !== null;

  /* ── pan ── */
  const onDown = e => {
    if (e.target.closest(".mn")) return;
    setDrag(true);
    dragRef.current = { x0: e.clientX - tf.x, y0: e.clientY - tf.y };
  };
  const onMove = e => {
    if (!drag) return;
    setTf(t => ({ ...t, x: e.clientX - dragRef.current.x0, y: e.clientY - dragRef.current.y0 }));
  };
  const onUp = () => setDrag(false);

  /* ── wheel zoom centered on cursor ── */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const fn = e => {
      e.preventDefault();
      const rect  = el.getBoundingClientRect();
      const mx    = e.clientX - rect.left;
      const my    = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setTf(t => {
        const ns = Math.min(2.5, Math.max(0.2, t.s * delta));
        return {
          s: ns,
          x: mx - (mx - t.x) * (ns / t.s),
          y: my - (my - t.y) * (ns / t.s),
        };
      });
    };
    el.addEventListener("wheel", fn, { passive:false });
    return () => el.removeEventListener("wheel", fn);
  }, []);

  const handleSelect = (nodeId) => {
    setSelected(prev => prev === nodeId ? null : nodeId);
  };

  const handleToggle = (nodeId) => {
    setCollapsed(p => {
      const n = new Set(p);
      n.has(nodeId) ? n.delete(nodeId) : n.add(nodeId);
      return n;
    });
  };

  const btnStyle = {
    fontSize:12, padding:"4px 10px", borderRadius:8,
    border:"1px solid #E5E7EB", background:"#fff",
    color:"#6B7280", cursor:"pointer", transition:"background 0.15s"
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* ── header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {[["Sample","#3B82F6"],["Morphology / Molecular","#22C55E"],["Isolated / IsoMor","#8B5CF6"],["Tests","#F59E0B"]]
            .map(([lbl, clr]) => (
              <div key={lbl} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:9, height:9, borderRadius:2, background:clr, flexShrink:0 }} />
                <span style={{ fontSize:11, color:"#9CA3AF" }}>{lbl}</span>
              </div>
            ))}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#D1D5DB", marginRight:4 }}>
            {Math.round(tf.s * 100)}%
          </span>
          <button style={btnStyle} onClick={() => setTf({ x:24, y:24, s:1 })}>Reset</button>
          <button style={{ ...btnStyle, padding:"4px 8px" }}
            onClick={() => setTf(t => ({ ...t, s:Math.min(2.5, t.s*1.2) }))}>+</button>
          <button style={{ ...btnStyle, padding:"4px 8px" }}
            onClick={() => setTf(t => ({ ...t, s:Math.max(0.2, t.s*0.8) }))}>−</button>
        </div>
      </div>

      <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>
        Scroll to zoom · Drag to pan · Click card to highlight chain · Click +/− to expand
      </p>

      {/* ── canvas + side panel ── */}
      <div style={{ display:"flex", gap:12, alignItems:"stretch" }}>

        {/* ── mind map canvas ── */}
        <div style={{
          flex:1, border:"1px solid #E5E7EB", borderRadius:16,
          overflow:"hidden", background:"#FAFAFA",
          height:520, cursor:drag ? "grabbing" : "grab",
          position:"relative", minWidth:0
        }}>
          <svg ref={svgRef} width="100%" height="100%"
            onMouseDown={onDown} onMouseMove={onMove}
            onMouseUp={onUp} onMouseLeave={onUp}>

            <defs>
              <pattern id="idtdots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.2" fill="#E5E7EB" />
              </pattern>
              {PAL.map((p, i) => (
                <filter key={i} id={`ig${i}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                  <feFlood floodColor={p.accent} floodOpacity="0.35" result="col" />
                  <feComposite in="col" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <rect width="100%" height="100%" fill="url(#idtdots)" />

            <g transform={`translate(${tf.x},${tf.y}) scale(${tf.s})`}>
              {edges.map(edge => (
                <AnimatedEdge key={edge.key} edge={edge}
                  inChain={chain.has(edge.from) && chain.has(edge.to)}
                  dimmed={dimmed} />
              ))}
              {nodes.map(node => (
                <AnimatedNode key={node.id} node={node}
                  isSel={selected === node.id}
                  inChain={chain.has(node.id)}
                  isHov={hovered === node.id}
                  isDim={dimmed && !chain.has(node.id)}
                  onSelect={() => handleSelect(node.id)}
                  onToggle={() => handleToggle(node.id)}
                  onEnter={() => setHovered(node.id)}
                  onLeave={() => setHovered(null)} />
              ))}
            </g>
          </svg>
        </div>

        {/* ── detail panel ── */}
        <div style={{
          width:240, flexShrink:0,
          border: selectedNode
            ? `1.5px solid ${pal(selectedNode.level).border}`
            : "1px dashed #E5E7EB",
          borderRadius:16, padding:"16px 14px",
          background: selectedNode ? pal(selectedNode.level).bg : "#FAFAFA",
          transition:"all 0.3s ease",
          height:520, overflowY:"auto",
          display:"flex", flexDirection:"column", gap:12
        }}>
          {selectedNode ? (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ width:8, height:8, borderRadius:2,
                              background:pal(selectedNode.level).accent }} />
                <button onClick={() => setSelected(null)}
                  style={{ fontSize:12, color:"#9CA3AF", background:"none",
                           border:"none", cursor:"pointer", padding:"2px 6px", borderRadius:4 }}>
                  ✕
                </button>
              </div>

              <div>
                <p style={{ fontSize:10, fontWeight:600,
                             color:pal(selectedNode.level).text,
                             textTransform:"uppercase", letterSpacing:"0.05em",
                             margin:"0 0 4px" }}>
                  {selectedNode.label}
                </p>
                {selectedNode.independent && (
                  <span style={{ fontSize:10, padding:"1px 8px", borderRadius:10,
                                 background:pal(selectedNode.level).accent,
                                 color:"white", fontWeight:500 }}>
                    Independent
                  </span>
                )}
              </div>

              <div style={{ background:"white", borderRadius:10, padding:"10px 12px",
                            border:`1px solid ${pal(selectedNode.level).border}` }}>
                <p style={{ fontSize:9, fontWeight:600, color:"#9CA3AF",
                             textTransform:"uppercase", letterSpacing:"0.05em",
                             margin:"0 0 5px" }}>
                  Full ID
                </p>
                <p style={{ fontFamily:"monospace", fontSize:11, fontWeight:500,
                             color:pal(selectedNode.level).text,
                             wordBreak:"break-all", margin:0, lineHeight:1.6 }}>
                  {selectedNode.id}
                </p>
              </div>

              {selectedNode.desc && (
                <div>
                  <p style={{ fontSize:9, fontWeight:600, color:"#9CA3AF",
                               textTransform:"uppercase", letterSpacing:"0.05em",
                               margin:"0 0 4px" }}>
                    Details
                  </p>
                  <p style={{ fontSize:12, color:"#6B7280", margin:0, lineHeight:1.5 }}>
                    {selectedNode.desc}
                  </p>
                </div>
              )}

              {chain.size > 1 && (
                <div>
                  <p style={{ fontSize:9, fontWeight:600, color:"#9CA3AF",
                               textTransform:"uppercase", letterSpacing:"0.05em",
                               margin:"0 0 6px" }}>
                    Chain — {chain.size} {chain.size === 1 ? "node" : "nodes"}
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {nodes
                      .filter(n => chain.has(n.id))
                      .sort((a, b) => a.level - b.level)
                      .map((n, i, arr) => (
                        <div key={n.id} style={{ display:"flex", flexDirection:"column", gap:2 }}>
                          <span
                            onClick={() => setSelected(n.id)}
                            style={{
                              fontSize:10, fontFamily:"monospace",
                              padding:"4px 8px", borderRadius:8,
                              background: n.id === selected
                                ? pal(n.level).accent : "white",
                              border:`1px solid ${pal(n.level).border}`,
                              color: n.id === selected ? "white" : pal(n.level).text,
                              fontWeight:500, cursor:"pointer",
                              wordBreak:"break-all", lineHeight:1.4,
                              transition:"all 0.2s ease", display:"block"
                            }}>
                            {short(n.id, n.level)}
                          </span>
                          {i < arr.length-1 && (
                            <span style={{ fontSize:10, color:"#D1D5DB",
                                           textAlign:"center", lineHeight:1 }}>↓</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex:1, display:"flex", flexDirection:"column",
                          alignItems:"center", justifyContent:"center",
                          gap:8, textAlign:"center" }}>
              <div style={{ width:32, height:32, borderRadius:8,
                             background:"#F3F4F6", display:"flex",
                             alignItems:"center", justifyContent:"center",
                             fontSize:16 }}>
                ↗
              </div>
              <p style={{ fontSize:12, color:"#9CA3AF", margin:0, lineHeight:1.5 }}>
                Click any node to see its full ID and chain
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, RefreshCw, Sun, Thermometer, User, Phone, Calendar,
  CheckCircle, Clock, FileText, Camera, PenLine, ChevronDown, ChevronUp,
  ExternalLink, Image as ImageIcon, AlertTriangle
} from 'lucide-react';
import { fetchDashboard } from '@/services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ count }: { count: number }) {
  if (count === 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      <Clock className="w-3 h-3" /> Pendiente
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="w-3 h-3" /> {count} envío{count !== 1 ? 's' : ''}
    </span>
  );
}

function ProductBadge({ type }: { type: string }) {
  const isSolar = type?.toLowerCase() === 'solar';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${isSolar ? 'bg-yellow-50 text-yellow-700' : 'bg-cyan-50 text-cyan-700'}`}>
      {isSolar ? <Sun className="w-3 h-3" /> : <Thermometer className="w-3 h-3" />}
      {isSolar ? 'Solar' : 'Aerotermia'}
    </span>
  );
}

// ── Photo Grid ────────────────────────────────────────────────────────────────
function PhotoGrid({ photos, label }: { photos: any[]; label: string }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((p: any, i: number) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {p.preview ? (
              <img src={p.preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Extracted Data Card ───────────────────────────────────────────────────────
function ExtractedCard({ label, extraction }: { label: string; extraction: any }) {
  if (!extraction) return null;
  const data = extraction.manualCorrections
    ? { ...extraction.extractedData, ...extraction.manualCorrections }
    : extraction.extractedData;
  const entries = Object.entries(data).filter(([k]) => !k.endsWith('Warning'));

  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600">{label}</p>
        {extraction.needsManualReview && (
          <span className="text-xs text-orange-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Revisar
          </span>
        )}
      </div>
      {extraction.photo && (
        <img src={extraction.photo.preview} alt={label} className="w-full h-28 object-cover rounded-lg" />
      )}
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-gray-400 capitalize min-w-0 shrink-0">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
            <span className="text-gray-800 font-medium truncate">{v !== null && v !== undefined ? String(v) : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DocSlot display ───────────────────────────────────────────────────────────
function DocSlotDisplay({ label, slot }: { label: string; slot: any }) {
  if (!slot?.photo) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex gap-3 items-start">
        <img src={slot.photo.preview} alt={label} className="w-24 h-24 object-cover rounded-xl border border-gray-200 shrink-0" />
        {slot.extraction?.extractedData && (
          <div className="space-y-1 text-xs min-w-0">
            {Object.entries(slot.extraction.extractedData)
              .filter(([k]) => !k.endsWith('Warning') && slot.extraction.extractedData[k])
              .map(([k, v]) => (
                <div key={k}>
                  <span className="text-gray-400">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}: </span>
                  <span className="font-medium text-gray-800">{String(v)}</span>
                </div>
              ))}
            {slot.extraction.needsManualReview && (
              <span className="text-orange-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Revisar</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: any }) {
  const [expanded, setExpanded] = useState(false);
  const fd = project.formData;

  const hasDocuments = fd && (fd.dni?.front?.photo || fd.dni?.back?.photo || fd.ibi?.photo || fd.electricityBill?.photo);
  const hasPhotos = fd && (fd.electricalPanel?.photos?.length || fd.roof?.photos?.length || fd.installationSpace?.photos?.length || fd.radiators?.photos?.length);
  const hasSigs = fd?.signatures?.customerSignature || fd?.signatures?.repSignature;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold text-eltex-blue bg-eltex-blue-light px-2 py-0.5 rounded-md">{project.code}</span>
              <ProductBadge type={project.productType} />
              <StatusBadge count={project.submissionCount} />
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{project.customerName}</h3>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{project.phone}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3 h-3" />Asesor: {project.assessor}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(project.createdAt)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {hasDocuments && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-eltex-blue" /> Documentos
            </span>
          )}
          {hasPhotos && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-eltex-blue" /> Fotos
            </span>
          )}
          {hasSigs && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <PenLine className="w-3.5 h-3.5 text-eltex-blue" /> Firmado
            </span>
          )}
          {project.lastActivity && (
            <span className="text-xs text-gray-400 ml-auto">Última actividad: {formatDate(project.lastActivity)}</span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && fd && (
        <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50">

          {/* Phone */}
          {fd.phone && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teléfono confirmado</p>
              <p className="text-sm font-medium text-gray-800">{fd.phone}</p>
            </div>
          )}

          {/* DNI */}
          {(fd.dni?.front?.photo || fd.dni?.back?.photo) && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> DNI / NIE
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DocSlotDisplay label="Cara frontal" slot={fd.dni.front} />
                <DocSlotDisplay label="Cara trasera" slot={fd.dni.back} />
              </div>
            </div>
          )}

          {/* IBI & Electricity */}
          {(fd.ibi?.photo || fd.electricityBill?.photo) && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Documentos del inmueble
              </p>
              <div className="grid grid-cols-1 gap-3">
                {fd.ibi?.photo && <DocSlotDisplay label="IBI / Escritura" slot={fd.ibi} />}
                {fd.electricityBill?.photo && <DocSlotDisplay label="Factura de electricidad" slot={fd.electricityBill} />}
              </div>
            </div>
          )}

          {/* Photos */}
          {hasPhotos && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Fotos del inmueble
              </p>
              <PhotoGrid photos={fd.electricalPanel?.photos || []} label="Cuadro eléctrico" />
              <PhotoGrid photos={fd.roof?.photos || []} label="Tejado" />
              <PhotoGrid photos={fd.installationSpace?.photos || []} label="Espacio de instalación" />
              <PhotoGrid photos={fd.radiators?.photos || []} label="Radiadores" />
            </div>
          )}

          {/* Signatures */}
          {hasSigs && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5" /> Firmas
              </p>
              <div className="grid grid-cols-2 gap-3">
                {fd.signatures.customerSignature && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Firma del cliente</p>
                    <img src={fd.signatures.customerSignature} alt="Firma cliente" className="w-full h-20 object-contain bg-white rounded-xl border border-gray-200 p-1" />
                  </div>
                )}
                {fd.signatures.repSignature && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Firma del comercial</p>
                    <img src={fd.signatures.repSignature} alt="Firma comercial" className="w-full h-20 object-contain bg-white rounded-xl border border-gray-200 p-1" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Open form link */}
          <a
            href={`/?code=${project.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-eltex-blue font-medium hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Abrir formulario del cliente
          </a>
        </div>
      )}
    </div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'submitted' | 'pending'>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchDashboard();
      if (res.success && res.projects) setProjects(res.projects);
      else setError('No se pudieron cargar los datos.');
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = projects.filter(p => {
    if (filter === 'submitted' && p.submissionCount === 0) return false;
    if (filter === 'pending' && p.submissionCount > 0) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.customerName?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.assessor?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalSubmitted = projects.filter(p => p.submissionCount > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/eltex-logo.png" alt="Eltex" className="h-7 object-contain" />
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-eltex-blue" />
              <h1 className="font-semibold text-gray-900">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-eltex-blue font-medium px-3 py-2 rounded-lg hover:bg-eltex-blue-light transition-colors"
            >
              ← Volver al formulario
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Proyectos totales', value: projects.length, icon: FileText },
            { label: 'Enviados', value: totalSubmitted, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Pendientes', value: projects.length - totalSubmitted, icon: Clock, color: 'text-orange-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100">
              <Icon className={`w-5 h-5 mb-2 ${color || 'text-eltex-blue'}`} />
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, código, teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input flex-1 py-2.5 text-sm"
          />
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(['all', 'submitted', 'pending'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-eltex-blue text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f === 'all' ? 'Todos' : f === 'submitted' ? 'Enviados' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 rounded-xl p-4 text-sm text-red-600 border border-red-100">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-eltex-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Projects */}
        {!loading && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No hay proyectos que coincidan.</div>
            ) : (
              filtered.map(p => <ProjectCard key={p.code} project={p} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

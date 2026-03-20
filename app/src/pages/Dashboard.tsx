import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, RefreshCw, Sun, Thermometer, User, Phone, Calendar,
  CheckCircle, Clock, FileText, Camera, PenLine, ChevronDown, ChevronUp,
  ExternalLink, Image as ImageIcon, AlertTriangle, Search, Zap, CreditCard,
  MapPin, Hash, Users
} from 'lucide-react';
import { fetchDashboard } from '@/services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function StatusBadge({ count }: { count: number }) {
  if (count === 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" /> Pendiente
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle className="w-3 h-3" /> {count} envío{count !== 1 ? 's' : ''}
    </span>
  );
}

function ProductBadge({ type }: { type: string }) {
  const isSolar = type?.toLowerCase() === 'solar';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isSolar ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
      {isSolar ? <Sun className="w-3 h-3" /> : <Thermometer className="w-3 h-3" />}
      {isSolar ? 'Solar' : 'Aerotermia'}
    </span>
  );
}

// ── Document image with lightbox ───────────────────────────────────────────────
function DocImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setOpen(true)}
        className={`cursor-zoom-in object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity ${className}`}
      />
      {open && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <img src={src} alt={alt} className="max-w-full max-h-full rounded-xl shadow-2xl" />
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >✕</button>
        </div>
      )}
    </>
  );
}

// ── Section heading ────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <div className="w-6 h-6 rounded-md bg-eltex-blue-light flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-eltex-blue" />
      </div>
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ── Extracted field row ────────────────────────────────────────────────────────
function FieldRow({ label, value }: { label: string; value: any }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 text-xs py-0.5">
      <span className="text-gray-400 shrink-0 w-36">{label}</span>
      <span className="text-gray-800 font-medium break-all">{String(value)}</span>
    </div>
  );
}

// ── DNI display ───────────────────────────────────────────────────────────────
function DNIDisplay({ dni }: { dni: any }) {
  if (!dni?.front?.photo && !dni?.back?.photo) return null;

  const frontData = dni.front?.extraction?.extractedData;
  const backData = dni.back?.extraction?.extractedData;

  return (
    <div className="space-y-3">
      <SectionHeading icon={CreditCard} label="DNI / NIE" />
      <div className="grid grid-cols-2 gap-4">
        {/* Front */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Cara frontal</p>
          {dni.front?.photo?.preview && (
            <DocImage src={dni.front.photo.preview} alt="DNI frontal" className="w-full h-36" />
          )}
          {frontData && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <FieldRow label="Nombre" value={frontData.fullName} />
              <FieldRow label="DNI / NIE" value={frontData.dniNumber} />
              <FieldRow label="Nacimiento" value={frontData.dateOfBirth} />
              <FieldRow label="Válido hasta" value={frontData.expiryDate} />
              <FieldRow label="Sexo" value={frontData.sex} />
              {dni.front.extraction?.needsManualReview && (
                <span className="text-orange-600 text-xs flex items-center gap-1 pt-1">
                  <AlertTriangle className="w-3 h-3" /> Revisar manualmente
                </span>
              )}
            </div>
          )}
        </div>

        {/* Back */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Cara trasera</p>
          {dni.back?.photo?.preview && (
            <DocImage src={dni.back.photo.preview} alt="DNI trasera" className="w-full h-36" />
          )}
          {backData && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <FieldRow label="Domicilio" value={backData.address} />
              <FieldRow label="Municipio" value={backData.municipality} />
              <FieldRow label="Provincia" value={backData.province} />
              <FieldRow label="Lugar de nacimiento" value={backData.placeOfBirth} />
              {dni.back.extraction?.needsManualReview && (
                <span className="text-orange-600 text-xs flex items-center gap-1 pt-1">
                  <AlertTriangle className="w-3 h-3" /> Revisar manualmente
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── IBI display ───────────────────────────────────────────────────────────────
function IBIDisplay({ ibi }: { ibi: any }) {
  if (!ibi?.photo) return null;
  const data = ibi.extraction?.extractedData;
  return (
    <div className="space-y-3">
      <SectionHeading icon={FileText} label="IBI / Escritura" />
      <div className="flex gap-4">
        {ibi.photo?.preview && (
          <DocImage src={ibi.photo.preview} alt="IBI" className="w-32 h-44 shrink-0" />
        )}
        {data && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1 flex-1">
            <FieldRow label="Referencia Catastral" value={data.referenciaCatastral} />
            <FieldRow label="Titular" value={data.titular} />
            <FieldRow label="Dirección" value={data.direccion} />
            {ibi.extraction?.needsManualReview && (
              <span className="text-orange-600 text-xs flex items-center gap-1 pt-1">
                <AlertTriangle className="w-3 h-3" /> Revisar manualmente
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Electricity Bill display ──────────────────────────────────────────────────
function ElectricityDisplay({ bill }: { bill: any }) {
  if (!bill?.photo) return null;
  const data = bill.extraction?.extractedData;
  return (
    <div className="space-y-3">
      <SectionHeading icon={Zap} label="Factura de electricidad" />
      <div className="flex gap-4">
        {bill.photo?.preview && (
          <DocImage src={bill.photo.preview} alt="Factura luz" className="w-32 h-44 shrink-0" />
        )}
        {data && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1 flex-1">
            <FieldRow label="CUPS" value={data.cups} />
            <FieldRow label="Potencia (kW)" value={data.potenciaContratada} />
            <FieldRow label="Tipo instalación" value={data.tipoFase} />
            <FieldRow label="Dirección suministro" value={data.direccionSuministro} />
            {bill.extraction?.needsManualReview && (
              <span className="text-orange-600 text-xs flex items-center gap-1 pt-1">
                <AlertTriangle className="w-3 h-3" /> Revisar manualmente
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Photo gallery ─────────────────────────────────────────────────────────────
function PhotoGallery({ photos, label }: { photos: any[]; label: string }) {
  if (!photos?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((p: any, i: number) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            {p.preview ? (
              <DocImage src={p.preview} alt={`${label} ${i + 1}`} className="w-full h-full" />
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

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: any }) {
  const [expanded, setExpanded] = useState(false);
  const fd = project.formData;

  const hasDocuments = fd && (fd.dni?.front?.photo || fd.dni?.back?.photo || fd.ibi?.photo || fd.electricityBill?.photo);
  const hasPhotos = fd && (fd.electricalPanel?.photos?.length || fd.roof?.photos?.length || fd.installationSpace?.photos?.length || fd.radiators?.photos?.length);
  const hasSigs = fd?.signatures?.customerSignature || fd?.signatures?.repSignature;
  const hasAny = hasDocuments || hasPhotos || hasSigs;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-eltex-blue bg-eltex-blue-light px-2.5 py-1 rounded-lg">{project.code}</span>
              <ProductBadge type={project.productType} />
              <StatusBadge count={project.submissionCount} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">{project.customerName}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{project.phone}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3 h-3" />{project.assessor}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(project.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/?code=${project.code}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir formulario"
              className="p-2 text-gray-400 hover:text-eltex-blue hover:bg-eltex-blue-light rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              disabled={!hasAny && !fd}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Quick chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {hasDocuments && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <FileText className="w-3 h-3" /> Documentos
            </span>
          )}
          {hasPhotos && (
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Camera className="w-3 h-3" /> Fotos
            </span>
          )}
          {hasSigs && (
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <PenLine className="w-3 h-3" /> Firmado
            </span>
          )}
          {project.lastActivity && (
            <span className="text-xs text-gray-400 ml-auto">
              Última actividad: {formatDate(project.lastActivity)}
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && fd && (
        <div className="border-t border-gray-100 p-5 space-y-6 bg-gradient-to-b from-gray-50/60 to-white">

          {/* Confirmed phone */}
          {fd.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 rounded-xl px-4 py-2.5 w-fit">
              <Phone className="w-4 h-4 text-eltex-blue" />
              <span className="font-medium">{fd.phone}</span>
              <span className="text-gray-400 text-xs">— teléfono confirmado</span>
            </div>
          )}

          {/* Documents */}
          {hasDocuments && (
            <div className="space-y-5">
              <DNIDisplay dni={fd.dni} />
              <IBIDisplay ibi={fd.ibi} />
              <ElectricityDisplay bill={fd.electricityBill} />
            </div>
          )}

          {/* Property photos */}
          {hasPhotos && (
            <div className="space-y-4">
              <SectionHeading icon={Camera} label="Fotos del inmueble" />
              <PhotoGallery photos={fd.electricalPanel?.photos || []} label="Cuadro eléctrico" />
              <PhotoGallery photos={fd.roof?.photos || []} label="Tejado" />
              <PhotoGallery photos={fd.installationSpace?.photos || []} label="Espacio de instalación" />
              <PhotoGallery photos={fd.radiators?.photos || []} label="Radiadores" />
            </div>
          )}

          {/* Signatures */}
          {hasSigs && (
            <div className="space-y-3">
              <SectionHeading icon={PenLine} label="Firmas" />
              <div className="grid grid-cols-2 gap-4">
                {fd.signatures?.customerSignature && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Cliente</p>
                    <img
                      src={fd.signatures.customerSignature}
                      alt="Firma cliente"
                      className="w-full h-24 object-contain bg-white rounded-xl border border-gray-200 p-2"
                    />
                  </div>
                )}
                {fd.signatures?.repSignature && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Comercial</p>
                    <img
                      src={fd.signatures.repSignature}
                      alt="Firma comercial"
                      className="w-full h-24 object-contain bg-white rounded-xl border border-gray-200 p-2"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submissions log */}
          {project.submissionCount > 0 && project.latestSubmission && (
            <div className="space-y-2">
              <SectionHeading icon={CheckCircle} label="Último envío" />
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs space-y-1">
                <div className="flex gap-2">
                  <span className="text-emerald-600 font-semibold">ID:</span>
                  <span className="font-mono text-emerald-700">{project.latestSubmission.id}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-600 font-semibold">Fecha:</span>
                  <span className="text-emerald-700">{formatDate(project.latestSubmission.timestamp)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-600 font-semibold">Origen:</span>
                  <span className="text-emerald-700 capitalize">{project.latestSubmission.source}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expand hint when no data */}
      {expanded && !fd && (
        <div className="border-t border-gray-100 p-5 text-center text-sm text-gray-400">
          Este proyecto aún no tiene datos guardados.
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
      return (
        p.customerName?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.assessor?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSubmitted = projects.filter(p => p.submissionCount > 0).length;
  const totalPending = projects.length - totalSubmitted;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/eltex-logo.png" alt="Eltex" className="h-7 object-contain" />
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-eltex-blue" />
              <h1 className="font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              title="Actualizar"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-eltex-blue font-semibold px-3 py-2 rounded-lg hover:bg-eltex-blue-light transition-colors"
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
            { label: 'Total proyectos', value: projects.length, icon: Users, color: 'text-eltex-blue', bg: 'bg-eltex-blue-light' },
            { label: 'Enviados', value: totalSubmitted, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pendientes', value: totalPending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, teléfono, asesor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-10 py-2.5 text-sm w-full"
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
            {(['all', 'submitted', 'pending'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f ? 'bg-eltex-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'submitted' ? 'Enviados' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 rounded-xl p-4 text-sm text-red-600 border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-eltex-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Project list */}
        {!loading && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No hay proyectos que coincidan.</p>
              </div>
            ) : (
              filtered.map(p => <ProjectCard key={p.code} project={p} />)
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 pb-4">
            Mostrando {filtered.length} de {projects.length} proyectos
          </p>
        )}
      </div>
    </div>
  );
}

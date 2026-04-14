import { useParams, useNavigate } from 'react-router-dom'
import { useCapteurById } from '../queries/capteurQueries'
import { useMesuresByCapteur } from '../queries/mesureQueries'
import DataGraph from '../components/DataGraph'

const CapteurDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: capteur, isLoading: capteurLoading } = useCapteurById(id!)
  const { data: mesures, isLoading: mesuresLoading, isError } = useMesuresByCapteur(id!)

  const isLoading = capteurLoading || mesuresLoading

  return (
    <div>
      <header className="mb-8">
        <button
          onClick={() => navigate('/capteurs')}
          style={{ fontFamily: 'var(--font-mono)' }}
          className="flex items-center gap-2 text-[11px] text-[#3d4455] hover:text-[#00e5a0] tracking-widest uppercase transition-colors mb-4"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour aux capteurs
        </button>

        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#00e5a0] tracking-[0.2em] uppercase mb-1">
          Relevés du capteur
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold tracking-wider text-white uppercase">
          {capteur ? capteur.capteur_id : id}
        </h1>
        <div className="mt-3 h-px w-16 bg-[#00e5a0]" />

        {capteur && (
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={['w-2 h-2 rounded-full', capteur.statut ? 'bg-[#00e5a0] animate-pulse' : 'bg-[#3d4455]'].join(' ')} />
              <span style={{ fontFamily: 'var(--font-mono)' }} className={['text-[11px] tracking-widest uppercase', capteur.statut ? 'text-[#00e5a0]' : 'text-[#3d4455]'].join(' ')}>
                {capteur.statut ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[11px] text-[#3d4455] tracking-widest">
              {capteur.latitude}, {capteur.longitude}
            </span>
          </div>
        )}
      </header>

      <div className="rounded border border-[#1e2230] bg-[#111318] p-6">
        {isLoading && (
          <p style={{ fontFamily: 'var(--font-mono)' }} className="text-xs text-[#3d4455] tracking-widest animate-pulse">
            Chargement...
          </p>
        )}
        {isError && (
          <p style={{ fontFamily: 'var(--font-mono)' }} className="text-xs text-red-500/70 tracking-widest">
            Erreur de connexion au backend.
          </p>
        )}
        {mesures && <DataGraph data={mesures} />}
      </div>
    </div>
  )
}

export default CapteurDetailPage

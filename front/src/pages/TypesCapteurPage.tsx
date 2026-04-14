import { useTypesCapteur } from '../queries/typeCapteurQueries'

const TypesCapteurPage = () => {
  const { data, isLoading, isError } = useTypesCapteur()

  return (
    <div>
      <header className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#00e5a0] tracking-[0.2em] uppercase mb-1">
          Classification
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold tracking-wider text-white uppercase">
          Types de capteur
        </h1>
        <div className="mt-3 h-px w-16 bg-[#00e5a0]" />
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
        {data && (
          <ul className="flex flex-col gap-2">
            {data.map((type) => (
              <li
                key={type.type_capteur_id}
                className="flex items-center justify-between px-4 py-3 rounded border border-[#1e2230] hover:border-[#00e5a0]/30 hover:bg-[#00e5a0]/5 transition-all duration-150"
              >
                <span style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-semibold tracking-wider text-white uppercase">
                  {type.libelle}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] text-[#3d4455] tracking-widest">
                  {type.type_capteur_id}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default TypesCapteurPage

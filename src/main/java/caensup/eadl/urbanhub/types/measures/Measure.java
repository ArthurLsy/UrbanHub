package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

/**
 * Classe de base commune à toutes les mesures issues d'un capteur.
 *
 * <p>Chaque mesure est immuable et regroupe les champs partagés par tous les types
 * ({@code sensorId}, {@code timestamp}, {@code location}, {@code value}, {@code unit}).
 * Les sous-classes fournissent leur {@link MeasureType} et leurs règles de validation
 * métier via {@link #validate()}.
 *
 * <p>Hiérarchie connue :
 * <ul>
 *   <li>{@link AirMeasure} – qualité de l'air (µg/m³)</li>
 *   <li>{@link NoiseMeasure} – niveau sonore (dB)</li>
 *   <li>{@link TrafficMeasure} – vitesse de trafic (km/h)</li>
 *   <li>{@link WeatherMeasure} – données météo (°C)</li>
 * </ul>
 *
 * @see MeasureFactory
 * @see MeasureType
 */
public abstract class Measure {

	private final String sensorId;
	private final Instant timestamp;
	private final String location;
	private final Double value;
	private final String unit;

	/**
	 * Construit une mesure avec ses champs communs.
	 *
	 * @param sensorId  identifiant unique du capteur émetteur
	 * @param timestamp instant auquel la mesure a été relevée
	 * @param location  identifiant ou coordonnées du lieu de mesure
	 * @param value     valeur numérique mesurée
	 * @param unit      unité de la valeur (ex. {@code "°C"}, {@code "dB"})
	 */
	protected Measure(String sensorId, Instant timestamp, String location, Double value, String unit) {
		this.sensorId = sensorId;
		this.timestamp = timestamp;
		this.location = location;
		this.value = value;
		this.unit = unit;
	}

	/** @return identifiant unique du capteur émetteur */
	public String sensorId()    { return sensorId; }

	/** @return instant auquel la mesure a été relevée */
	public Instant timestamp()  { return timestamp; }

	/** @return identifiant ou coordonnées du lieu de mesure */
	public String location()    { return location; }

	/** @return valeur numérique mesurée */
	public Double value()       { return value; }

	/** @return unité de la valeur (ex. {@code "°C"}, {@code "dB"}) */
	public String unit()        { return unit; }

	/** @return le type de mesure associé à cette instance */
	public abstract MeasureType type();

	/**
	 * Vérifie que la mesure respecte les règles métier de son type.
	 *
	 * @throws InvalidMeasureException si la valeur ou le timestamp est invalide
	 */
	public abstract void validate();

	/**
	 * Utilitaire partagé : vérifie que le timestamp est présent et non dans le futur.
	 *
	 * @throws InvalidMeasureException si le timestamp est {@code null} ou postérieur à {@link Instant#now()}
	 */
	protected void validateTimestamp() {
		if (timestamp == null || timestamp.isAfter(Instant.now())) {
			throw new InvalidMeasureException("le timestamp est absent ou dans le futur");
		}
	}
}

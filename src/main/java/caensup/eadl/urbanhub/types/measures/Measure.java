package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

/**
 * Classe de base commune à toutes les mesures issues d'un capteur.
 * Les champs communs sont portés ici ; chaque sous-classe fournit
 * son {@link MeasureType} et ses règles de validation métier.
 */
public abstract class Measure {

	private final String sensorId;
	private final Instant timestamp;
	private final String location;
	private final Double value;
	private final String unit;

	protected Measure(String sensorId, Instant timestamp, String location, Double value, String unit) {
		this.sensorId = sensorId;
		this.timestamp = timestamp;
		this.location = location;
		this.value = value;
		this.unit = unit;
	}

	public String sensorId()    { return sensorId; }
	public Instant timestamp()  { return timestamp; }
	public String location()    { return location; }
	public Double value()       { return value; }
	public String unit()        { return unit; }

	public abstract MeasureType type();

	/**
	 * Vérifie que la mesure est cohérente.
	 * Lève {@link InvalidMeasureException} si une règle est violée.
	 */
	public abstract void validate();

	/** Utilitaire partagé : rejette un timestamp absent ou dans le futur. */
	protected void validateTimestamp() {
		if (timestamp == null || timestamp.isAfter(Instant.now())) {
			throw new InvalidMeasureException("le timestamp est absent ou dans le futur");
		}
	}
}

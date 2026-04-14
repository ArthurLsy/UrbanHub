package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

/**
 * Mesure de trafic routier exprimée en kilomètres par heure (km/h).
 *
 * <p>Règles métier :
 * <ul>
 *   <li>L'unité fournie doit être exactement {@code "km/h"}.</li>
 *   <li>La valeur doit être {@code >= 0} — une vitesse ne peut pas être négative.</li>
 *   <li>Le timestamp ne doit pas être dans le futur.</li>
 * </ul>
 */
public class TrafficMeasure extends Measure {

	private static final String UNIT = "km/h";

	/**
	 * Crée une mesure de trafic routier.
	 *
	 * @param sensorId   identifiant du capteur
	 * @param timestamp  instant de la mesure
	 * @param location   lieu de la mesure
	 * @param value      vitesse mesurée (km/h)
	 * @param unitString unité déclarée dans le message entrant ; doit être {@code "km/h"}
	 * @throws InvalidMeasureException si {@code unitString} ne correspond pas à {@code "km/h"}
	 */
	public TrafficMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
		super(sensorId, timestamp, location, value, UNIT);

		if (!UNIT.equals(unitString)) {
			throw new InvalidMeasureException("La valeur doit être être en " + UNIT + " (reçu: " + unitString + ")");
		}
	}

	/** @return {@link MeasureType#TRAFFIC} */
	@Override
	public MeasureType type() {
		return MeasureType.TRAFFIC;
	}

	/**
	 * Vérifie que la vitesse est présente et non négative, puis valide le timestamp.
	 *
	 * @throws InvalidMeasureException si la valeur est {@code null} ou {@code < 0},
	 *                                 ou si le timestamp est absent / dans le futur
	 */
	@Override
	public void validate() {
		if (value() == null || value() < 0) {
			throw new InvalidMeasureException("la valeur de trafic doit être >= 0 (reçu: " + value() + ")");
		}
		validateTimestamp();
	}
}

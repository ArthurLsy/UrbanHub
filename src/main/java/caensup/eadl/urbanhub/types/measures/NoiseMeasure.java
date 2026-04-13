package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class NoiseMeasure extends Measure {

	private static final String UNIT = "dB";

	public NoiseMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
		super(sensorId, timestamp, location, value, UNIT);

		if (!UNIT.equals(unitString)) {
			throw new InvalidMeasureException("La valeur doit être être en " + UNIT + " (reçu: " + unitString + ")");
		}
	}

	@Override
	public MeasureType type() {
		return MeasureType.NOISE;
	}

	/** Le niveau sonore (dB) ne peut pas être négatif. */
	@Override
	public void validate() {
		if (value() == null || value() < 0) {
			throw new InvalidMeasureException("le niveau sonore doit être >= 0 dB (reçu: " + value() + ")");
		}
		validateTimestamp();
	}
}

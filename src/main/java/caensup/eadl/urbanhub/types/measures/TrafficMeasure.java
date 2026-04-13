package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class TrafficMeasure extends Measure {

	private static final String UNIT = "km/h";	

	public TrafficMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
		super(sensorId, timestamp, location, value, UNIT);

		if (!UNIT.equals(unitString)) {
			throw new InvalidMeasureException("La valeur doit être être en " + UNIT + " (reçu: " + unitString + ")");
		}
	}

	@Override
	public MeasureType type() {
		return MeasureType.TRAFFIC;
	}

	/** Une vitesse de trafic ne peut pas être négative. */
	@Override
	public void validate() {
		if (value() == null || value() < 0) {
			throw new InvalidMeasureException("la valeur de trafic doit être >= 0 (reçu: " + value() + ")");
		}
		validateTimestamp();
	}
}

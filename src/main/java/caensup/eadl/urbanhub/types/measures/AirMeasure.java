package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class AirMeasure extends Measure {

	private static final String UNIT = "μg/m3";

	public AirMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
		super(sensorId, timestamp, location, value, UNIT);

		if (!UNIT.equals(unitString)) {
			throw new InvalidMeasureException("La valeur doit être être en " + UNIT + " (reçu: " + unitString + ")");
		}
	}

	@Override
	public MeasureType type() {
		return MeasureType.AIR;
	}

	/** La qualité de l'air (ex. µg/m³) ne peut pas être négative. */
	@Override
	public void validate() {
		if (value() == null || value() < 0) {
			throw new InvalidMeasureException("la valeur de qualité de l'air doit être >= 0 (reçu: " + value() + ")");
		}
		validateTimestamp();
	}
}

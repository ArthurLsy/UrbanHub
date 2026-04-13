package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class WeatherMeasure extends Measure {

	private static final String UNIT = "°C";

	public WeatherMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
		super(sensorId, timestamp, location, value, UNIT);

		if (!UNIT.equals(unitString)) {
			throw new InvalidMeasureException("La valeur doit être être en " + UNIT + " (reçu: " + unitString + ")");
		}
	}

	@Override
	public MeasureType type() {
		return MeasureType.WEATHER;
	}

	/** La valeur météo (ex. température, humidité) doit être présente. */
	@Override
	public void validate() {
		if (value() == null) {
			throw new InvalidMeasureException("la valeur météo est absente");
		}
		validateTimestamp();
	}
}

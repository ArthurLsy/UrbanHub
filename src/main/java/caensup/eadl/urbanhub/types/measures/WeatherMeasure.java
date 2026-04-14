package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class WeatherMeasure extends MeasureBase {

    private static final String UNIT = "°C";

    public WeatherMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
        super(sensorId, timestamp, location, value, UNIT);

        if (!UNIT.equals(unitString)) {
            throw new InvalidMeasureException("Value must be in " + UNIT + " (received: " + unitString + ")");
        }
    }

    @Override
    public MeasureType type() {
        return MeasureType.WEATHER;
    }

    @Override
    public void validate() {
        if (value() == null) {
            throw new InvalidMeasureException("weather value is missing");
        }
        validateTimestamp();
    }
}

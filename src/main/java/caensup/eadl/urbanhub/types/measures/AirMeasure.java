package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class AirMeasure extends MeasureBase {

    private static final String UNIT = "μg/m3";

    public AirMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
        super(sensorId, timestamp, location, value, UNIT);

        if (!UNIT.equals(unitString)) {
            throw new InvalidMeasureException("Value must be in " + UNIT + " (received: " + unitString + ")");
        }
    }

    @Override
    public MeasureType type() {
        return MeasureType.AIR;
    }

    /** Air quality (e.g. µg/m³) cannot be negative. */
    @Override
    public void validate() {
        if (value() == null || value() < 0) {
            throw new InvalidMeasureException("air quality value must be >= 0 (received: " + value() + ")");
        }
        validateTimestamp();
    }
}

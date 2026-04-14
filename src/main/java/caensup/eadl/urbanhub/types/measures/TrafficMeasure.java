package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class TrafficMeasure extends MeasureBase {

    private static final String UNIT = "km/h";

    public TrafficMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
        super(sensorId, timestamp, location, value, UNIT);

        if (!UNIT.equals(unitString)) {
            throw new InvalidMeasureException("Value must be in " + UNIT + " (received: " + unitString + ")");
        }
    }

    @Override
    public MeasureType type() {
        return MeasureType.TRAFFIC;
    }

    @Override
    public void validate() {
        if (value() == null || value() < 0) {
            throw new InvalidMeasureException("traffic value must be >= 0 (received: " + value() + ")");
        }
        validateTimestamp();
    }
}

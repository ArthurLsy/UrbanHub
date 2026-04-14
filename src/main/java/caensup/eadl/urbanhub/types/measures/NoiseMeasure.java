package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;

public class NoiseMeasure extends MeasureBase {

    private static final String UNIT = "dB";

    public NoiseMeasure(String sensorId, Instant timestamp, String location, Double value, String unitString) {
        super(sensorId, timestamp, location, value, UNIT);

        if (!UNIT.equals(unitString)) {
            throw new InvalidMeasureException("Value must be in " + UNIT + " (received: " + unitString + ")");
        }
    }

    @Override
    public MeasureType type() {
        return MeasureType.NOISE;
    }

    /** Sound level (dB) cannot be negative. */
    @Override
    public void validate() {
        if (value() == null || value() < 0) {
            throw new InvalidMeasureException("sound level must be >= 0 dB (received: " + value() + ")");
        }
        validateTimestamp();
    }
}

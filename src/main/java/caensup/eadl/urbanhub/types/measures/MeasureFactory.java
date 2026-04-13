package caensup.eadl.urbanhub.types.measures;

import java.time.Instant;

import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON;

/**
 * Transforme un DTO brut ({@link IngestMeasureJSON}) en objet domaine {@link Measure}
 * selon le champ {@code type}.
 */
public final class MeasureFactory {

	private MeasureFactory() {
	}

	public static Measure from(IngestMeasureJSON dto) {
		MeasureType type = parseType(dto.type());
		Instant ts = Instant.ofEpochMilli(Long.parseLong(dto.timestamp()));

		return switch (type) {
			case TRAFFIC -> new TrafficMeasure(
					dto.sensor_id(), ts, dto.location(), dto.value(), dto.unit());
			case AIR -> new AirMeasure(
					dto.sensor_id(), ts, dto.location(), dto.value(), dto.unit());
			case NOISE -> new NoiseMeasure(
					dto.sensor_id(), ts, dto.location(), dto.value(), dto.unit());
			case WEATHER -> new WeatherMeasure(
					dto.sensor_id(), ts, dto.location(), dto.value(), dto.unit());
		};
	}

	private static MeasureType parseType(String raw) {
		try {
			return MeasureType.valueOf(raw.toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new IllegalArgumentException("Type de mesure inconnu: " + raw);
		}
	}
}

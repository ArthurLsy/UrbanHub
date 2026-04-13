package caensup.eadl.urbanhub.ingest.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IngestMeasureJSON(
		@NotBlank String sensor_id,
		@NotBlank String type,
		@NotBlank String timestamp,
		String location,
		@NotNull Double value,
		@NotBlank String unit) {
}

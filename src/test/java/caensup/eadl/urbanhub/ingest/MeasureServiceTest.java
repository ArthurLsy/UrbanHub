package caensup.eadl.urbanhub.ingest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.boot.test.context.SpringBootTest;

import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON;
import caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException;
import caensup.eadl.urbanhub.ingest.service.MeasureService;

@SpringBootTest
class MeasureServiceTest {

	@ParameterizedTest
	@CsvSource({
		"weather, °C",
		"air,     μg/m3",
		"noise,   dB",
		"traffic, km/h"
	})
	@DisplayName("Ingestion d'une mesure de type {0} avec unité {1} est valide")
	void ingestMeasureValid(String type, String unit) {
		IngestMeasureJSON ingestMeasureJSON = new IngestMeasureJSON("1234567890", type, "78976865754", "1234567890", 20.0, unit);
		MeasureService measureService = new MeasureService();
		measureService.ingestMeasure(ingestMeasureJSON);
		assertEquals(20.0, ingestMeasureJSON.value());
	}

	@ParameterizedTest
	@CsvSource({
		"weather, km/h",
		"air,     °C",
		"noise,   μg/m3",
		"traffic, dB"
	})
	@DisplayName("Ingestion d'une mesure de type {0} avec unité {1} est invalide")
	void ingestMeasureInvalid(String type, String unit) {
		IngestMeasureJSON ingestMeasureJSON = new IngestMeasureJSON("1234567890", type, "78976865754", "1234567890", 20.0, unit);
		MeasureService measureService = new MeasureService();
		assertThrows(InvalidMeasureException.class, () -> measureService.ingestMeasure(ingestMeasureJSON));
	}

	@Test
	@DisplayName("Ingestion d'une mesure avec une valeur nulle est invalide")
	void ingestMeasureNullValue() {
		IngestMeasureJSON ingestMeasureJSON = new IngestMeasureJSON("1234567890", "weather", "78976865754", "1234567890", null, "°C");
		MeasureService measureService = new MeasureService();
		assertThrows(InvalidMeasureException.class, () -> measureService.ingestMeasure(ingestMeasureJSON));
	}

	@Test
	@DisplayName("Ingestion d'une mesure avec une valeur négative est valide")
	void ingestMeasureNegativeValueValid() {
		IngestMeasureJSON ingestMeasureJSON = new IngestMeasureJSON("1234567890", "weather", "78976865754", "1234567890", -1.0, "°C");
		MeasureService measureService = new MeasureService();
		measureService.ingestMeasure(ingestMeasureJSON);
		assertEquals(-1.0, ingestMeasureJSON.value());
	}

	@Test
	@DisplayName("Ingestion d'une mesure avec une valeur avec type inconnu est invalide")
	void ingestMeasureUnknownTypeInvalid() {
		IngestMeasureJSON ingestMeasureJSON = new IngestMeasureJSON("1234567890", "unknown", "78976865754", "1234567890", 20.0, "°C");
		MeasureService measureService = new MeasureService();
		assertThrows(IllegalArgumentException.class, () -> measureService.ingestMeasure(ingestMeasureJSON));
	}

}

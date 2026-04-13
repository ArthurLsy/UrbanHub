package caensup.eadl.urbanhub.ingest.api;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON;
import caensup.eadl.urbanhub.ingest.service.MeasureService;

import jakarta.validation.Valid;

@RestController
public class IngestMeasureController {

	private final MeasureService measureService;

	public IngestMeasureController(MeasureService measureService) {
		this.measureService = measureService;
	}

	@PostMapping("/ingest/measures")
	public void ingestMeasure(@Valid @RequestBody IngestMeasureJSON ingestMeasureJSON) {
		measureService.ingestMeasure(ingestMeasureJSON);
	}
}

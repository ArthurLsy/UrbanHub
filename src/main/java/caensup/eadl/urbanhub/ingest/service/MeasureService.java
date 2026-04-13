package caensup.eadl.urbanhub.ingest.service;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON;

import jakarta.validation.Valid;

@Service
@Validated
public class MeasureService {

	public void ingestMeasure(@Valid IngestMeasureJSON ingestMeasureJSON) {
		// Si la méthode est appelée depuis un autre bean Spring, @Valid déclenche la validation.
		System.out.println(ingestMeasureJSON);
	}
}

package caensup.eadl.urbanhub.ingest.service;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON;
import caensup.eadl.urbanhub.types.measures.MeasureFactory;
import caensup.eadl.urbanhub.types.measures.Measure;

import jakarta.validation.Valid;

@Service
@Validated
public class MeasureService {

	public void ingestMeasure(@Valid IngestMeasureJSON ingestMeasureJSON) {

		Measure measure = MeasureFactory.from(ingestMeasureJSON);

		measure.validate();
		// Si la méthode est appelée depuis un autre bean Spring, @Valid déclenche la validation.
		//TODO: Enregistrer la mesure dans la base de données
		System.out.println(measure);
	}
}

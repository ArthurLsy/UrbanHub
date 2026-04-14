package caensup.eadl.urbanhub.ingest.service;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON;
import caensup.eadl.urbanhub.types.measures.MeasureFactory;
import caensup.eadl.urbanhub.types.measures.Measure;

import jakarta.validation.Valid;

/**
 * Service applicatif chargé de l'ingestion des mesures capteurs.
 *
 * <p>Le flux d'ingestion suit trois étapes :
 * <ol>
 *   <li>Validation du DTO entrant via les contraintes Bean Validation ({@code @Valid}).</li>
 *   <li>Conversion du DTO en objet domaine {@link caensup.eadl.urbanhub.types.measures.Measure}
 *       via {@link caensup.eadl.urbanhub.types.measures.MeasureFactory}.</li>
 *   <li>Validation métier de la mesure (unité, valeur, timestamp).</li>
 * </ol>
 *
 * @see caensup.eadl.urbanhub.types.measures.MeasureFactory
 * @see caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON
 */
@Service
@Validated
public class MeasureService {

	/**
	 * Ingère une mesure capteur brute.
	 *
	 * <p>La validation Bean Validation ({@code @Valid}) est déclenchée automatiquement
	 * lorsque la méthode est appelée depuis un autre bean Spring géré par le conteneur.
	 *
	 * @param ingestMeasureJSON le DTO représentant la mesure reçue ; ne doit pas être {@code null}
	 * @throws jakarta.validation.ConstraintViolationException si une contrainte Bean Validation est violée
	 * @throws caensup.eadl.urbanhub.ingest.exception.InvalidMeasureException si la mesure échoue à la validation métier
	 * @throws IllegalArgumentException si le type de mesure est inconnu
	 */
	public void ingestMeasure(@Valid IngestMeasureJSON ingestMeasureJSON) {

		Measure measure = MeasureFactory.from(ingestMeasureJSON);

		measure.validate();
		//TODO: Enregistrer la mesure dans la base de données 
		System.out.println(measure);
	}
}

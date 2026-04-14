package caensup.eadl.urbanhub.ingest.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import caensup.eadl.urbanhub.entity.Capteur;
import caensup.eadl.urbanhub.entity.Mesure;
import caensup.eadl.urbanhub.entity.MesureId;
import caensup.eadl.urbanhub.entity.TypeCapteur;
import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJSON;
import caensup.eadl.urbanhub.repository.CapteurRepository;
import caensup.eadl.urbanhub.repository.MesureRepository;
import caensup.eadl.urbanhub.repository.TypeCapteurRepository;
import caensup.eadl.urbanhub.types.measures.Measure;
import caensup.eadl.urbanhub.types.measures.MeasureFactory;

import jakarta.validation.Valid;

import java.time.OffsetDateTime;

@Service
@Validated
public class MeasureService {

    private final MesureRepository mesureRepository;
    private final CapteurRepository capteurRepository;
    private final TypeCapteurRepository typeCapteurRepository;

    public MeasureService(MesureRepository mesureRepository, CapteurRepository capteurRepository, TypeCapteurRepository typeCapteurRepository) {
        this.mesureRepository = mesureRepository;
        this.capteurRepository = capteurRepository;
        this.typeCapteurRepository = typeCapteurRepository;
    }

    @Transactional
    public void ingestMeasure(@Valid IngestMeasureJSON ingestMeasureJSON) {

        Measure measure = MeasureFactory.from(ingestMeasureJSON);
        measure.validate();

        Capteur capteur = capteurRepository.findByCapteurId(ingestMeasureJSON.sensor_id())
                .orElseGet(() -> {
                    String typeStr = ingestMeasureJSON.type().toUpperCase();
                    TypeCapteur typeCapteur = typeCapteurRepository.findByTypeCapteurId(typeStr)
                            .orElseGet(() -> {
                                TypeCapteur newType = new TypeCapteur();
                                newType.setTypeCapteurId(typeStr);
                                return typeCapteurRepository.save(newType);
                            });

                    double lat = 0.0;
                    double lon = 0.0;
                    if (ingestMeasureJSON.location() != null && ingestMeasureJSON.location().contains(";")) {
                        try {
                            String[] parts = ingestMeasureJSON.location().split(";");
                            lat = Double.parseDouble(parts[0].trim());
                            lon = Double.parseDouble(parts[1].trim());
                        } catch (NumberFormatException ignored) {}
                    }

                    Capteur newCapteur = new Capteur();
                    newCapteur.setCapteurId(ingestMeasureJSON.sensor_id());
                    newCapteur.setTypeCapteur(typeCapteur);
                    newCapteur.setStatut(true);
                    newCapteur.setLatitude(lat);
                    newCapteur.setLongitude(lon);
                    newCapteur.setZone(null);

                    return capteurRepository.save(newCapteur);
                });

        OffsetDateTime horodatage = OffsetDateTime.ofInstant(measure.timestamp(), java.time.ZoneOffset.UTC);
        MesureId mesureId = new MesureId(horodatage, capteur.getUuid());

        Mesure mesure = new Mesure();
        mesure.setId(mesureId);
        mesure.setCapteur(capteur);
        mesure.setValeur(ingestMeasureJSON.value().floatValue());
        mesure.setUnite(ingestMeasureJSON.unit());

        mesureRepository.save(mesure);
    }
}

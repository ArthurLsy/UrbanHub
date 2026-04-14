package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.MesureDto;
import caensup.eadl.urbanhub.entity.Capteur;
import caensup.eadl.urbanhub.entity.Mesure;
import caensup.eadl.urbanhub.repository.MesureRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Porte la logique metier liee a la consultation des mesures.
 */
@Service
public class MesureService {

    private final MesureRepository mesureRepository;

    public MesureService(MesureRepository mesureRepository) {
        this.mesureRepository = mesureRepository;
    }

    /**
     * Recupere les mesures avec un filtrage optionnel par identifiant fonctionnel de capteur.
     *
     * @param capteurId identifiant fonctionnel du capteur
     * @return la liste des mesures trouvees
     */
    @Transactional(readOnly = true)
    public List<MesureDto> getMesures(String capteurId) {
        List<Mesure> mesures = capteurId == null || capteurId.isBlank()
                ? mesureRepository.findAll()
                : mesureRepository.findByCapteurCapteurId(capteurId);

        return mesures.stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Transforme une entite {@link Mesure} en DTO de retour.
     *
     * @param mesure entite a transformer
     * @return DTO expose par l'API
     */
    private MesureDto toDto(Mesure mesure) {
        Capteur capteur = mesure.getCapteur();
        String zoneId = capteur.getZone() != null ? capteur.getZone().getZoneId() : null;

        return new MesureDto(
                null, // ancien uuid technique (supprime pour TimescaleDB)
                null, // ancien mesureId
                mesure.getId().getHorodatage(), // recupere l'horodatage depuis la cle composite
                mesure.getValeur(),
                mesure.getUnite(),
                capteur.getCapteurId(),
                capteur.getLatitude(),
                capteur.getLongitude(),
                capteur.getStatut(),
                zoneId,
                capteur.getTypeCapteur().getTypeCapteurId()
        );
    }
}

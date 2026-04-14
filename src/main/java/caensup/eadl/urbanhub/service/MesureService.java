package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.MesureDto;
import caensup.eadl.urbanhub.entity.Capteur;
import caensup.eadl.urbanhub.entity.Mesure;
import caensup.eadl.urbanhub.repository.MesureRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
     * Recupere une mesure a partir de son identifiant technique.
     *
     * @param uuid identifiant technique de la mesure
     * @return la mesure trouvee
     * @throws ResponseStatusException si aucune mesure ne correspond a l'identifiant fourni
     */
    @Transactional(readOnly = true)
    public MesureDto getMesureByUuid(UUID uuid) {
        return mesureRepository.findById(uuid)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mesure introuvable pour l'uuid " + uuid
                ));
    }

    /**
     * Transforme une entite {@link Mesure} en DTO de retour.
     *
     * @param mesure entite a transformer
     * @return DTO expose par l'API
     */
    private MesureDto toDto(Mesure mesure) {
        Capteur capteur = mesure.getCapteur();

        return new MesureDto(
                mesure.getUuid(),
                mesure.getMesureId(),
                mesure.getHorodatage(),
                mesure.getValeur(),
                mesure.getUnite(),
                capteur.getCapteurId(),
                capteur.getLatitude(),
                capteur.getLongitude(),
                capteur.getStatut(),
                capteur.getZone().getZoneId(),
                capteur.getTypeCapteur().getTypeCapteurId()
        );
    }
}

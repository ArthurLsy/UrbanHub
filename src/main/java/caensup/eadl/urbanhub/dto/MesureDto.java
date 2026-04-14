package caensup.eadl.urbanhub.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO de retour expose pour la lecture des mesures.
 *
 * @param uuid identifiant technique de la mesure
 * @param mesureId identifiant fonctionnel de la mesure
 * @param horodatage date et heure de la mesure
 * @param valeur valeur relevee
 * @param unite unite associee a la valeur
 * @param capteurId identifiant fonctionnel du capteur
 * @param latitude latitude du capteur
 * @param longitude longitude du capteur
 * @param statutCapteur statut du capteur
 * @param zoneId identifiant fonctionnel de la zone
 * @param typeCapteurId identifiant fonctionnel du type de capteur
 */
public record MesureDto(
        UUID uuid,
        String mesureId,
        OffsetDateTime horodatage,
        Float valeur,
        String unite,
        String capteurId,
        Double latitude,
        Double longitude,
        Boolean statutCapteur,
        String zoneId,
        String typeCapteurId
) {
}

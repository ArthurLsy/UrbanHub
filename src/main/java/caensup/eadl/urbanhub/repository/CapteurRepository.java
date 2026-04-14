package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Capteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CapteurRepository extends JpaRepository<Capteur, UUID> {

    /**
     * Recherche un capteur par son identifiant métier (sensor_id dans le payload JSON).
     */
    Optional<Capteur> findByCapteurId(String capteurId);

    /**
     * Retourne tous les capteurs appartenant à une zone identifiée par son zoneId métier.
     */
    List<Capteur> findByZone_ZoneId(String zoneId);
}

package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Mesure;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acces aux donnees des mesures.
 */
public interface MesureRepository extends JpaRepository<Mesure, UUID> {

    @Override
    @EntityGraph(attributePaths = {"capteur", "capteur.zone", "capteur.typeCapteur"})
    List<Mesure> findAll();

    /**
     * Recherche les mesures associees a un capteur via son identifiant fonctionnel.
     *
     * @param capteurId identifiant fonctionnel du capteur
     * @return la liste des mesures trouvees
     */
    @EntityGraph(attributePaths = {"capteur", "capteur.zone", "capteur.typeCapteur"})
    List<Mesure> findByCapteurCapteurId(String capteurId);
}

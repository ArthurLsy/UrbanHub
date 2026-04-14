package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Mesure;
import caensup.eadl.urbanhub.entity.MesureId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MesureRepository extends JpaRepository<Mesure, MesureId> {

    /**
     * Retourne toutes les mesures associées à un capteur identifié par son capteurId métier.
     */
    List<Mesure> findByCapteur_CapteurId(String capteurId);
}

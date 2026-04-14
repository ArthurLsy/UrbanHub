package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.TypeCapteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TypeCapteurRepository extends JpaRepository<TypeCapteur, UUID> {

    /**
     * Recherche un type de capteur par son identifiant métier (ex: "AIR", "NOISE"...).
     */
    Optional<TypeCapteur> findByTypeCapteurId(String typeCapteurId);
}

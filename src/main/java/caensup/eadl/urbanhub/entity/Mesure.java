package caensup.eadl.urbanhub.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité TimescaleDB.
 * La clé primaire composite (horodatage, capteur_uuid) est définie dans {@link MesureId}.
 * TimescaleDB partitionne automatiquement la table par "horodatage".
 */
@Entity
@Table(name = "mesure")
@Data
@NoArgsConstructor
public class Mesure {

    @EmbeddedId
    private MesureId id;

    /**
     * Lie le champ capteurUuid de la clé composite à la FK Capteur.
     * insertable/updatable = false car la colonne est déjà gérée par @EmbeddedId.
     */
    @MapsId("capteurUuid")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capteur_uuid", insertable = false, updatable = false)
    private Capteur capteur;

    @Column(name = "valeur", nullable = false)
    private Float valeur;

    @Column(name = "unite", nullable = false)
    private String unite;
}

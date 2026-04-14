package caensup.eadl.urbanhub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Clé composite pour la table TimescaleDB "mesure".
 * TimescaleDB exige que la colonne de partition temporelle (horodatage)
 * fasse partie de la clé primaire.
 *
 * Unicité naturelle : un capteur ne peut émettre qu'une mesure à un instant donné.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MesureId implements Serializable {

    @Column(name = "horodatage", columnDefinition = "TIMESTAMPTZ", nullable = false)
    private OffsetDateTime horodatage;

    @Column(name = "capteur_uuid", columnDefinition = "UUID", nullable = false)
    private UUID capteurUuid;
}

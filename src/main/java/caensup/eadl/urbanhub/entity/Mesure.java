package caensup.eadl.urbanhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "mesure")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mesure {

    @Id
    @Column(name = "uuid", columnDefinition = "UUID")
    private UUID uuid = UUID.randomUUID();

    @Column(name = "mesure_id", nullable = false)
    private String mesureId;

    @Column(name = "horodatage", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime horodatage;

    @Column(name = "valeur", nullable = false)
    private Float valeur;

    @Column(name = "unite", nullable = false)
    private String unite;

    @ManyToOne
    @JoinColumn(name = "capteur_id", nullable = false)
    private Capteur capteur;
}


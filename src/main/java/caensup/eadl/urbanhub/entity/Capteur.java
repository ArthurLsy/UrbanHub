package caensup.eadl.urbanhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "capteur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Capteur {

    @Id
    @Column(name = "uuid", columnDefinition = "UUID")
    private UUID uuid = UUID.randomUUID();

    @Column(name = "capteur_id", nullable = false)
    private String capteurId;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "statut", nullable = false)
    private Boolean statut;

    @ManyToOne
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @ManyToOne
    @JoinColumn(name = "type_capteur", nullable = false)
    private TypeCapteur typeCapteur;

    @OneToMany(mappedBy = "capteur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Mesure> mesures;
}


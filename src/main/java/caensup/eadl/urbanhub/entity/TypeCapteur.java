package caensup.eadl.urbanhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "type_capteur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypeCapteur {

    @Id
    @Column(name = "uuid", columnDefinition = "UUID")
    private UUID uuid = UUID.randomUUID();

    @Column(name = "type_capteur_id", nullable = false)
    private String typeCapteurId;

    @OneToMany(mappedBy = "typeCapteur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Capteur> capteurs;
}


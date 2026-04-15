package caensup.eadl.urbanhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.HashSet;
import java.util.UUID;
import java.util.Set;

@Entity
@Table(name = "sensor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Sensor {

    @Id
    @Column(name = "uuid", columnDefinition = "UUID")
    @EqualsAndHashCode.Include
    private UUID uuid = UUID.randomUUID();

    @Column(name = "sensor_id", nullable = false)
    private String sensorId;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @ManyToMany(mappedBy = "sensors")
    private Set<Zone> zones = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "sensor_type", nullable = false)
    private SensorType sensorType;

    @OneToMany(mappedBy = "sensor", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Measure> measures;
}

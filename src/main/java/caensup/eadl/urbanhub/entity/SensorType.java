package caensup.eadl.urbanhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "sensor_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorType {

    @Id
    @Column(name = "uuid", columnDefinition = "UUID")
    private UUID uuid = UUID.randomUUID();

    @Column(name = "sensor_type_id", nullable = false)
    private String sensorTypeId;

    @OneToMany(mappedBy = "sensorType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sensor> sensors;
}

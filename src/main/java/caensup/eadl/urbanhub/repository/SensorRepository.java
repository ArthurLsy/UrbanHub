package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, UUID> {

    /**
     * Finds a sensor by its business identifier (sensor_id in the JSON payload).
     */
    Optional<Sensor> findBySensorId(String sensorId);
}

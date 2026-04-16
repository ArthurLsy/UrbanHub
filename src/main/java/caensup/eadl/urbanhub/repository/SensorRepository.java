package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Sensor;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, UUID> {

    /**
     * Finds a sensor by its business identifier (sensor_id in the JSON payload).
     */
    Optional<Sensor> findBySensorId(String sensorId);

    /** Capteurs avec activité récente : {@code last_update >= cutoff}. */
    List<Sensor> findByLastUpdateGreaterThanEqual(Instant cutoff);

    /** Capteurs sans activité récente : {@code last_update < cutoff}. */
    List<Sensor> findByLastUpdateLessThan(Instant cutoff);

}

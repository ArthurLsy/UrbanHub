package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.ZoneDto;
import caensup.eadl.urbanhub.entity.Zone;
import caensup.eadl.urbanhub.ingest.exception.ZoneNotFoundException;
import caensup.eadl.urbanhub.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ZoneService {

    private final ZoneRepository zoneRepository;

    public ZoneService(ZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }

    @Transactional(readOnly = true)
    public List<ZoneDto> getAll() {
        return zoneRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ZoneDto getById(String zoneId) {
        return zoneRepository.findByZoneId(zoneId)
                .map(this::toDto)
                .orElseThrow(() -> new ZoneNotFoundException(zoneId));
    }

    @Transactional(readOnly = true)
    public long getCount() {
        return zoneRepository.count();
    }

    private ZoneDto toDto(Zone zone) {
        return new ZoneDto(zone.getUuid(), zone.getZoneId());
    }
}

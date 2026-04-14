package caensup.eadl.urbanhub.controller;

import caensup.eadl.urbanhub.dto.ZoneDto;
import caensup.eadl.urbanhub.service.ZoneService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @GetMapping
    public List<ZoneDto> getAll() {
        return zoneService.getAll();
    }

    @GetMapping("/count")
    public long getCount() {
        return zoneService.getCount();
    }

    @GetMapping("/by-id")
    public ZoneDto getById(@RequestParam(name = "zone_id") String zoneId) {
        return zoneService.getById(zoneId);
    }
}

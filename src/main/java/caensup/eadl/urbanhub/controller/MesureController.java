package caensup.eadl.urbanhub.controller;

import caensup.eadl.urbanhub.dto.MesureDto;
import caensup.eadl.urbanhub.service.MesureService;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expose les endpoints de consultation des mesures.
 */
@RestController
@RequestMapping("/api/mesures")
public class MesureController {

    private final MesureService mesureService;

    public MesureController(MesureService mesureService) {
        this.mesureService = mesureService;
    }

    /**
     * Retourne la liste des mesures, avec un filtrage optionnel par identifiant fonctionnel de capteur.
     *
     * @param capteurId identifiant fonctionnel du capteur a utiliser comme filtre
     * @return la liste des mesures correspondant au filtre
     */
    @GetMapping
    public List<MesureDto> getMesures(@RequestParam(name = "capteur_id", required = false) String capteurId) {
        return mesureService.getMesures(capteurId);
    }

}

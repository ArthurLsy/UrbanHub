package caensup.eadl.urbanhub.ingest.exception;

public class CapteurNotFoundException extends RuntimeException {

	private final Long capteurId;

	public CapteurNotFoundException(Long capteurId) {
		super("Capteur introuvable: " + capteurId);
		this.capteurId = capteurId;
	}

	public Long getCapteurId() {
		return capteurId;
	}
}

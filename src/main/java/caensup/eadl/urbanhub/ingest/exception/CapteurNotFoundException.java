package caensup.eadl.urbanhub.ingest.exception;

public class CapteurNotFoundException extends RuntimeException {

	private final String capteurId;

	public CapteurNotFoundException(String capteurId) {
		super("Capteur introuvable: " + capteurId);
		this.capteurId = capteurId;
	}

	public String getCapteurId() {
		return capteurId;
	}
}

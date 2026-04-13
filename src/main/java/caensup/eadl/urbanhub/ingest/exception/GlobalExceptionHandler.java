package caensup.eadl.urbanhub.ingest.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(InvalidMeasureException.class)
	public ResponseEntity<ProblemDetail> handleInvalidMeasure(InvalidMeasureException ex) {
		ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
		detail.setTitle("Mesure invalide");
		return ResponseEntity.unprocessableEntity().body(detail);
	}

	@ExceptionHandler(CapteurNotFoundException.class)
	public ResponseEntity<ProblemDetail> handleCapteurNotFound(CapteurNotFoundException ex) {
		ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
		detail.setTitle("Capteur introuvable");
		detail.setProperty("capteurId", ex.getCapteurId());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(detail);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult().getFieldErrors().stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.collect(Collectors.joining("; "));
		ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
		detail.setTitle("Requête invalide");
		return ResponseEntity.badRequest().body(detail);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ProblemDetail> handleUnreadableJson(HttpMessageNotReadableException ex) {
		ProblemDetail detail = ProblemDetail.forStatusAndDetail(
				HttpStatus.BAD_REQUEST, "Corps JSON illisible ou mal formé");
		detail.setTitle("Requête invalide");
		return ResponseEntity.badRequest().body(detail);
	}
}

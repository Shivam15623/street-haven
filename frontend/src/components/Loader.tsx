import { Spinner, Container } from "react-bootstrap";

export default function Loader() {
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center vh-100 "
      style={{
        background: "var(--street-card)",
      }}
    >
      {/* Spinning Loader */}
      <Spinner
        animation="border"
        role="status"
        variant="primary"
        style={{ width: "4rem", height: "4rem", borderWidth: "0.35rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>

      {/* Loading Text */}
      <p className="mt-3 fs-5 fw-semibold text-street-base">Loading...</p>
    </Container>
  );
}

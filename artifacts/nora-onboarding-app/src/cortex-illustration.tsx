export function CortexIllustration() {
  return (
    <figure className="nora-cortex-figure">
      <img
        src={`${import.meta.env.BASE_URL}nora-prefrontal-anatomical.jpg`}
        alt="Anatomical illustration of the brain viewed from the side. The prefrontal cortex at the front is highlighted in purple."
        data-testid="img-prefrontal-cortex"
        className="nora-illustration"
      />
      <figcaption><span className="nora-cortex-key" aria-hidden="true" />Prefrontal cortex · front of the brain</figcaption>
    </figure>
  );
}

/** Shown while the next page is being prepared: the site's saffron ring, fading in only if the wait is noticeable. */
export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading">
      <span className="page-loader__ring" aria-hidden="true" />
    </div>
  );
}

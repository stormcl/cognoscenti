import { Link, useParams, useSearchParams } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
  description: string
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const query = params.get('q')
  const heading = id ? id.replace(/-/g, ' ') : title

  return (
    <section className="placeholder">
      <h1>{heading}</h1>
      {query ? <p className="placeholder-query">Looking for “{query}”.</p> : null}
      <p>{description}</p>
      <p className="placeholder-note">{'{Demo dead link}'}</p>
      <Link className="text-link" to="/">
        Back to front page
      </Link>
    </section>
  )
}

export default PlaceholderPage

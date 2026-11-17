import { Link, useParams } from 'react-router-dom'
import { useDiscussions } from '../data/discussions'

function DiscussionDetailPage() {
  // Get the discussion ID from the URL
  const { id } = useParams<{ id: string }>()

  // Retrieve discussions from the shared data store
  const discussions = useDiscussions()

  // Find the discussion matching the URL
  const discussion = discussions.find((row) => row.id === id)

  // Handle a discussion that doesn't exist
  if (!discussion) {
    return (
      <section className="discussion-detail">
        <Link to="/discussions" className="discussion-back">
            ← Back to Discussions
        </Link>
        <h1>Discussion not found</h1>
        <p>This discussion may have been removed or is unavailable.</p>
      </section>
    )
  }

  return (
    <section className="discussion-detail">
      <h1>{discussion.title}</h1>
      <p>{discussion.status}</p>
      <p>{discussion.body}</p>
      <p>Started by {discussion.authorName}</p>
    </section>
  )
}

export default DiscussionDetailPage
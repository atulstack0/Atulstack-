import { acts, accomplishments, finalMessage, profile, projects, skills } from '../data/portfolioData'
import { mapRange } from '../utils/math'

// Computes a gentle enter/exit reveal for a panel that "lives" within a
// given slice of the overall scroll progress (0-1). Pass `holdToEnd: true`
// for the final panel so it stays put instead of fading before the page ends.
function useReveal(progress, [start, end], options = {}) {
  const span = end - start
  const enter = mapRange(progress, start, start + span * (options.enterFraction ?? 0.35))
  const exit = options.holdToEnd ? 0 : mapRange(progress, end - span * (options.exitFraction ?? 0.3), end)
  const opacity = enter * (1 - exit)
  const translateY = (1 - enter) * 36 - exit * 36
  return { opacity, transform: `translateY(${translateY}px)`, enter, exit }
}

function Panel({ progress, range, align = 'start', className = '', children }) {
  const { opacity, transform } = useReveal(progress, range)
  return (
    <section className={`story-section story-section--${align}`}>
      <div className={`story-panel ${className}`} style={{ opacity, transform }}>
        {children}
      </div>
    </section>
  )
}

function ActArrival({ progress }) {
  const { eyebrow, title, body } = acts.arrival
  return (
    <Panel progress={progress} range={[0.0, 0.17]} align="start" className="story-panel--narrative">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </Panel>
  )
}

function ActTouchdown({ progress }) {
  const { eyebrow, title, body } = acts.touchdown
  return (
    <Panel progress={progress} range={[0.2, 0.36]} align="start" className="story-panel--narrative">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="badge-row">
        <span className="badge">{profile.name}</span>
        <span className="badge badge--ghost">{profile.role}</span>
      </div>
    </Panel>
  )
}

function SkillsPanel({ progress }) {
  const range = [0.36, 0.54]
  const { opacity, transform, enter } = useReveal(progress, range)
  return (
    <section className="story-section story-section--end">
      <div className="story-panel story-panel--card" style={{ opacity, transform }}>
        <p className="eyebrow">Act III — The Aura Awakens</p>
        <h2>Skills woven into the energy field</h2>
        <ul className="skill-list">
          {skills.map((skill) => (
            <li key={skill.label}>
              <div className="skill-list__head">
                <span>{skill.label}</span>
                <span>{Math.round(skill.level * enter)}%</span>
              </div>
              <div className="skill-bar">
                <div className="skill-bar__fill" style={{ width: `${skill.level * enter}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ProjectsPanel({ progress }) {
  const range = [0.52, 0.72]
  const { opacity, transform } = useReveal(progress, range)
  return (
    <section className="story-section story-section--start">
      <div className="story-panel story-panel--wide" style={{ opacity, transform }}>
        <p className="eyebrow">Act IV — Projects in the Light</p>
        <h2>Things I've built &amp; shipped</h2>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.title}>
              <span className="project-card__tag">{project.tag}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function AccomplishmentsPanel({ progress }) {
  const range = [0.7, 0.86]
  const { opacity, transform } = useReveal(progress, range)
  return (
    <section className="story-section story-section--end">
      <div className="story-panel story-panel--card" style={{ opacity, transform }}>
        <p className="eyebrow">Act V — What the Journey Built</p>
        <h2>Milestones along the way</h2>
        <ul className="accomplishment-list">
          {accomplishments.map((item) => (
            <li key={item}>
              <span className="accomplishment-list__dot" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FinalPanel({ progress }) {
  const range = [0.86, 1.0]
  const { opacity, transform } = useReveal(progress, range, { enterFraction: 0.5, holdToEnd: true })
  const { eyebrow, title, body, cta, email } = finalMessage
  return (
    <section className="story-section story-section--center">
      <div className="story-panel story-panel--final" style={{ opacity, transform }}>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{body}</p>
        <a className="final-cta" href={`mailto:${email}`}>
          {cta}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}

export default function StoryOverlay({ progress }) {
  return (
    <div className="story">
      <ActArrival progress={progress} />
      <ActTouchdown progress={progress} />
      <SkillsPanel progress={progress} />
      <ProjectsPanel progress={progress} />
      <AccomplishmentsPanel progress={progress} />
      <FinalPanel progress={progress} />
    </div>
  )
}
